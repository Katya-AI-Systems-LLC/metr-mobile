// METRAccordion.tsx - Custom METR Branded Accordion Component
import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface METRAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

export const METRAccordion: React.FC<METRAccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return allowMultiple ? [...prev, itemId] : [itemId];
      }
    });
  };

  return (
    <View style={styles.container}>
      {items.map(item => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.includes(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </View>
  );
};

interface AccordionItemProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({item, isOpen, onToggle}) => {
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withSpring(isOpen ? 180 : 0, {damping: 15, stiffness: 300});
    height.value = withSpring(isOpen ? 1 : 0, {damping: 15, stiffness: 300});
    opacity.value = withTiming(isOpen ? 1 : 0, {duration: 200});
  }, [isOpen]);

  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    height: height.value === 0 ? 0 : undefined,
    opacity: opacity.value,
  }));

  return (
    <View style={styles.item}>
      <TouchableOpacity
        onPress={onToggle}
        style={[
          styles.header,
          isOpen && styles.headerOpen,
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          {item.icon && <View style={styles.iconContainer}>{item.icon}</View>}
          <Text style={[styles.title, isOpen && styles.titleOpen]}>
            {item.title}
          </Text>
        </View>
        <Animated.View style={animatedArrowStyle}>
          <Text style={styles.arrow}>▼</Text>
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[styles.content, animatedContentStyle]}>
        {isOpen && (
          <View style={styles.contentInner}>
            {item.content}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  item: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: MetrTheme.colors.dark.surface,
    borderWidth: 1,
    borderColor: MetrTheme.colors.dark.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerOpen: {
    borderBottomWidth: 1,
    borderBottomColor: MetrTheme.colors.dark.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    marginRight: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: MetrTheme.colors.dark.text,
  },
  titleOpen: {
    color: MetrTheme.colors.primary.electric,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  content: {
    overflow: 'hidden',
  },
  contentInner: {
    padding: 16,
  },
});

export default METRAccordion;

