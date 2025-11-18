// VoiceUI.ts - Voice Control Interface for METR
import Voice from '@react-native-voice/voice';
import {NativeModules, DeviceEventEmitter} from 'react-native';

interface VoiceCommand {
  id: string;
  phrases: string[];
  action: string;
  parameters?: any;
  callback?: (params: any) => void;
  confidence: number;
}

interface VoiceContext {
  screen: string;
  availableCommands: VoiceCommand[];
  lastCommand?: string;
  conversation: string[];
}

interface VoiceResponse {
  text: string;
  audio?: boolean;
  action?: string;
  data?: any;
}

export class VoiceUI {
  private static instance: VoiceUI;
  private isListening: boolean = false;
  private commands: Map<string, VoiceCommand>;
  private context: VoiceContext;
  private wakeWord: string = 'hey metr';
  private isWakeWordActive: boolean = false;
  private conversationMode: boolean = false;
  private language: string = 'en-US';
  
  private constructor() {
    this.commands = new Map();
    this.context = {
      screen: 'home',
      availableCommands: [],
      conversation: [],
    };
    this.initializeVoiceRecognition();
    this.registerDefaultCommands();
  }

  public static getInstance(): VoiceUI {
    if (!VoiceUI.instance) {
      VoiceUI.instance = new VoiceUI();
    }
    return VoiceUI.instance;
  }

  private async initializeVoiceRecognition() {
    try {
      Voice.onSpeechStart = this.onSpeechStart.bind(this);
      Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
      Voice.onSpeechResults = this.onSpeechResults.bind(this);
      Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
      Voice.onSpeechError = this.onSpeechError.bind(this);
      
      // Check permissions
      const hasPermission = await this.checkPermissions();
      if (hasPermission) {
        console.log('Voice UI initialized');
      }
    } catch (error) {
      console.error('Failed to initialize voice UI:', error);
    }
  }

  private async checkPermissions(): Promise<boolean> {
    // Check microphone permissions
    // In production, use react-native-permissions
    return true;
  }

  private registerDefaultCommands() {
    // Navigation commands
    this.registerCommand({
      id: 'nav_home',
      phrases: ['go home', 'home screen', 'main screen'],
      action: 'navigate',
      parameters: {screen: 'home'},
      confidence: 0.8,
    });

    this.registerCommand({
      id: 'nav_messages',
      phrases: ['open messages', 'show messages', 'go to chat'],
      action: 'navigate',
      parameters: {screen: 'messages'},
      confidence: 0.8,
    });

    this.registerCommand({
      id: 'nav_tasks',
      phrases: ['show tasks', 'open tasks', 'my tasks'],
      action: 'navigate',
      parameters: {screen: 'tasks'},
      confidence: 0.8,
    });

    // Action commands
    this.registerCommand({
      id: 'create_task',
      phrases: ['create task', 'new task', 'add task'],
      action: 'create',
      parameters: {type: 'task'},
      confidence: 0.85,
    });

    this.registerCommand({
      id: 'send_message',
      phrases: ['send message', 'compose message', 'write to'],
      action: 'compose',
      parameters: {type: 'message'},
      confidence: 0.85,
    });

    this.registerCommand({
      id: 'search',
      phrases: ['search for', 'find', 'look for'],
      action: 'search',
      confidence: 0.8,
    });

    // AI commands
    this.registerCommand({
      id: 'ai_summary',
      phrases: ['summarize this', 'give me a summary', 'tldr'],
      action: 'ai_action',
      parameters: {type: 'summary'},
      confidence: 0.9,
    });

    this.registerCommand({
      id: 'ai_help',
      phrases: ['help me with', 'how do I', 'what is'],
      action: 'ai_action',
      parameters: {type: 'help'},
      confidence: 0.85,
    });

    // Meeting commands
    this.registerCommand({
      id: 'start_meeting',
      phrases: ['start meeting', 'begin meeting', 'meeting mode'],
      action: 'meeting',
      parameters: {action: 'start'},
      confidence: 0.9,
    });

    this.registerCommand({
      id: 'take_note',
      phrases: ['take note', 'note that', 'remember'],
      action: 'note',
      confidence: 0.85,
    });

    // System commands
    this.registerCommand({
      id: 'stop_listening',
      phrases: ['stop listening', 'goodbye', 'exit voice'],
      action: 'system',
      parameters: {action: 'stop'},
      confidence: 0.95,
    });

    this.registerCommand({
      id: 'increase_volume',
      phrases: ['volume up', 'louder', 'increase volume'],
      action: 'system',
      parameters: {action: 'volume_up'},
      confidence: 0.9,
    });
  }

  // Register custom command
  public registerCommand(command: VoiceCommand): void {
    this.commands.set(command.id, command);
    command.phrases.forEach(phrase => {
      // Store phrase variations for matching
      const variations = this.generatePhraseVariations(phrase);
      variations.forEach(v => this.commands.set(v.toLowerCase(), command));
    });
  }

