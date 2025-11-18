// TimeCapsules.tsx - Messages to the Future for Teams
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimeCapsule {
  id: string;
  type: 'personal' | 'team' | 'milestone' | 'prediction';
  title: string;
  message: string;
  attachments: Attachment[];
  createdBy: string;
  createdAt: Date;
  openDate: Date;
  recipients: string[];
  isOpened: boolean;
  openedAt?: Date;
  reactions?: {[emoji: string]: string[]};
  tags: string[];
  location?: {latitude: number; longitude: number; name: string};
  mood?: string;
  predictions?: Prediction[];
}

interface Attachment {
  type: 'photo' | 'video' | 'audio' | 'document';
  uri: string;
  name: string;
  thumbnail?: string;
}

interface Prediction {
  id: string;
  question: string;
  prediction: string;
  confidence: number;
  actualOutcome?: string;
  wasCorrect?: boolean;
}

const CAPSULE_TEMPLATES = [
  {
    id: 'new_year',
    title: 'New Year Resolutions',
    icon: 'party-popper',
    prompts: [
      'What are your goals for next year?',
      'What do you hope to achieve?',
      'What habits will you build?',
    ],
    duration: 365,
  },
  {
    id: 'project_launch',
    title: 'Project Time Capsule',
    icon: 'rocket',
    prompts: [
      'How do you feel about this project?',
      'What challenges do you expect?',
      'What will success look like?',
    ],
    duration: 90,
  },
  {
    id: 'team_memories',
    title: 'Team Memories',
    icon: 'account-group',
    prompts: [
      'What makes this team special?',
      'Favorite team moment so far?',
      'Message to future team members?',
    ],
    duration: 180,
  },
  {
    id: 'personal_growth',
    title: 'Future Self',
    icon: 'head-lightbulb',
    prompts: [
      'Letter to your future self',
      'Where will you be in 5 years?',
      'What advice would you give?',
    ],
    duration: 1825,
  },
];

