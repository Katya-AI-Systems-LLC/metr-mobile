// METRSounds.ts - Custom METR Branded Sound Effects
import {Sound} from 'react-native-sound';

class METRSounds {
  private static instance: METRSounds;
  private sounds: Map<string, Sound> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  private constructor() {
    this.initializeSounds();
  }

  public static getInstance(): METRSounds {
    if (!METRSounds.instance) {
      METRSounds.instance = new METRSounds();
    }
    return METRSounds.instance;
  }

  private initializeSounds(): void {
    // Initialize sound files
    // In production, these would be actual sound files
    const soundTypes = [
      'tap',
      'success',
      'error',
      'notification',
      'achievement',
      'swipe',
      'click',
    ];

    soundTypes.forEach(type => {
      // Placeholder - in production, load actual sound files
      // const sound = new Sound(`${type}.mp3`, Sound.MAIN_BUNDLE, (error) => {
      //   if (error) {
      //     console.log(`Failed to load sound: ${type}`, error);
      //   }
      // });
      // this.sounds.set(type, sound);
    });
  }

  public play(type: 'tap' | 'success' | 'error' | 'notification' | 'achievement' | 'swipe' | 'click'): void {
    if (!this.enabled) return;

    const sound = this.sounds.get(type);
    if (sound) {
      sound.setVolume(this.volume);
      sound.play((success) => {
        if (!success) {
          console.log(`Sound playback failed: ${type}`);
        }
      });
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public getVolume(): number {
    return this.volume;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

export default METRSounds.getInstance();