  private generatePhraseVariations(phrase: string): string[] {
    const variations = [phrase];
    
    // Add common variations
    variations.push(`please ${phrase}`);
    variations.push(`can you ${phrase}`);
    variations.push(`${phrase} please`);
    
    return variations;
  }

  // Start listening
  public async startListening(continuous: boolean = false): Promise<void> {
    if (this.isListening) return;
    
    try {
      this.isListening = true;
      this.conversationMode = continuous;
      
      await Voice.start(this.language);
      
      // Auto-stop after timeout if not continuous
      if (!continuous) {
        setTimeout(() => {
          if (this.isListening && !this.conversationMode) {
            this.stopListening();
          }
        }, 10000); // 10 seconds timeout
      }
      
      this.speak('How can I help you?');
    } catch (error) {
      console.error('Failed to start listening:', error);
      this.isListening = false;
    }
  }

  // Stop listening
  public async stopListening(): Promise<void> {
    if (!this.isListening) return;
    
    try {
      await Voice.stop();
      this.isListening = false;
      this.conversationMode = false;
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }

  // Voice callbacks
  private onSpeechStart(e: any) {
    console.log('Speech started');
    DeviceEventEmitter.emit('voice_ui_started');
  }

  private onSpeechEnd(e: any) {
    console.log('Speech ended');
    if (this.conversationMode && this.isListening) {
      // Continue listening in conversation mode
      setTimeout(() => {
        if (this.conversationMode) {
          Voice.start(this.language);
        }
      }, 500);
    }
  }

  private async onSpeechResults(e: any) {
    if (!e.value || e.value.length === 0) return;
    
    const speech = e.value[0].toLowerCase();
    console.log('Speech recognized:', speech);
    
    // Add to conversation history
    this.context.conversation.push(`User: ${speech}`);
    
    // Check for wake word
    if (!this.isWakeWordActive && speech.includes(this.wakeWord)) {
      this.isWakeWordActive = true;
      this.speak("I'm listening");
      return;
    }
    
    // Process command
    if (this.isWakeWordActive || this.conversationMode) {
      const response = await this.processCommand(speech);
      this.handleResponse(response);
      
      // Reset wake word after command
      if (!this.conversationMode) {
        this.isWakeWordActive = false;
      }
    }
  }

  private onSpeechPartialResults(e: any) {
    if (e.value && e.value.length > 0) {
      DeviceEventEmitter.emit('voice_ui_partial', {
        text: e.value[0],
      });
    }
  }

  private onSpeechError(e: any) {
    console.error('Speech recognition error:', e);
    
    // Retry on error
    if (this.conversationMode && e.error?.code !== 'no_match') {
      setTimeout(() => {
        if (this.conversationMode) {
          Voice.start(this.language);
        }
      }, 1000);
    }
  }

  // Process voice command
  private async processCommand(speech: string): Promise<VoiceResponse> {
    // Try exact match first
    let command = this.findCommand(speech);
    
    // If no exact match, use fuzzy matching
    if (!command) {
      command = this.fuzzyMatchCommand(speech);
    }
    
    // If still no match, use AI to interpret
    if (!command) {
      return await this.interpretWithAI(speech);
    }
    
    // Execute command
    return await this.executeCommand(command, speech);
  }

  private findCommand(speech: string): VoiceCommand | null {
    // Check each registered command
    for (const [, command] of this.commands) {
      for (const phrase of command.phrases) {
        if (speech.includes(phrase.toLowerCase())) {
          return command;
        }
      }
    }
    return null;
  }

  private fuzzyMatchCommand(speech: string): VoiceCommand | null {
    let bestMatch: VoiceCommand | null = null;
    let bestScore = 0;
    
    for (const [, command] of this.commands) {
      for (const phrase of command.phrases) {
        const score = this.calculateSimilarity(speech, phrase.toLowerCase());
        if (score > bestScore && score > 0.7) {
          bestScore = score;
          bestMatch = command;
        }
      }
    }
    
    return bestMatch;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple word overlap similarity
    const words1 = new Set(str1.split(' '));
    const words2 = new Set(str2.split(' '));
    
    let overlap = 0;
    words1.forEach(word => {
      if (words2.has(word)) overlap++;
    });
    
    return overlap / Math.max(words1.size, words2.size);
  }

  private async interpretWithAI(speech: string): Promise<VoiceResponse> {
    // Use AI to interpret ambiguous commands
    // In production, use NLP model
    
    // Simple keyword-based interpretation
    if (speech.includes('remind') || speech.includes('reminder')) {
      return {
        text: "I'll set a reminder for you",
        action: 'reminder',
        data: {text: speech},
      };
    }
    
    if (speech.includes('call') || speech.includes('phone')) {
      return {
        text: "I can't make phone calls yet, but I can start a voice chat",
        action: 'voice_chat',
      };
    }
    
    if (speech.includes('weather')) {
      return {
        text: "I don't have weather information, but I can help with work tasks",
      };
    }
    
    // Default response
    return {
      text: "I didn't understand that. Can you please rephrase?",
    };
  }

  private async executeCommand(command: VoiceCommand, speech: string): Promise<VoiceResponse> {
    // Extract parameters from speech
    const params = this.extractParameters(speech, command);
    
    // Execute callback if provided
    if (command.callback) {
      command.callback(params);
    }
    
    // Emit event for command execution
    DeviceEventEmitter.emit('voice_command_executed', {
      command: command.id,
      action: command.action,
      parameters: params,
    });
    
    // Generate response
    return this.generateResponse(command, params);
  }

  private extractParameters(speech: string, command: VoiceCommand): any {
    const params = {...command.parameters};
    
    // Extract specific parameters based on command type
    switch (command.action) {
      case 'search':
        // Extract search query
        const searchMatch = speech.match(/(?:search for|find|look for)\s+(.+)/i);
        if (searchMatch) {
          params.query = searchMatch[1];
        }
        break;
        
      case 'compose':
        // Extract recipient
        const recipientMatch = speech.match(/(?:to|message)\s+(\w+)/i);
        if (recipientMatch) {
          params.recipient = recipientMatch[1];
        }
        break;
        
      case 'create':
        // Extract task details
        const taskMatch = speech.match(/(?:task|todo)\s+(.+)/i);
        if (taskMatch) {
          params.title = taskMatch[1];
        }
        break;
    }
    
    return params;
  }

  private generateResponse(command: VoiceCommand, params: any): VoiceResponse {
    const responses: {[key: string]: string} = {
      'navigate': `Navigating to ${params.screen || 'requested screen'}`,
      'create': `Creating new ${params.type || 'item'}`,
      'compose': `Opening message composer${params.recipient ? ` for ${params.recipient}` : ''}`,
      'search': `Searching${params.query ? ` for ${params.query}` : ''}`,
      'ai_action': 'Processing your request with AI',
      'meeting': 'Starting meeting mode',
      'note': 'Taking note',
      'system': 'Command executed',
    };
    
    return {
      text: responses[command.action] || 'Command executed',
      action: command.action,
      data: params,
      audio: true,
    };
  }

  private handleResponse(response: VoiceResponse) {
    // Add to conversation
    this.context.conversation.push(`METR: ${response.text}`);
    
    // Speak response if audio enabled
    if (response.audio) {
      this.speak(response.text);
    }
    
    // Emit response event
    DeviceEventEmitter.emit('voice_ui_response', response);
  }

  // Text-to-speech
  private async speak(text: string): Promise<void> {
    try {
      // In production, use react-native-tts
      console.log(`Speaking: ${text}`);
      DeviceEventEmitter.emit('voice_ui_speaking', {text});
    } catch (error) {
      console.error('Failed to speak:', error);
    }
  }

  // Context management
  public setContext(screen: string, availableCommands?: VoiceCommand[]): void {
    this.context.screen = screen;
    if (availableCommands) {
      this.context.availableCommands = availableCommands;
    }
  }

  public getContext(): VoiceContext {
    return this.context;
  }

  // Conversation management
  public startConversation(): void {
    this.conversationMode = true;
    this.context.conversation = [];
    this.startListening(true);
    this.speak("Starting conversation mode. I'm here to help.");
  }

  public endConversation(): void {
    this.conversationMode = false;
    this.stopListening();
    this.speak("Ending conversation. Call me when you need help.");
  }

  public getConversationHistory(): string[] {
    return this.context.conversation;
  }

  // Settings
  public setWakeWord(word: string): void {
    this.wakeWord = word.toLowerCase();
  }

  public setLanguage(language: string): void {
    this.language = language;
  }

  // Quick actions
  public async quickAction(action: string): Promise<void> {
    switch (action) {
      case 'dictate':
        await this.startListening();
        this.speak("Start dictating");
        break;
        
      case 'command':
        this.isWakeWordActive = true;
        await this.startListening();
        this.speak("Ready for command");
        break;
        
      case 'help':
        this.speak("You can say things like: create task, send message, or search for documents");
        break;
    }
  }

  // Get available commands for current context
  public getAvailableCommands(): VoiceCommand[] {
    const contextCommands = this.context.availableCommands;
    const globalCommands = Array.from(this.commands.values());
    
    // Merge and deduplicate
    const allCommands = [...contextCommands, ...globalCommands];
    const uniqueCommands = allCommands.filter(
      (cmd, index, self) => self.findIndex(c => c.id === cmd.id) === index
    );
    
    return uniqueCommands;
  }
}
