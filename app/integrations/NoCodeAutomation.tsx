// NoCodeAutomation.tsx - No-Code Automation Builder for METR
import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import Svg, {Path, Circle} from 'react-native-svg';

const {width: screenWidth} = Dimensions.get('window');

interface AutomationNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'loop';
  category: string;
  name: string;
  icon: string;
  config: Record<string, any>;
  position: {x: number; y: number};
  connections: string[];
}

interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  nodes: AutomationNode[];
  enabled: boolean;
  lastRun?: Date;
  runCount: number;
}

const TRIGGERS = [
  {id: 'schedule', name: 'Schedule', icon: 'clock-outline', category: 'Time'},
  {id: 'webhook', name: 'Webhook', icon: 'webhook', category: 'API'},
  {id: 'email', name: 'Email Received', icon: 'email', category: 'Communication'},
  {id: 'message', name: 'Message', icon: 'message', category: 'Chat'},
  {id: 'file', name: 'File Upload', icon: 'file-upload', category: 'Files'},
];

const ACTIONS = [
  {id: 'send_message', name: 'Send Message', icon: 'send', category: 'Communication'},
  {id: 'create_task', name: 'Create Task', icon: 'checkbox-marked', category: 'Tasks'},
  {id: 'api_call', name: 'API Call', icon: 'api', category: 'Integration'},
  {id: 'ai_process', name: 'AI Process', icon: 'robot', category: 'AI'},
  {id: 'notify', name: 'Send Notification', icon: 'bell', category: 'Alerts'},
];

