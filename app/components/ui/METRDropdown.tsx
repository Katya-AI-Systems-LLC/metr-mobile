// METRDropdown.tsx - Custom METR Branded Dropdown Component
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';
import {METRLogo} from '../branding/METRLogo';

interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface METRDropdownProps {
  options: DropdownOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  searchable?: boolean;
  showLogo?: boolean;
}

export const METRDropdown: React.FC<METRDropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select an option',
  label,
  disabled = false,
  searchable = false,
  showLogo = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  React.useEffect(() => {
    if (visible) {
      rotation.value = withSpring(180, {damping: 15, stiffness: 300});
      opacity.value = withTiming(1, {duration: 200});
    } else {
      rotation.value = withSpring(0, {damping: 15, stiffness: 300});
      opacity.value = withTiming(0, {duration: 200});
    }
  }, [visible]);

  const filteredOptions = searchable
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
        style={[
          styles.dropdown,
          {
            opacity: disabled ? 0.5 : 1,
            borderColor: visible
              ? MetrTheme.colors.primary.electric
              : MetrTheme.colors.dark.border,
          },
        ]}
      >
        <View style={styles.dropdownContent}>
          {showLogo && !selectedOption && (
            <METRLogo size={20} variant="icon" color="primary" />
          )}
          {selectedOption?.icon && (
            <View style={styles.iconContainer}>{selectedOption.icon}</View>
          )}
          <Text
            style={[
              styles.dropdownText,
              !selectedOption && styles.placeholderText,
            ]}
          >
            {selectedOption?.label || placeholder}
          </Text>
        </View>
        <Animated.View style={animatedArrowStyle}>
          <Text style={styles.arrow}>▼</Text>
        </Animated.View>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <Animated.View style={[styles.modalOverlay, animatedModalStyle]}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <LinearGradient
                  colors={[MetrTheme.colors.dark.surface, MetrTheme.colors.dark.surfaceLight]}
                  style={styles.modalGradient}
                >
                  <View style={styles.modalHeader}>
                    {showLogo && <METRLogo size={24} variant="icon" color="primary" />}
                    <Text style={styles.modalTitle}>Select Option</Text>
                    <TouchableOpacity onPress={() => setVisible(false)}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                    {filteredOptions.map(option => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                          onSelect(option.value);
                          setVisible(false);
                          setSearchQuery('');
                        }}
                        style={[
                          styles.option,
                          selectedValue === option.value && styles.selectedOption,
                        ]}
                      >
                        {option.icon && (
                          <View style={styles.optionIcon}>{option.icon}</View>
                        )}
                        <Text
                          style={[
                            styles.optionText,
                            selectedValue === option.value && styles.selectedOptionText,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {selectedValue === option.value && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </LinearGradient>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MetrTheme.colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  iconContainer: {
    marginRight: 4,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: MetrTheme.colors.dark.text,
  },
  placeholderText: {
    color: MetrTheme.colors.dark.textSecondary,
  },
  arrow: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
  },
  closeButton: {
    fontSize: 24,
    color: MetrTheme.colors.dark.text,
    fontWeight: 'bold',
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: MetrTheme.colors.glass.purpleBlur,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: MetrTheme.colors.dark.text,
  },
  selectedOptionText: {
    color: MetrTheme.colors.primary.electric,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: MetrTheme.colors.primary.electric,
    fontWeight: 'bold',
  },
});

export default METRDropdown;

