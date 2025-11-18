// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title METRAchievements
 * @dev NFT contract for team achievement badges in METR
 */
contract METRAchievements is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
    // Achievement rarity levels
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY, MYTHIC }
    
    // Achievement structure
    struct Achievement {
        string name;
        string description;
        Rarity rarity;
        uint256 points;
        uint256 timestamp;
        address earner;
        string category;
        bool transferable;
    }
    
    // Mappings
    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public userAchievements;
    mapping(string => bool) public achievementExists;
    mapping(address => uint256) public userPoints;
    mapping(address => mapping(string => uint256)) public userCategoryPoints;
    
    // Events
    event AchievementMinted(
        address indexed user,
        uint256 indexed tokenId,
        string name,
        Rarity rarity,
        uint256 points
    );
    
    event PointsEarned(address indexed user, uint256 points, uint256 totalPoints);
    event AchievementUpgraded(uint256 indexed tokenId, Rarity newRarity);
    
    // Achievement categories
    string[] public categories = [
        "Productivity",
        "Collaboration", 
        "Innovation",
        "Leadership",
        "Learning",
        "Communication",
        "Problem Solving"
    ];
    
    constructor() ERC721("METR Achievements", "ACHIEVE") {}
    
    /**
     * @dev Mint a new achievement NFT
     */
    function mintAchievement(
        address to,
        string memory name,
        string memory description,
        string memory uri,
        Rarity rarity,
        string memory category,
        bool transferable
    ) public onlyOwner returns (uint256) {
        require(!achievementExists[name], "Achievement already exists");
        require(to != address(0), "Invalid address");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        uint256 points = calculatePoints(rarity);
        
        achievements[tokenId] = Achievement({
            name: name,
            description: description,
            rarity: rarity,
            points: points,
            timestamp: block.timestamp,
            earner: to,
            category: category,
            transferable: transferable
        });
        
        userAchievements[to].push(tokenId);
        achievementExists[name] = true;
        
        // Update points
        userPoints[to] += points;
        userCategoryPoints[to][category] += points;
        
        emit AchievementMinted(to, tokenId, name, rarity, points);
        emit PointsEarned(to, points, userPoints[to]);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint achievements for multiple users
     */
    function batchMintAchievements(
        address[] memory recipients,
        string memory name,
        string memory description,
        string memory uri,
        Rarity rarity,
        string memory category
    ) public onlyOwner {
        for (uint i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0)) {
                mintAchievement(
                    recipients[i],
                    string(abi.encodePacked(name, "_", uint2str(i))),
                    description,
                    uri,
                    rarity,
                    category,
                    true
                );
            }
        }
    }
    
    /**
     * @dev Calculate points based on rarity
     */
    function calculatePoints(Rarity rarity) private pure returns (uint256) {
        if (rarity == Rarity.COMMON) return 10;
        if (rarity == Rarity.RARE) return 25;
        if (rarity == Rarity.EPIC) return 50;
        if (rarity == Rarity.LEGENDARY) return 100;
        if (rarity == Rarity.MYTHIC) return 500;
        return 0;
    }
    
    /**
     * @dev Upgrade achievement rarity (for special occasions)
     */
    function upgradeAchievement(uint256 tokenId, Rarity newRarity) public onlyOwner {
        require(_exists(tokenId), "Achievement does not exist");
        Achievement storage achievement = achievements[tokenId];
        require(newRarity > achievement.rarity, "Can only upgrade to higher rarity");
        
        uint256 oldPoints = achievement.points;
        uint256 newPoints = calculatePoints(newRarity);
        uint256 additionalPoints = newPoints - oldPoints;
        
        achievement.rarity = newRarity;
        achievement.points = newPoints;
        
        address owner = ownerOf(tokenId);
        userPoints[owner] += additionalPoints;
        userCategoryPoints[owner][achievement.category] += additionalPoints;
        
        emit AchievementUpgraded(tokenId, newRarity);
        emit PointsEarned(owner, additionalPoints, userPoints[owner]);
    }
    
    /**
     * @dev Get user's achievements
     */
    function getUserAchievements(address user) public view returns (uint256[] memory) {
        return userAchievements[user];
    }
    
    /**
     * @dev Get user's total points
     */
    function getUserPoints(address user) public view returns (uint256) {
        return userPoints[user];
    }
    
    /**
     * @dev Get user's points by category
     */
    function getUserCategoryPoints(address user, string memory category) 
        public view returns (uint256) {
        return userCategoryPoints[user][category];
    }
    
    /**
     * @dev Get achievement details
     */
    function getAchievement(uint256 tokenId) 
        public view returns (Achievement memory) {
        require(_exists(tokenId), "Achievement does not exist");
        return achievements[tokenId];
    }
    
    /**
     * @dev Get leaderboard (top N users by points)
     */
    function getLeaderboard(uint256 limit) 
        public view returns (address[] memory, uint256[] memory) {
        // This would require additional data structures for efficient sorting
        // Simplified version for demonstration
        address[] memory users = new address[](limit);
        uint256[] memory points = new uint256[](limit);
        
        // In production, maintain a sorted list of users by points
        
        return (users, points);
    }
    
    /**
     * @dev Override transfer functions to check transferability
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Skip checks for minting
        if (from != address(0)) {
            require(
                achievements[tokenId].transferable,
                "This achievement is non-transferable"
            );
            
            // Update user achievements arrays
            if (to != address(0)) {
                // Remove from sender
                removeFromArray(userAchievements[from], tokenId);
                // Add to receiver
                userAchievements[to].push(tokenId);
                
                // Transfer points
                uint256 points = achievements[tokenId].points;
                userPoints[from] -= points;
                userPoints[to] += points;
                
                string memory category = achievements[tokenId].category;
                userCategoryPoints[from][category] -= points;
                userCategoryPoints[to][category] += points;
            }
        }
    }
    
    /**
     * @dev Helper function to remove element from array
     */
    function removeFromArray(uint256[] storage array, uint256 element) private {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == element) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Convert uint to string
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
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }
    
    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage)
        returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
