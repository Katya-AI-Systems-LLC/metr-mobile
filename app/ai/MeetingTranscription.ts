// MeetingTranscription.ts - AI-Powered Meeting Transcription & Analysis
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';

interface MeetingTranscript {
  id: string;
  meetingId: string;
  title: string;
  date: Date;
  duration: number;
  participants: Participant[];
  transcript: TranscriptSegment[];
  summary: MeetingSummary;
  actionItems: ActionItem[];
  decisions: Decision[];
  topics: Topic[];
  sentiment: SentimentAnalysis;
  recording?: string;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  speakingTime: number;
  contributions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: number;
  confidence: number;
  keywords?: string[];
  emotion?: string;
}

interface MeetingSummary {
  overview: string;
  keyPoints: string[];
  nextSteps: string[];
  risks: string[];
  opportunities: string[];
}

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  context: string;
}

interface Decision {
  id: string;
  decision: string;
  rationale: string;
  madeBy: string;
  timestamp: number;
  impact: 'high' | 'medium' | 'low';
}

interface Topic {
  name: string;
  duration: number;
  sentiment: number;
  keyPoints: string[];
}

interface SentimentAnalysis {
  overall: number;
  timeline: Array<{time: number; sentiment: number}>;
  byParticipant: Map<string, number>;
  highlights: string[];
  concerns: string[];
}

export class MeetingTranscription {
  private static instance: MeetingTranscription;
  private isRecording: boolean = false;
  private currentTranscript: TranscriptSegment[] = [];
  private currentMeetingId: string | null = null;
  private voiceRecognition: any;
  private audioBuffer: Float32Array[] = [];
  private speakerDiarization: Map<string, string> = new Map();
  
  private constructor() {
    this.initializeVoiceRecognition();
  }

  public static getInstance(): MeetingTranscription {
    if (!MeetingTranscription.instance) {
      MeetingTranscription.instance = new MeetingTranscription();
    }
    return MeetingTranscription.instance;
  }

  private async initializeVoiceRecognition() {
    try {
      Voice.onSpeechStart = this.onSpeechStart.bind(this);
      Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
      Voice.onSpeechResults = this.onSpeechResults.bind(this);
      Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
      Voice.onSpeechError = this.onSpeechError.bind(this);
    } catch (error) {
      console.error('Failed to initialize voice recognition:', error);
    }
  }

  // Start meeting transcription
  public async startMeeting(
    title: string,
    participants: string[]
  ): Promise<string> {
    const meetingId = `meeting_${Date.now()}`;
    this.currentMeetingId = meetingId;
    this.currentTranscript = [];
    this.isRecording = true;

    // Initialize speaker profiles
    participants.forEach(participant => {
      this.speakerDiarization.set(participant, '');
    });

    // Start voice recognition
    try {
      await Voice.start('en-US');
      console.log('Meeting transcription started:', meetingId);
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
    }

    return meetingId;
  }

  // Stop meeting transcription
  public async stopMeeting(): Promise<MeetingTranscript | null> {
    if (!this.currentMeetingId) return null;

    this.isRecording = false;
    
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }

    // Process and analyze transcript
    const transcript = await this.processTranscript();
    
    // Save transcript
    await this.saveTranscript(transcript);
    
    // Reset
    this.currentMeetingId = null;
    this.currentTranscript = [];
    
