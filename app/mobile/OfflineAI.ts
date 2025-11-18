// OfflineAI.ts - Offline AI Models for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

interface LocalModel {
  id: string;
  name: string;
  type: 'nlp' | 'vision' | 'speech' | 'general';
  size: number;
  path: string;
  version: string;
  loaded: boolean;
  capabilities: string[];
}

interface InferenceResult {
  output: any;
  confidence: number;
  processingTime: number;
  modelUsed: string;
}

export class OfflineAI {
  private static instance: OfflineAI;
  private models: Map<string, LocalModel>;
  private loadedModels: Map<string, any>;
  private modelCache: Map<string, any>;
  private readonly MODEL_DIR = `${RNFS.DocumentDirectoryPath}/models`;

  private constructor() {
    this.models = new Map();
    this.loadedModels = new Map();
    this.modelCache = new Map();
    this.initializeModels();
  }

  public static getInstance(): OfflineAI {
    if (!OfflineAI.instance) {
      OfflineAI.instance = new OfflineAI();
    }
    return OfflineAI.instance;
  }

  private async initializeModels() {
    // Create models directory if not exists
    const dirExists = await RNFS.exists(this.MODEL_DIR);
    if (!dirExists) {
      await RNFS.mkdir(this.MODEL_DIR);
    }

    // Register available models
    this.registerModel({
      id: 'tiny-llm',
      name: 'TinyLLM',
      type: 'nlp',
      size: 50 * 1024 * 1024, // 50MB
      path: `${this.MODEL_DIR}/tiny-llm.onnx`,
      version: '1.0.0',
      loaded: false,
      capabilities: ['text-generation', 'summarization', 'sentiment'],
    });

    this.registerModel({
      id: 'mobilenet',
      name: 'MobileNet V3',
      type: 'vision',
      size: 15 * 1024 * 1024, // 15MB
      path: `${this.MODEL_DIR}/mobilenet.tflite`,
      version: '3.0.0',
      loaded: false,
      capabilities: ['image-classification', 'object-detection'],
    });

    this.registerModel({
      id: 'whisper-tiny',
      name: 'Whisper Tiny',
      type: 'speech',
      size: 30 * 1024 * 1024, // 30MB
      path: `${this.MODEL_DIR}/whisper-tiny.onnx`,
      version: '1.0.0',
      loaded: false,
      capabilities: ['speech-to-text', 'language-detection'],
    });
  }

  private registerModel(model: LocalModel) {
    this.models.set(model.id, model);
  }

