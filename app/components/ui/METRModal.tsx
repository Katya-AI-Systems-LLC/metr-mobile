// METRModal.tsx - Custom METR Branded Modal Component
import React, {useEffect, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';
import {METRButton} from './METRButton';

interface METRModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showLogo?: boolean;
  variant?: 'default' | 'fullscreen' | 'bottomSheet';
  showCloseButton?: boolean;
  actions?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  }>;
}

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

export const METRModal: React.FC<METRModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showLogo = false,
  variant = 'default',
  showCloseButton = true,
  actions,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const renderContent = () => {
    if (variant === 'fullscreen') {
      return (
        <View style={styles.fullscreenContent}>
          {showLogo && (
            <View style={styles.logoContainer}>
              <METRLogo size={48} variant="icon" color="primary" />
            </View>
          )}
          {title && <Text style={styles.fullscreenTitle}>{title}</Text>}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {actions && (
            <View style={styles.actionsContainer}>
              {actions.map((action, index) => (
                <METRButton
                  key={index}
                  title={action.label}
                  onPress={action.onPress}
                  variant={action.variant || 'primary'}
                  style={styles.actionButton}
                />
              ))}
            </View>
          )}
        </View>
      );
    }

    if (variant === 'bottomSheet') {
      return (
        <Animated.View
          style={[
            styles.bottomSheetContent,
            {
              transform: [{translateY: slideAnim}],
            },
          ]}
        >
          <View style={styles.bottomSheetHandle} />
          {title && <Text style={styles.bottomSheetTitle}>{title}</Text>}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {actions && (
            <View style={styles.actionsContainer}>
              {actions.map((action, index) => (
                <METRButton
                  key={index}
                  title={action.label}
                  onPress={action.onPress}
                  variant={action.variant || 'primary'}
                  style={styles.actionButton}
                />
              ))}
            </View>
          )}
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.modalContent,
          {
            opacity: fadeAnim,
            transform: [{scale: fadeAnim}],
          },
        ]}
      >
        <LinearGradient
          colors={[MetrTheme.colors.dark.surface, MetrTheme.colors.dark.surfaceLight]}
          style={styles.modalGradient}
        >
          <View style={styles.modalHeader}>
            {showLogo && <METRLogo size={32} variant="icon" color="primary" />}
            {title && <Text style={styles.modalTitle}>{title}</Text>}
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {actions && (
            <View style={styles.actionsContainer}>
              {actions.map((action, index) => (
                <METRButton
                  key={index}
                  title={action.label}
                  onPress={action.onPress}
                  variant={action.variant || 'primary'}
                  style={styles.actionButton}
                />
              ))}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={variant === 'bottomSheet' ? undefined : onClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableWithoutFeedback>
            {renderContent()}
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: variant === 'bottomSheet' ? 'flex-end' : 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MetrTheme.colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: MetrTheme.colors.dark.text,
    fontWeight: 'bold',
  },
  fullscreenContent: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
    padding: 24,
    paddingTop: 60,
  },
  fullscreenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  bottomSheetContent: {
    backgroundColor: MetrTheme.colors.dark.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: MetrTheme.colors.dark.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    justifyContent: 'flex-end',
  },
  actionButton: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default METRModal;