export const NoCodeAutomation: React.FC = () => {
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [currentFlow, setCurrentFlow] = useState<AutomationFlow | null>(null);
  const [selectedNode, setSelectedNode] = useState<AutomationNode | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [draggedNode, setDraggedNode] = useState<AutomationNode | null>(null);

  const createNewFlow = () => {
    const newFlow: AutomationFlow = {
      id: Date.now().toString(),
      name: 'New Automation',
      description: 'Automated workflow',
      nodes: [],
      enabled: true,
      runCount: 0,
    };
    setFlows([...flows, newFlow]);
    setCurrentFlow(newFlow);
    setIsBuilding(true);
  };

  const addNodeToFlow = (nodeType: any, category: 'trigger' | 'action' | 'condition') => {
    if (!currentFlow) return;

    const newNode: AutomationNode = {
      id: Date.now().toString(),
      type: category,
      category: nodeType.category,
      name: nodeType.name,
      icon: nodeType.icon,
      config: {},
      position: {x: 100, y: 100 + currentFlow.nodes.length * 100},
      connections: [],
    };

    const updatedFlow = {
      ...currentFlow,
      nodes: [...currentFlow.nodes, newNode],
    };
    
    setCurrentFlow(updatedFlow);
    setFlows(flows.map(f => f.id === updatedFlow.id ? updatedFlow : f));
  };

  const connectNodes = (fromId: string, toId: string) => {
    if (!currentFlow) return;

    const updatedNodes = currentFlow.nodes.map(node => {
      if (node.id === fromId) {
        return {...node, connections: [...node.connections, toId]};
      }
      return node;
    });

    const updatedFlow = {...currentFlow, nodes: updatedNodes};
    setCurrentFlow(updatedFlow);
    setFlows(flows.map(f => f.id === updatedFlow.id ? updatedFlow : f));
  };

  const testAutomation = () => {
    if (!currentFlow) return;
    
    // Simulate automation execution
    console.log('Testing automation:', currentFlow.name);
    alert(`Testing automation with ${currentFlow.nodes.length} nodes`);
  };

  const renderFlowBuilder = () => (
    <View style={styles.builderContainer}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>{currentFlow?.name}</Text>
        
        <View style={styles.toolbarActions}>
          <TouchableOpacity onPress={testAutomation} style={styles.testButton}>
            <Icon name="play" size={20} color="#FFFFFF" />
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setIsBuilding(false)} style={styles.saveButton}>
            <Icon name="check" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <ScrollView horizontal style={styles.canvas}>
        <View style={styles.canvasContent}>
          {currentFlow?.nodes.map(node => (
            <GlassCard key={node.id} style={[styles.node, {left: node.position.x, top: node.position.y}]}>
              <Icon name={node.icon} size={24} color={
                node.type === 'trigger' ? MetrTheme.colors.primary.electric :
                node.type === 'action' ? MetrTheme.colors.primary.teal :
                MetrTheme.colors.primary.pink
              } />
              <Text style={styles.nodeText}>{node.name}</Text>
            </GlassCard>
          ))}
        </View>
      </ScrollView>

      {/* Node Palette */}
      <View style={styles.palette}>
        <Text style={styles.paletteTitle}>Triggers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paletteRow}>
          {TRIGGERS.map(trigger => (
            <TouchableOpacity
              key={trigger.id}
              onPress={() => addNodeToFlow(trigger, 'trigger')}
              style={styles.paletteItem}
            >
              <Icon name={trigger.icon} size={24} color={MetrTheme.colors.primary.electric} />
              <Text style={styles.paletteItemText}>{trigger.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.paletteTitle}>Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paletteRow}>
          {ACTIONS.map(action => (
            <TouchableOpacity
              key={action.id}
              onPress={() => addNodeToFlow(action, 'action')}
              style={styles.paletteItem}
            >
              <Icon name={action.icon} size={24} color={MetrTheme.colors.primary.teal} />
              <Text style={styles.paletteItemText}>{action.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderFlowsList = () => (
    <ScrollView style={styles.flowsList}>
      <View style={styles.header}>
        <Text style={styles.title}>No-Code Automations</Text>
        
        <TouchableOpacity onPress={createNewFlow} style={styles.createButton}>
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create Flow</Text>
        </TouchableOpacity>
      </View>

      {flows.map(flow => (
        <GlassCard key={flow.id} style={styles.flowCard}>
          <View style={styles.flowHeader}>
            <Icon name="transit-connection-variant" size={24} color={MetrTheme.colors.primary.electric} />
            <Text style={styles.flowName}>{flow.name}</Text>
            <Switch
              value={flow.enabled}
              onValueChange={(value) => {
                setFlows(flows.map(f => f.id === flow.id ? {...f, enabled: value} : f));
              }}
            />
          </View>
          
          <Text style={styles.flowDescription}>{flow.description}</Text>
          
          <View style={styles.flowStats}>
            <View style={styles.stat}>
              <Icon name="play-circle" size={16} color={MetrTheme.colors.dark.textSecondary} />
              <Text style={styles.statText}>{flow.runCount} runs</Text>
            </View>
            
            {flow.lastRun && (
              <View style={styles.stat}>
                <Icon name="clock-outline" size={16} color={MetrTheme.colors.dark.textSecondary} />
                <Text style={styles.statText}>
                  Last run: {new Date(flow.lastRun).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            onPress={() => {
              setCurrentFlow(flow);
              setIsBuilding(true);
            }}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit Flow</Text>
          </TouchableOpacity>
        </GlassCard>
      ))}

      {/* Templates */}
      <Text style={styles.sectionTitle}>Popular Templates</Text>
      
      <GlassCard style={styles.templateCard}>
        <Icon name="slack" size={32} color={MetrTheme.colors.primary.electric} />
        <Text style={styles.templateName}>Slack to Task</Text>
        <Text style={styles.templateDescription}>
          Create tasks from Slack messages
        </Text>
      </GlassCard>
      
      <GlassCard style={styles.templateCard}>
        <Icon name="github" size={32} color={MetrTheme.colors.dark.text} />
        <Text style={styles.templateName}>GitHub to Notification</Text>
        <Text style={styles.templateDescription}>
          Get notified on PR updates
        </Text>
      </GlassCard>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {isBuilding ? renderFlowBuilder() : renderFlowsList()}
    </View>
  );
};

const Switch = ({value, onValueChange}: {value: boolean; onValueChange: (value: boolean) => void}) => (
  <TouchableOpacity
    onPress={() => onValueChange(!value)}
    style={[styles.switch, value && styles.switchActive]}
  >
    <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MetrTheme.colors.primary.electric,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  flowsList: {
    flex: 1,
  },
  flowCard: {
    margin: 20,
    marginTop: 0,
    padding: 16,
  },
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  flowName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  flowDescription: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginBottom: 12,
  },
  flowStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 6,
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  editButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.primary.electric,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  templateCard: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    alignItems: 'center',
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginTop: 8,
  },
  templateDescription: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  builderContainer: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolbarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MetrTheme.colors.semantic.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  testButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MetrTheme.colors.primary.electric,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  canvas: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  canvasContent: {
    width: screenWidth * 2,
    height: 600,
    position: 'relative',
  },
  node: {
    position: 'absolute',
    padding: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  nodeText: {
    marginTop: 4,
    fontSize: 12,
    color: MetrTheme.colors.dark.text,
  },
  palette: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
  },
  paletteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 8,
  },
  paletteRow: {
    marginBottom: 16,
  },
  paletteItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  paletteItemText: {
    marginTop: 4,
    fontSize: 10,
    color: MetrTheme.colors.dark.textSecondary,
  },
  switch: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 2,
  },
  switchActive: {
    backgroundColor: MetrTheme.colors.semantic.success,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    transform: [{translateX: 22}],
  },
});
