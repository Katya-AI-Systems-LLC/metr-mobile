// EmotionalBlockchain.sol - Blockchain for Emotional States and Team Sentiment
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EmotionalBlockchain
 * @dev Stores emotional states and team sentiment on blockchain
 * @notice This contract enables immutable tracking of team emotions and sentiment
 */
contract EmotionalBlockchain is Ownable, ReentrancyGuard {
    
    // Emotional State Structure
    struct EmotionalState {
        address user;
        uint256 timestamp;
        EmotionType emotion;
        int256 intensity; // -100 to 100
        string context; // What triggered this emotion
        bytes32 hash; // Hash of emotional data for privacy
        bool isPublic;
    }
    
    // Team Sentiment Structure
    struct TeamSentiment {
        bytes32 teamId;
        uint256 timestamp;
        int256 averageSentiment; // -100 to 100
        EmotionDistribution distribution;
        uint256 participantCount;
        bytes32[] emotionalStates; // Hashes of emotional states
    }
    
    // Emotion Distribution
    struct EmotionDistribution {
        uint256 happy;
        uint256 neutral;
        uint256 stressed;
        uint256 excited;
        uint256 frustrated;
        uint256 calm;
    }
    
    // Emotion Types
    enum EmotionType {
        Happy,
        Neutral,
        Stressed,
        Excited,
        Frustrated,
        Calm,
        Anxious,
        Confident,
        Overwhelmed,
        Motivated
    }
    
    // Mapping: user => emotional states
    mapping(address => bytes32[]) public userEmotionalStates;
    
    // Mapping: teamId => team sentiments
    mapping(bytes32 => TeamSentiment[]) public teamSentiments;
    
    // Mapping: hash => emotional state
    mapping(bytes32 => EmotionalState) public emotionalStates;
    
    // Events
    event EmotionalStateRecorded(
        address indexed user,
        bytes32 indexed hash,
        EmotionType emotion,
        uint256 timestamp
    );
    
    event TeamSentimentCalculated(
        bytes32 indexed teamId,
        int256 averageSentiment,
        uint256 timestamp
    );
    
    event EmotionalStateShared(
        address indexed from,
        address indexed to,
        bytes32 indexed hash
    );
    
    /**
     * @dev Record an emotional state
     * @param emotion The type of emotion
     * @param intensity Intensity from -100 to 100
     * @param context Context that triggered the emotion
     * @param isPublic Whether this state is publicly visible
     */
    function recordEmotionalState(
        EmotionType emotion,
        int256 intensity,
        string memory context,
        bool isPublic
    ) external nonReentrant returns (bytes32) {
        require(intensity >= -100 && intensity <= 100, "Intensity out of range");
        
        // Create emotional state
        bytes32 hash = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            emotion,
            intensity,
            context
        ));
        
        EmotionalState memory state = EmotionalState({
            user: msg.sender,
            timestamp: block.timestamp,
            emotion: emotion,
            intensity: intensity,
            context: context,
            hash: hash,
            isPublic: isPublic
        });
        
        // Store emotional state
        emotionalStates[hash] = state;
        userEmotionalStates[msg.sender].push(hash);
        
        emit EmotionalStateRecorded(
            msg.sender,
            hash,
            emotion,
            block.timestamp
        );
        
        return hash;
    }
    
    /**
     * @dev Calculate team sentiment from multiple emotional states
     * @param teamId The team identifier
     * @param stateHashes Array of emotional state hashes
     */
    function calculateTeamSentiment(
        bytes32 teamId,
        bytes32[] memory stateHashes
    ) external nonReentrant returns (TeamSentiment memory) {
        require(stateHashes.length > 0, "No states provided");
        
        int256 totalSentiment = 0;
        EmotionDistribution memory distribution;
        uint256 validStates = 0;
        
        // Process each emotional state
        for (uint256 i = 0; i < stateHashes.length; i++) {
            EmotionalState memory state = emotionalStates[stateHashes[i]];
            
            // Only count public states or states from team members
            if (state.isPublic || isTeamMember(teamId, state.user)) {
                totalSentiment += state.intensity;
                validStates++;
                
                // Update distribution
                if (state.emotion == EmotionType.Happy) {
                    distribution.happy++;
                } else if (state.emotion == EmotionType.Neutral) {
                    distribution.neutral++;
                } else if (state.emotion == EmotionType.Stressed) {
                    distribution.stressed++;
                } else if (state.emotion == EmotionType.Excited) {
                    distribution.excited++;
                } else if (state.emotion == EmotionType.Frustrated) {
                    distribution.frustrated++;
                } else if (state.emotion == EmotionType.Calm) {
                    distribution.calm++;
                }
            }
        }
        
        require(validStates > 0, "No valid states");
        
        int256 averageSentiment = totalSentiment / int256(validStates);
        
        // Create team sentiment
        TeamSentiment memory sentiment = TeamSentiment({
            teamId: teamId,
            timestamp: block.timestamp,
            averageSentiment: averageSentiment,
            distribution: distribution,
            participantCount: validStates,
            emotionalStates: stateHashes
        });
        
        teamSentiments[teamId].push(sentiment);
        
        emit TeamSentimentCalculated(
            teamId,
            averageSentiment,
            block.timestamp
        );
        
        return sentiment;
    }
    
    /**
     * @dev Share emotional state with another user
     * @param to The recipient address
     * @param stateHash The hash of the emotional state to share
     */
    function shareEmotionalState(
        address to,
        bytes32 stateHash
    ) external nonReentrant {
        EmotionalState memory state = emotionalStates[stateHash];
        require(state.user == msg.sender, "Not your emotional state");
        
        emit EmotionalStateShared(msg.sender, to, stateHash);
    }
    
    /**
     * @dev Get emotional state by hash
     * @param hash The hash of the emotional state
     */
    function getEmotionalState(bytes32 hash) external view returns (EmotionalState memory) {
        EmotionalState memory state = emotionalStates[hash];
        require(
            state.isPublic || state.user == msg.sender,
            "State not accessible"
        );
        return state;
    }
    
    /**
     * @dev Get user's emotional states
     * @param user The user address
     * @param limit Maximum number of states to return
     */
    function getUserEmotionalStates(
        address user,
        uint256 limit
    ) external view returns (bytes32[] memory) {
        bytes32[] memory states = userEmotionalStates[user];
        uint256 returnLength = states.length > limit ? limit : states.length;
        bytes32[] memory result = new bytes32[](returnLength);
        
        for (uint256 i = 0; i < returnLength; i++) {
            result[i] = states[states.length - 1 - i]; // Most recent first
        }
        
        return result;
    }
    
    /**
     * @dev Get latest team sentiment
     * @param teamId The team identifier
     */
    function getLatestTeamSentiment(
        bytes32 teamId
    ) external view returns (TeamSentiment memory) {
        TeamSentiment[] memory sentiments = teamSentiments[teamId];
        require(sentiments.length > 0, "No sentiments found");
        return sentiments[sentiments.length - 1];
    }
    
    /**
     * @dev Get team sentiment history
     * @param teamId The team identifier
     * @param limit Maximum number of sentiments to return
     */
    function getTeamSentimentHistory(
        bytes32 teamId,
        uint256 limit
    ) external view returns (TeamSentiment[] memory) {
        TeamSentiment[] memory sentiments = teamSentiments[teamId];
        uint256 returnLength = sentiments.length > limit ? limit : sentiments.length;
        TeamSentiment[] memory result = new TeamSentiment[](returnLength);
        
        for (uint256 i = 0; i < returnLength; i++) {
            result[i] = sentiments[sentiments.length - 1 - i]; // Most recent first
        }
        
        return result;
    }
    
    /**
     * @dev Check if user is team member (simplified - in production would check team contract)
     */
    function isTeamMember(bytes32 teamId, address user) internal pure returns (bool) {
        // In production, this would check against a team membership contract
        // For now, return true for demonstration
        return true;
    }
    
    /**
     * @dev Get emotion name as string
     */
    function getEmotionName(EmotionType emotion) external pure returns (string memory) {
        if (emotion == EmotionType.Happy) return "Happy";
        if (emotion == EmotionType.Neutral) return "Neutral";
        if (emotion == EmotionType.Stressed) return "Stressed";
        if (emotion == EmotionType.Excited) return "Excited";
        if (emotion == EmotionType.Frustrated) return "Frustrated";
        if (emotion == EmotionType.Calm) return "Calm";
        if (emotion == EmotionType.Anxious) return "Anxious";
        if (emotion == EmotionType.Confident) return "Confident";
        if (emotion == EmotionType.Overwhelmed) return "Overwhelmed";
        if (emotion == EmotionType.Motivated) return "Motivated";
        return "Unknown";
    }
}

