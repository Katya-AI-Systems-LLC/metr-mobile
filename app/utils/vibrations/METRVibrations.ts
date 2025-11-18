// METRVibrations.ts - Custom METR Branded Vibration Patterns
import {Vibration} from 'react-native';

export class METRVibrations {
  // Light tap vibration
  static tap(): void {
    Vibration.vibrate(50);
  }

  // Success vibration pattern
  static success(): void {
    Vibration.vibrate([0, 50, 100, 50]);
  }

  // Error vibration pattern
  static error(): void {
    Vibration.vibrate([0, 100, 50, 100, 50, 100]);
  }

  // Notification vibration
  static notification(): void {
    Vibration.vibrate([0, 200, 100, 200]);
  }

  // Achievement vibration
  static achievement(): void {
    Vibration.vibrate([0, 50, 100, 50, 100, 50, 100, 50]);
  }

  // Long press vibration
  static longPress(): void {
    Vibration.vibrate(100);
  }

  // Swipe vibration
  static swipe(): void {
    Vibration.vibrate(30);
  }

  // Custom pattern
  static custom(pattern: number[]): void {
    Vibration.vibrate(pattern);
  }

  // Cancel vibration
  static cancel(): void {
    Vibration.cancel();
  }
}

export default METRVibrations;

