// VoiceNotes.tsx - Voice Notes with Transcription for METR
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Voice from '@react-native-voice/voice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const audioRecorderPlayer = new AudioRecorderPlayer();

interface VoiceNote {
  id: string;
  uri: string;
  duration: number;
  transcription: string;
  timestamp: Date;
  author: string;
  tags: string[];
  language: string;
  confidence: number;
}

export const VoiceNotes: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const waveformAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechError = onSpeechError;
    loadVoiceNotes();
    
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const loadVoiceNotes = async () => {
    const stored = await AsyncStorage.getItem('voice_notes');
    if (stored) setVoiceNotes(JSON.parse(stored));
  };

  const startRecording = async () => {
    try {
      const path = await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener((e) => {
        setCurrentPosition(e.currentPosition);
        setCurrentDuration(e.currentMetering || 0);
      });
      
      setIsRecording(true);
      
      // Start voice recognition
      await Voice.start('en-US');
      setIsTranscribing(true);
      
      // Start waveform animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } catch (error) {
      console.error('Start recording error:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      
      // Stop voice recognition
      await Voice.stop();
      setIsTranscribing(false);
      
      // Stop animation
      waveformAnimation.setValue(0);
      
      // Save voice note
      const voiceNote: VoiceNote = {
        id: Date.now().toString(),
        uri: result,
        duration: currentPosition,
        transcription: transcription || 'No transcription available',
        timestamp: new Date(),
        author: 'Current User',
        tags: extractTags(transcription),
        language: 'en-US',
        confidence: 0.95,
      };
      
      const updated = [...voiceNotes, voiceNote];
      setVoiceNotes(updated);
      await AsyncStorage.setItem('voice_notes', JSON.stringify(updated));
      
      setTranscription('');
      Alert.alert('Success', 'Voice note saved!');
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };

  const onSpeechResults = (e: any) => {
    setTranscription(e.value?.[0] || '');
  };

  const onSpeechPartialResults = (e: any) => {
    setTranscription(e.value?.[0] || '');
  };

  const onSpeechError = (e: any) => {
    console.error('Speech recognition error:', e);
  };

  const extractTags = (text: string): string[] => {
    // Extract hashtags and important keywords
    const hashtags = text.match(/#\w+/g) || [];
    const keywords = text.match(/\b(todo|important|urgent|meeting|deadline)\b/gi) || [];
    return [...hashtags, ...keywords].map(tag => tag.toLowerCase());
  };

  const playVoiceNote = async (note: VoiceNote) => {
    try {
      await audioRecorderPlayer.startPlayer(note.uri);
      audioRecorderPlayer.addPlayBackListener((e) => {
        setCurrentPosition(e.currentPosition);
        setCurrentDuration(e.duration);
        if (e.currentPosition === e.duration) {
          setIsPlaying(false);
        }
      });
      setIsPlaying(true);
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  const stopPlaying = async () => {
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setIsPlaying(false);
  };

  const deleteVoiceNote = async (id: string) => {
    const updated = voiceNotes.filter(note => note.id !== id);
    setVoiceNotes(updated);
    await AsyncStorage.setItem('voice_notes', JSON.stringify(updated));
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Recording Section */}
      <GlassCard style={styles.recordingCard}>
        <Text style={styles.title}>Voice Notes</Text>
        
        {/* Waveform Visualization */}
        <View style={styles.waveformContainer}>
          {[...Array(7)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveformBar,
                {
                  transform: [{
                    scaleY: waveformAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1 + Math.random() * 0.5],
                    }),
                  }],
                },
              ]}
            />
          ))}
        </View>

        {/* Transcription Display */}
        {isTranscribing && (
          <View style={styles.transcriptionBox}>
            <Text style={styles.transcriptionText}>
              {transcription || 'Listening...'}
            </Text>
          </View>
        )}

        {/* Recording Controls */}
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
        >
          <Icon
            name={isRecording ? 'stop' : 'microphone'}
            size={32}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        
        {isRecording && (
          <Text style={styles.recordingTime}>{formatTime(currentPosition)}</Text>
        )}
      </GlassCard>

      {/* Voice Notes List */}
      <ScrollView style={styles.notesList}>
        {voiceNotes.map(note => (
          <GlassCard key={note.id} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Icon name="microphone-variant" size={24} color={MetrTheme.colors.primary.electric} />
              <Text style={styles.noteDuration}>{formatTime(note.duration)}</Text>
              <Text style={styles.noteDate}>
                {new Date(note.timestamp).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={styles.noteTranscription}>{note.transcription}</Text>
            
            {note.tags.length > 0 && (
              <View style={styles.noteTags}>
                {note.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.noteActions}>
              <TouchableOpacity
                onPress={() => playVoiceNote(note)}
                style={styles.actionButton}
              >
                <Icon name="play" size={20} color={MetrTheme.colors.primary.teal} />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => deleteVoiceNote(note.id)}
                style={styles.actionButton}
              >
                <Icon name="delete" size={20} color={MetrTheme.colors.semantic.error} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
    padding: 20,
  },
  recordingCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginBottom: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  waveformBar: {
    width: 4,
    height: 40,
    backgroundColor: MetrTheme.colors.primary.electric,
    borderRadius: 2,
  },
  transcriptionBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 80,
  },
  transcriptionText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    lineHeight: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MetrTheme.colors.primary.electric,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordButtonActive: {
    backgroundColor: MetrTheme.colors.semantic.error,
  },
  recordingTime: {
    fontSize: 16,
    color: MetrTheme.colors.dark.textSecondary,
  },
  notesList: {
    flex: 1,
  },
  noteCard: {
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  noteDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  noteDate: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginLeft: 'auto',
  },
  noteTranscription: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: MetrTheme.colors.primary.teal,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
});
