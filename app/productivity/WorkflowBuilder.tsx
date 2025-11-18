// WorkflowBuilder.tsx - Visual Workflow Constructor for METR
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
import Svg, {Line, Circle, Path} from 'react-native-svg';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'loop' | 'integration' | 'ai';
  name: string;
  description: string;
  icon: string;
  position: {x: number; y: number};
  config: any;
  inputs: string[];
  outputs: string[];
  status?: 'idle' | 'running' | 'success' | 'error';
}

interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: Map<string, any>;
  isActive: boolean;
  lastRun?: Date;
  runCount: number;
  createdAt: Date;
}

const NODE_TEMPLATES: WorkflowNode[] = [
  {
    id: 'trigger_time',
    type: 'trigger',
    name: 'Time Trigger',
    description: 'Trigger at specific time',
    icon: 'clock-outline',
    position: {x: 0, y: 0},
    config: {schedule: '0 9 * * *'},
    inputs: [],
    outputs: ['trigger'],
  },
  {
    id: 'trigger_event',
    type: 'trigger',
    name: 'Event Trigger',
    description: 'Trigger on event',
    icon: 'lightning-bolt',
    position: {x: 0, y: 0},
    config: {event: 'message_received'},
    inputs: [],
    outputs: ['data'],
  },
  {
    id: 'action_send',
    type: 'action',
    name: 'Send Message',
    description: 'Send a message',
    icon: 'send',
    position: {x: 0, y: 0},
    config: {channel: '', message: ''},
    inputs: ['trigger'],
    outputs: ['success', 'error'],
  },
  {
    id: 'action_task',
    type: 'action',
    name: 'Create Task',
    description: 'Create a new task',
    icon: 'checkbox-marked',
    position: {x: 0, y: 0},
    config: {title: '', assignee: ''},
    inputs: ['trigger'],
    outputs: ['task'],
  },
  {
    id: 'condition_if',
    type: 'condition',
    name: 'If/Else',
    description: 'Conditional branch',
    icon: 'source-branch',
    position: {x: 0, y: 0},
    config: {condition: ''},
    inputs: ['data'],
    outputs: ['true', 'false'],
  },
  {
    id: 'ai_analyze',
    type: 'ai',
    name: 'AI Analysis',
    description: 'Analyze with AI',
    icon: 'robot',
    position: {x: 0, y: 0},
    config: {prompt: ''},
    inputs: ['data'],
    outputs: ['result'],
  },
];

