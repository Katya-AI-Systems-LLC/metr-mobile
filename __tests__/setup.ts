// Test setup file
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    NativeModules: {
      ...RN.NativeModules,
      AsyncStorage: require('@react-native-async-storage/async-storage').default,
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((dict) => dict.ios),
    },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock DeviceEventEmitter
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    DeviceEventEmitter: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      emit: jest.fn(),
    },
  };
});

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};


