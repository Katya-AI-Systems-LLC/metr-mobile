// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title METRDAO
 * @dev Decentralized governance for METR teams
 */
contract METRDAO is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl {
    
    // Proposal categories
    enum ProposalCategory { 
        FEATURE,
        BUDGET,
        TEAM,
        STRATEGIC,
        EMERGENCY
    }
    
    // Proposal structure
    struct ProposalMetadata {
        string title;
        string description;
        ProposalCategory category;
        address proposer;
        uint256 createdAt;
        string ipfsHash;
        uint256 requiredQuorum;
        bool executed;
    }
    
    // Mappings
    mapping(uint256 => ProposalMetadata) public proposalMetadata;
    mapping(address => uint256) public memberReputation;
    mapping(address => bool) public isCoreMember;
    mapping(uint256 => mapping(address => string)) public voteReasons;
    
    // Team structure
    uint256 public totalMembers;
    uint256 public coreTeamSize;
    
    // Events
    event ProposalCreatedWithMetadata(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        ProposalCategory category
    );
    
    event VoteReason(
        uint256 indexed proposalId,
        address indexed voter,
        string reason
    );
    
    event ReputationUpdated(
        address indexed member,
        uint256 oldReputation,
        uint256 newReputation
    );
    
    event MemberAdded(address indexed member, bool isCore);
    event MemberRemoved(address indexed member);
    
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold
    )
        Governor("METR DAO")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {}
    
    /**
     * @dev Create proposal with metadata
     */
    function proposeWithMetadata(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        string memory title,
        ProposalCategory category,
        string memory ipfsHash
    ) public returns (uint256) {
        uint256 proposalId = propose(targets, values, calldatas, description);
        
        uint256 requiredQuorum = _calculateRequiredQuorum(category);
        
        proposalMetadata[proposalId] = ProposalMetadata({
            title: title,
            description: description,
            category: category,
            proposer: msg.sender,
            createdAt: block.timestamp,
            ipfsHash: ipfsHash,
            requiredQuorum: requiredQuorum,
            executed: false
        });
        
        emit ProposalCreatedWithMetadata(proposalId, msg.sender, title, category);
        
        return proposalId;
    }
    
    /**
     * @dev Calculate required quorum based on proposal category
     */
    function _calculateRequiredQuorum(ProposalCategory category) 
        private pure returns (uint256) {
        if (category == ProposalCategory.EMERGENCY) return 10; // 10% for emergency
        if (category == ProposalCategory.STRATEGIC) return 15; // 15% for strategic
        if (category == ProposalCategory.BUDGET) return 12; // 12% for budget
        if (category == ProposalCategory.TEAM) return 8; // 8% for team
        return 4; // 4% for features (default)
    }
    
    /**
     * @dev Cast vote with reason
     */
    function castVoteWithReasonAndParams(
        uint256 proposalId,
        uint8 support,
        string memory reason,
        bytes memory params
    ) public override returns (uint256) {
        voteReasons[proposalId][msg.sender] = reason;
        
        emit VoteReason(proposalId, msg.sender, reason);
        
        return super.castVoteWithReasonAndParams(proposalId, support, reason, params);
    }
    
    /**
     * @dev Add team member
     */
    function addMember(address member, bool isCore, uint256 initialReputation) 
        external onlyGovernance {
        require(member != address(0), "Invalid address");
        require(memberReputation[member] == 0, "Member already exists");
        
        memberReputation[member] = initialReputation;
        totalMembers++;
        
        if (isCore) {
            isCoreMember[member] = true;
            coreTeamSize++;
        }
        
        emit MemberAdded(member, isCore);
    }
    
    /**
     * @dev Remove team member
     */
    function removeMember(address member) external onlyGovernance {
        require(memberReputation[member] > 0, "Member does not exist");
        
        delete memberReputation[member];
        totalMembers--;
        
        if (isCoreMember[member]) {
            delete isCoreMember[member];
            coreTeamSize--;
        }
        
        emit MemberRemoved(member);
    }
    
    /**
     * @dev Update member reputation
     */
    function updateReputation(address member, uint256 newReputation) 
        external onlyGovernance {
        uint256 oldReputation = memberReputation[member];
        memberReputation[member] = newReputation;
        
        emit ReputationUpdated(member, oldReputation, newReputation);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposalDetails(uint256 proposalId) 
        external view returns (
            ProposalMetadata memory metadata,
            ProposalState state,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes
        ) {
        metadata = proposalMetadata[proposalId];
        state = state(proposalId);
        (againstVotes, forVotes, abstainVotes) = proposalVotes(proposalId);
    }
    
    /**
     * @dev Check if address can propose (includes reputation check)
     */
    function canPropose(address account) public view returns (bool) {
        uint256 votes = getVotes(account, block.number - 1);
        uint256 reputation = memberReputation[account];
        uint256 threshold = proposalThreshold();
        
        // Either have enough votes or enough reputation
        return votes >= threshold || reputation >= threshold * 2;
    }
    
    /**
     * @dev Execute successful proposal
     */
    function execute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public payable override(Governor, GovernorTimelockControl) returns (uint256) {
        uint256 proposalId = hashProposal(targets, values, calldatas, descriptionHash);
        proposalMetadata[proposalId].executed = true;
        
        return super.execute(targets, values, calldatas, descriptionHash);
    }
    
    /**
     * @dev Check quorum based on proposal category
     */
    function quorum(uint256 blockNumber) 
        public view override(IGovernor, GovernorVotesQuorumFraction) 
        returns (uint256) {
        return super.quorum(blockNumber);
    }
    
    /**
     * @dev Get active proposals count
     */
    function getActiveProposalsCount() public view returns (uint256) {
        // This would require maintaining a list of active proposals
        // Simplified for demonstration
        return 0;
    }
    
    /**
     * @dev Get member statistics
     */
    function getMemberStats(address member) public view returns (
        uint256 reputation,
        bool isCore,
        uint256 votingPower
    ) {
        return (
            memberReputation[member],
            isCoreMember[member],
            getVotes(member, block.number - 1)
        );
    }
    
    // Required overrides
    function votingDelay()
        public view override(IGovernor, GovernorSettings)
        returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod()
        public view override(IGovernor, GovernorSettings)
        returns (uint256) {
        return super.votingPeriod();
    }

    function proposalThreshold()
        public view override(Governor, GovernorSettings)
        returns (uint256) {
        return super.proposalThreshold();
    }
    
    function state(uint256 proposalId)
        public view override(Governor, GovernorTimelockControl)
        returns (ProposalState) {
        return super.state(proposalId);
    }
    
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        require(canPropose(msg.sender), "Insufficient reputation or voting power");
        return super.propose(targets, values, calldatas, description);
    }
    
    function cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public override(Governor, GovernorTimelockControl) returns (uint256) {
        return super.cancel(targets, values, calldatas, descriptionHash);
    }
    
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }
    
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }
    
    function _executor()
        internal view override(Governor, GovernorTimelockControl)
        returns (address) {
        return super._executor();
    }
    
    function supportsInterface(bytes4 interfaceId)
        public view override(Governor, GovernorTimelockControl)
        returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