export const WorkflowBuilder: React.FC = () => {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'wf_new',
    name: 'New Workflow',
    description: '',
    nodes: [],
    connections: [],
    variables: new Map(),
    isActive: false,
    runCount: 0,
    createdAt: new Date(),
  });
  
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  
  const canvasRef = useRef<ScrollView>(null);

  // Create pan responder for dragging nodes
  const createPanResponder = (nodeId: string) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (node) setSelectedNode(node);
      },
      onPanResponderMove: (evt, gestureState) => {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (node) {
          const updatedNodes = workflow.nodes.map(n => 
            n.id === nodeId 
              ? {...n, position: {
                  x: n.position.x + gestureState.dx,
                  y: n.position.y + gestureState.dy
                }}
              : n
          );
          setWorkflow({...workflow, nodes: updatedNodes});
        }
      },
      onPanResponderRelease: () => {
        // Save workflow
        saveWorkflow();
      },
    });
  };

  const addNode = (template: WorkflowNode) => {
    const newNode: WorkflowNode = {
      ...template,
      id: `node_${Date.now()}`,
      position: {
        x: screenWidth / 2 - 50,
        y: workflow.nodes.length * 100 + 100,
      },
    };
    
    setWorkflow({
      ...workflow,
      nodes: [...workflow.nodes, newNode],
    });
    
    setShowTemplates(false);
  };

  const deleteNode = (nodeId: string) => {
    setWorkflow({
      ...workflow,
      nodes: workflow.nodes.filter(n => n.id !== nodeId),
      connections: workflow.connections.filter(
        c => c.source !== nodeId && c.target !== nodeId
      ),
    });
  };

  const startConnection = (nodeId: string) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  };

  const completeConnection = (targetId: string) => {
    if (!connectionStart || connectionStart === targetId) {
      setIsConnecting(false);
      setConnectionStart(null);
      return;
    }
    
    const newConnection: WorkflowConnection = {
      id: `conn_${Date.now()}`,
      source: connectionStart,
      target: targetId,
    };
    
    setWorkflow({
      ...workflow,
      connections: [...workflow.connections, newConnection],
    });
    
    setIsConnecting(false);
    setConnectionStart(null);
  };

  const deleteConnection = (connId: string) => {
    setWorkflow({
      ...workflow,
      connections: workflow.connections.filter(c => c.id !== connId),
    });
  };

  const testWorkflow = async () => {
    setIsTestMode(true);
    
    // Find trigger nodes
    const triggers = workflow.nodes.filter(n => n.type === 'trigger');
    
    for (const trigger of triggers) {
      await executeNode(trigger);
    }
    
    setIsTestMode(false);
  };

  const executeNode = async (node: WorkflowNode) => {
    // Update node status
    const updatedNodes = workflow.nodes.map(n => 
      n.id === node.id ? {...n, status: 'running'} : n
    );
    setWorkflow({...workflow, nodes: updatedNodes});
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update status to success
    const successNodes = workflow.nodes.map(n => 
      n.id === node.id ? {...n, status: 'success'} : n
    );
    setWorkflow({...workflow, nodes: successNodes});
    
    // Execute connected nodes
    const nextConnections = workflow.connections.filter(c => c.source === node.id);
    for (const conn of nextConnections) {
      const nextNode = workflow.nodes.find(n => n.id === conn.target);
      if (nextNode) {
        await executeNode(nextNode);
      }
    }
  };

  const saveWorkflow = async () => {
    try {
      const workflows = await loadWorkflows();
      const index = workflows.findIndex(w => w.id === workflow.id);
      
      if (index >= 0) {
        workflows[index] = workflow;
      } else {
        workflows.push(workflow);
      }
      
      await AsyncStorage.setItem('workflows', JSON.stringify(workflows));
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  const loadWorkflows = async (): Promise<Workflow[]> => {
    try {
      const saved = await AsyncStorage.getItem('workflows');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load workflows:', error);
      return [];
    }
  };

  const renderNode = (node: WorkflowNode) => {
    const panResponder = createPanResponder(node.id);
    const isSelected = selectedNode?.id === node.id;
    const nodeColor = 
      node.type === 'trigger' ? MetrTheme.colors.primary.electric :
      node.type === 'action' ? MetrTheme.colors.primary.teal :
      node.type === 'condition' ? MetrTheme.colors.primary.pink :
      node.type === 'ai' ? '#F59E0B' :
      '#10B981';

    return (
      <View
        key={node.id}
        style={[
          styles.node,
          {
            left: node.position.x,
            top: node.position.y,
            borderColor: isSelected ? nodeColor : 'transparent',
            borderWidth: isSelected ? 2 : 0,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.nodeIcon, {backgroundColor: nodeColor + '20'}]}>
          <Icon name={node.icon} size={24} color={nodeColor} />
        </View>
        <Text style={styles.nodeName}>{node.name}</Text>
        
        {node.status && (
          <View style={[styles.nodeStatus, styles[`status_${node.status}`]]}>
            <Icon 
              name={
                node.status === 'running' ? 'loading' :
                node.status === 'success' ? 'check' :
                node.status === 'error' ? 'alert' : 'circle'
              }
              size={12}
              color="#FFFFFF"
            />
          </View>
        )}
        
        <View style={styles.nodeActions}>
          <TouchableOpacity
            style={styles.nodeActionButton}
            onPress={() => startConnection(node.id)}
          >
            <Icon name="link" size={16} color={MetrTheme.colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nodeActionButton}
            onPress={() => deleteNode(node.id)}
          >
            <Icon name="delete" size={16} color={MetrTheme.colors.semantic.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderConnection = (conn: WorkflowConnection) => {
    const sourceNode = workflow.nodes.find(n => n.id === conn.source);
    const targetNode = workflow.nodes.find(n => n.id === conn.target);
    
    if (!sourceNode || !targetNode) return null;
    
    const x1 = sourceNode.position.x + 50;
    const y1 = sourceNode.position.y + 40;
    const x2 = targetNode.position.x + 50;
    const y2 = targetNode.position.y + 40;
    
    // Calculate control points for curved line
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx1 = x1 + dx * 0.5;
    const cy1 = y1;
    const cx2 = x2 - dx * 0.5;
    const cy2 = y2;
    
    return (
      <Svg
        key={conn.id}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Path
          d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
          stroke={MetrTheme.colors.dark.textSecondary}
          strokeWidth={2}
          fill="none"
        />
        <Circle cx={x1} cy={y1} r={4} fill={MetrTheme.colors.primary.electric} />
        <Circle cx={x2} cy={y2} r={4} fill={MetrTheme.colors.primary.teal} />
      </Svg>
    );
  };

  const renderTemplates = () => (
    <GlassCard style={styles.templatesPanel}>
      <Text style={styles.templateTitle}>Add Node</Text>
      <ScrollView>
        {NODE_TEMPLATES.map(template => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateItem}
            onPress={() => addNode(template)}
          >
            <Icon name={template.icon} size={24} color={MetrTheme.colors.dark.text} />
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDesc}>{template.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.closeTemplates}
        onPress={() => setShowTemplates(false)}
      >
        <Text style={styles.closeTemplatesText}>Close</Text>
      </TouchableOpacity>
    </GlassCard>
  );

  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <TouchableOpacity
        style={styles.toolButton}
        onPress={() => setShowTemplates(true)}
      >
        <Icon name="plus" size={24} color={MetrTheme.colors.dark.text} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.toolButton}
        onPress={testWorkflow}
      >
        <Icon name="play" size={24} color={MetrTheme.colors.semantic.success} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.toolButton}
        onPress={saveWorkflow}
      >
        <Icon name="content-save" size={24} color={MetrTheme.colors.primary.electric} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.toolButton, workflow.isActive && styles.activeButton]}
        onPress={() => setWorkflow({...workflow, isActive: !workflow.isActive})}
      >
        <Icon 
          name={workflow.isActive ? 'pause' : 'power'} 
          size={24} 
          color={workflow.isActive ? MetrTheme.colors.semantic.warning : MetrTheme.colors.dark.text} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workflow Builder</Text>
        <Text style={styles.subtitle}>{workflow.name}</Text>
      </View>
      
      <ScrollView
        ref={canvasRef}
        style={styles.canvas}
        contentContainerStyle={styles.canvasContent}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Render connections */}
        {workflow.connections.map(renderConnection)}
        
        {/* Render nodes */}
        {workflow.nodes.map(renderNode)}
        
        {/* Empty state */}
        {workflow.nodes.length === 0 && (
          <TouchableOpacity
            style={styles.emptyState}
            onPress={() => setShowTemplates(true)}
          >
            <Icon name="plus-circle-outline" size={64} color={MetrTheme.colors.dark.textSecondary} />
            <Text style={styles.emptyStateText}>Add your first node</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {renderToolbar()}
      {showTemplates && renderTemplates()}
      
      {selectedNode && (
        <GlassCard style={styles.propertiesPanel}>
          <Text style={styles.propertiesTitle}>Properties</Text>
          <Text style={styles.propertyLabel}>Name</Text>
          <Text style={styles.propertyValue}>{selectedNode.name}</Text>
          <Text style={styles.propertyLabel}>Type</Text>
          <Text style={styles.propertyValue}>{selectedNode.type}</Text>
          <TouchableOpacity
            style={styles.configButton}
            onPress={() => {/* Open config modal */}}
          >
            <Text style={styles.configButtonText}>Configure</Text>
          </TouchableOpacity>
        </GlassCard>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  subtitle: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  canvas: {
    flex: 1,
  },
  canvasContent: {
    width: screenWidth * 2,
    height: screenHeight * 2,
  },
  node: {
    position: 'absolute',
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  nodeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  nodeName: {
    fontSize: 12,
    color: MetrTheme.colors.dark.text,
    textAlign: 'center',
  },
  nodeStatus: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  status_running: {
    backgroundColor: MetrTheme.colors.semantic.warning,
  },
  status_success: {
    backgroundColor: MetrTheme.colors.semantic.success,
  },
  status_error: {
    backgroundColor: MetrTheme.colors.semantic.error,
  },
  nodeActions: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -25,
    gap: 8,
  },
  nodeActionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 24,
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  templatesPanel: {
    position: 'absolute',
    top: 120,
    left: 20,
    width: 250,
    height: 400,
    padding: 16,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  templateInfo: {
    marginLeft: 12,
    flex: 1,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '500',
    color: MetrTheme.colors.dark.text,
  },
  templateDesc: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 2,
  },
  closeTemplates: {
    marginTop: 16,
    padding: 12,
    backgroundColor: MetrTheme.colors.primary.electric,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeTemplatesText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  propertiesPanel: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 200,
    padding: 16,
  },
  propertiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  propertyLabel: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 12,
  },
  propertyValue: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    marginTop: 4,
  },
  configButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: MetrTheme.colors.primary.teal,
    borderRadius: 8,
    alignItems: 'center',
  },
  configButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    position: 'absolute',
    top: screenHeight / 2,
    left: screenWidth / 2 - 80,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 12,
  },
});
