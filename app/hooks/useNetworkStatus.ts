// useNetworkStatus.ts - React Hook for Network Status
import {useState, useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {DeviceEventEmitter} from 'react-native';

interface NetworkStatus {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
  details: any;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: null,
    details: null,
  });

  useEffect(() => {
    // Get initial status
    NetInfo.fetch().then(state => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      });
    });

    // Subscribe to updates
    const unsubscribe = NetInfo.addEventListener(state => {
      const newStatus = {
        isConnected: state.isConnected ?? false,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      };

      setNetworkStatus(newStatus);

      // Emit event
      DeviceEventEmitter.emit('network_status_changed', newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
};


