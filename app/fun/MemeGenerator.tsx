// MemeGenerator.tsx - AI-Powered Meme Generator for Team Fun
import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Share,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  category: 'work' | 'meeting' | 'deadline' | 'bug' | 'deploy' | 'coffee' | 'custom';
  textAreas: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    placeholder: string;
  }>;
}

interface SavedMeme {
  id: string;
  templateId: string;
  texts: string[];
  createdAt: Date;
  author: string;
  reactions: {[emoji: string]: string[]};
  shares: number;
  imageUri?: string;
}

const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'drake',
    name: 'Drake',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    category: 'work',
    textAreas: [
      {x: 350, y: 100, width: 250, height: 100, placeholder: 'Thing I avoid'},
      {x: 350, y: 300, width: 250, height: 100, placeholder: 'Thing I prefer'},
    ],
  },
  {
    id: 'distracted',
    name: 'Distracted Boyfriend',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    category: 'work',
    textAreas: [
      {x: 100, y: 300, width: 150, height: 50, placeholder: 'Current solution'},
      {x: 350, y: 200, width: 150, height: 50, placeholder: 'New shiny tech'},
      {x: 500, y: 300, width: 150, height: 50, placeholder: 'Me'},
    ],
  },
  {
    id: 'this_is_fine',
    name: 'This is Fine',
    url: 'https://i.imgflip.com/wxica.jpg',
    category: 'deadline',
    textAreas: [
      {x: 150, y: 50, width: 300, height: 50, placeholder: 'The situation'},
      {x: 150, y: 350, width: 300, height: 50, placeholder: 'Me saying it\'s fine'},
    ],
  },
  {
    id: 'batman_slap',
    name: 'Batman Slapping Robin',
    url: 'https://i.imgflip.com/9ehk.jpg',
    category: 'bug',
    textAreas: [
      {x: 100, y: 50, width: 200, height: 50, placeholder: 'Bad suggestion'},
      {x: 350, y: 50, width: 200, height: 50, placeholder: 'Better solution'},
    ],
  },
];

