// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title METRToken
 * @dev Team productivity token for METR ecosystem
 */
contract METRToken is ERC20, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant REWARDS_ROLE = keccak256("REWARDS_ROLE");
    
    // Token economics
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100 million tokens
    
    // Reward rates
    uint256 public dailyActiveReward = 10 * 10**18; // 10 tokens
    uint256 public taskCompletionReward = 5 * 10**18; // 5 tokens
    uint256 public achievementReward = 20 * 10**18; // 20 tokens
    uint256 public collaborationReward = 3 * 10**18; // 3 tokens
    
    // User tracking
    mapping(address => uint256) public lastActiveDate;
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public totalSpent;
    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public stakingTimestamp;
    
    // Team pools
    mapping(string => uint256) public teamPools;
    mapping(string => mapping(address => bool)) public teamMembers;
    mapping(string => address) public teamManagers;
    
    // Events
    event RewardEarned(address indexed user, uint256 amount, string reason);
    event TokensSpent(address indexed user, uint256 amount, string purpose);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event TeamPoolCreated(string teamId, uint256 initialAmount);
    event TeamRewardDistributed(string teamId, uint256 amount);
    
    constructor() ERC20("METR Token", "METR") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(REWARDS_ROLE, msg.sender);
        
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Reward user for daily activity
     */
    function rewardDailyActive(address user) public onlyRole(REWARDS_ROLE) {
        uint256 today = block.timestamp / 86400;
        require(lastActiveDate[user] < today, "Already rewarded today");
        
        lastActiveDate[user] = today;
        _mintReward(user, dailyActiveReward, "Daily Activity");
    }
    
    /**
     * @dev Reward user for completing tasks
     */
    function rewardTaskCompletion(address user, uint256 taskCount) 
        public onlyRole(REWARDS_ROLE) {
        uint256 reward = taskCompletionReward * taskCount;
        _mintReward(user, reward, "Task Completion");
    }
    
    /**
     * @dev Reward user for achievements
     */
    function rewardAchievement(address user, string memory achievementName) 
        public onlyRole(REWARDS_ROLE) {
        _mintReward(user, achievementReward, achievementName);
    }
    
    /**
     * @dev Reward team collaboration
     */
    function rewardCollaboration(address[] memory users, string memory activity) 
        public onlyRole(REWARDS_ROLE) {
        for (uint i = 0; i < users.length; i++) {
            _mintReward(users[i], collaborationReward, activity);
        }
    }
    
    /**
     * @dev Internal function to mint rewards
     */
    function _mintReward(address user, uint256 amount, string memory reason) private {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        
        _mint(user, amount);
        totalEarned[user] += amount;
        emit RewardEarned(user, amount, reason);
    }
    
    /**
     * @dev Spend tokens for premium features
     */
    function spendTokens(uint256 amount, string memory purpose) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        totalSpent[msg.sender] += amount;
        emit TokensSpent(msg.sender, amount, purpose);
    }
    
    /**
     * @dev Stake tokens for rewards
     */
    function stake(uint256 amount) public whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // If already staking, claim rewards first
        if (stakingBalance[msg.sender] > 0) {
            _claimStakingRewards();
        }
        
        _transfer(msg.sender, address(this), amount);
        stakingBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     */
    function unstake(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(stakingBalance[msg.sender] >= amount, "Insufficient staking balance");
        
        uint256 reward = _calculateStakingReward(msg.sender);
        
        stakingBalance[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        
        if (reward > 0) {
            _mintReward(msg.sender, reward, "Staking Reward");
        }
        
        if (stakingBalance[msg.sender] == 0) {
            stakingTimestamp[msg.sender] = 0;
        } else {
            stakingTimestamp[msg.sender] = block.timestamp;
        }
        
        emit Unstaked(msg.sender, amount, reward);
    }
    
    /**
     * @dev Calculate staking rewards
     */
    function _calculateStakingReward(address user) private view returns (uint256) {
        if (stakingBalance[user] == 0 || stakingTimestamp[user] == 0) {
            return 0;
        }
        
        uint256 stakingDuration = block.timestamp - stakingTimestamp[user];
        uint256 dailyRate = 10; // 0.1% daily = 10 basis points
        
        // Calculate reward: (staked amount * daily rate * days) / 10000
        uint256 reward = (stakingBalance[user] * dailyRate * stakingDuration) / (86400 * 10000);
        
        return reward;
    }
    
    /**
     * @dev Claim staking rewards without unstaking
     */
    function _claimStakingRewards() private {
        uint256 reward = _calculateStakingReward(msg.sender);
        
        if (reward > 0) {
            _mintReward(msg.sender, reward, "Staking Reward");
            stakingTimestamp[msg.sender] = block.timestamp;
        }
    }
    
    /**
     * @dev Create team pool for shared rewards
     */
    function createTeamPool(string memory teamId, uint256 initialAmount) 
        public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(teamManagers[teamId] == address(0), "Team already exists");
        require(initialAmount > 0, "Initial amount must be greater than 0");
        
        teamManagers[teamId] = msg.sender;
        teamPools[teamId] = initialAmount;
        
        _mint(address(this), initialAmount);
        
        emit TeamPoolCreated(teamId, initialAmount);
    }
    
    /**
     * @dev Add member to team
     */
    function addTeamMember(string memory teamId, address member) public {
        require(msg.sender == teamManagers[teamId], "Only team manager can add members");
        teamMembers[teamId][member] = true;
    }
    
    /**
     * @dev Distribute team rewards
     */
    function distributeTeamReward(string memory teamId, address[] memory recipients, uint256[] memory amounts) 
        public {
        require(msg.sender == teamManagers[teamId], "Only team manager can distribute");
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(teamPools[teamId] >= totalAmount, "Insufficient team pool balance");
        
        for (uint i = 0; i < recipients.length; i++) {
            require(teamMembers[teamId][recipients[i]], "Recipient not a team member");
            _transfer(address(this), recipients[i], amounts[i]);
        }
        
        teamPools[teamId] -= totalAmount;
        
        emit TeamRewardDistributed(teamId, totalAmount);
    }
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) public view returns (
        uint256 balance,
        uint256 earned,
        uint256 spent,
        uint256 staked,
        uint256 stakingReward
    ) {
        return (
            balanceOf(user),
            totalEarned[user],
            totalSpent[user],
            stakingBalance[user],
            _calculateStakingReward(user)
        );
    }
    
    /**
     * @dev Update reward rates
     */
    function updateRewardRates(
        uint256 _dailyActive,
        uint256 _taskCompletion,
        uint256 _achievement,
        uint256 _collaboration
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        dailyActiveReward = _dailyActive;
        taskCompletionReward = _taskCompletion;
        achievementReward = _achievement;
        collaborationReward = _collaboration;
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override transfer to include pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
