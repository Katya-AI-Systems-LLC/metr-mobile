// ActionExtractor.ts - Extract actionable items from conversations
import {AIConfig, Message} from '../core/AIManager';

export interface ActionItem {
  id: string;
  task: string;
  assignee?: string;
  assigneeId?: string;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: 'task' | 'decision' | 'follow-up' | 'meeting' | 'review';
  source: {
    messageId: string;
    userId: string;
    timestamp: Date;
  };
  dependencies?: string[];
  estimatedHours?: number;
  tags?: string[];
  notes?: string;
}

export class ActionExtractor {
  private config: AIConfig | null = null;
  private actionItems: Map<string, ActionItem>;
  
  private actionIndicators = {
    highPriority: [
      'urgent', 'critical', 'asap', 'immediately', 'priority',
      'important', 'blocker', 'must', 'required', 'essential'
    ],
    task: [
      'will', "i'll", 'need to', 'should', 'must', 'have to',
      'going to', 'plan to', 'action:', 'todo:', 'task:'
    ],
    deadline: [
      'by', 'before', 'until', 'deadline', 'due',
      'tomorrow', 'today', 'monday', 'tuesday', 'wednesday',
      'thursday', 'friday', 'next week', 'end of day', 'eod'
    ],
    assignment: [
      'you', 'can you', 'could you', 'please', 'assigned to',
      'owner:', 'responsible:', 'will you', '@'
    ]
  };

  constructor() {
    this.actionItems = new Map();
  }

  public async initialize(config: AIConfig): Promise<void> {
    this.config = config;
  }

  public async extract(messages: Message[]): Promise<ActionItem[]> {
    const items: ActionItem[] = [];
    
    for (const message of messages) {
      const extracted = await this.extractFromMessage(message);
      items.push(...extracted);
    }
    
    return this.deduplicateActionItems(items);
  }

  private async extractFromMessage(message: Message): Promise<ActionItem[]> {
    const items: ActionItem[] = [];
    const text = message.text;
    const sentences = this.splitIntoSentences(text);
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      
      if (this.containsActionIndicator(sentenceLower)) {
        const actionItem = this.parseActionItem(sentence, message);
        if (actionItem) {
          items.push(actionItem);
        }
      }
    }
    
    return items;
  }

  private splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }

  private containsActionIndicator(text: string): boolean {
    return this.actionIndicators.task.some(indicator => text.includes(indicator));
  }

  private parseActionItem(sentence: string, message: Message): ActionItem | null {
    const sentenceLower = sentence.toLowerCase();
    
    const task = this.extractTask(sentence);
    if (!task || task.length < 10) return null;
    
    const assignee = this.extractAssignee(sentence, message.userId);
    const deadline = this.extractDeadline(sentenceLower);
    const priority = this.determinePriority(sentenceLower);
    
    return {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      task,
      assignee,
      deadline,
      priority,
      status: 'pending',
      category: 'task',
      source: {
        messageId: message.id,
        userId: message.userId,
        timestamp: new Date(message.timestamp)
      }
    };
  }

  private extractTask(sentence: string): string {
    let task = sentence;
    
    const prefixes = ['i will', "i'll", 'we need to', 'we should', 'please'];
    prefixes.forEach(prefix => {
      const regex = new RegExp(`^${prefix}\\s+`, 'i');
      task = task.replace(regex, '');
    });
    
    task = task.trim();
    task = task.charAt(0).toUpperCase() + task.slice(1);
    task = task.replace(/[.!?]+$/, '');
    
    return task;
  }

  private extractAssignee(sentence: string, defaultUserId: string): string {
    const mentionMatch = sentence.match(/@(\w+)/);
    if (mentionMatch) {
      return mentionMatch[1];
    }
    
    const sentenceLower = sentence.toLowerCase();
    if (sentenceLower.includes('i will') || sentenceLower.includes("i'll")) {
      return defaultUserId;
    }
    
    return 'unassigned';
  }

  private extractDeadline(text: string): Date | undefined {
    const now = new Date();
    
    if (text.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    if (text.includes('today')) {
      return now;
    }
    
    if (text.includes('next week')) {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    
    return undefined;
  }

  private determinePriority(text: string): 'high' | 'medium' | 'low' {
    if (this.actionIndicators.highPriority.some(ind => text.includes(ind))) {
      return 'high';
    }
    return 'medium';
  }

  private deduplicateActionItems(items: ActionItem[]): ActionItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = item.task.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