export const MemeGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(MEME_TEMPLATES[0]);
  const [memeTexts, setMemeTexts] = useState<string[]>([]);
  const [savedMemes, setSavedMemes] = useState<SavedMeme[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  useState(() => {
    loadSavedMemes();
  });

  const loadSavedMemes = async () => {
    try {
      const saved = await AsyncStorage.getItem('saved_memes');
      if (saved) {
        setSavedMemes(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved memes:', error);
    }
  };

  const generateAISuggestions = async () => {
    setIsGenerating(true);
    setShowAISuggestions(true);
    
    // Simulate AI generating contextual meme text
    setTimeout(() => {
      const suggestions = getContextualSuggestions(selectedTemplate.category);
      setMemeTexts(suggestions);
      setIsGenerating(false);
    }, 1500);
  };

  const getContextualSuggestions = (category: string): string[] => {
    const suggestions: {[key: string]: string[][]} = {
      work: [
        ['Writing documentation', 'Shipping features'],
        ['Manual testing', 'Automated testing'],
        ['Friday deploy', 'Monday fix'],
      ],
      meeting: [
        ['Could have been an email', 'Another meeting'],
        ['5 min standup', '45 min discussion'],
        ['Agenda', 'Random tangents'],
      ],
      deadline: [
        ['Everything is on fire', 'This is fine'],
        ['Project deadline tomorrow', "Haven't started yet"],
        ['Client requirements', 'What we delivered'],
      ],
      bug: [
        ['It works on my machine', 'Production is down'],
        ['Quick fix', '3 days of debugging'],
        ['One line change', 'Breaks everything'],
      ],
      deploy: [
        ['Testing in production', 'Following best practices'],
        ['Deploy on Friday', 'Enjoy weekend'],
        ['It passed CI/CD', 'Users found bugs'],
      ],
      coffee: [
        ['Before coffee', 'After coffee'],
        ['Decaf', 'Triple espresso'],
        ['Tea person', 'Coffee addicts'],
      ],
      custom: [
        ['Old way', 'New way'],
        ['Expectation', 'Reality'],
        ['Plan', 'Actual execution'],
      ],
    };

    const categorysuggestions = suggestions[category] || suggestions.custom;
    const randomIndex = Math.floor(Math.random() * categorysuggestions.length);
    return categorysuggestions[randomIndex];
  };

  const captureMeme = async () => {
    if (!viewShotRef.current) return;
    
    try {
      const uri = await viewShotRef.current.capture();
      
      const newMeme: SavedMeme = {
        id: `meme_${Date.now()}`,
        templateId: selectedTemplate.id,
        texts: memeTexts,
        createdAt: new Date(),
        author: 'current_user',
        reactions: {},
        shares: 0,
        imageUri: uri,
      };
      
      const updatedMemes = [...savedMemes, newMeme];
      setSavedMemes(updatedMemes);
      await AsyncStorage.setItem('saved_memes', JSON.stringify(updatedMemes));
      
      Alert.alert('Success!', 'Meme saved to gallery');
      return uri;
    } catch (error) {
      console.error('Failed to capture meme:', error);
      Alert.alert('Error', 'Failed to save meme');
    }
  };

  const shareMeme = async () => {
    const uri = await captureMeme();
    if (!uri) return;
    
    try {
      await Share.share({
        message: `Check out this meme from METR! 😂`,
        url: uri,
        title: 'METR Meme',
      });
    } catch (error) {
      console.error('Failed to share meme:', error);
    }
  };

  const reactToMeme = async (memeId: string, emoji: string) => {
    const meme = savedMemes.find(m => m.id === memeId);
    if (!meme) return;
    
    if (!meme.reactions[emoji]) {
      meme.reactions[emoji] = [];
    }
    
    const userId = 'current_user';
    if (!meme.reactions[emoji].includes(userId)) {
      meme.reactions[emoji].push(userId);
    } else {
      meme.reactions[emoji] = meme.reactions[emoji].filter(id => id !== userId);
    }
    
    const updatedMemes = savedMemes.map(m => m.id === memeId ? meme : m);
    setSavedMemes(updatedMemes);
    await AsyncStorage.setItem('saved_memes', JSON.stringify(updatedMemes));
  };

  const renderMemeCreator = () => (
    <View style={styles.creatorContainer}>
      <ViewShot ref={viewShotRef} style={styles.memeCanvas}>
        <Image 
          source={{uri: selectedTemplate.url}} 
          style={styles.memeImage}
          resizeMode="contain"
        />
        {selectedTemplate.textAreas.map((area, index) => (
          <View 
            key={index}
            style={[
              styles.memeTextContainer,
              {
                position: 'absolute',
                left: area.x * 0.5, // Scale for mobile
                top: area.y * 0.5,
                width: area.width * 0.5,
                height: area.height * 0.5,
              }
            ]}
          >
            <Text style={styles.memeText}>
              {memeTexts[index] || area.placeholder}
            </Text>
          </View>
        ))}
      </ViewShot>

      <View style={styles.textInputsContainer}>
        {selectedTemplate.textAreas.map((area, index) => (
          <TextInput
            key={index}
            style={styles.textInput}
            placeholder={area.placeholder}
            placeholderTextColor={MetrTheme.colors.dark.textSecondary}
            value={memeTexts[index] || ''}
            onChangeText={(text) => {
              const newTexts = [...memeTexts];
              newTexts[index] = text;
              setMemeTexts(newTexts);
            }}
            multiline
          />
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.aiButton}
          onPress={generateAISuggestions}
          disabled={isGenerating}
        >
          <Icon name="robot" size={20} color="#FFFFFF" />
          <Text style={styles.aiButtonText}>
            {isGenerating ? 'Generating...' : 'AI Suggest'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={captureMeme}>
          <Icon name="content-save" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={shareMeme}>
          <Icon name="share-variant" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTemplateSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateSelector}>
      {MEME_TEMPLATES.map(template => (
        <TouchableOpacity
          key={template.id}
          style={[
            styles.templateOption,
            selectedTemplate.id === template.id && styles.templateOptionSelected
          ]}
          onPress={() => {
            setSelectedTemplate(template);
            setMemeTexts([]);
          }}
        >
          <Image source={{uri: template.url}} style={styles.templateThumb} />
          <Text style={styles.templateName}>{template.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSavedMemes = () => (
    <ScrollView style={styles.savedMemesContainer}>
      <Text style={styles.sectionTitle}>Team Memes Gallery</Text>
      {savedMemes.reverse().map(meme => (
        <GlassCard key={meme.id} style={styles.savedMemeCard}>
          <Image 
            source={{uri: meme.imageUri || MEME_TEMPLATES.find(t => t.id === meme.templateId)?.url}} 
            style={styles.savedMemeImage}
            resizeMode="contain"
          />
          <View style={styles.memeFooter}>
            <Text style={styles.memeAuthor}>by {meme.author}</Text>
            <View style={styles.reactions}>
              {['😂', '🔥', '💯', '👏', '❤️'].map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionButton}
                  onPress={() => reactToMeme(meme.id, emoji)}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  {meme.reactions[emoji] && meme.reactions[emoji].length > 0 && (
                    <Text style={styles.reactionCount}>
                      {meme.reactions[emoji].length}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </GlassCard>
      ))}
    </ScrollView>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎭 Meme Generator</Text>
        <Text style={styles.subtitle}>Create team memes with AI</Text>
      </View>

      {renderTemplateSelector()}
      {renderMemeCreator()}
      
      {showAISuggestions && (
        <GlassCard style={styles.suggestionsCard}>
          <Text style={styles.suggestionsTitle}>💡 AI Generated Ideas:</Text>
          {memeTexts.map((text, index) => (
            <Text key={index} style={styles.suggestionText}>• {text}</Text>
          ))}
        </GlassCard>
      )}
      
      {renderSavedMemes()}
    </ScrollView>
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
  templateSelector: {
    maxHeight: 120,
    paddingHorizontal: 20,
  },
  templateOption: {
    marginRight: 12,
    alignItems: 'center',
    opacity: 0.7,
  },
  templateOptionSelected: {
    opacity: 1,
  },
  templateThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  templateName: {
    fontSize: 12,
    color: MetrTheme.colors.dark.text,
    marginTop: 4,
  },
  creatorContainer: {
    padding: 20,
  },
  memeCanvas: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  memeImage: {
    width: '100%',
    height: 300,
  },
  memeTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  memeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: '#000',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 3,
  },
  textInputsContainer: {
    marginTop: 20,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    color: MetrTheme.colors.dark.text,
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  aiButton: {
    flexDirection: 'row',
    backgroundColor: MetrTheme.colors.primary.electric,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: MetrTheme.colors.primary.teal,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: MetrTheme.colors.primary.pink,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  suggestionsCard: {
    margin: 20,
    padding: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginVertical: 4,
  },
  savedMemesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  savedMemeCard: {
    marginBottom: 16,
    padding: 12,
  },
  savedMemeImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  memeFooter: {
    marginTop: 12,
  },
  memeAuthor: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  reactions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    padding: 4,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionCount: {
    fontSize: 12,
    color: MetrTheme.colors.dark.text,
    marginLeft: 4,
  },
});