    return transcript;
  }

  // Voice recognition callbacks
  private onSpeechStart(e: any) {
    console.log('Speech recognition started');
  }

  private onSpeechEnd(e: any) {
    console.log('Speech recognition ended');
  }

  private onSpeechResults(e: any) {
    if (!e.value || e.value.length === 0) return;

    const text = e.value[0];
    const speaker = this.identifySpeaker(e.voice || {});
    
    const segment: TranscriptSegment = {
      id: `seg_${Date.now()}`,
      speaker,
      text,
      timestamp: Date.now(),
      confidence: e.confidence || 0.9,
      keywords: this.extractKeywords(text),
      emotion: this.detectEmotion(text),
    };

    this.currentTranscript.push(segment);
    
    // Real-time action item detection
    const actionItem = this.detectActionItem(text, speaker);
    if (actionItem) {
      console.log('Action item detected:', actionItem);
    }
  }

  private onSpeechPartialResults(e: any) {
    // Handle partial results for real-time display
    if (e.value && e.value.length > 0) {
      console.log('Partial:', e.value[0]);
    }
  }

  private onSpeechError(e: any) {
    console.error('Speech recognition error:', e);
  }

  // Speaker identification (simplified)
  private identifySpeaker(voiceFeatures: any): string {
    // In production, use voice biometrics or ML model
    // For now, use simple round-robin or voice characteristics
    const speakers = Array.from(this.speakerDiarization.keys());
    return speakers[Math.floor(Math.random() * speakers.length)] || 'Unknown';
  }

  // Extract keywords from text
  private extractKeywords(text: string): string[] {
    const importantWords = [
      'deadline', 'priority', 'budget', 'risk', 'opportunity',
      'decision', 'action', 'responsibility', 'milestone', 'blocker',
      'critical', 'urgent', 'important', 'issue', 'solution',
    ];

    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => importantWords.includes(word));
  }

  // Detect emotion from text
  private detectEmotion(text: string): string {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('concern') || textLower.includes('worry')) {
      return 'concerned';
    }
    if (textLower.includes('excited') || textLower.includes('great')) {
      return 'positive';
    }
    if (textLower.includes('frustrated') || textLower.includes('problem')) {
      return 'frustrated';
    }
    
    return 'neutral';
  }

  // Detect action items in real-time
  private detectActionItem(text: string, speaker: string): ActionItem | null {
    const actionPhrases = [
      'will do', 'i\'ll handle', 'i\'ll take care',
      'action item', 'todo', 'need to',
      'should', 'must', 'have to',
      'by tomorrow', 'by next week', 'deadline',
    ];

    const textLower = text.toLowerCase();
    const hasAction = actionPhrases.some(phrase => textLower.includes(phrase));

    if (hasAction) {
      return {
        id: `action_${Date.now()}`,
        task: text,
        assignee: speaker,
        deadline: this.extractDeadline(text),
        priority: this.extractPriority(text),
        status: 'pending',
        context: text,
      };
    }

    return null;
  }

  // Extract deadline from text
  private extractDeadline(text: string): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (text.toLowerCase().includes('tomorrow')) {
      return tomorrow;
    }
    if (text.toLowerCase().includes('next week')) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    if (text.toLowerCase().includes('end of month')) {
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
      return endOfMonth;
    }
    
    // Default: one week from now
    const oneWeek = new Date();
    oneWeek.setDate(oneWeek.getDate() + 7);
    return oneWeek;
  }

  // Extract priority from text
  private extractPriority(text: string): 'high' | 'medium' | 'low' {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('urgent') || textLower.includes('critical') || 
        textLower.includes('asap') || textLower.includes('immediately')) {
      return 'high';
    }
    if (textLower.includes('important') || textLower.includes('priority')) {
      return 'medium';
    }
    
    return 'low';
  }

  // Process complete transcript
  private async processTranscript(): Promise<MeetingTranscript> {
    const participants = this.analyzeParticipants();
    const summary = await this.generateSummary();
    const actionItems = this.extractAllActionItems();
    const decisions = this.extractDecisions();
    const topics = this.identifyTopics();
    const sentiment = this.analyzeSentiment();

    return {
      id: `transcript_${Date.now()}`,
      meetingId: this.currentMeetingId!,
      title: `Meeting ${new Date().toLocaleDateString()}`,
      date: new Date(),
      duration: this.calculateDuration(),
      participants,
      transcript: this.currentTranscript,
      summary,
      actionItems,
      decisions,
      topics,
      sentiment,
    };
  }

  // Analyze participant contributions
  private analyzeParticipants(): Participant[] {
    const participants = new Map<string, Participant>();

    this.currentTranscript.forEach(segment => {
      if (!participants.has(segment.speaker)) {
        participants.set(segment.speaker, {
          id: `participant_${segment.speaker}`,
          name: segment.speaker,
          role: 'Participant',
          speakingTime: 0,
          contributions: 0,
          sentiment: 'neutral',
        });
      }

      const participant = participants.get(segment.speaker)!;
      participant.speakingTime += segment.text.split(' ').length * 0.5; // Estimate
      participant.contributions++;
    });

    return Array.from(participants.values());
  }

  // Generate meeting summary using AI
  private async generateSummary(): Promise<MeetingSummary> {
    const fullText = this.currentTranscript.map(s => s.text).join(' ');
    
    // Extract key points
    const keyPoints = this.extractKeyPoints(fullText);
    
    // Identify next steps
    const nextSteps = this.currentTranscript
      .filter(s => s.text.toLowerCase().includes('next step') || 
                   s.text.toLowerCase().includes('follow up'))
      .map(s => s.text)
      .slice(0, 5);

    // Identify risks
    const risks = this.currentTranscript
      .filter(s => s.text.toLowerCase().includes('risk') || 
                   s.text.toLowerCase().includes('concern'))
      .map(s => s.text)
      .slice(0, 3);

    // Identify opportunities
    const opportunities = this.currentTranscript
      .filter(s => s.text.toLowerCase().includes('opportunity') || 
                   s.text.toLowerCase().includes('potential'))
      .map(s => s.text)
      .slice(0, 3);

    return {
      overview: `Meeting with ${this.speakerDiarization.size} participants discussing ${keyPoints.length} key topics.`,
      keyPoints,
      nextSteps,
      risks,
      opportunities,
    };
  }

  // Extract key points from text
  private extractKeyPoints(text: string): string[] {
    const sentences = text.split(/[.!?]+/);
    const keyPoints: string[] = [];
    
    // Simple extraction based on importance indicators
    sentences.forEach(sentence => {
      if (sentence.includes('important') || 
          sentence.includes('key') || 
          sentence.includes('critical') ||
          sentence.includes('decided') ||
          sentence.includes('agreed')) {
        keyPoints.push(sentence.trim());
      }
    });

    return keyPoints.slice(0, 5);
  }

  // Extract all action items from transcript
  private extractAllActionItems(): ActionItem[] {
    const actionItems: ActionItem[] = [];

    this.currentTranscript.forEach(segment => {
      const actionItem = this.detectActionItem(segment.text, segment.speaker);
      if (actionItem) {
        actionItems.push(actionItem);
      }
    });

    return actionItems;
  }

  // Extract decisions from transcript
  private extractDecisions(): Decision[] {
    const decisions: Decision[] = [];

    this.currentTranscript.forEach(segment => {
      const textLower = segment.text.toLowerCase();
      if (textLower.includes('decided') || 
          textLower.includes('agreed') || 
          textLower.includes('decision')) {
        decisions.push({
          id: `decision_${Date.now()}`,
          decision: segment.text,
          rationale: '',
          madeBy: segment.speaker,
          timestamp: segment.timestamp,
          impact: 'medium',
        });
      }
    });

    return decisions;
  }

  // Identify discussion topics
  private identifyTopics(): Topic[] {
    // Group transcript by topics using simple clustering
    const topics = new Map<string, Topic>();
    
    this.currentTranscript.forEach(segment => {
      const keywords = segment.keywords || [];
      const topicName = keywords[0] || 'General';
      
      if (!topics.has(topicName)) {
        topics.set(topicName, {
          name: topicName,
          duration: 0,
          sentiment: 0,
          keyPoints: [],
        });
      }
      
      const topic = topics.get(topicName)!;
      topic.duration++;
      topic.keyPoints.push(segment.text);
    });

    return Array.from(topics.values());
  }

  // Analyze overall sentiment
  private analyzeSentiment(): SentimentAnalysis {
    let overallSentiment = 0;
    const timeline: Array<{time: number; sentiment: number}> = [];
    const byParticipant = new Map<string, number>();
    const highlights: string[] = [];
    const concerns: string[] = [];

    this.currentTranscript.forEach(segment => {
      const sentimentScore = this.calculateSentimentScore(segment.text);
      overallSentiment += sentimentScore;
      
      timeline.push({
        time: segment.timestamp,
        sentiment: sentimentScore,
      });

      // Track by participant
      const current = byParticipant.get(segment.speaker) || 0;
      byParticipant.set(segment.speaker, current + sentimentScore);

      // Collect highlights and concerns
      if (sentimentScore > 0.5) {
        highlights.push(segment.text);
      } else if (sentimentScore < -0.5) {
        concerns.push(segment.text);
      }
    });

    return {
      overall: overallSentiment / this.currentTranscript.length,
      timeline,
      byParticipant,
      highlights: highlights.slice(0, 3),
      concerns: concerns.slice(0, 3),
    };
  }

  // Calculate sentiment score for text
  private calculateSentimentScore(text: string): number {
    const positive = ['good', 'great', 'excellent', 'happy', 'success', 'achieve'];
    const negative = ['bad', 'problem', 'issue', 'concern', 'fail', 'difficult'];
    
    let score = 0;
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (positive.includes(word)) score += 0.2;
      if (negative.includes(word)) score -= 0.2;
    });

    return Math.max(-1, Math.min(1, score));
  }

  // Calculate meeting duration
  private calculateDuration(): number {
    if (this.currentTranscript.length < 2) return 0;
    
    const first = this.currentTranscript[0].timestamp;
    const last = this.currentTranscript[this.currentTranscript.length - 1].timestamp;
    
    return (last - first) / 1000; // in seconds
  }

  // Save transcript to storage
  private async saveTranscript(transcript: MeetingTranscript): Promise<void> {
    try {
      const transcripts = await this.getAllTranscripts();
      transcripts.push(transcript);
      await AsyncStorage.setItem('meeting_transcripts', JSON.stringify(transcripts));
    } catch (error) {
      console.error('Failed to save transcript:', error);
    }
  }

  // Get all transcripts
  public async getAllTranscripts(): Promise<MeetingTranscript[]> {
    try {
      const saved = await AsyncStorage.getItem('meeting_transcripts');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load transcripts:', error);
      return [];
    }
  }

  // Search transcripts
  public async searchTranscripts(query: string): Promise<MeetingTranscript[]> {
    const transcripts = await this.getAllTranscripts();
    
    return transcripts.filter(transcript => {
      const searchText = query.toLowerCase();
      return transcript.transcript.some(segment => 
        segment.text.toLowerCase().includes(searchText)
      );
    });
  }

  // Export transcript
  public async exportTranscript(
    transcriptId: string,
    format: 'txt' | 'json' | 'pdf'
  ): Promise<string> {
    const transcripts = await this.getAllTranscripts();
    const transcript = transcripts.find(t => t.id === transcriptId);
    
    if (!transcript) throw new Error('Transcript not found');

    switch (format) {
      case 'txt':
        return this.exportAsText(transcript);
      case 'json':
        return JSON.stringify(transcript, null, 2);
      case 'pdf':
        return this.exportAsPDF(transcript);
      default:
        throw new Error('Unsupported format');
    }
  }

  private exportAsText(transcript: MeetingTranscript): string {
    let text = `Meeting: ${transcript.title}\n`;
    text += `Date: ${transcript.date}\n`;
    text += `Duration: ${transcript.duration} seconds\n\n`;
    
    text += 'TRANSCRIPT:\n';
    transcript.transcript.forEach(segment => {
      text += `${segment.speaker}: ${segment.text}\n`;
    });
    
    text += '\n\nACTION ITEMS:\n';
    transcript.actionItems.forEach(item => {
      text += `- ${item.task} (${item.assignee})\n`;
    });
    
    return text;
  }

  private exportAsPDF(transcript: MeetingTranscript): string {
    // In production, use PDF generation library
    return 'PDF export not implemented';
  }
}
