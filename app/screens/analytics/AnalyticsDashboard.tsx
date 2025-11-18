// AnalyticsDashboard.tsx - Team Analytics & Insights Dashboard for METR
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Circle, Path, Rect, G, Text as SvgText, Line} from 'react-native-svg';
import {GlassCard} from '../../components/glassmorphism/GlassCard';
import {MetrTheme} from '../../theme/metrTheme';
import AIManager from '../../ai/core/AIManager';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface MetricCard {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [teamHealthScore, setTeamHealthScore] = useState(85);
  const [productivityData, setProductivityData] = useState<ChartData[]>([]);
  const [communicationPatterns, setCommunicationPatterns] = useState<any>({});
  const [burnoutRisk, setBurnoutRisk] = useState<'low' | 'medium' | 'high'>('low');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const aiManager = useRef(AIManager.getInstance());

  useEffect(() => {
    loadAnalytics();
    startAnimations();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    // Load analytics data
    const mockProductivityData = [
      {label: 'Mon', value: 75},
      {label: 'Tue', value: 82},
      {label: 'Wed', value: 78},
      {label: 'Thu', value: 85},
      {label: 'Fri', value: 92},
      {label: 'Sat', value: 65},
      {label: 'Sun', value: 70},
    ];
    setProductivityData(mockProductivityData);
    
    // Load team health metrics
    const healthScore = await calculateTeamHealth();
    setTeamHealthScore(healthScore);
    
    // Analyze communication patterns
    const patterns = await analyzeCommunicationPatterns();
    setCommunicationPatterns(patterns);
    
    // Assess burnout risk
    const risk = await assessBurnoutRisk();
    setBurnoutRisk(risk);
  };

  const calculateTeamHealth = async (): Promise<number> => {
    // AI-powered team health calculation
    return 85; // Mock value
  };

  const analyzeCommunicationPatterns = async (): Promise<any> => {
    return {
      messagesPerDay: 156,
      responseTime: '12 min',
      activePeakHour: '10 AM',
      collaborationScore: 88,
    };
  };

  const assessBurnoutRisk = async (): Promise<'low' | 'medium' | 'high'> => {
    return 'low';
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadAnalytics();
      setRefreshing(false);
    }, 2000);
  };

  const metrics: MetricCard[] = [
    {
      id: '1',
      title: 'Productivity Score',
      value: 87,
      unit: '%',
      change: 12,
      trend: 'up',
      icon: 'trending-up',
      color: MetrTheme.colors.semantic.success,
    },
    {
      id: '2',
      title: 'Tasks Completed',
      value: 42,
      unit: '',
      change: 8,
      trend: 'up',
      icon: 'checkbox-marked-circle',
      color: MetrTheme.colors.primary.electric,
    },
    {
      id: '3',
      title: 'Focus Time',
      value: 5.5,
      unit: 'hrs',
      change: -10,
      trend: 'down',
      icon: 'clock-focus',
      color: MetrTheme.colors.semantic.warning,
    },
    {
      id: '4',
      title: 'Team Velocity',
      value: 23,
      unit: 'pts',
      change: 5,
      trend: 'up',
      icon: 'speedometer',
      color: MetrTheme.colors.primary.teal,
    },
  ];

  const renderMetricCard = (metric: MetricCard) => (
    <TouchableOpacity key={metric.id} activeOpacity={0.8}>
      <GlassCard style={styles.metricCard} glassTint="dark">
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, {backgroundColor: metric.color + '20'}]}>
            <Icon name={metric.icon} size={24} color={metric.color} />
          </View>
          <View style={[
            styles.trendBadge,
            {backgroundColor: metric.trend === 'up' ? '#10B98120' : '#EF444420'}
          ]}>
            <Icon
              name={metric.trend === 'up' ? 'arrow-up' : 'arrow-down'}
              size={14}
              color={metric.trend === 'up' ? '#10B981' : '#EF4444'}
            />
            <Text style={[
              styles.trendText,
              {color: metric.trend === 'up' ? '#10B981' : '#EF4444'}
            ]}>
              {Math.abs(metric.change)}%
            </Text>
          </View>
        </View>
        <Text style={styles.metricValue}>
          {metric.value}
          <Text style={styles.metricUnit}>{metric.unit}</Text>
        </Text>
        <Text style={styles.metricTitle}>{metric.title}</Text>
      </GlassCard>
    </TouchableOpacity>
  );

  const renderProductivityChart = () => {
    const maxValue = Math.max(...productivityData.map(d => d.value));
    const chartHeight = 200;
    const chartWidth = screenWidth - 60;
    const barWidth = chartWidth / productivityData.length - 10;

    return (
      <GlassCard style={styles.chartCard} glassTint="purple">
        <Text style={styles.chartTitle}>Weekly Productivity Trend</Text>
        <Svg height={chartHeight} width={chartWidth}>
          {productivityData.map((data, index) => {
            const barHeight = (data.value / maxValue) * (chartHeight - 40);
            const x = index * (barWidth + 10) + 10;
            const y = chartHeight - barHeight - 20;

            return (
              <G key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={`url(#gradient${index})`}
                  rx={4}
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 5}
                  fontSize="12"
                  fill={MetrTheme.colors.dark.textSecondary}
                  textAnchor="middle"
                >
                  {data.label}
                </SvgText>
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize="10"
                  fill={MetrTheme.colors.dark.text}
                  textAnchor="middle"
                >
                  {data.value}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </GlassCard>
    );
  };

  const renderTeamHealthWheel = () => {
    const size = 180;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (teamHealthScore / 100) * circumference;

    return (
      <GlassCard style={styles.healthCard} glassTint="teal">
        <Text style={styles.healthTitle}>Team Health Score</Text>
        <View style={styles.healthWheel}>
          <Svg height={size} width={size} style={styles.svgContainer}>
            <Circle
              stroke="rgba(255, 255, 255, 0.1)"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke={MetrTheme.colors.primary.teal}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90, ${size / 2}, ${size / 2})`}
            />
          </Svg>
          <View style={styles.healthScoreContainer}>
            <Text style={styles.healthScore}>{teamHealthScore}</Text>
            <Text style={styles.healthScoreLabel}>/ 100</Text>
          </View>
        </View>
        <View style={styles.healthMetrics}>
          <View style={styles.healthMetric}>
            <Icon name="account-group" size={16} color={MetrTheme.colors.dark.textSecondary} />
            <Text style={styles.healthMetricText}>Collaboration: 88%</Text>
          </View>
          <View style={styles.healthMetric}>
            <Icon name="emoticon-happy" size={16} color={MetrTheme.colors.dark.textSecondary} />
            <Text style={styles.healthMetricText}>Mood: Positive</Text>
          </View>
          <View style={styles.healthMetric}>
            <Icon name="fire" size={16} color={MetrTheme.colors.dark.textSecondary} />
            <Text style={styles.healthMetricText}>Burnout Risk: {burnoutRisk}</Text>
          </View>
        </View>
      </GlassCard>
    );
  };

  const renderCommunicationPatterns = () => (
    <GlassCard style={styles.patternsCard} glassTint="dark">
      <Text style={styles.patternsTitle}>Communication Patterns</Text>
      <View style={styles.patternGrid}>
        <View style={styles.patternItem}>
          <Icon name="message-text" size={24} color={MetrTheme.colors.primary.electric} />
          <Text style={styles.patternValue}>{communicationPatterns.messagesPerDay}</Text>
          <Text style={styles.patternLabel}>Messages/Day</Text>
        </View>
        <View style={styles.patternItem}>
          <Icon name="clock-fast" size={24} color={MetrTheme.colors.primary.teal} />
          <Text style={styles.patternValue}>{communicationPatterns.responseTime}</Text>
          <Text style={styles.patternLabel}>Avg Response</Text>
        </View>
        <View style={styles.patternItem}>
          <Icon name="trending-up" size={24} color={MetrTheme.colors.primary.pink} />
          <Text style={styles.patternValue}>{communicationPatterns.activePeakHour}</Text>
          <Text style={styles.patternLabel}>Peak Activity</Text>
        </View>
        <View style={styles.patternItem}>
          <Icon name="handshake" size={24} color={MetrTheme.colors.semantic.success} />
          <Text style={styles.patternValue}>{communicationPatterns.collaborationScore}%</Text>
          <Text style={styles.patternLabel}>Collaboration</Text>
        </View>
      </View>
    </GlassCard>
  );

  const renderSkillsMatrix = () => {
    const skills = [
      {name: 'Frontend', level: 85},
      {name: 'Backend', level: 70},
      {name: 'Design', level: 60},
      {name: 'DevOps', level: 75},
      {name: 'Mobile', level: 90},
    ];

    return (
      <GlassCard style={styles.skillsCard} glassTint="purple">
        <Text style={styles.skillsTitle}>Team Skills Matrix</Text>
        {skills.map((skill, index) => (
          <View key={index} style={styles.skillItem}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <View style={styles.skillBarContainer}>
              <LinearGradient
                colors={MetrTheme.colors.gradients.primary}
                style={[styles.skillBar, {width: `${skill.level}%`}]}
              />
            </View>
            <Text style={styles.skillLevel}>{skill.level}%</Text>
          </View>
        ))}
      </GlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={MetrTheme.colors.gradients.dark}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={{opacity: fadeAnim, transform: [{scale: scaleAnim}]}}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Analytics Dashboard</Text>
            <View style={styles.periodSelector}>
              {(['day', 'week', 'month'] as const).map(period => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selectedPeriod === period && styles.periodTextActive,
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI Insight */}
          <GlassCard style={styles.insightCard} glassTint="purple">
            <View style={styles.insightHeader}>
              <Icon name="robot" size={24} color={MetrTheme.colors.primary.electric} />
              <Text style={styles.insightTitle}>AI Insight</Text>
            </View>
            <Text style={styles.insightText}>
              📈 Team productivity is up 15% this week! Peak performance detected on Friday.
              Consider implementing similar workflows for consistent results.
            </Text>
          </GlassCard>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {metrics.map(metric => renderMetricCard(metric))}
          </View>

          {/* Productivity Chart */}
          {renderProductivityChart()}

          {/* Team Health Wheel */}
          {renderTeamHealthWheel()}

          {/* Communication Patterns */}
          {renderCommunicationPatterns()}

          {/* Skills Matrix */}
          {renderSkillsMatrix()}

          {/* Burnout Prevention Alert */}
          {burnoutRisk !== 'low' && (
            <GlassCard style={styles.alertCard} glassTint="dark">
              <View style={styles.alertHeader}>
                <Icon name="alert-circle" size={24} color={MetrTheme.colors.semantic.warning} />
                <Text style={styles.alertTitle}>Burnout Prevention Alert</Text>
              </View>
              <Text style={styles.alertText}>
                Some team members showing signs of stress. Consider redistributing workload
                and scheduling wellness check-ins.
              </Text>
              <TouchableOpacity style={styles.alertButton}>
                <Text style={styles.alertButtonText}>View Recommendations →</Text>
              </TouchableOpacity>
            </GlassCard>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: MetrTheme.colors.primary.electric,
  },
  periodText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  periodTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  insightCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  metricCard: {
    width: (screenWidth - 40) / 2 - 6,
    margin: 6,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: MetrTheme.colors.dark.textSecondary,
  },
  metricTitle: {
    fontSize: 13,
    color: MetrTheme.colors.dark.textSecondary,
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  healthCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 20,
  },
  healthWheel: {
    position: 'relative',
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  svgContainer: {
    position: 'absolute',
  },
  healthScoreContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -40}, {translateY: -20}],
    alignItems: 'center',
  },
  healthScore: {
    fontSize: 48,
    fontWeight: '700',
    color: MetrTheme.colors.primary.teal,
  },
  healthScoreLabel: {
    fontSize: 16,
    color: MetrTheme.colors.dark.textSecondary,
  },
  healthMetrics: {
    width: '100%',
  },
  healthMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthMetricText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginLeft: 8,
  },
  patternsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  patternsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 20,
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  patternItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  patternValue: {
    fontSize: 20,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginTop: 8,
  },
  patternLabel: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  skillsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  skillsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 20,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillName: {
    width: 80,
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
  },
  skillBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  skillBar: {
    height: '100%',
    borderRadius: 4,
  },
  skillLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    width: 40,
    textAlign: 'right',
  },
  alertCard: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.semantic.warning,
    marginLeft: 8,
  },
  alertText: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  alertButton: {
    alignSelf: 'flex-start',
  },
  alertButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: MetrTheme.colors.primary.electric,
  },
});
