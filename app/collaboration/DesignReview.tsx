// DesignReview.tsx - Design Review & Feedback Tools for METR
import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  PanResponder,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Circle, Line, Path, Text as SvgText} from 'react-native-svg';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: screenWidth} = Dimensions.get('window');

interface Annotation {
  id: string;
  type: 'comment' | 'arrow' | 'circle' | 'rectangle' | 'text';
  position: {x: number; y: number};
  endPosition?: {x: number; y: number};
  text?: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
  color: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

interface DesignVersion {
  id: string;
  version: string;
  imageUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  annotations: Annotation[];
  approvals: Approval[];
  status: 'draft' | 'review' | 'approved' | 'rejected';
}

interface Approval {
  userId: string;
  userName: string;
  status: 'approved' | 'rejected' | 'pending';
  comment?: string;
  timestamp: Date;
}

interface DesignProject {
  id: string;
  name: string;
  description: string;
  versions: DesignVersion[];
  currentVersion: string;
  team: string[];
  createdAt: Date;
}

const ANNOTATION_TOOLS = [
  {id: 'comment', icon: 'comment', name: 'Comment'},
  {id: 'arrow', icon: 'arrow-top-right', name: 'Arrow'},
  {id: 'circle', icon: 'circle-outline', name: 'Circle'},
  {id: 'rectangle', icon: 'square-outline', name: 'Rectangle'},
  {id: 'text', icon: 'format-text', name: 'Text'},
];

const COLORS = ['#8B5CF6', '#14B8A6', '#EC4899', '#F59E0B', '#EF4444', '#10B981'];

export const DesignReview: React.FC = () => {
  const [project, setProject] = useState<DesignProject>({
    id: 'proj_1',
    name: 'METR App Redesign',
    description: 'New UI/UX for METR mobile app',
    versions: [
      {
        id: 'v1',
        version: '1.0',
        imageUrl: 'https://picsum.photos/400/800',
        uploadedBy: 'Designer',
        uploadedAt: new Date(),
        annotations: [],
        approvals: [],
        status: 'review',
      },
    ],
    currentVersion: 'v1',
    team: ['Designer', 'Developer', 'PM'],
    createdAt: new Date(),
  });

  const [currentVersion, setCurrentVersion] = useState<DesignVersion>(project.versions[0]);
  const [selectedTool, setSelectedTool] = useState<string>('comment');
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{x: number; y: number} | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const imageRef = useRef<View>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => selectedTool !== 'comment',
    onMoveShouldSetPanResponder: () => selectedTool !== 'comment',
    onPanResponderGrant: (evt) => {
      const {locationX, locationY} = evt.nativeEvent;
      setIsDrawing(true);
      setDrawStart({x: locationX, y: locationY});
    },
    onPanResponderMove: (evt) => {
      if (!isDrawing || !drawStart) return;
      // Update preview while drawing
    },
    onPanResponderRelease: (evt) => {
      if (!drawStart) return;
      
      const {locationX, locationY} = evt.nativeEvent;
      createAnnotation(drawStart, {x: locationX, y: locationY});
      
      setIsDrawing(false);
      setDrawStart(null);
    },
  });

  const createAnnotation = (start: {x: number; y: number}, end?: {x: number; y: number}) => {
    const newAnnotation: Annotation = {
      id: `ann_${Date.now()}`,
      type: selectedTool as Annotation['type'],
      position: start,
      endPosition: end,
      author: 'Current User',
      timestamp: new Date(),
      resolved: false,
      color: selectedColor,
      replies: [],
    };

    if (selectedTool === 'comment' || selectedTool === 'text') {
      // Show input dialog for text
      setSelectedAnnotation(newAnnotation);
    } else {
      addAnnotation(newAnnotation);
    }
  };

  const addAnnotation = (annotation: Annotation) => {
    const updatedVersion = {
      ...currentVersion,
      annotations: [...currentVersion.annotations, annotation],
    };
    
    setCurrentVersion(updatedVersion);
    updateProject(updatedVersion);
  };

  const updateProject = async (version: DesignVersion) => {
    const updatedVersions = project.versions.map(v => 
      v.id === version.id ? version : v
    );
    
    const updatedProject = {
      ...project,
      versions: updatedVersions,
    };
    
    setProject(updatedProject);
    await saveProject(updatedProject);
  };

  const saveProject = async (proj: DesignProject) => {
    try {
      await AsyncStorage.setItem(`design_project_${proj.id}`, JSON.stringify(proj));
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const addReply = (annotationId: string) => {
    if (!replyText.trim()) return;

    const reply: Reply = {
      id: `reply_${Date.now()}`,
      text: replyText,
      author: 'Current User',
      timestamp: new Date(),
    };

    const updatedAnnotations = currentVersion.annotations.map(ann =>
      ann.id === annotationId
        ? {...ann, replies: [...ann.replies, reply]}
        : ann
    );

    const updatedVersion = {
      ...currentVersion,
      annotations: updatedAnnotations,
    };

    setCurrentVersion(updatedVersion);
    updateProject(updatedVersion);
    setReplyText('');
  };

  const resolveAnnotation = (annotationId: string) => {
    const updatedAnnotations = currentVersion.annotations.map(ann =>
      ann.id === annotationId ? {...ann, resolved: !ann.resolved} : ann
    );

    const updatedVersion = {
      ...currentVersion,
      annotations: updatedAnnotations,
    };

    setCurrentVersion(updatedVersion);
    updateProject(updatedVersion);
  };

  const approveDesign = async (status: 'approved' | 'rejected', comment?: string) => {
    const approval: Approval = {
      userId: 'current_user',
      userName: 'Current User',
      status,
      comment,
      timestamp: new Date(),
    };

    const updatedVersion = {
      ...currentVersion,
      approvals: [...currentVersion.approvals, approval],
      status: status === 'approved' && 
              currentVersion.approvals.filter(a => a.status === 'approved').length >= 2
              ? 'approved' : currentVersion.status,
    };

    setCurrentVersion(updatedVersion);
    updateProject(updatedVersion);
  };

  const uploadNewVersion = () => {
    const newVersion: DesignVersion = {
      id: `v${project.versions.length + 1}`,
      version: `${project.versions.length + 1}.0`,
      imageUrl: 'https://picsum.photos/400/801', // Different image
      uploadedBy: 'Current User',
      uploadedAt: new Date(),
      annotations: [],
      approvals: [],
      status: 'draft',
    };

    const updatedProject = {
      ...project,
      versions: [...project.versions, newVersion],
      currentVersion: newVersion.id,
    };

    setProject(updatedProject);
    setCurrentVersion(newVersion);
    saveProject(updatedProject);
  };

  const renderAnnotation = (annotation: Annotation) => {
    switch (annotation.type) {
      case 'comment':
        return (
          <TouchableOpacity
            key={annotation.id}
            style={[
              styles.commentMarker,
              {
                left: annotation.position.x - 15,
                top: annotation.position.y - 15,
                backgroundColor: annotation.resolved ? '#10B981' : annotation.color,
              },
            ]}
            onPress={() => setSelectedAnnotation(annotation)}
          >
            <Icon name="comment" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        );

      case 'arrow':
        if (!annotation.endPosition) return null;
        return (
          <Svg
            key={annotation.id}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          >
            <Line
              x1={annotation.position.x}
              y1={annotation.position.y}
              x2={annotation.endPosition.x}
              y2={annotation.endPosition.y}
              stroke={annotation.color}
              strokeWidth={3}
            />
            <Path
              d={`M ${annotation.endPosition.x} ${annotation.endPosition.y} 
                  L ${annotation.endPosition.x - 10} ${annotation.endPosition.y - 5} 
                  L ${annotation.endPosition.x - 10} ${annotation.endPosition.y + 5} Z`}
              fill={annotation.color}
            />
          </Svg>
        );

      case 'circle':
        if (!annotation.endPosition) return null;
        const radius = Math.sqrt(
          Math.pow(annotation.endPosition.x - annotation.position.x, 2) +
          Math.pow(annotation.endPosition.y - annotation.position.y, 2)
        );
        return (
          <Svg
            key={annotation.id}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          >
            <Circle
              cx={annotation.position.x}
              cy={annotation.position.y}
              r={radius}
              stroke={annotation.color}
              strokeWidth={3}
              fill="transparent"
            />
          </Svg>
        );

      case 'text':
        return (
          <View
            key={annotation.id}
            style={[
              styles.textAnnotation,
              {
                left: annotation.position.x,
                top: annotation.position.y,
              },
            ]}
          >
            <Text style={[styles.textAnnotationText, {color: annotation.color}]}>
              {annotation.text}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const renderToolbar = () => (
    <View style={styles.toolbar}>
      {ANNOTATION_TOOLS.map(tool => (
        <TouchableOpacity
          key={tool.id}
          style={[
            styles.toolButton,
            selectedTool === tool.id && styles.toolButtonSelected,
          ]}
          onPress={() => setSelectedTool(tool.id)}
        >
          <Icon 
            name={tool.icon} 
            size={24} 
            color={selectedTool === tool.id ? '#FFFFFF' : MetrTheme.colors.dark.text} 
          />
        </TouchableOpacity>
      ))}
      
      <View style={styles.colorPicker}>
        {COLORS.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              {backgroundColor: color},
              selectedColor === color && styles.colorButtonSelected,
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>
    </View>
  );

  const renderAnnotationPanel = () => {
    if (!selectedAnnotation) return null;

    return (
      <GlassCard style={styles.annotationPanel}>
        <View style={styles.annotationHeader}>
          <Text style={styles.annotationAuthor}>{selectedAnnotation.author}</Text>
          <TouchableOpacity onPress={() => setSelectedAnnotation(null)}>
            <Icon name="close" size={20} color={MetrTheme.colors.dark.text} />
          </TouchableOpacity>
        </View>

        {selectedAnnotation.text && (
          <Text style={styles.annotationText}>{selectedAnnotation.text}</Text>
        )}

        <View style={styles.replies}>
          {selectedAnnotation.replies.map(reply => (
            <View key={reply.id} style={styles.reply}>
              <Text style={styles.replyAuthor}>{reply.author}</Text>
              <Text style={styles.replyText}>{reply.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.replyInput}>
          <TextInput
            style={styles.replyTextInput}
            placeholder="Add a reply..."
            placeholderTextColor={MetrTheme.colors.dark.textSecondary}
            value={replyText}
            onChangeText={setReplyText}
          />
          <TouchableOpacity onPress={() => addReply(selectedAnnotation.id)}>
            <Icon name="send" size={20} color={MetrTheme.colors.primary.electric} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.resolveButton,
            selectedAnnotation.resolved && styles.resolvedButton,
          ]}
          onPress={() => resolveAnnotation(selectedAnnotation.id)}
        >
          <Text style={styles.resolveButtonText}>
            {selectedAnnotation.resolved ? 'Reopen' : 'Resolve'}
          </Text>
        </TouchableOpacity>
      </GlassCard>
    );
  };

  const renderApprovalSection = () => (
    <GlassCard style={styles.approvalSection}>
      <Text style={styles.approvalTitle}>Approval Status</Text>
      
      <View style={styles.approvals}>
        {currentVersion.approvals.map(approval => (
          <View key={approval.timestamp.toString()} style={styles.approval}>
            <Icon 
              name={approval.status === 'approved' ? 'check-circle' : 'close-circle'}
              size={24}
              color={approval.status === 'approved' ? MetrTheme.colors.semantic.success : MetrTheme.colors.semantic.error}
            />
            <Text style={styles.approvalUser}>{approval.userName}</Text>
            {approval.comment && (
              <Text style={styles.approvalComment}>{approval.comment}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.approvalActions}>
        <TouchableOpacity
          style={[styles.approvalButton, styles.approveButton]}
          onPress={() => approveDesign('approved')}
        >
          <Icon name="check" size={20} color="#FFFFFF" />
          <Text style={styles.approvalButtonText}>Approve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.approvalButton, styles.rejectButton]}
          onPress={() => approveDesign('rejected')}
        >
          <Icon name="close" size={20} color="#FFFFFF" />
          <Text style={styles.approvalButtonText}>Request Changes</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Design Review</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowVersionHistory(!showVersionHistory)}>
            <Icon name="history" size={24} color={MetrTheme.colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={uploadNewVersion}>
            <Icon name="upload" size={24} color={MetrTheme.colors.dark.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.designContainer} {...panResponder.panHandlers}>
          <Image
            ref={imageRef}
            source={{uri: currentVersion.imageUrl}}
            style={[styles.designImage, {transform: [{scale: zoomLevel}]}]}
            resizeMode="contain"
          />
          
          {/* Render annotations */}
          <View style={StyleSheet.absoluteFillObject}>
            {currentVersion.annotations.map(renderAnnotation)}
          </View>
        </View>

        {renderApprovalSection()}
      </ScrollView>

      {renderToolbar()}
      {renderAnnotationPanel()}

      {/* Version History */}
      {showVersionHistory && (
        <GlassCard style={styles.versionHistory}>
          <Text style={styles.versionHistoryTitle}>Version History</Text>
          <ScrollView>
            {project.versions.map(version => (
              <TouchableOpacity
                key={version.id}
                style={[
                  styles.versionItem,
                  currentVersion.id === version.id && styles.versionItemSelected,
                ]}
                onPress={() => setCurrentVersion(version)}
              >
                <Text style={styles.versionNumber}>v{version.version}</Text>
                <Text style={styles.versionDate}>
                  {version.uploadedAt.toLocaleDateString()}
                </Text>
                <View style={[styles.versionStatus, styles[`status_${version.status}`]]}>
                  <Text style={styles.versionStatusText}>{version.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </GlassCard>
      )}

      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity onPress={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}>
          <Icon name="magnify-minus" size={24} color={MetrTheme.colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</Text>
        <TouchableOpacity onPress={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}>
          <Icon name="magnify-plus" size={24} color={MetrTheme.colors.dark.text} />
        </TouchableOpacity>
      </View>
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
    padding: 20,
    paddingTop: 60,
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
  content: {
    flex: 1,
  },
  designContainer: {
    width: screenWidth,
    height: 600,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  designImage: {
    width: '100%',
    height: '100%',
  },
  toolbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  toolButtonSelected: {
    backgroundColor: MetrTheme.colors.primary.electric,
  },
  colorPicker: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 8,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorButtonSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  commentMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAnnotation: {
    position: 'absolute',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
  },
  textAnnotationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  annotationPanel: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 300,
    padding: 16,
  },
  annotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  annotationAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  annotationText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    marginBottom: 12,
  },
  replies: {
    marginBottom: 12,
  },
  reply: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  replyText: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  replyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  replyTextInput: {
    flex: 1,
    color: MetrTheme.colors.dark.text,
    fontSize: 14,
  },
  resolveButton: {
    backgroundColor: MetrTheme.colors.primary.electric,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  resolvedButton: {
    backgroundColor: MetrTheme.colors.semantic.success,
  },
  resolveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  approvalSection: {
    margin: 20,
    padding: 16,
  },
  approvalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  approvals: {
    marginBottom: 16,
  },
  approval: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvalUser: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
    marginLeft: 8,
  },
  approvalComment: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginLeft: 8,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approvalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  approveButton: {
    backgroundColor: MetrTheme.colors.semantic.success,
  },
  rejectButton: {
    backgroundColor: MetrTheme.colors.semantic.error,
  },
  approvalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  versionHistory: {
    position: 'absolute',
    top: 100,
    left: 20,
    width: 200,
    padding: 16,
  },
  versionHistoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 12,
  },
  versionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  versionItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  versionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  versionDate: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  versionStatus: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  status_draft: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  status_review: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  status_approved: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  status_rejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  versionStatusText: {
    fontSize: 10,
    color: MetrTheme.colors.dark.text,
    textTransform: 'uppercase',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 8,
    gap: 12,
  },
  zoomLevel: {
    fontSize: 12,
    color: MetrTheme.colors.dark.text,
  },
});