export const TimeCapsules: React.FC = () => {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(CAPSULE_TEMPLATES[0]);
  const [newCapsule, setNewCapsule] = useState<Partial<TimeCapsule>>({
    type: 'personal',
    title: '',
    message: '',
    attachments: [],
    recipients: [],
    tags: [],
    predictions: [],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [filter, setFilter] = useState<'all' | 'unopened' | 'opened' | 'upcoming'>('all');

  useEffect(() => {
    loadCapsules();
    checkForOpenableCapsules();
    
    // Check daily for capsules to open
    const interval = setInterval(checkForOpenableCapsules, 86400000);
    return () => clearInterval(interval);
  }, []);

  const loadCapsules = async () => {
    try {
      const saved = await AsyncStorage.getItem('time_capsules');
      if (saved) {
        const loaded = JSON.parse(saved);
        setCapsules(loaded.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          openDate: new Date(c.openDate),
          openedAt: c.openedAt ? new Date(c.openedAt) : undefined,
        })));
      }
    } catch (error) {
      console.error('Failed to load time capsules:', error);
    }
  };

  const saveCapsules = async (updated: TimeCapsule[]) => {
    try {
      await AsyncStorage.setItem('time_capsules', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save time capsules:', error);
    }
  };

  const checkForOpenableCapsules = () => {
    const now = new Date();
    const openable = capsules.filter(c => 
      !c.isOpened && new Date(c.openDate) <= now
    );

    openable.forEach(capsule => {
      Alert.alert(
        '⏰ Time Capsule Ready!',
        `"${capsule.title}" can now be opened!`,
        [
          {text: 'Later', style: 'cancel'},
          {text: 'Open Now', onPress: () => openCapsule(capsule.id)},
        ]
      );
    });
  };

  const createCapsule = async () => {
    if (!newCapsule.title || !newCapsule.message) {
      Alert.alert('Missing Information', 'Please add a title and message');
      return;
    }

    const capsule: TimeCapsule = {
      id: `capsule_${Date.now()}`,
      type: newCapsule.type || 'personal',
      title: newCapsule.title,
      message: newCapsule.message,
      attachments: newCapsule.attachments || [],
      createdBy: 'Current User',
      createdAt: new Date(),
      openDate: selectedDate,
      recipients: newCapsule.recipients || ['Current User'],
      isOpened: false,
      tags: newCapsule.tags || [],
      mood: detectMood(newCapsule.message),
      predictions: newCapsule.predictions || [],
    };

    const updated = [...capsules, capsule];
    setCapsules(updated);
    await saveCapsules(updated);

    // Reset form
    setNewCapsule({
      type: 'personal',
      title: '',
      message: '',
      attachments: [],
      recipients: [],
      tags: [],
      predictions: [],
    });
    setShowCreateModal(false);

    Alert.alert(
      '✨ Time Capsule Created!',
      `Your capsule will open on ${selectedDate.toLocaleDateString()}`,
      [{text: 'OK'}]
    );
  };

  const openCapsule = async (capsuleId: string) => {
    const capsule = capsules.find(c => c.id === capsuleId);
    if (!capsule || capsule.isOpened) return;

    const now = new Date();
    if (now < new Date(capsule.openDate)) {
      const daysLeft = Math.ceil(
        (new Date(capsule.openDate).getTime() - now.getTime()) / 86400000
      );
      Alert.alert(
        '🔒 Not Yet!',
        `This capsule will open in ${daysLeft} days`,
        [{text: 'OK'}]
      );
      return;
    }

    const updated = capsules.map(c => 
      c.id === capsuleId 
        ? {...c, isOpened: true, openedAt: now}
        : c
    );

    setCapsules(updated);
    await saveCapsules(updated);

    // Show celebration
    Alert.alert(
      '🎉 Time Capsule Opened!',
      'Enjoy this message from the past!',
      [{text: 'View', onPress: () => {/* Navigate to capsule view */}}]
    );
  };

  const detectMood = (text: string): string => {
    const moods: {[key: string]: string[]} = {
      '😊': ['happy', 'joy', 'excited', 'great', 'awesome'],
      '😔': ['sad', 'miss', 'difficult', 'hard', 'tough'],
      '🤔': ['think', 'wonder', 'maybe', 'perhaps', 'curious'],
      '❤️': ['love', 'heart', 'care', 'appreciate', 'grateful'],
      '🚀': ['future', 'hope', 'dream', 'goal', 'achieve'],
    };

    const textLower = text.toLowerCase();
    for (const [emoji, keywords] of Object.entries(moods)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return emoji;
      }
    }
    return '📝';
  };

  const addPrediction = () => {
    const prediction: Prediction = {
      id: `pred_${Date.now()}`,
      question: '',
      prediction: '',
      confidence: 50,
    };

    setNewCapsule({
      ...newCapsule,
      predictions: [...(newCapsule.predictions || []), prediction],
    });
  };

  const getFilteredCapsules = () => {
    const now = new Date();
    
    switch (filter) {
      case 'unopened':
        return capsules.filter(c => !c.isOpened);
      case 'opened':
        return capsules.filter(c => c.isOpened);
      case 'upcoming':
        return capsules.filter(c => !c.isOpened && new Date(c.openDate) > now)
          .sort((a, b) => new Date(a.openDate).getTime() - new Date(b.openDate).getTime());
      default:
        return capsules;
    }
  };

  const getTimeUntilOpen = (openDate: Date): string => {
    const now = new Date();
    const diff = new Date(openDate).getTime() - now.getTime();
    
    if (diff <= 0) return 'Ready to open!';
    
    const days = Math.floor(diff / 86400000);
    const years = Math.floor(days / 365);
    const months = Math.floor(days / 30);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const getCapsuleIcon = (type: string): string => {
    switch (type) {
      case 'team': return 'account-group';
      case 'milestone': return 'trophy';
      case 'prediction': return 'crystal-ball';
      default: return 'treasure-chest';
    }
  };

  const renderCapsule = (capsule: TimeCapsule) => (
    <TouchableOpacity
      key={capsule.id}
      onPress={() => capsule.isOpened ? {} : openCapsule(capsule.id)}
    >
      <GlassCard style={[
        styles.capsuleCard,
        capsule.isOpened && styles.openedCapsule,
      ]}>
        <View style={styles.capsuleHeader}>
          <View style={[
            styles.capsuleIcon,
            {backgroundColor: capsule.isOpened ? '#10B981' : MetrTheme.colors.primary.electric}
          ]}>
            <Icon 
              name={getCapsuleIcon(capsule.type)} 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.capsuleInfo}>
            <Text style={styles.capsuleTitle}>{capsule.title}</Text>
            <Text style={styles.capsuleDate}>
              Created {new Date(capsule.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {capsule.mood && (
            <Text style={styles.capsuleMood}>{capsule.mood}</Text>
          )}
        </View>

        {!capsule.isOpened ? (
          <View style={styles.lockedContent}>
            <Icon name="lock" size={32} color={MetrTheme.colors.dark.textSecondary} />
            <Text style={styles.timeRemaining}>
              Opens in {getTimeUntilOpen(capsule.openDate)}
            </Text>
            <Text style={styles.openDate}>
              {new Date(capsule.openDate).toLocaleDateString()}
            </Text>
          </View>
        ) : (
          <View style={styles.openedContent}>
            <Text style={styles.capsuleMessage}>{capsule.message}</Text>
            
            {capsule.predictions && capsule.predictions.length > 0 && (
              <View style={styles.predictions}>
                <Text style={styles.predictionsTitle}>🔮 Predictions</Text>
                {capsule.predictions.map(pred => (
                  <View key={pred.id} style={styles.prediction}>
                    <Text style={styles.predictionQ}>{pred.question}</Text>
                    <Text style={styles.predictionA}>{pred.prediction}</Text>
                  </View>
                ))}
              </View>
            )}

            {capsule.attachments.length > 0 && (
              <ScrollView horizontal style={styles.attachments}>
                {capsule.attachments.map((att, index) => (
                  <View key={index} style={styles.attachment}>
                    <Icon 
                      name={att.type === 'photo' ? 'image' : 'file'} 
                      size={20} 
                      color={MetrTheme.colors.dark.text} 
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        <View style={styles.capsuleFooter}>
          <View style={styles.recipients}>
            <Icon name="account-multiple" size={16} color={MetrTheme.colors.dark.textSecondary} />
            <Text style={styles.recipientCount}>{capsule.recipients.length}</Text>
          </View>
          
          {capsule.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <View style={styles.modal}>
      <GlassCard style={styles.modalContent}>
        <Text style={styles.modalTitle}>Create Time Capsule</Text>

        {/* Template Selection */}
        <ScrollView horizontal style={styles.templates}>
          {CAPSULE_TEMPLATES.map(template => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.template,
                selectedTemplate.id === template.id && styles.templateSelected,
              ]}
              onPress={() => setSelectedTemplate(template)}
            >
              <Icon name={template.icon} size={24} color={MetrTheme.colors.dark.text} />
              <Text style={styles.templateTitle}>{template.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Title Input */}
        <TextInput
          style={styles.input}
          placeholder="Give your capsule a title..."
          placeholderTextColor={MetrTheme.colors.dark.textSecondary}
          value={newCapsule.title}
          onChangeText={title => setNewCapsule({...newCapsule, title})}
        />

        {/* Message Input */}
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Write your message to the future..."
          placeholderTextColor={MetrTheme.colors.dark.textSecondary}
          value={newCapsule.message}
          onChangeText={message => setNewCapsule({...newCapsule, message})}
          multiline
          numberOfLines={5}
        />

        {/* Prompts */}
        <View style={styles.prompts}>
          <Text style={styles.promptsTitle}>💭 Prompts</Text>
          {selectedTemplate.prompts.map((prompt, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => setNewCapsule({
                ...newCapsule, 
                message: newCapsule.message + '\n\n' + prompt + '\n'
              })}
            >
              <Text style={styles.prompt}>• {prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Open Date Selection */}
        <TouchableOpacity 
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar" size={20} color={MetrTheme.colors.dark.text} />
          <Text style={styles.dateSelectorText}>
            Opens on {selectedDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {/* Add Prediction */}
        <TouchableOpacity style={styles.addButton} onPress={addPrediction}>
          <Icon name="plus" size={20} color={MetrTheme.colors.primary.electric} />
          <Text style={styles.addButtonText}>Add Prediction</Text>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.modalActions}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowCreateModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={createCapsule}
          >
            <Text style={styles.createButtonText}>Seal Capsule</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⏳ Time Capsules</Text>
        <Text style={styles.subtitle}>Messages to your future self & team</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'unopened', 'opened', 'upcoming'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterTabText,
              filter === f && styles.filterTabTextActive,
            ]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Capsules List */}
      <ScrollView style={styles.content}>
        {getFilteredCapsules().length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="inbox" size={64} color={MetrTheme.colors.dark.textSecondary} />
            <Text style={styles.emptyStateText}>No time capsules yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first message to the future
            </Text>
          </View>
        ) : (
          getFilteredCapsules().map(renderCapsule)
        )}
      </ScrollView>

      {/* Create Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Modal */}
      {showCreateModal && renderCreateModal()}

      {/* Date Picker */}
      <DatePicker
        modal
        open={showDatePicker}
        date={selectedDate}
        minimumDate={new Date(Date.now() + 86400000)} // Tomorrow minimum
        onConfirm={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  subtitle: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterTabActive: {
    backgroundColor: MetrTheme.colors.primary.electric,
  },
  filterTabText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 8,
  },
  capsuleCard: {
    padding: 16,
    marginBottom: 16,
  },
  openedCapsule: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  capsuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  capsuleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capsuleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  capsuleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  capsuleDate: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 2,
  },
  capsuleMood: {
    fontSize: 24,
  },
  lockedContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timeRemaining: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.primary.electric,
    marginTop: 12,
  },
  openDate: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  openedContent: {
    paddingVertical: 12,
  },
  capsuleMessage: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    lineHeight: 20,
  },
  predictions: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
  },
  predictionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 8,
  },
  prediction: {
    marginBottom: 8,
  },
  predictionQ: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  predictionA: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    marginTop: 2,
  },
  attachments: {
    marginTop: 12,
    flexDirection: 'row',
  },
  attachment: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  capsuleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  recipients: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  recipientCount: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginLeft: 4,
  },
  tag: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 11,
    color: MetrTheme.colors.primary.teal,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MetrTheme.colors.primary.electric,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginBottom: 20,
  },
  templates: {
    marginBottom: 20,
  },
  template: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  templateSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  templateTitle: {
    fontSize: 10,
    color: MetrTheme.colors.dark.text,
    marginTop: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    color: MetrTheme.colors.dark.text,
    fontSize: 14,
    marginBottom: 12,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  prompts: {
    marginBottom: 16,
  },
  promptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 8,
  },
  prompt: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginBottom: 6,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateSelectorText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 14,
    color: MetrTheme.colors.primary.electric,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  createButton: {
    flex: 1,
    backgroundColor: MetrTheme.colors.primary.electric,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
