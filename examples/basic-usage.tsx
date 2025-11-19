/**
 * METR - Basic Usage Examples
 * 
 * Этот файл содержит примеры использования основных функций METR
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import METR from '../app/core/METRIntegration';
import {METRButton} from '../app/components/ui/METRButton';
import {METRCard} from '../app/components/ui/METRCard';
import {METRInput} from '../app/components/ui/METRInput';
import {METRAvatar} from '../app/components/profile/METRAvatar';
import {MetrTheme} from '../app/theme/metrTheme';

// Example 1: Using AI Assistant
export const AIAssistantExample = () => {
  const [response, setResponse] = useState('');
  const [question, setQuestion] = useState('');

  const askAI = async () => {
    try {
      const answer = await METR.AI.personal.ask(question);
      setResponse(answer);
    } catch (error) {
      console.error('AI Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <METRInput
        placeholder="Ask AI assistant..."
        value={question}
        onChangeText={setQuestion}
      />
      <METRButton title="Ask" onPress={askAI} />
      {response && <Text style={styles.response}>{response}</Text>}
    </View>
  );
};

// Example 2: Using Web3 Features
export const Web3Example = () => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const address = METR.Quantum.emotionalBlockchain.getWalletAddress();
        if (address) {
          const userAchievements = await METR.Quantum.emotionalBlockchain.getUserAchievements(address);
          setAchievements(userAchievements);
        }
      } catch (error) {
        console.error('Web3 Error:', error);
      }
    };

    loadAchievements();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NFT Achievements</Text>
      {achievements.map((achievement, index) => (
        <METRCard key={index} variant="glass">
          <Text>{achievement.name}</Text>
        </METRCard>
      ))}
    </View>
  );
};

// Example 3: Using Virtual Office
export const VirtualOfficeExample = () => {
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    const loadSpaces = async () => {
      try {
        const availableSpaces = await METR.ARVR.virtualOffice.getAvailableSpaces();
        setSpaces(availableSpaces);
      } catch (error) {
        console.error('AR/VR Error:', error);
      }
    };

    loadSpaces();
  }, []);

  const joinSpace = async (spaceId: string) => {
    try {
      await METR.ARVR.virtualOffice.joinSpace(spaceId);
    } catch (error) {
      console.error('Join Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Virtual Offices</Text>
      {spaces.map((space) => (
        <METRCard key={space.id} variant="glass">
          <Text>{space.name}</Text>
          <METRButton
            title="Join"
            onPress={() => joinSpace(space.id)}
            size="small"
          />
        </METRCard>
      ))}
    </View>
  );
};

// Example 4: Using Security Features
export const SecurityExample = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authenticate = async () => {
    try {
      const result = await METR.Security.biometricAuth.authenticate();
      setIsAuthenticated(result);
    } catch (error) {
      console.error('Auth Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <METRButton
        title={isAuthenticated ? 'Authenticated' : 'Authenticate'}
        onPress={authenticate}
        disabled={isAuthenticated}
      />
    </View>
  );
};

// Example 5: Complete App Example
export const CompleteAppExample = () => {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <METRAvatar
          size={80}
          name="John Doe"
          variant="gradient"
          status="online"
        />
        <Text style={styles.title}>Welcome to METR</Text>
        
        <AIAssistantExample />
        <Web3Example />
        <VirtualOfficeExample />
        <SecurityExample />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
    marginBottom: 20,
  },
  response: {
    marginTop: 10,
    color: MetrTheme.colors.dark.text,
  },
});


