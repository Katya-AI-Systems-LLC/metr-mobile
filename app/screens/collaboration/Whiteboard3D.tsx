// Whiteboard3D.tsx - 3D Collaborative Whiteboard for METR
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Path, Circle, Rect, Text as SvgText, G} from 'react-native-svg';
import {GlassCard} from '../../components/glassmorphism/GlassCard';
import {MetrTheme} from '../../theme/metrTheme';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface DrawingElement {
  id: string;
  type: 'pen' | 'text' | 'shape' | 'sticky' | 'image';
  data: any;
  position: {x: number; y: number; z: number};
  rotation?: number;
  scale?: number;
  color: string;
  author: string;
  timestamp: Date;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  elements: DrawingElement[];
}

export const Whiteboard3D: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<'pen' | 'text' | 'shape' | 'sticky' | 'eraser'>('pen');
  const [currentColor, setCurrentColor] = useState('#8B5CF6');
  const [brushSize, setBrushSize] = useState(3);
  const [layers, setLayers] = useState<Layer[]>([
    {id: '1', name: 'Base Layer', visible: true, opacity: 1, elements: []},
  ]);
  const [activeLayerId, setActiveLayerId] = useState('1');
  const [is3DMode, setIs3DMode] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  
  // Animation values
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const scale3D = useRef(new Animated.Value(1)).current;
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef<any>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        const {locationX, locationY} = evt.nativeEvent;
        handleTouchStart(locationX, locationY);
      },
      
      onPanResponderMove: (evt) => {
        const {locationX, locationY} = evt.nativeEvent;
        handleTouchMove(locationX, locationY);
      },
      
      onPanResponderRelease: () => {
        handleTouchEnd();
      },
    })
  ).current;

  const handleTouchStart = (x: number, y: number) => {
    if (currentTool === 'pen') {
      setIsDrawing(true);
      setCurrentPath([`M ${x} ${y}`]);
    } else if (currentTool === 'text') {
      addTextElement(x, y);
    } else if (currentTool === 'sticky') {
      addStickyNote(x, y);
    }
  };

  const handleTouchMove = (x: number, y: number) => {
    if (isDrawing && currentTool === 'pen') {
      setCurrentPath(prev => [...prev, `L ${x} ${y}`]);
    }
  };

  const handleTouchEnd = () => {
    if (isDrawing && currentPath.length > 0) {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'pen',
        data: currentPath.join(' '),
        position: {x: 0, y: 0, z: 0},
        color: currentColor,
        author: 'Current User',
        timestamp: new Date(),
      };
      
      addElementToActiveLayer(newElement);
      setCurrentPath([]);
      setIsDrawing(false);
    }
  };

  const addElementToActiveLayer = (element: DrawingElement) => {
    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === activeLayerId 
          ? {...layer, elements: [...layer.elements, element]}
          : layer
      )
    );
  };

  const addTextElement = (x: number, y: number) => {
    // Show text input modal
    // For now, add placeholder text
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: 'text',
      data: 'New Text',
      position: {x, y, z: 0},
      color: currentColor,
      author: 'Current User',
      timestamp: new Date(),
    };
    addElementToActiveLayer(newElement);
  };

  const addStickyNote = (x: number, y: number) => {
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: 'sticky',
      data: {text: 'New Idea', color: currentColor},
      position: {x, y, z: 0},
      color: currentColor,
      author: 'Current User',
      timestamp: new Date(),
    };
    addElementToActiveLayer(newElement);
  };

  const toggle3DMode = () => {
    setIs3DMode(!is3DMode);
    
    if (!is3DMode) {
      // Animate to 3D view
      Animated.parallel([
        Animated.timing(rotateX, {
          toValue: 30,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(rotateY, {
          toValue: -30,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale3D, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset to 2D view
      Animated.parallel([
        Animated.timing(rotateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(rotateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale3D, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const clearBoard = () => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === activeLayerId ? {...layer, elements: []} : layer
      )
    );
  };

  const addNewLayer = () => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      elements: [],
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const tools = [
    {id: 'pen', icon: 'pencil', label: 'Pen'},
    {id: 'text', icon: 'format-text', label: 'Text'},
    {id: 'shape', icon: 'shape', label: 'Shapes'},
    {id: 'sticky', icon: 'note-sticky', label: 'Sticky Note'},
    {id: 'eraser', icon: 'eraser', label: 'Eraser'},
  ];

  const colors = [
    '#8B5CF6', // Electric Purple
    '#14B8A6', // Cyber Teal
    '#EC4899', // Neon Pink
    '#F97316', // Orange
    '#10B981', // Green
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#F59E0B', // Yellow
    '#FFFFFF', // White
    '#000000', // Black
  ];

  const renderDrawingCanvas = () => {
    return (
      <Animated.View
        style={[
          styles.canvas,
          {
            transform: [
              {perspective: 1000},
              {rotateX: rotateX.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              })},
              {rotateY: rotateY.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              })},
              {scale: scale3D},
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Svg
          ref={svgRef}
          style={StyleSheet.absoluteFillObject}
          width={screenWidth}
          height={screenHeight * 0.6}
        >
          {layers.map(layer => {
            if (!layer.visible) return null;
            
            return (
              <G key={layer.id} opacity={layer.opacity}>
                {layer.elements.map(element => {
                  if (element.type === 'pen') {
                    return (
                      <Path
                        key={element.id}
                        d={element.data}
                        stroke={element.color}
                        strokeWidth={brushSize}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  } else if (element.type === 'text') {
                    return (
                      <SvgText
                        key={element.id}
                        x={element.position.x}
                        y={element.position.y}
                        fill={element.color}
                        fontSize="16"
                      >
                        {element.data}
                      </SvgText>
                    );
                  } else if (element.type === 'sticky') {
                    return (
                      <G key={element.id}>
                        <Rect
                          x={element.position.x}
                          y={element.position.y}
                          width={100}
                          height={100}
                          fill={element.color + '40'}
                          stroke={element.color}
                          strokeWidth={2}
                          rx={5}
                        />
                        <SvgText
                          x={element.position.x + 50}
                          y={element.position.y + 50}
                          fill={element.color}
                          fontSize="12"
                          textAnchor="middle"
                        >
                          {element.data.text}
                        </SvgText>
                      </G>
                    );
                  }
                  return null;
                })}
              </G>
            );
          })}
          
          {/* Current drawing path */}
          {isDrawing && currentPath.length > 0 && (
            <Path
              d={currentPath.join(' ')}
              stroke={currentColor}
              strokeWidth={brushSize}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
        
        {/* 3D Layer indicators */}
        {is3DMode && layers.map((layer, index) => (
          <View
            key={layer.id}
            style={[
              styles.layerIndicator,
              {
                bottom: index * 30,
                opacity: layer.visible ? 1 : 0.3,
                borderColor: layer.id === activeLayerId ? currentColor : 'transparent',
              },
            ]}
          >
            <Text style={styles.layerIndicatorText}>{layer.name}</Text>
          </View>
        ))}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={MetrTheme.colors.gradients.dark}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>3D Whiteboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggle3DMode} style={styles.headerButton}>
            <Icon 
              name={is3DMode ? 'cube' : 'cube-outline'} 
              size={24} 
              color={is3DMode ? MetrTheme.colors.primary.electric : MetrTheme.colors.dark.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowLayersPanel(true)} style={styles.headerButton}>
            <Icon name="layers" size={24} color={MetrTheme.colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearBoard} style={styles.headerButton}>
            <Icon name="delete-outline" size={24} color={MetrTheme.colors.semantic.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      {renderDrawingCanvas()}

      {/* Toolbar */}
      <GlassCard style={styles.toolbar} glassTint="dark">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tools.map(tool => (
            <TouchableOpacity
              key={tool.id}
              onPress={() => setCurrentTool(tool.id as any)}
              style={[
                styles.toolButton,
                currentTool === tool.id && styles.toolButtonActive,
              ]}
            >
              <Icon
                name={tool.icon}
                size={24}
                color={currentTool === tool.id ? MetrTheme.colors.primary.electric : MetrTheme.colors.dark.text}
              />
              <Text style={[
                styles.toolLabel,
                currentTool === tool.id && styles.toolLabelActive,
              ]}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </GlassCard>

      {/* Color Palette */}
      <GlassCard style={styles.colorPalette} glassTint="dark">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {colors.map(color => (
            <TouchableOpacity
              key={color}
              onPress={() => setCurrentColor(color)}
              style={[
                styles.colorButton,
                {backgroundColor: color},
                currentColor === color && styles.colorButtonActive,
              ]}
            />
          ))}
        </ScrollView>
      </GlassCard>

      {/* Brush Size */}
      <GlassCard style={styles.brushSizeContainer} glassTint="dark">
        <Text style={styles.brushSizeLabel}>Brush Size: {brushSize}</Text>
        <View style={styles.brushSizeButtons}>
          <TouchableOpacity onPress={() => setBrushSize(Math.max(1, brushSize - 1))}>
            <Icon name="minus" size={20} color={MetrTheme.colors.dark.text} />
          </TouchableOpacity>
          <View style={[styles.brushSizePreview, {width: brushSize * 3, height: brushSize * 3}]} />
          <TouchableOpacity onPress={() => setBrushSize(Math.min(10, brushSize + 1))}>
            <Icon name="plus" size={20} color={MetrTheme.colors.dark.text} />
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Collaborators */}
      <View style={styles.collaborators}>
        {collaborators.map((collab, index) => (
          <View
            key={index}
            style={[
              styles.collaboratorAvatar,
              {backgroundColor: MetrTheme.colors.primary.electric},
            ]}
          >
            <Text style={styles.collaboratorText}>
              {collab.name ? collab.name.charAt(0) : 'U'}
            </Text>
          </View>
        ))}
        <TouchableOpacity style={styles.addCollaborator}>
          <Icon name="plus" size={16} color={MetrTheme.colors.dark.text} />
        </TouchableOpacity>
      </View>

      {/* Layers Panel Modal */}
      <Modal visible={showLayersPanel} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <GlassCard style={styles.layersPanel}>
            <View style={styles.layersPanelHeader}>
              <Text style={styles.layersPanelTitle}>Layers</Text>
              <TouchableOpacity onPress={() => setShowLayersPanel(false)}>
                <Icon name="close" size={24} color={MetrTheme.colors.dark.text} />
              </TouchableOpacity>
            </View>
            
            {layers.map(layer => (
              <TouchableOpacity
                key={layer.id}
                onPress={() => setActiveLayerId(layer.id)}
                style={[
                  styles.layerItem,
                  layer.id === activeLayerId && styles.layerItemActive,
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    setLayers(prevLayers =>
                      prevLayers.map(l =>
                        l.id === layer.id ? {...l, visible: !l.visible} : l
                      )
                    );
                  }}
                >
                  <Icon
                    name={layer.visible ? 'eye' : 'eye-off'}
                    size={20}
                    color={MetrTheme.colors.dark.textSecondary}
                  />
                </TouchableOpacity>
                <Text style={styles.layerName}>{layer.name}</Text>
                <Text style={styles.layerElementCount}>
                  {layer.elements.length} elements
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity onPress={addNewLayer} style={styles.addLayerButton}>
              <Icon name="plus" size={20} color={MetrTheme.colors.primary.electric} />
              <Text style={styles.addLayerText}>Add Layer</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
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
    fontSize: 24,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  canvas: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  layerIndicator: {
    position: 'absolute',
    left: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  layerIndicatorText: {
    fontSize: 10,
    color: MetrTheme.colors.dark.textSecondary,
  },
  toolbar: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
  },
  toolButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toolButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
  },
  toolLabel: {
    fontSize: 10,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  toolLabelActive: {
    color: MetrTheme.colors.primary.electric,
  },
  colorPalette: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: MetrTheme.colors.dark.text,
  },
  brushSizeContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brushSizeLabel: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
  },
  brushSizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  brushSizePreview: {
    backgroundColor: MetrTheme.colors.primary.electric,
    borderRadius: 20,
  },
  collaborators: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    gap: -8,
  },
  collaboratorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MetrTheme.colors.dark.background,
  },
  collaboratorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addCollaborator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MetrTheme.colors.dark.background,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  layersPanel: {
    width: screenWidth * 0.8,
    maxHeight: screenHeight * 0.6,
    padding: 20,
  },
  layersPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  layersPanelTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  layerItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  layerName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
  },
  layerElementCount: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  addLayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  addLayerText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: MetrTheme.colors.primary.electric,
  },
});
