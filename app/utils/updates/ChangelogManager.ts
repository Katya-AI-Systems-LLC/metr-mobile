// ChangelogManager.ts - Changelog Management for METR
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeviceEventEmitter} from 'react-native';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    added: string[];
    changed: string[];
    fixed: string[];
    removed: string[];
    security: string[];
  };
}

export class ChangelogManager {
  private static instance: ChangelogManager;
  private changelog: ChangelogEntry[] = [];
  private lastSeenVersion: string | null = null;

  private constructor() {
    this.loadChangelog();
    this.loadLastSeenVersion();
  }

  public static getInstance(): ChangelogManager {
    if (!ChangelogManager.instance) {
      ChangelogManager.instance = new ChangelogManager();
    }
    return ChangelogManager.instance;
  }

  // Add changelog entry
  public addEntry(entry: ChangelogEntry): void {
    this.changelog.push(entry);
    this.saveChangelog();
  }

  // Get changelog
  public getChangelog(): ChangelogEntry[] {
    return [...this.changelog];
  }

  // Get changelog since version
  public getChangelogSince(version: string): ChangelogEntry[] {
    const versionIndex = this.changelog.findIndex(entry => entry.version === version);
    if (versionIndex === -1) {
      return this.changelog;
    }
    return this.changelog.slice(versionIndex + 1);
  }

  // Get unseen changes
  public async getUnseenChanges(): Promise<ChangelogEntry[]> {
    if (!this.lastSeenVersion) {
      return this.changelog;
    }
    return this.getChangelogSince(this.lastSeenVersion);
  }

  // Mark version as seen
  public async markVersionAsSeen(version: string): Promise<void> {
    this.lastSeenVersion = version;
    await AsyncStorage.setItem('last_seen_version', version);
    DeviceEventEmitter.emit('changelog_seen', {version});
  }

  // Load changelog
  private async loadChangelog(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('changelog');
      if (stored) {
        this.changelog = JSON.parse(stored);
      } else {
        // Initialize with default changelog
        this.initializeDefaultChangelog();
      }
    } catch (error) {
      console.error('Failed to load changelog:', error);
      this.initializeDefaultChangelog();
    }
  }

  // Save changelog
  private async saveChangelog(): Promise<void> {
    try {
      await AsyncStorage.setItem('changelog', JSON.stringify(this.changelog));
    } catch (error) {
      console.error('Failed to save changelog:', error);
    }
  }

  // Load last seen version
  private async loadLastSeenVersion(): Promise<void> {
    try {
      this.lastSeenVersion = await AsyncStorage.getItem('last_seen_version');
    } catch (error) {
      console.error('Failed to load last seen version:', error);
    }
  }

  // Initialize default changelog
  private initializeDefaultChangelog(): void {
    this.changelog = [
      {
        version: '2.2.0',
        date: '2025-01-15',
        changes: {
          added: [
            'Complete rebranding to METR',
            'Advanced AI features',
            'Web3 integration',
            'AR/VR support',
          ],
          changed: [
            'Improved UI/UX',
            'Enhanced performance',
          ],
          fixed: [
            'Various bug fixes',
          ],
          removed: [],
          security: [
            'Security enhancements',
          ],
        },
      },
    ];
  }
}

export default ChangelogManager;


