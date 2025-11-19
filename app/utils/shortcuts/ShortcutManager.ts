// ShortcutManager.ts - Keyboard Shortcuts and Quick Actions for METR
import {DeviceEventEmitter} from 'react-native';

interface Shortcut {
  id: string;
  key: string;
  modifiers?: string[];
  action: () => void;
  description: string;
  category: string;
  enabled: boolean;
}

interface ShortcutConfig {
  enableKeyboardShortcuts: boolean;
  enableQuickActions: boolean;
  enableGestures: boolean;
}

export class ShortcutManager {
  private static instance: ShortcutManager;
  private config: ShortcutConfig;
  private shortcuts: Map<string, Shortcut> = new Map();
  private quickActions: Map<string, Shortcut> = new Map();

  private constructor() {
    this.config = {
      enableKeyboardShortcuts: true,
      enableQuickActions: true,
      enableGestures: true,
    };

    this.setupDefaultShortcuts();
  }

  public static getInstance(): ShortcutManager {
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = new ShortcutManager();
    }
    return ShortcutManager.instance;
  }

  // Setup default shortcuts
  private setupDefaultShortcuts(): void {
    // Navigation shortcuts
    this.registerShortcut({
      id: 'navigate_home',
      key: 'h',
      modifiers: ['ctrl'],
      action: () => DeviceEventEmitter.emit('navigate', {screen: 'Home'}),
      description: 'Navigate to Home',
      category: 'navigation',
      enabled: true,
    });

    this.registerShortcut({
      id: 'navigate_messages',
      key: 'm',
      modifiers: ['ctrl'],
      action: () => DeviceEventEmitter.emit('navigate', {screen: 'Messages'}),
      description: 'Navigate to Messages',
      category: 'navigation',
      enabled: true,
    });

    // Action shortcuts
    this.registerShortcut({
      id: 'create_task',
      key: 't',
      modifiers: ['ctrl'],
      action: () => DeviceEventEmitter.emit('create_task'),
      description: 'Create Task',
      category: 'actions',
      enabled: true,
    });

    this.registerShortcut({
      id: 'search',
      key: 'f',
      modifiers: ['ctrl'],
      action: () => DeviceEventEmitter.emit('open_search'),
      description: 'Open Search',
      category: 'actions',
      enabled: true,
    });

    // Quick actions
    this.registerQuickAction({
      id: 'quick_message',
      key: 'q',
      action: () => DeviceEventEmitter.emit('quick_message'),
      description: 'Quick Message',
      category: 'quick',
      enabled: true,
    });
  }

  // Register shortcut
  public registerShortcut(shortcut: Shortcut): void {
    if (!this.config.enableKeyboardShortcuts) {
      return;
    }

    const key = this.getShortcutKey(shortcut.key, shortcut.modifiers);
    this.shortcuts.set(key, shortcut);

    DeviceEventEmitter.emit('shortcut_registered', {shortcut});
  }

  // Register quick action
  public registerQuickAction(shortcut: Omit<Shortcut, 'modifiers'>): void {
    if (!this.config.enableQuickActions) {
      return;
    }

    this.quickActions.set(shortcut.id, shortcut as Shortcut);

    DeviceEventEmitter.emit('quick_action_registered', {shortcut});
  }

  // Execute shortcut
  public executeShortcut(key: string, modifiers?: string[]): boolean {
    const shortcutKey = this.getShortcutKey(key, modifiers);
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut && shortcut.enabled) {
      shortcut.action();
      DeviceEventEmitter.emit('shortcut_executed', {shortcut});
      return true;
    }

    return false;
  }

  // Execute quick action
  public executeQuickAction(id: string): boolean {
    const action = this.quickActions.get(id);

    if (action && action.enabled) {
      action.action();
      DeviceEventEmitter.emit('quick_action_executed', {action});
      return true;
    }

    return false;
  }

  // Get shortcut key
  private getShortcutKey(key: string, modifiers?: string[]): string {
    const mods = modifiers ? modifiers.sort().join('+') : '';
    return mods ? `${mods}+${key}` : key;
  }

  // Get all shortcuts
  public getShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  // Get shortcuts by category
  public getShortcutsByCategory(category: string): Shortcut[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category);
  }

  // Get quick actions
  public getQuickActions(): Shortcut[] {
    return Array.from(this.quickActions.values());
  }

  // Enable/disable shortcut
  public setShortcutEnabled(id: string, enabled: boolean): void {
    const shortcut = Array.from(this.shortcuts.values()).find(s => s.id === id);
    if (shortcut) {
      shortcut.enabled = enabled;
    }
  }

  // Configure shortcut manager
  public configure(config: Partial<ShortcutConfig>): void {
    this.config = {...this.config, ...config};
  }
}

export default ShortcutManager;


