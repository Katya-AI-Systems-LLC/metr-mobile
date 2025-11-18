// VideoMessages.tsx - Asynchronous Video Messages for METR
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface VideoMessage {
  id: string;
  uri: string;
  thumbnail?: string;
  duration: number;
  sender: string;
  recipients: string[];
  timestamp: Date;
  transcription?: string;
  reactions: VideoReaction[];
  viewed: boolean;
  metadata: {
    width: number;
    height: number;
    size: number;
    codec: string;
  };
}

interface VideoReaction {
  userId: string;
  emoji: string;
  timestamp: Date;
}

interface RecordingState {
  isRecording: boolean;
  duration: number;
  isPaused: boolean;
  hasPermissions: boolean;
}

export const VideoMessages: React.FC = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    isPaused: false,
    hasPermissions: false,
  });
  
  const [currentVideo, setCurrentVideo] = useState<VideoMessage | null>(null);
  const [videoMessages, setVideoMessages] = useState<VideoMessage[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.front);
  const [flashMode, setFlashMode] = useState(RNCamera.Constants.FlashMode.off);
  
  const cameraRef = useRef<RNCamera | null>(null);
  const videoPlayerRef = useRef<Video | null>(null);
  const recordingTimer = useRef<any>(null);
  
  const MAX_DURATION = 180; // 3 minutes max

  useEffect(() => {
    checkPermissions();
    loadVideoMessages();
    
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const cameraPermission = await RNCamera.requestPermissionsAsync();
      const audioPermission = await RNCamera.requestRecordAudioPermissionsAsync();
      
      setRecordingState(prev => ({
        ...prev,
        hasPermissions: cameraPermission.status === 'granted' && audioPermission.status === 'granted',
      }));
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const loadVideoMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem('video_messages');
      if (stored) {
        setVideoMessages(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load video messages:', error);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || !recordingState.hasPermissions) {
      Alert.alert('Error', 'Camera not ready or permissions not granted');
      return;
    }

    try {
      const options = {
        quality: RNCamera.Constants.VideoQuality['720p'],
        maxDuration: MAX_DURATION,
        maxFileSize: 100 * 1024 * 1024, // 100MB
        videoBitrate: 5 * 1024 * 1024, // 5 Mbps
        mute: false,
      };

      const data = await cameraRef.current.recordAsync(options);
      await handleVideoRecorded(data);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Recording Error', 'Failed to record video');
    }

    setRecordingState(prev => ({
      ...prev,
      isRecording: true,
      duration: 0,
    }));

    // Start duration timer
    recordingTimer.current = setInterval(() => {
      setRecordingState(prev => {
        if (prev.duration >= MAX_DURATION) {
          stopRecording();
          return prev;
        }
        return {...prev, duration: prev.duration + 1};
      });
    }, 1000);
  };

  const stopRecording = async () => {
    if (cameraRef.current && recordingState.isRecording) {
      await cameraRef.current.stopRecording();
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        duration: 0,
      }));
    }
  };

  const handleVideoRecorded = async (data: any) => {
    try {
      // Generate thumbnail
      const thumbnail = await generateThumbnail(data.uri);
      
      // Create video message
      const videoMessage: VideoMessage = {
        id: Date.now().toString(),
        uri: data.uri,
        thumbnail,
        duration: recordingState.duration,
        sender: 'Current User',
        recipients: [],
        timestamp: new Date(),
        reactions: [],
        viewed: false,
        metadata: {
          width: data.width || 1280,
          height: data.height || 720,
          size: data.size || 0,
          codec: data.codec || 'h264',
        },
      };
      
      // Save video message
      await saveVideoMessage(videoMessage);
      
      // Process video (compression, transcription, etc.)
      await processVideo(videoMessage);
      
      Alert.alert('Success', 'Video message saved!');
    } catch (error) {
      console.error('Failed to handle video:', error);
      Alert.alert('Error', 'Failed to save video message');
    }
  };

  const generateThumbnail = async (videoUri: string): Promise<string> => {
    // In production, use a proper thumbnail generation library
    // For now, return a placeholder
    return 'thumbnail_placeholder';
  };

  const saveVideoMessage = async (message: VideoMessage) => {
    const messages = [...videoMessages, message];
    setVideoMessages(messages);
    await AsyncStorage.setItem('video_messages', JSON.stringify(messages));
  };

  const processVideo = async (message: VideoMessage) => {
    // 1. Compress video if needed
    await compressVideo(message.uri);
    
    // 2. Generate transcription
    const transcription = await transcribeVideo(message.uri);
    if (transcription) {
      message.transcription = transcription;
    }
    
    // 3. Upload to server
    // await uploadVideo(message);
  };

  const compressVideo = async (uri: string): Promise<string> => {
    // Use react-native-video-compressor or similar
    return uri; // Return original for now
  };

  const transcribeVideo = async (uri: string): Promise<string | null> => {
    // Use speech-to-text service
    return null; // Placeholder
  };

  const playVideo = (message: VideoMessage) => {
    setCurrentVideo(message);
    setIsPlaying(true);
    
    // Mark as viewed
    if (!message.viewed) {
      message.viewed = true;
      saveVideoMessage(message);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    const message = videoMessages.find(m => m.id === messageId);
    if (message) {
      message.reactions.push({
        userId: 'Current User',
        emoji,
        timestamp: new Date(),
      });
      await saveVideoMessage(message);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCamera = () => {
    setCameraType(
      cameraType === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back
    );
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === RNCamera.Constants.FlashMode.off
        ? RNCamera.Constants.FlashMode.on
        : RNCamera.Constants.FlashMode.off
    );
  };

  const videoFilters = [
    {id: 'none', name: 'None', icon: 'image-off'},
    {id: 'blur', name: 'Blur BG', icon: 'blur'},
    {id: 'beauty', name: 'Beauty', icon: 'face-woman-shimmer'},
    {id: 'vintage', name: 'Vintage', icon: 'filmstrip'},
    {id: 'comic', name: 'Comic', icon: 'palette'},
  ];

  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      {recordingState.hasPermissions ? (
        <RNCamera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          flashMode={flashMode}
          captureAudio={true}
          androidCameraPermissionOptions={{
            title: 'Camera Permission',
            message: 'METR needs camera access for video messages',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Audio Permission',
            message: 'METR needs audio access for video messages',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }}
        >
          {/* Camera Controls Overlay */}
          <View style={styles.cameraOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity onPress={toggleFlash} style={styles.controlButton}>
                <Icon
                  name={flashMode === RNCamera.Constants.FlashMode.on ? 'flash' : 'flash-off'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={toggleCamera} style={styles.controlButton}>
                <Icon name="camera-flip" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                style={styles.controlButton}
              >
                <Icon name="palette" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Recording Status */}
            {recordingState.isRecording && (
              <View style={styles.recordingStatus}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTime}>
                  {formatDuration(recordingState.duration)}
                </Text>
              </View>
            )}

            {/* Filters */}
            {showFilters && (
              <ScrollView
                horizontal
                style={styles.filtersContainer}
                showsHorizontalScrollIndicator={false}
              >
                {videoFilters.map(filter => (
                  <TouchableOpacity
                    key={filter.id}
                    onPress={() => setSelectedFilter(filter.id)}
                    style={[
                      styles.filterButton,
                      selectedFilter === filter.id && styles.filterButtonActive,
                    ]}
                  >
                    <Icon
                      name={filter.icon}
                      size={24}
                      color={selectedFilter === filter.id ? MetrTheme.colors.primary.electric : '#FFFFFF'}
                    />
                    <Text style={styles.filterName}>{filter.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.galleryButton}>
                <Icon name="image-multiple" size={30} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={recordingState.isRecording ? stopRecording : startRecording}
                style={styles.recordButton}
              >
                <View style={[
                  styles.recordButtonInner,
                  recordingState.isRecording && styles.recordButtonRecording,
                ]} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.effectsButton}>
                <Icon name="auto-fix" size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </RNCamera>
      ) : (
        <View style={styles.permissionContainer}>
          <Icon name="camera-off" size={64} color={MetrTheme.colors.dark.textSecondary} />
          <Text style={styles.permissionText}>Camera permissions required</Text>
          <TouchableOpacity onPress={checkPermissions} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderVideoPlayer = () => {
    if (!currentVideo) return null;

    return (
      <Modal visible={!!currentVideo} animationType="fade">
        <View style={styles.playerContainer}>
          <Video
            ref={videoPlayerRef}
            source={{uri: currentVideo.uri}}
            style={styles.videoPlayer}
            paused={!isPlaying}
            repeat={false}
            resizeMode="contain"
            onEnd={() => setIsPlaying(false)}
          />
          
          <View style={styles.playerOverlay}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setCurrentVideo(null)}
              style={styles.closeButton}
            >
              <Icon name="close" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              style={styles.playPauseButton}
            >
              <Icon
                name={isPlaying ? 'pause' : 'play'}
                size={50}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* Video Info */}
            <View style={styles.videoInfo}>
              <Text style={styles.videoSender}>{currentVideo.sender}</Text>
              <Text style={styles.videoTimestamp}>
                {new Date(currentVideo.timestamp).toLocaleString()}
              </Text>
              {currentVideo.transcription && (
                <Text style={styles.videoTranscription}>
                  {currentVideo.transcription}
                </Text>
              )}
            </View>

            {/* Reactions */}
            <View style={styles.reactionsBar}>
              {['❤️', '👍', '😂', '😮', '😢'].map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => addReaction(currentVideo.id, emoji)}
                  style={styles.reactionButton}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderVideoMessages = () => (
    <ScrollView style={styles.messagesContainer}>
      <Text style={styles.sectionTitle}>Video Messages</Text>
      
      <View style={styles.messagesGrid}>
        {videoMessages.map(message => (
          <TouchableOpacity
            key={message.id}
            onPress={() => playVideo(message)}
            style={styles.messageCard}
          >
            <GlassCard style={styles.messageCardContent}>
              {/* Thumbnail */}
              <View style={styles.thumbnailContainer}>
                <Icon name="play-circle" size={40} color="#FFFFFF" style={styles.playIcon} />
                {!message.viewed && <View style={styles.unviewedBadge} />}
              </View>
              
              {/* Message Info */}
              <Text style={styles.messageSender}>{message.sender}</Text>
              <Text style={styles.messageDuration}>
                {formatDuration(message.duration)}
              </Text>
              
              {/* Reactions */}
              {message.reactions.length > 0 && (
                <View style={styles.messageReactions}>
                  {message.reactions.slice(0, 3).map((reaction, index) => (
                    <Text key={index} style={styles.messageReaction}>
                      {reaction.emoji}
                    </Text>
                  ))}
                  {message.reactions.length > 3 && (
                    <Text style={styles.moreReactions}>
                      +{message.reactions.length - 3}
                    </Text>
                  )}
                </View>
              )}
            </GlassCard>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={MetrTheme.colors.gradients.dark}
        style={StyleSheet.absoluteFillObject}
      />
      
      {renderCamera()}
      {renderVideoMessages()}
      {renderVideoPlayer()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    height: screenHeight * 0.6,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
    gap: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingStatus: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  recordingTime: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filtersContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  filterButton: {
    alignItems: 'center',
    marginRight: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  filterName: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 4,
  },
  recordButtonInner: {
    flex: 1,
    backgroundColor: '#FF0000',
    borderRadius: 36,
  },
  recordButtonRecording: {
    borderRadius: 12,
  },
  effectsButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 18,
    color: MetrTheme.colors.dark.text,
    marginTop: 16,
  },
  permissionButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: MetrTheme.colors.primary.electric,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  messagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  messageCard: {
    width: (screenWidth - 60) / 2,
    marginBottom: 16,
  },
  messageCardContent: {
    padding: 12,
  },
  thumbnailContainer: {
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playIcon: {
    opacity: 0.8,
  },
  unviewedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: MetrTheme.colors.primary.pink,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  messageDuration: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 2,
  },
  messageReactions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  messageReaction: {
    fontSize: 16,
    marginRight: 4,
  },
  moreReactions: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    alignSelf: 'center',
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoPlayer: {
    flex: 1,
  },
  playerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -25}, {translateY: -25}],
  },
  videoInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  videoSender: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoTimestamp: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  videoTranscription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 12,
    fontStyle: 'italic',
  },
  reactionsBar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionEmoji: {
    fontSize: 24,
  },
});
