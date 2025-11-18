// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BlockchainAuditTrail
 * @dev Immutable audit trail for METR team actions and decisions
 */
contract BlockchainAuditTrail is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    Counters.Counter private _entryIds;

    struct AuditEntry {
        uint256 id;
        address author;
        string action;
        string category;
        string dataHash;
        uint256 timestamp;
        uint256 blockNumber;
        bytes32 previousHash;
        bytes32 entryHash;
        string metadata;
        bool verified;
        address[] witnesses;
    }

    struct TeamAction {
        string actionType;
        string teamId;
        string userId;
        string description;
        uint256 timestamp;
        string[] affectedResources;
        mapping(address => bool) approvals;
        uint256 approvalCount;
        uint256 requiredApprovals;
    }

    struct ComplianceRecord {
        string standard; // ISO, SOC2, GDPR, etc
        bool compliant;
        string evidence;
        uint256 auditDate;
        address auditor;
    }

    // State variables
    mapping(uint256 => AuditEntry) public auditEntries;
    mapping(bytes32 => bool) public hashExists;
    mapping(address => uint256[]) public userEntries;
    mapping(string => uint256[]) public categoryEntries;
    mapping(uint256 => TeamAction) public teamActions;
    mapping(string => ComplianceRecord) public complianceRecords;
    
    uint256 public totalEntries;
    bytes32 public latestHash;
    
    // Events
    event AuditEntryCreated(
        uint256 indexed id,
        address indexed author,
        string action,
        string category,
        uint256 timestamp,
        bytes32 entryHash
    );
    
    event TeamActionRecorded(
        uint256 indexed actionId,
        string actionType,
        string teamId,
        uint256 timestamp
    );
    
    event ComplianceAudited(
        string standard,
        bool compliant,
        address auditor,
        uint256 timestamp
    );
    
    event EntryVerified(
        uint256 indexed id,
        address indexed verifier,
        uint256 timestamp
    );
    
    event WitnessAdded(
        uint256 indexed entryId,
        address indexed witness,
        uint256 timestamp
    );

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(AUDITOR_ROLE, msg.sender);
    }

    /**
     * @dev Create a new audit entry
     */
    function createAuditEntry(
        string memory _action,
        string memory _category,
        string memory _dataHash,
        string memory _metadata
    ) external nonReentrant returns (uint256) {
        require(bytes(_action).length > 0, "Action cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(bytes(_dataHash).length > 0, "Data hash cannot be empty");
        
        _entryIds.increment();
        uint256 newId = _entryIds.current();
        
        bytes32 entryHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _action,
                _category,
                _dataHash,
                block.timestamp,
                block.number,
                latestHash
            )
        );
        
        require(!hashExists[entryHash], "Duplicate entry detected");
        
        AuditEntry storage newEntry = auditEntries[newId];
        newEntry.id = newId;
        newEntry.author = msg.sender;
        newEntry.action = _action;
        newEntry.category = _category;
        newEntry.dataHash = _dataHash;
        newEntry.timestamp = block.timestamp;
        newEntry.blockNumber = block.number;
        newEntry.previousHash = latestHash;
        newEntry.entryHash = entryHash;
        newEntry.metadata = _metadata;
        newEntry.verified = false;
        
        hashExists[entryHash] = true;
        userEntries[msg.sender].push(newId);
        categoryEntries[_category].push(newId);
        
        latestHash = entryHash;
        totalEntries++;
        
        emit AuditEntryCreated(
            newId,
            msg.sender,
            _action,
            _category,
            block.timestamp,
            entryHash
        );
        
        return newId;
    }

    /**
     * @dev Record a team action requiring approvals
     */
    function recordTeamAction(
        string memory _actionType,
        string memory _teamId,
        string memory _userId,
        string memory _description,
        string[] memory _affectedResources,
        uint256 _requiredApprovals
    ) external returns (uint256) {
        _entryIds.increment();
        uint256 actionId = _entryIds.current();
        
        TeamAction storage action = teamActions[actionId];
        action.actionType = _actionType;
        action.teamId = _teamId;
        action.userId = _userId;
        action.description = _description;
        action.timestamp = block.timestamp;
        action.affectedResources = _affectedResources;
        action.requiredApprovals = _requiredApprovals;
        action.approvalCount = 0;
        
        emit TeamActionRecorded(
            actionId,
            _actionType,
            _teamId,
            block.timestamp
        );
        
        return actionId;
    }

    /**
     * @dev Approve a team action
     */
    function approveTeamAction(uint256 _actionId) external {
        TeamAction storage action = teamActions[_actionId];
        require(action.timestamp > 0, "Action does not exist");
        require(!action.approvals[msg.sender], "Already approved");
        
        action.approvals[msg.sender] = true;
        action.approvalCount++;
        
        // If required approvals met, create audit entry
        if (action.approvalCount >= action.requiredApprovals) {
            createAuditEntry(
                action.actionType,
                "team_action",
                action.description,
                string(abi.encodePacked("Team: ", action.teamId))
            );
        }
    }

    /**
     * @dev Verify an audit entry (requires AUDITOR_ROLE)
     */
    function verifyEntry(uint256 _entryId) external onlyRole(AUDITOR_ROLE) {
        require(_entryId <= totalEntries, "Entry does not exist");
        require(!auditEntries[_entryId].verified, "Already verified");
        
        auditEntries[_entryId].verified = true;
        
        emit EntryVerified(_entryId, msg.sender, block.timestamp);
    }

    /**
     * @dev Add witness to an entry
     */
    function addWitness(uint256 _entryId) external {
        require(_entryId <= totalEntries, "Entry does not exist");
        
        AuditEntry storage entry = auditEntries[_entryId];
        
        // Check if already a witness
        for (uint256 i = 0; i < entry.witnesses.length; i++) {
            require(entry.witnesses[i] != msg.sender, "Already a witness");
        }
        
        entry.witnesses.push(msg.sender);
        
        emit WitnessAdded(_entryId, msg.sender, block.timestamp);
    }

    /**
     * @dev Record compliance audit
     */
    function recordComplianceAudit(
        string memory _standard,
        bool _compliant,
        string memory _evidence
    ) external onlyRole(AUDITOR_ROLE) {
        ComplianceRecord storage record = complianceRecords[_standard];
        record.standard = _standard;
        record.compliant = _compliant;
        record.evidence = _evidence;
        record.auditDate = block.timestamp;
        record.auditor = msg.sender;
        
        emit ComplianceAudited(
            _standard,
            _compliant,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Verify chain integrity
     */
    function verifyChainIntegrity(uint256 _startId, uint256 _endId) 
        external 
        view 
        returns (bool) 
    {
        require(_startId > 0 && _startId <= _endId, "Invalid range");
        require(_endId <= totalEntries, "End exceeds total entries");
        
        for (uint256 i = _startId; i <= _endId; i++) {
            if (i > 1) {
                AuditEntry memory currentEntry = auditEntries[i];
                AuditEntry memory previousEntry = auditEntries[i - 1];
                
                if (currentEntry.previousHash != previousEntry.entryHash) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * @dev Get entries by user
     */
    function getUserEntries(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userEntries[_user];
    }

    /**
     * @dev Get entries by category
     */
    function getCategoryEntries(string memory _category) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return categoryEntries[_category];
    }

    /**
     * @dev Get entry details
     */
    function getEntry(uint256 _entryId) 
        external 
        view 
        returns (
            address author,
            string memory action,
            string memory category,
            string memory dataHash,
            uint256 timestamp,
            uint256 blockNumber,
            bytes32 previousHash,
            bytes32 entryHash,
            bool verified,
            address[] memory witnesses
        ) 
    {
        require(_entryId <= totalEntries, "Entry does not exist");
        
        AuditEntry memory entry = auditEntries[_entryId];
        
        return (
            entry.author,
            entry.action,
            entry.category,
            entry.dataHash,
            entry.timestamp,
            entry.blockNumber,
            entry.previousHash,
            entry.entryHash,
            entry.verified,
            entry.witnesses
        );
    }

    /**
     * @dev Get entries in range
     */
    function getEntriesInRange(uint256 _start, uint256 _end) 
        external 
        view 
        returns (AuditEntry[] memory) 
    {
        require(_start > 0 && _start <= _end, "Invalid range");
        require(_end <= totalEntries, "End exceeds total");
        
        uint256 length = _end - _start + 1;
        AuditEntry[] memory entries = new AuditEntry[](length);
        
        for (uint256 i = 0; i < length; i++) {
            entries[i] = auditEntries[_start + i];
        }
        
        return entries;
    }

    /**
     * @dev Search entries by hash
     */
    function findByHash(bytes32 _hash) 
        external 
        view 
        returns (uint256) 
    {
        for (uint256 i = 1; i <= totalEntries; i++) {
            if (auditEntries[i].entryHash == _hash) {
                return i;
            }
        }
        return 0;
    }

    /**
     * @dev Get compliance status
     */
    function getComplianceStatus(string memory _standard) 
        external 
        view 
        returns (
            bool compliant,
            string memory evidence,
            uint256 auditDate,
            address auditor
        ) 
    {
        ComplianceRecord memory record = complianceRecords[_standard];
        
        return (
            record.compliant,
            record.evidence,
            record.auditDate,
            record.auditor
        );
    }

    /**
     * @dev Emergency pause (only admin)
     */
    function emergencyExport(uint256 _limit) 
        external 
        onlyRole(ADMIN_ROLE) 
        view 
        returns (string memory) 
    {
        require(_limit <= totalEntries, "Limit exceeds total");
        
        string memory export = "[";
        
        for (uint256 i = 1; i <= _limit && i <= 100; i++) {
            AuditEntry memory entry = auditEntries[i];
            
            if (i > 1) export = string(abi.encodePacked(export, ","));
            
            export = string(abi.encodePacked(
                export,
                '{"id":',
                uint2str(entry.id),
                ',"action":"',
                entry.action,
                '","timestamp":',
                uint2str(entry.timestamp),
                '}'
            ));
        }
        
        export = string(abi.encodePacked(export, "]"));
        return export;
    }

    /**
     * @dev Helper function to convert uint to string
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
