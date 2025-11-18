// CodeCollaboration.tsx - Real-time Code Collaboration for METR
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import {atomOneDark} from 'react-syntax-highlighter/styles/hljs';

interface CodeSession {
  id: string;
  title: string;
  language: string;
  participants: Participant[];
  code: string;
  version: number;
  createdAt: Date;
}

interface Participant {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  role: 'owner' | 'editor' | 'viewer';
  cursor: {line: number; column: number};
}

export const CodeCollaboration: React.FC = () => {
  const [code, setCode] = useState('// Welcome to METR Code Collaboration\n\nfunction hello() {\n  console.log("Hello METR!");\n}');
  const [language, setLanguage] = useState('javascript');
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'You',
      color: '#8B5CF6',
      isActive: true,
      role: 'owner',
      cursor: {line: 0, column: 0},
    },
  ]);
  const [isLiveShare, setIsLiveShare] = useState(false);
  const [executionResult, setExecutionResult] = useState('');
  const [showConsole, setShowConsole] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('dark');
  
  const languages = [
    {id: 'javascript', name: 'JavaScript', icon: 'language-javascript'},
    {id: 'typescript', name: 'TypeScript', icon: 'language-typescript'},
    {id: 'python', name: 'Python', icon: 'language-python'},
    {id: 'java', name: 'Java', icon: 'language-java'},
    {id: 'cpp', name: 'C++', icon: 'language-cpp'},
    {id: 'go', name: 'Go', icon: 'language-go'},
    {id: 'rust', name: 'Rust', icon: 'cog'},
    {id: 'swift', name: 'Swift', icon: 'apple'},
  ];

  const executeCode = async () => {
    try {
      // Simulate code execution
      setShowConsole(true);
      setExecutionResult('Executing code...\n');
      
      // In production, send to backend execution service
      setTimeout(() => {
        setExecutionResult('Hello METR!\n\nExecution completed successfully.');
      }, 1000);
    } catch (error) {
      setExecutionResult(`Error: ${error.message}`);
    }
  };

  const startLiveShare = () => {
    setIsLiveShare(true);
    // Connect to WebRTC/WebSocket for real-time collaboration
    // Generate shareable link
    const sessionId = Math.random().toString(36).substring(7);
    console.log('Live share started:', sessionId);
  };

  const inviteParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: `User ${participants.length}`,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      isActive: true,
      role: 'editor',
      cursor: {line: 0, column: 0},
    };
    setParticipants([...participants, newParticipant]);
  };

  const formatCode = () => {
    // Simulate code formatting
    const formatted = code.replace(/\s+/g, ' ').trim();
    setCode(formatted);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={MetrTheme.colors.gradients.dark}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Code Collaboration</Text>
        
        <View style={styles.headerActions}>
          {/* Language Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.languageSelector}
          >
            {languages.map(lang => (
              <TouchableOpacity
                key={lang.id}
                onPress={() => setLanguage(lang.id)}
                style={[
                  styles.languageButton,
                  language === lang.id && styles.languageButtonActive,
                ]}
              >
                <Icon
                  name={lang.icon}
                  size={20}
                  color={language === lang.id ? '#FFFFFF' : MetrTheme.colors.dark.textSecondary}
                />
                <Text style={[
                  styles.languageText,
                  language === lang.id && styles.languageTextActive,
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Live Share Button */}
          <TouchableOpacity
            onPress={isLiveShare ? inviteParticipant : startLiveShare}
            style={[styles.liveShareButton, isLiveShare && styles.liveShareActive]}
          >
            <Icon
              name={isLiveShare ? 'account-plus' : 'share-variant'}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.liveShareText}>
              {isLiveShare ? 'Invite' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Participants */}
      {isLiveShare && (
        <View style={styles.participantsBar}>
          {participants.map(participant => (
            <View
              key={participant.id}
              style={[
                styles.participantBubble,
                {backgroundColor: participant.color},
              ]}
            >
              <Text style={styles.participantInitial}>
                {participant.name[0].toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Code Editor */}
      <GlassCard style={styles.editorContainer}>
        <ScrollView>
          <TextInput
            value={code}
            onChangeText={setCode}
            style={styles.codeInput}
            multiline
            placeholder="Start coding..."
            placeholderTextColor={MetrTheme.colors.dark.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </ScrollView>
        
        {/* Editor Toolbar */}
        <View style={styles.editorToolbar}>
          <TouchableOpacity onPress={formatCode} style={styles.toolButton}>
            <Icon name="format-indent-increase" size={20} color={MetrTheme.colors.primary.teal} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => {}} style={styles.toolButton}>
            <Icon name="comment-text" size={20} color={MetrTheme.colors.primary.teal} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => {}} style={styles.toolButton}>
            <Icon name="magnify" size={20} color={MetrTheme.colors.primary.teal} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={executeCode} style={styles.runButton}>
            <Icon name="play" size={20} color="#FFFFFF" />
            <Text style={styles.runButtonText}>Run</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Console Output */}
      {showConsole && (
        <GlassCard style={styles.console}>
          <View style={styles.consoleHeader}>
            <Text style={styles.consoleTitle}>Console</Text>
            <TouchableOpacity onPress={() => setShowConsole(false)}>
              <Icon name="close" size={20} color={MetrTheme.colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.consoleOutput}>
            <Text style={styles.consoleText}>{executionResult}</Text>
          </ScrollView>
        </GlassCard>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageSelector: {
    flex: 1,
    marginRight: 12,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageButtonActive: {
    backgroundColor: MetrTheme.colors.primary.electric,
  },
  languageText: {
    marginLeft: 6,
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  languageTextActive: {
    color: '#FFFFFF',
  },
  liveShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MetrTheme.colors.primary.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  liveShareActive: {
    backgroundColor: MetrTheme.colors.semantic.success,
  },
  liveShareText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  participantsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  participantBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  participantInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editorContainer: {
    flex: 1,
    margin: 20,
    padding: 16,
  },
  codeInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    lineHeight: 20,
    minHeight: 300,
  },
  editorToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    marginTop: 12,
  },
  toolButton: {
    padding: 8,
    marginRight: 16,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MetrTheme.colors.semantic.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  runButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  console: {
    height: 200,
    margin: 20,
    marginTop: 0,
    padding: 16,
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  consoleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  consoleOutput: {
    flex: 1,
  },
  consoleText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: MetrTheme.colors.semantic.success,
    lineHeight: 18,
  },
});
