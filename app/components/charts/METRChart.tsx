// METRChart.tsx - Custom METR Branded Chart Components
import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {LineChart, BarChart, PieChart} from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import {MetrTheme} from '../../theme/metrTheme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface METRLineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
    }>;
  };
  title?: string;
  height?: number;
}

export const METRLineChart: React.FC<METRLineChartProps> = ({
  data,
  title,
  height = 220,
}) => {
  const chartConfig = {
    backgroundColor: MetrTheme.colors.dark.surface,
    backgroundGradientFrom: MetrTheme.colors.dark.surface,
    backgroundGradientTo: MetrTheme.colors.dark.surfaceLight,
    decimalPlaces: 0,
    color: (opacity = 1) => MetrTheme.colors.primary.electric + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => MetrTheme.colors.dark.textSecondary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: MetrTheme.colors.primary.electric,
    },
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <LineChart
        data={data}
        width={SCREEN_WIDTH - 48}
        height={height}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withDots={true}
        withShadow={false}
      />
    </View>
  );
};

interface METRBarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  title?: string;
  height?: number;
}

export const METRBarChart: React.FC<METRBarChartProps> = ({
  data,
  title,
  height = 220,
}) => {
  const chartConfig = {
    backgroundColor: MetrTheme.colors.dark.surface,
    backgroundGradientFrom: MetrTheme.colors.dark.surface,
    backgroundGradientTo: MetrTheme.colors.dark.surfaceLight,
    decimalPlaces: 0,
    color: (opacity = 1) => MetrTheme.colors.primary.teal + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => MetrTheme.colors.dark.textSecondary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <BarChart
        data={data}
        width={SCREEN_WIDTH - 48}
        height={height}
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars
        withInnerLines={false}
        withVerticalLabels={true}
        withHorizontalLabels={true}
      />
    </View>
  );
};

interface METRPieChartProps {
  data: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor?: string;
    legendFontSize?: number;
  }>;
  title?: string;
  height?: number;
}

export const METRPieChart: React.FC<METRPieChartProps> = ({
  data,
  title,
  height = 220,
}) => {
  const chartConfig = {
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => MetrTheme.colors.dark.text + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <PieChart
        data={data}
        width={SCREEN_WIDTH - 48}
        height={height}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default {METRLineChart, METRBarChart, METRPieChart};

