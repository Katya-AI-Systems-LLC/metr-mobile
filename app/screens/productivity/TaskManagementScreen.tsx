// TaskManagementScreen.tsx - AI-powered task management for METR
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {GlassCard} from '../../components/glassmorphism/GlassCard';
import {MetrTheme} from '../../theme/metrTheme';
import AIManager from '../../ai/core/AIManager';

const {width: screenWidth} = Dimensions.get('window');

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  deadline?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  aiSuggestions?: string[];
  dependencies?: string[];
  completionPercentage: number;
}

interface TaskColumn {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export const TaskManagementScreen: React.FC = () => {
  const [columns, setColumns] = useState<TaskColumn[]>([
    {id: 'todo', title: 'To Do', tasks: [], color: MetrTheme.colors.semantic.info},
    {id: 'in-progress', title: 'In Progress', tasks: [], color: MetrTheme.colors.semantic.warning},
    {id: 'review', title: 'Review', tasks: [], color: MetrTheme.colors.primary.electric},
    {id: 'done', title: 'Done', tasks: [], color: MetrTheme.colors.semantic.success},
  ]);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  
  const aiManager = useRef(AIManager.getInstance());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    loadTasks();
    getAIRecommendations();
    startAnimations();
  }, []);

  const loadTasks = async () => {
    // Load tasks from storage/API
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Implement AI Assistant UI',
        description: 'Create the chat interface for AI assistant',
        status: 'in-progress',
        priority: 'high',
        assignee: 'Current User',
        deadline: new Date(Date.now() + 86400000 * 2),
        estimatedHours: 8,
        actualHours: 3,
        tags: ['AI', 'UI', 'Frontend'],
        completionPercentage: 40,
      },
      {
        id: '2',
        title: 'Setup Web3 Integration',
        description: 'Connect wallet functionality',
        status: 'todo',
        priority: 'medium',
        assignee: 'Current User',
        deadline: new Date(Date.now() + 86400000 * 5),
        estimatedHours: 12,
        tags: ['Web3', 'Blockchain'],
        completionPercentage: 0,
      },
    ];
    
    // Distribute tasks to columns
    const newColumns = [...columns];
    sampleTasks.forEach(task => {
      const column = newColumns.find(c => c.id === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });
    
    setColumns(newColumns);
  };

  const getAIRecommendations = async () => {
    try {
      const recommendations = [
        '🎯 Focus on high-priority tasks first',
        '⏰ You have 2 tasks due this week',
        '💡 Consider breaking down "Setup Web3 Integration" into smaller tasks',
        '🚀 Your velocity has increased by 20% this sprint',
      ];
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 10,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    // Get AI suggestions for the task
    const suggestions = await aiManager.current.extractActionItems([
      {id: '1', text: newTaskTitle, userId: 'current', timestamp: Date.now()},
    ]);
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: 'Current User',
      tags: [],
      aiSuggestions: suggestions.map(s => s.task),
      completionPercentage: 0,
    };
    
    const newColumns = [...columns];
    newColumns[0].tasks.push(newTask);
    setColumns(newColumns);
    
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const moveTask = (task: Task, fromColumn: string, toColumn: string) => {
    const newColumns = [...columns];
    const from = newColumns.find(c => c.id === fromColumn);
    const to = newColumns.find(c => c.id === toColumn);
    
    if (from && to) {
      from.tasks = from.tasks.filter(t => t.id !== task.id);
      task.status = toColumn as Task['status'];
      to.tasks.push(task);
      setColumns(newColumns);
    }
  };

  const renderTask = (task: Task, columnId: string) => (
    <TouchableOpacity
      key={task.id}
      onPress={() => setSelectedTask(task)}
      onLongPress={() => {}} // For drag
    >
      <GlassCard style={styles.taskCard} glassTint="dark">
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={[styles.priorityBadge, {backgroundColor: getPriorityColor(task.priority)}]}>
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>
        </View>
        
        {task.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        
        <View style={styles.taskMeta}>
          {task.deadline && (
            <View style={styles.taskMetaItem}>
              <Icon name="calendar" size={14} color={MetrTheme.colors.dark.textSecondary} />
              <Text style={styles.taskMetaText}>
                {new Date(task.deadline).toLocaleDateString()}
              </Text>
            </View>
          )}
          
          {task.estimatedHours && (
            <View style={styles.taskMetaItem}>
              <Icon name="clock-outline" size={14} color={MetrTheme.colors.dark.textSecondary} />
              <Text style={styles.taskMetaText}>{task.estimatedHours}h</Text>
            </View>
          )}
        </View>
        
        {task.tags.length > 0 && (
          <View style={styles.taskTags}>
            {task.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        
        {task.completionPercentage > 0 && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {width: `${task.completionPercentage}%`},
              ]}
            />
          </View>
        )}
      </GlassCard>
    </TouchableOpacity>
  );

  const renderColumn = (column: TaskColumn) => (
    <View key={column.id} style={styles.column}>
      <View style={[styles.columnHeader, {borderBottomColor: column.color}]}>
        <Text style={styles.columnTitle}>{column.title}</Text>
        <View style={[styles.columnBadge, {backgroundColor: column.color + '20'}]}>
          <Text style={[styles.columnCount, {color: column.color}]}>
            {column.tasks.length}
          </Text>
        </View>
      </View>
      
      <ScrollView style={styles.columnContent} showsVerticalScrollIndicator={false}>
        {column.tasks
          .filter(task => 
            filterPriority === 'all' || task.priority === filterPriority
          )
          .filter(task =>
            searchQuery === '' ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(task => renderTask(task, column.id))}
      </ScrollView>
    </View>
  );

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return MetrTheme.colors.semantic.error;
      case 'high': return MetrTheme.colors.primary.pink;
      case 'medium': return MetrTheme.colors.semantic.warning;
      case 'low': return MetrTheme.colors.semantic.info;
      default: return MetrTheme.colors.dark.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={MetrTheme.colors.gradients.dark}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Task Management</Text>
          <TouchableOpacity onPress={() => setIsAddingTask(true)} style={styles.addButton}>
            <LinearGradient
              colors={MetrTheme.colors.gradients.primary}
              style={styles.addButtonGradient}
            >
              <Icon name="plus" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recommendationsContainer}
          >
            {aiRecommendations.map((rec, index) => (
              <GlassCard key={index} style={styles.recommendationCard} glassTint="purple">
                <Text style={styles.recommendationText}>{rec}</Text>
              </GlassCard>
            ))}
          </ScrollView>
        )}

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={20} color={MetrTheme.colors.dark.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              placeholderTextColor={MetrTheme.colors.dark.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'critical', 'high', 'medium', 'low'].map(priority => (
              <TouchableOpacity
                key={priority}
                onPress={() => setFilterPriority(priority)}
                style={[
                  styles.filterChip,
                  filterPriority === priority && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterPriority === priority && styles.filterChipTextActive,
                  ]}
                >
                  {priority === 'all' ? 'All' : priority}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Kanban Board */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.board}
        >
          {columns.map(column => renderColumn(column))}
        </ScrollView>
      </Animated.View>

      {/* Add Task Modal */}
      <Modal visible={isAddingTask} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Task title"
              placeholderTextColor={MetrTheme.colors.dark.textSecondary}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsAddingTask(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleAddTask} style={styles.modalButtonPrimary}>
                <LinearGradient
                  colors={MetrTheme.colors.gradients.primary}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonTextPrimary}>Add Task</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  addButton: {
    width: 48,
    height: 48,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  recommendationCard: {
    padding: 12,
    marginRight: 12,
    minWidth: 200,
  },
  recommendationText: {
    fontSize: 13,
    color: MetrTheme.colors.dark.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: MetrTheme.colors.dark.text,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: MetrTheme.colors.primary.electric + '20',
  },
  filterChipText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: MetrTheme.colors.primary.electric,
  },
  board: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  column: {
    width: screenWidth * 0.75,
    marginRight: 16,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: 2,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  columnBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  columnCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  columnContent: {
    maxHeight: 500,
  },
  taskCard: {
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: MetrTheme.colors.dark.text,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  taskDescription: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  taskMetaText: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginLeft: 4,
  },
  taskTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: MetrTheme.colors.primary.electric + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: MetrTheme.colors.primary.electric,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: MetrTheme.colors.primary.electric,
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: screenWidth * 0.9,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: MetrTheme.colors.dark.text,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  modalButtonText: {
    fontSize: 16,
    color: MetrTheme.colors.dark.textSecondary,
  },
  modalButtonPrimary: {
    flex: 1,
  },
  modalButtonGradient: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