  public async downloadModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) throw new Error(`Model ${modelId} not found`);

    // Check if model already exists
    const exists = await RNFS.exists(model.path);
    if (exists) {
      console.log(`Model ${modelId} already downloaded`);
      return;
    }

    // Download model from CDN
    const downloadUrl = `https://models.metr.app/${modelId}/${model.version}/model.bin`;
    
    const download = RNFS.downloadFile({
      fromUrl: downloadUrl,
      toFile: model.path,
      progress: (res) => {
        const progress = res.bytesWritten / res.contentLength;
        console.log(`Downloading ${modelId}: ${(progress * 100).toFixed(2)}%`);
      },
    });

    await download.promise;
    console.log(`Model ${modelId} downloaded successfully`);
  }

  public async loadModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) throw new Error(`Model ${modelId} not found`);

    if (this.loadedModels.has(modelId)) {
      console.log(`Model ${modelId} already loaded`);
      return;
    }

    // Check if model file exists
    const exists = await RNFS.exists(model.path);
    if (!exists) {
      await this.downloadModel(modelId);
    }

    // Load model based on type
    let loadedModel: any;
    
    switch (model.type) {
      case 'nlp':
        loadedModel = await this.loadNLPModel(model);
        break;
      case 'vision':
        loadedModel = await this.loadVisionModel(model);
        break;
      case 'speech':
        loadedModel = await this.loadSpeechModel(model);
        break;
      default:
        loadedModel = await this.loadGeneralModel(model);
    }

    this.loadedModels.set(modelId, loadedModel);
    model.loaded = true;
    console.log(`Model ${modelId} loaded successfully`);
  }

  private async loadNLPModel(model: LocalModel): Promise<any> {
    // In production, use ONNX Runtime or TensorFlow Lite
    return {
      type: 'nlp',
      predict: async (input: string) => {
        // Simulate NLP inference
        return {
          text: `Processed: ${input}`,
          tokens: input.split(' ').length,
        };
      },
    };
  }

  private async loadVisionModel(model: LocalModel): Promise<any> {
    return {
      type: 'vision',
      predict: async (imageData: any) => {
        // Simulate vision inference
        return {
          labels: ['cat', 'dog', 'bird'],
          probabilities: [0.7, 0.2, 0.1],
        };
      },
    };
  }

  private async loadSpeechModel(model: LocalModel): Promise<any> {
    return {
      type: 'speech',
      predict: async (audioData: any) => {
        // Simulate speech inference
        return {
          transcription: 'Hello world',
          language: 'en',
          confidence: 0.95,
        };
      },
    };
  }

  private async loadGeneralModel(model: LocalModel): Promise<any> {
    return {
      type: 'general',
      predict: async (input: any) => input,
    };
  }

  public async unloadModel(modelId: string): Promise<void> {
    if (!this.loadedModels.has(modelId)) return;
    
    this.loadedModels.delete(modelId);
    const model = this.models.get(modelId);
    if (model) model.loaded = false;
    
    console.log(`Model ${modelId} unloaded`);
  }

  // Text Generation
  public async generateText(
    prompt: string,
    maxLength: number = 100,
    temperature: number = 0.7
  ): Promise<string> {
    const modelId = 'tiny-llm';
    await this.ensureModelLoaded(modelId);
    
    const model = this.loadedModels.get(modelId);
    const result = await model.predict(prompt);
    
    return result.text;
  }

  // Sentiment Analysis
  public async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }> {
    const modelId = 'tiny-llm';
    await this.ensureModelLoaded(modelId);
    
    // Simulate sentiment analysis
    const words = text.toLowerCase().split(' ');
    const positiveWords = ['good', 'great', 'excellent', 'love', 'happy'];
    const negativeWords = ['bad', 'terrible', 'hate', 'sad', 'angry'];
    
    let score = 0;
    words.forEach(word => {
      if (positiveWords.includes(word)) score++;
      if (negativeWords.includes(word)) score--;
    });
    
    return {
      sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
      confidence: Math.min(Math.abs(score) / words.length, 1),
    };
  }

  // Summarization
  public async summarize(text: string, maxLength: number = 50): Promise<string> {
    const modelId = 'tiny-llm';
    await this.ensureModelLoaded(modelId);
    
    // Simple extractive summarization
    const sentences = text.split('. ');
    const importantSentences = sentences.slice(0, 2);
    
    return importantSentences.join('. ') + '.';
  }

  // Image Classification
  public async classifyImage(imagePath: string): Promise<{
    labels: string[];
    probabilities: number[];
  }> {
    const modelId = 'mobilenet';
    await this.ensureModelLoaded(modelId);
    
    const model = this.loadedModels.get(modelId);
    const imageData = await RNFS.readFile(imagePath, 'base64');
    
    return await model.predict(imageData);
  }

  // Speech to Text
  public async transcribeAudio(audioPath: string): Promise<{
    text: string;
    language: string;
    confidence: number;
  }> {
    const modelId = 'whisper-tiny';
    await this.ensureModelLoaded(modelId);
    
    const model = this.loadedModels.get(modelId);
    const audioData = await RNFS.readFile(audioPath, 'base64');
    
    return await model.predict(audioData);
  }

  // Entity Recognition
  public async extractEntities(text: string): Promise<Array<{
    text: string;
    type: string;
    confidence: number;
  }>> {
    // Simple regex-based entity extraction
    const entities: Array<{text: string; type: string; confidence: number}> = [];
    
    // Extract emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    emails.forEach(email => {
      entities.push({text: email, type: 'email', confidence: 1.0});
    });
    
    // Extract URLs
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = text.match(urlRegex) || [];
    urls.forEach(url => {
      entities.push({text: url, type: 'url', confidence: 1.0});
    });
    
    // Extract dates
    const dateRegex = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g;
    const dates = text.match(dateRegex) || [];
    dates.forEach(date => {
      entities.push({text: date, type: 'date', confidence: 0.9});
    });
    
    return entities;
  }

  // Question Answering
  public async answerQuestion(context: string, question: string): Promise<string> {
    const modelId = 'tiny-llm';
    await this.ensureModelLoaded(modelId);
    
    // Simple keyword matching
    const keywords = question.toLowerCase().split(' ');
    const sentences = context.split('. ');
    
    let bestMatch = '';
    let bestScore = 0;
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      let score = 0;
      keywords.forEach(keyword => {
        if (sentenceLower.includes(keyword)) score++;
      });
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = sentence;
      }
    });
    
    return bestMatch || 'Unable to find answer in context';
  }

  private async ensureModelLoaded(modelId: string): Promise<void> {
    if (!this.loadedModels.has(modelId)) {
      await this.loadModel(modelId);
    }
  }

  // Get model information
  public getModelInfo(modelId: string): LocalModel | undefined {
    return this.models.get(modelId);
  }

  // Get all available models
  public getAllModels(): LocalModel[] {
    return Array.from(this.models.values());
  }

  // Get loaded models
  public getLoadedModels(): string[] {
    return Array.from(this.loadedModels.keys());
  }

  // Calculate total model size
  public getTotalModelSize(): number {
    let totalSize = 0;
    this.models.forEach(model => {
      totalSize += model.size;
    });
    return totalSize;
  }

  // Clear model cache
  public clearCache(): void {
    this.modelCache.clear();
  }

  // Delete downloaded model
  public async deleteModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) return;
    
    // Unload if loaded
    await this.unloadModel(modelId);
    
    // Delete file
    const exists = await RNFS.exists(model.path);
    if (exists) {
      await RNFS.unlink(model.path);
    }
  }
}
