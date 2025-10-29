import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Mask, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { getAppleWeatherGradientColor, lightenHexColor } from '../utils/colorUtils';

const { width: screenWidth } = Dimensions.get('window');

// Mobile-specific optimizations for Expo Go iOS
const isIOS = Platform.OS === 'ios';

interface BurnoutDataPoint {
  hour?: number;
  minute?: number; // Add minute property
  day?: string;
  value: number;
  label: string;
  hasData: boolean; // Indicates if this data point has real data
  confidence?: number; // Forecast confidence for this point
  uncertainty?: number; // Uncertainty range
  isForecast?: boolean; // Whether this is a forecasted point
}

interface BurnoutGraphChartProps {
  data: BurnoutDataPoint[];
  selectedPeriod: 'Today' | 'Week' | 'Month' | 'Year';
  onDataPointPress?: (index: number) => void;
  selectedIndex?: number;
  currentOverride?: number; // Use to display current value (e.g., todayBurnout) reliably
}

const BurnoutGraphChart: React.FC<BurnoutGraphChartProps> = ({
  data,
  selectedPeriod,
  selectedIndex,
  onDataPointPress,
  currentOverride,
}) => {
  // Mobile-optimized chart dimensions for Expo Go iOS
  const chartWidth = screenWidth - (isIOS ? 16 : 8); // iOS-specific padding
  const chartHeight = isIOS ? 280 : 300; // Slightly smaller for iOS
  const paddingLeft = isIOS ? 25 : 30; // iOS-optimized padding
  const paddingRight = isIOS ? 45 : 50; // iOS-optimized padding
  const paddingTop = isIOS ? 25 : 30; // iOS-optimized padding
  const paddingBottom = isIOS ? 45 : 50; // iOS-optimized padding
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Scrubber state (Today, Week, Month)
  const [scrubX, setScrubX] = React.useState<number | null>(null);
  const [scrubIndex, setScrubIndex] = React.useState<number | null>(null);
  const isToday = selectedPeriod === 'Today';
  const isWeek = selectedPeriod === 'Week';
  const isMonth = selectedPeriod === 'Month';
  const isScrubbable = isToday || isWeek || isMonth;

  // Helper to get X position for a data point based on its original index and selected period
  const getXPositionForDataPoint = (dataPoint: BurnoutDataPoint, index: number) => {
    
    let xPos = paddingLeft;
    if (selectedPeriod === 'Today') {
      // For Today, scale based on 1440 minutes for full 24-hour representation
      if (dataPoint.hour !== undefined && dataPoint.minute !== undefined) {
        const totalMinutes = dataPoint.hour * 60 + dataPoint.minute;
        xPos += (totalMinutes / 1439) * graphWidth; // Use 1439 (0-1439 = 1440 minutes)
      } else {
        // Fallback if hour/minute are unexpectedly missing for 'Today'
        xPos += (index / Math.max(currentData.length - 1, 1)) * graphWidth; // Fallback to index-based scaling
      }
    } else {
      // For Week, position by weekday label across 7 slots so future days don't extend the line
      if (selectedPeriod === 'Week') {
        const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        const dayIndex = dataPoint.label ? days.indexOf(dataPoint.label) : -1;
        const denom = 6; // 0..6 across the week
        const posIndex = dayIndex >= 0 ? dayIndex : index;
        xPos += (posIndex / denom) * graphWidth;
      } else if (selectedPeriod === 'Month') {
        // Position by fixed 5 week slots (W1..W5) so the line can end at current week
        const weeks = ['W1','W2','W3','W4','W5'];
        const slotIndex = dataPoint.label ? weeks.indexOf(dataPoint.label) : -1;
        const denom = 4; // 0..4 across the month weeks
        const posIndex = slotIndex >= 0 ? slotIndex : index;
        xPos += (posIndex / denom) * graphWidth;
      } else {
        // Year or other: scale based on currentData length
        xPos += (index / Math.max(currentData.length - 1, 1)) * graphWidth;
      }
    }
    return xPos;
  };

  // Color coding for burnout levels - green to orange gradient
  const getBurnoutColor = (value: number) => {
    return getAppleWeatherGradientColor(value);
  };

  // Use the data prop directly, as filtering for 'Today' is handled upstream
  const currentData = data;
  
  // Silent handling - no need to log empty data (expected during initial load)

  // If no data, render a helpful placeholder
  if (currentData.length === 0) {
    return (
      <View style={{ width: chartWidth, height: chartHeight, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#9CA3AF', fontSize: 16 }}>No data available</Text>
        <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>Data will appear as it's collected</Text>
      </View>
    );
  }
  
  // Calculate average color for gradient
  const dataWithActualValues = currentData.filter(item => item.hasData);
  const averageValue = dataWithActualValues.length > 0 
    ? dataWithActualValues.reduce((sum, item) => sum + item.value, 0) / dataWithActualValues.length 
    : 0;

  // Enhanced line path generation with smooth curves for Today/Week view
  const generateLinePath = () => {
    // For Today, draw a continuous path using all points (synthetic + real)
    const validData = selectedPeriod === 'Today'
      ? currentData
      : (selectedPeriod === 'Week' ? getWeekRenderData() : (selectedPeriod === 'Month' ? getMonthClippedData() : currentData.filter(item => item.hasData)));
    
    if (validData.length === 0) {
      return '';
    }
    
    // For Today/Week, always use smooth curves to avoid gaps
    if ((selectedPeriod === 'Today' || selectedPeriod === 'Week' || selectedPeriod === 'Month') && validData.length > 2) {
      return generateSmoothLinePath();
    }
    
    // For other views, use simple linear connections
    let path = '';
    let isFirstPoint = true;
    
    for (let i = 0; i < currentData.length; i++) {
      const item = currentData[i];
      
        if (item.hasData && item.value !== undefined && item.value !== null) {
          const x = getXPositionForDataPoint(item, i);
          const y = paddingTop + graphHeight - (item.value / 100) * graphHeight;
          
          if (isFirstPoint) {
            path += `M ${x} ${y}`;
            isFirstPoint = false;
          } else {
            path += ` L ${x} ${y}`;
          }
        }
    }
    
    return path;
  };

  // Downsample data for Today chart to reduce visual clutter
  const downsampleDataForToday = (data: BurnoutDataPoint[]) => {
    if (selectedPeriod !== 'Today' || data.length <= 100) {
      return data; // No downsampling needed for other periods or small datasets
    }
    
    const targetPoints = 100; // Much more aggressive downsampling
    const step = Math.ceil(data.length / targetPoints);
    const downsampled = [];
    
    // Always include first and last points
    downsampled.push(data[0]);
    
    // Sample every step-th point, but ensure we don't exceed target
    for (let i = step; i < data.length - 1; i += step) {
      if (downsampled.length < targetPoints - 1) {
        downsampled.push(data[i]);
      }
    }
    
    // Always include the last point
    if (data.length > 1) {
      downsampled.push(data[data.length - 1]);
    }
    
    return downsampled;
  };

  // Week data sanitizer to ensure stable 7 points during refresh
  function getWeekRenderData() {
    const looksWeekly = currentData.length <= 14 && (currentData[0]?.hour === undefined);
    if (looksWeekly) return currentData.filter(item => item.hasData).map((d, i) => ({
      value: d.value,
      hasData: d.hasData,
      label: d.label, // expected 'Su'..'Sa'
    } as BurnoutDataPoint));
    const source = currentData;
    const target = 7;
    if (source.length === 0) return [] as BurnoutDataPoint[];
    const step = source.length / target;
    const weekdays = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    const sampled: BurnoutDataPoint[] = [];
    for (let i = 0; i < target; i++) {
      const idx = Math.min(source.length - 1, Math.round(i * step));
      const s = source[idx];
      sampled.push({
        value: s.value,
        hasData: s.hasData,
        label: weekdays[i] || weekdays[weekdays.length - 1],
      } as BurnoutDataPoint);
    }
    return sampled;
  }

  function getMonthRenderData() {
    // Month should render 5 week buckets (W1..W5). If already weekly labels, pass through.
    const looksWeeklyMonth = currentData.length <= 7 && (currentData[0]?.hour === undefined);
    if (looksWeeklyMonth) return currentData.filter(item => item.hasData).map((d, i) => ({
      value: d.value,
      hasData: d.hasData,
      label: d.label, // expected 'W1'..'W5'
    } as BurnoutDataPoint));
    const source = currentData;
    const target = 5;
    if (source.length === 0) return [] as BurnoutDataPoint[];
    const step = source.length / target;
    const sampled: BurnoutDataPoint[] = [];
    for (let i = 0; i < target; i++) {
      const idx = Math.min(source.length - 1, Math.round(i * step));
      const s = source[idx];
      sampled.push({
        value: s.value,
        hasData: s.hasData,
        label: `W${i + 1}`,
      } as BurnoutDataPoint);
    }
    return sampled;
  }

  // Clip Month to current week: only include weeks up to selectedIndex or last with hasData
  function getMonthClippedData() {
    const weeks = getMonthRenderData();
    const safeSelected = typeof selectedIndex === 'number' ? selectedIndex : -1;
    const cutoff = safeSelected >= 0 && safeSelected < weeks.length
      ? safeSelected
      : (() => {
          let last = 0;
          for (let i = 0; i < weeks.length; i++) {
            if (weeks[i]?.hasData) last = i;
          }
          return last;
        })();
    return weeks.slice(0, cutoff + 1);
  }

  // Generate smooth line path for Today/Week/Month view (Apple Weather style)
  const generateSmoothLinePath = () => {
    // For Today, use downsampled data to reduce visual clutter; for Week, sanitize to stable set
    const dataToUse = selectedPeriod === 'Today' 
      ? downsampleDataForToday(currentData)
      : (selectedPeriod === 'Week' ? getWeekRenderData() : (selectedPeriod === 'Month' ? getMonthClippedData() : currentData.filter(item => item.hasData)));
    
    const dataWithCoords = dataToUse.map((item, index) => ({
      x: getXPositionForDataPoint(item, index),
      y: paddingTop + graphHeight - (item.value / 100) * graphHeight,
      value: item.value,
    }));

    if (dataWithCoords.length === 0) return '';
    if (dataWithCoords.length === 1) return `M ${dataWithCoords[0].x} ${dataWithCoords[0].y}`;

    let path = `M ${dataWithCoords[0].x} ${dataWithCoords[0].y}`;
    
    // Generate smooth curves between points with enhanced smoothing for Today/Week
    const tension = (selectedPeriod === 'Today' || selectedPeriod === 'Week' || selectedPeriod === 'Month') ? 0.6 : 0.3;
    
    for (let i = 0; i < dataWithCoords.length - 1; i++) {
      const current = dataWithCoords[i];
      const next = dataWithCoords[i + 1];
      const prev = i > 0 ? dataWithCoords[i - 1] : null;
      const nextNext = i < dataWithCoords.length - 2 ? dataWithCoords[i + 2] : null;
      
      // Calculate control points for smooth curves
      let cp1x = current.x;
      let cp1y = current.y;
      let cp2x = next.x;
      let cp2y = next.y;
      
      if (prev && nextNext) {
        // Use surrounding points to calculate smooth tangents
        const dx = (next.x - prev.x) * tension;
        const dy = (next.y - prev.y) * tension;
        
        cp1x = current.x + dx * 0.5;
        cp1y = current.y + dy * 0.5;
        
        const dx2 = (nextNext.x - current.x) * tension;
        const dy2 = (nextNext.y - current.y) * tension;
        
        cp2x = next.x - dx2 * 0.5;
        cp2y = next.y - dy2 * 0.5;
      }
      
      // Add smooth curve to path
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    
    return path;
  };

  // Generate area path that follows the line exactly and fills to bottom
  const generateAreaPath = () => {
    if (currentData.length === 0) return '';

    let paths: string[] = [];
    let currentSegmentPoints: { x: number; y: number; originalIndex: number }[] = [];

    for (let i = 0; i < currentData.length; i++) {
      const item = currentData[i];
      const originalIndex = data.indexOf(item); // Get original index for correct X positioning

      if (item.hasData) {
        const x = getXPositionForDataPoint(item, i);
        const y = paddingTop + graphHeight - (item.value / 100) * graphHeight;
        currentSegmentPoints.push({ x, y, originalIndex }); // Store originalIndex as well
      } else {
        if (currentSegmentPoints.length > 0) {
          // End of a data segment, close the path
          const firstPoint = currentSegmentPoints[0];
          const lastPoint = currentSegmentPoints[currentSegmentPoints.length - 1];
          const bottomY = paddingTop + graphHeight;

          let segmentPath = `M ${firstPoint.x} ${firstPoint.y}`;
          for (let j = 1; j < currentSegmentPoints.length; j++) {
            segmentPath += ` L ${currentSegmentPoints[j].x} ${currentSegmentPoints[j].y}`;
          }
          segmentPath += ` L ${lastPoint.x} ${bottomY}`;
          segmentPath += ` L ${firstPoint.x} ${bottomY}`;
          segmentPath += ` Z`;
          paths.push(segmentPath);
          currentSegmentPoints = []; // Reset for next segment
        }
      }
    }

    // Handle the last segment if it exists
    if (currentSegmentPoints.length > 0) {
      const firstPoint = currentSegmentPoints[0];
      const lastPoint = currentSegmentPoints[currentSegmentPoints.length - 1];
      const bottomY = paddingTop + graphHeight;

      let segmentPath = `M ${firstPoint.x} ${firstPoint.y}`;
      for (let j = 1; j < currentSegmentPoints.length; j++) {
        segmentPath += ` L ${currentSegmentPoints[j].x} ${currentSegmentPoints[j].y}`;
      }
      segmentPath += ` L ${lastPoint.x} ${bottomY}`;
      segmentPath += ` L ${firstPoint.x} ${bottomY}`;
      segmentPath += ` Z`;
      paths.push(segmentPath);
    }

    return paths.join(' '); // Join all segment paths into one string
  };

  // Area path for Today that matches the smooth line and closes to bottom
  const generateAreaPathToday = () => {
    if (selectedPeriod !== 'Today') return '';
    const dataToUse = downsampleDataForToday(currentData);
    const dataWithCoords = dataToUse.map((item, index) => ({
      x: getXPositionForDataPoint(item, index),
      y: paddingTop + graphHeight - (item.value / 100) * graphHeight,
      value: item.value,
    }));

    if (dataWithCoords.length === 0) return '';
    if (dataWithCoords.length === 1) {
      const p = dataWithCoords[0];
      const bottomY = paddingTop + graphHeight;
      return `M ${p.x} ${p.y} L ${p.x} ${bottomY} Z`;
    }

    let path = `M ${dataWithCoords[0].x} ${dataWithCoords[0].y}`;
    const tension = 0.6; // Match Today's higher smoothing
    for (let i = 0; i < dataWithCoords.length - 1; i++) {
      const current = dataWithCoords[i];
      const next = dataWithCoords[i + 1];
      const prev = i > 0 ? dataWithCoords[i - 1] : null;
      const nextNext = i < dataWithCoords.length - 2 ? dataWithCoords[i + 2] : null;

      let cp1x = current.x;
      let cp1y = current.y;
      let cp2x = next.x;
      let cp2y = next.y;

      if (prev && nextNext) {
        const dx = (next.x - prev.x) * tension;
        const dy = (next.y - prev.y) * tension;
        cp1x = current.x + dx * 0.5;
        cp1y = current.y + dy * 0.5;
        const dx2 = (nextNext.x - current.x) * tension;
        const dy2 = (nextNext.y - current.y) * tension;
        cp2x = next.x - dx2 * 0.5;
        cp2y = next.y - dy2 * 0.5;
      }

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    const first = dataWithCoords[0];
    const last = dataWithCoords[dataWithCoords.length - 1];
    const bottomY = paddingTop + graphHeight;
    path += ` L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
    return path;
  };

  // Area path for Week that matches the smooth line and closes to bottom
  const generateAreaPathWeek = () => {
    if (selectedPeriod !== 'Week') return '';
    const dataSet = getWeekRenderData();
    const dataWithCoords = dataSet.map((item, index) => ({
      x: getXPositionForDataPoint(item, index),
      y: paddingTop + graphHeight - (item.value / 100) * graphHeight,
      value: item.value,
    }));

    if (dataWithCoords.length === 0) return '';
    if (dataWithCoords.length === 1) {
      const p = dataWithCoords[0];
      const bottomY = paddingTop + graphHeight;
      return `M ${p.x} ${p.y} L ${p.x} ${bottomY} Z`;
    }

    let path = `M ${dataWithCoords[0].x} ${dataWithCoords[0].y}`;
    const tension = 0.6;
    for (let i = 0; i < dataWithCoords.length - 1; i++) {
      const current = dataWithCoords[i];
      const next = dataWithCoords[i + 1];
      const prev = i > 0 ? dataWithCoords[i - 1] : null;
      const nextNext = i < dataWithCoords.length - 2 ? dataWithCoords[i + 2] : null;

      let cp1x = current.x;
      let cp1y = current.y;
      let cp2x = next.x;
      let cp2y = next.y;

      if (prev && nextNext) {
        const dx = (next.x - prev.x) * tension;
        const dy = (next.y - prev.y) * tension;
        cp1x = current.x + dx * 0.5;
        cp1y = current.y + dy * 0.5;
        const dx2 = (nextNext.x - current.x) * tension;
        const dy2 = (nextNext.y - current.y) * tension;
        cp2x = next.x - dx2 * 0.5;
        cp2y = next.y - dy2 * 0.5;
      }

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    const first = dataWithCoords[0];
    const last = dataWithCoords[dataWithCoords.length - 1];
    const bottomY = paddingTop + graphHeight;
    path += ` L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
    return path;
  };

  // Area path for Month that matches the smooth line and closes to bottom
  const generateAreaPathMonth = () => {
    if (selectedPeriod !== 'Month') return '';
    const dataSet = getMonthClippedData();
    const dataWithCoords = dataSet.map((item, index) => ({
      x: getXPositionForDataPoint(item, index),
      y: paddingTop + graphHeight - (item.value / 100) * graphHeight,
      value: item.value,
    }));

    if (dataWithCoords.length === 0) return '';
    if (dataWithCoords.length === 1) {
      const p = dataWithCoords[0];
      const bottomY = paddingTop + graphHeight;
      return `M ${p.x} ${p.y} L ${p.x} ${bottomY} Z`;
    }

    let path = `M ${dataWithCoords[0].x} ${dataWithCoords[0].y}`;
    const tension = 0.6;
    for (let i = 0; i < dataWithCoords.length - 1; i++) {
      const current = dataWithCoords[i];
      const next = dataWithCoords[i + 1];
      const prev = i > 0 ? dataWithCoords[i - 1] : null;
      const nextNext = i < dataWithCoords.length - 2 ? dataWithCoords[i + 2] : null;

      let cp1x = current.x;
      let cp1y = current.y;
      let cp2x = next.x;
      let cp2y = next.y;

      if (prev && nextNext) {
        const dx = (next.x - prev.x) * tension;
        const dy = (next.y - prev.y) * tension;
        cp1x = current.x + dx * 0.5;
        cp1y = current.y + dy * 0.5;
        const dx2 = (nextNext.x - current.x) * tension;
        const dy2 = (nextNext.y - current.y) * tension;
        cp2x = next.x - dx2 * 0.5;
        cp2y = next.y - dy2 * 0.5;
      }

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    const first = dataWithCoords[0];
    const last = dataWithCoords[dataWithCoords.length - 1];
    const bottomY = paddingTop + graphHeight;
    path += ` L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
    return path;
  };

  // Generate forecast uncertainty band for future predictions
  const generateForecastUncertaintyBand = () => {
    const forecastData = currentData.filter(item => item.isForecast && item.hasData);
    if (forecastData.length === 0) return '';
    
    let upperPath = '';
    let lowerPath = '';
    let isFirstPoint = true;
    
    forecastData.forEach((item, index) => {
      const x = getXPositionForDataPoint(item, index);
      const baseY = paddingTop + graphHeight - (item.value / 100) * graphHeight;
      const uncertainty = item.uncertainty || 5; // Default uncertainty
      
      const upperY = baseY - (uncertainty / 100) * graphHeight;
      const lowerY = baseY + (uncertainty / 100) * graphHeight;
      
      if (isFirstPoint) {
        upperPath += `M ${x} ${upperY}`;
        lowerPath += `M ${x} ${lowerY}`;
        isFirstPoint = false;
      } else {
        upperPath += ` L ${x} ${upperY}`;
        lowerPath += ` L ${x} ${lowerY}`;
      }
    });
    
    // Close the band by connecting upper and lower paths
    const lastX = getXPositionForDataPoint(forecastData[forecastData.length - 1], forecastData.length - 1);
    const lastBaseY = paddingTop + graphHeight - (forecastData[forecastData.length - 1].value / 100) * graphHeight;
    const lastUncertainty = forecastData[forecastData.length - 1].uncertainty || 5;
    const lastUpperY = lastBaseY - (lastUncertainty / 100) * graphHeight;
    const lastLowerY = lastBaseY + (lastUncertainty / 100) * graphHeight;
    
    return upperPath + ` L ${lastX} ${lastLowerY}` + lowerPath.split(' ').reverse().join(' ') + ` Z`;
  };

  // Generate gap areas (greyed out sections for missing data)
  const generateGapAreas = () => {
    const gapAreas = [];
    let gapStartIndex = -1; // Use gapStartIndex to track the start index of a continuous gap
    
    for (let i = 0; i < currentData.length; i++) {
      const item = currentData[i];
      const originalIndex = data.indexOf(item); // Get original index for correct X positioning
      
      if (!item.hasData) {
        if (gapStartIndex === -1) {
          gapStartIndex = originalIndex; // Store original index of gap start
        }
      } else {
        if (gapStartIndex !== -1) {
          // End of a continuous gap - create grey area
          const startX = gapStartIndex > 0 
            ? getXPositionForDataPoint(currentData[gapStartIndex - 1], gapStartIndex -1 )
            : paddingLeft; // If gap starts at index 0, start from paddingLeft
          
          const endX = getXPositionForDataPoint(item, i); // End at the current data point's x
          const topY = paddingTop;
          
          gapAreas.push({
            x: startX,
            y: topY,
            width: endX - startX,
            height: graphHeight
          });
          
          gapStartIndex = -1; // Reset for next gap
        }
      }
    }
    
    // Handle any remaining gap at the end of the data
    if (gapStartIndex !== -1) {
      const startX = gapStartIndex > 0 
        ? getXPositionForDataPoint(currentData[gapStartIndex - 1], gapStartIndex -1 )
        : paddingLeft; // If gap starts at index 0, start from paddingLeft
      
      const endX = getXPositionForDataPoint(currentData[currentData.length - 1], currentData.length - 1); // End at the last data point's x
      const topY = paddingTop;
      
      gapAreas.push({
        x: startX,
        y: topY,
        width: endX - startX,
        height: graphHeight
      });
    }
    
    return gapAreas;
  };

  // Generate dotted lines for gaps
  const generateGapLines = () => {
    // Disabled for a cleaner Today graph
    return [] as Array<{ x1: number; y1: number; x2: number; y2: number }>;
  };

  // Generate mask rectangles for the line to cut off overflow at gaps
  const generateMaskRects = () => {
    const maskRects = [];
    let dataSegmentStart = -1;
    const lineStrokeWidth = 2; // Must match the line's strokeWidth

    for (let i = 0; i < currentData.length; i++) {
      const item = currentData[i];

      if (item.hasData) {
        if (dataSegmentStart === -1) {
          dataSegmentStart = i;
        }
      } else {
        if (dataSegmentStart !== -1) {
          // End of a continuous data segment - create a mask rect
          const startX = getXPositionForDataPoint(currentData[dataSegmentStart], dataSegmentStart);
          const endX = getXPositionForDataPoint(currentData[i - 1], i - 1);
          
          // Adjust rect to cover the rounded caps. Extend by half stroke width on each side.
          const rectX = startX - lineStrokeWidth / 2;
          const rectWidth = (endX - startX) + lineStrokeWidth;

          maskRects.push({
            x: rectX,
            y: paddingTop,
            width: rectWidth,
            height: graphHeight
          });
          
          dataSegmentStart = -1; // Reset for next segment
        }
      }
    }

    // Handle any remaining data segment at the end of the data
    if (dataSegmentStart !== -1) {
      const startX = getXPositionForDataPoint(currentData[dataSegmentStart], dataSegmentStart);
      const endX = getXPositionForDataPoint(currentData[currentData.length - 1], currentData.length - 1);
      
      // Adjust rect to cover the rounded caps. Extend by half stroke width on each side.
      const rectX = startX - lineStrokeWidth / 2;
      const rectWidth = (endX - startX) + lineStrokeWidth;
      
      maskRects.push({
        x: rectX,
        y: paddingTop,
        width: rectWidth,
        height: graphHeight
      });
    }

    return maskRects;
  };

  // Grid lines - more prominent with additional lines
  const xAxisCount = data.length; // Use data.length for consistent grid spacing

  // Calculate positions for more prominent grid
  const getXPosition = (index: number) => {
    // This function needs to be updated to handle different periods as well.
    // For now, we'll keep it simple for the general case.
    if (data.length === 0) return paddingLeft; // Avoid division by zero
    return paddingLeft + (index / (data.length - 1)) * graphWidth;
  };

  const getYPosition = (value: number) => {
    return paddingTop + ((100 - value) / 100) * graphHeight;
  };

  // X-axis labels - fewer labels to prevent overlap
  const getXAxisLabels = () => {
    if (selectedPeriod === 'Today') {
      return [0, 6, 12, 18, 23].map(hour => ({
        position: (hour / 23) * graphWidth + paddingLeft,
        label: hour === 0 ? '12a' : hour === 12 ? '12p' : hour < 12 ? `${hour}a` : `${hour - 12}p`
      }));
    } else if (selectedPeriod === 'Week') {
      return [0, 1, 2, 3, 4, 5, 6].map(day => ({
        position: (day / 6) * graphWidth + paddingLeft,
        label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day]
      }));
    } else if (selectedPeriod === 'Month') {
      return [0, 1, 2, 3, 4].map(week => ({
        position: (week / 4) * graphWidth + paddingLeft,
        label: ['1', '8', '15', '22', '29'][week]
      }));
    } else {
      return [0, 3, 6, 9].map(month => ({
        position: (month / 11) * graphWidth + paddingLeft,
        label: ['J', 'A', 'J', 'O'][month]
      }));
    }
  };

  const xAxisLabels = getXAxisLabels();

  // Gesture: map finger x to nearest data point (Today/Week/Month)
  const minX = paddingLeft;
  const maxX = paddingLeft + graphWidth;

  const getInteractiveData = () => {
    if (isToday) return downsampleDataForToday(currentData);
    if (isWeek) return getWeekRenderData();
    if (isMonth) return getMonthRenderData();
    return currentData.filter(item => item.hasData);
  };

  const findNearestIndexAtX = (px: number): number | null => {
    if (!isScrubbable) return null;
    const list = getInteractiveData();
    if (list.length === 0) return null;

    const clamped = Math.max(minX, Math.min(maxX, px));
    const proportion = (clamped - paddingLeft) / Math.max(graphWidth, 1);
    if (isToday) {
      const minutesAtX = proportion * 1439;
      let nearestIndex = 0;
      let bestDelta = Number.POSITIVE_INFINITY;
      for (let i = 0; i < list.length; i++) {
        const pt = list[i];
        if (pt.hour === undefined || pt.minute === undefined) continue;
        const m = pt.hour * 60 + pt.minute;
        const delta = Math.abs(m - minutesAtX);
        if (delta < bestDelta) {
          bestDelta = delta;
          nearestIndex = i;
        }
      }
      return nearestIndex;
    } else {
      if (isWeek) {
        // Snap to nearest weekday slot across 7 buckets, match by label in filtered list
        const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        const targetSlot = Math.round(proportion * 6);
        let nearestIdx = 0;
        let bestDelta = Number.POSITIVE_INFINITY;
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          const slot = item.label ? days.indexOf(item.label) : -1;
          const delta = Math.abs((slot >= 0 ? slot : i) - targetSlot);
          if (delta < bestDelta) {
            bestDelta = delta;
            nearestIdx = i;
          }
        }
        return nearestIdx;
      } else if (isMonth) {
        // Snap to nearest week slot across 5 buckets (W1..W5)
        const weeks = ['W1','W2','W3','W4','W5'];
        const targetSlot = Math.round(proportion * 4);
        let nearestIdx = 0;
        let bestDelta = Number.POSITIVE_INFINITY;
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          const slot = item.label ? weeks.indexOf(item.label) : -1;
          const delta = Math.abs((slot >= 0 ? slot : i) - targetSlot);
          if (delta < bestDelta) {
            bestDelta = delta;
            nearestIdx = i;
          }
        }
        return nearestIdx;
      }
      const idx = Math.round(proportion * (list.length - 1));
      return Math.max(0, Math.min(list.length - 1, idx));
    }
  };

  const updateScrubFromX = (px: number) => {
    if (!isScrubbable) return;
    const x = Math.max(minX, Math.min(maxX, px));
    const idx = findNearestIndexAtX(x);
    setScrubX(x);
    setScrubIndex(idx);
  };

  const clearScrub = () => {
    setScrubX(null);
    setScrubIndex(null);
  };

  const panGesture = Gesture.Pan()
    .onBegin(e => {
      runOnJS(updateScrubFromX)(e.x);
    })
    .onUpdate(e => {
      runOnJS(updateScrubFromX)(e.x);
    })
    .onEnd(() => {
      runOnJS(clearScrub)();
    })
    .onFinalize(() => {
      runOnJS(clearScrub)();
    });

  // Helper to get X position for a data point based on its original index
  // This helper is now redundant as we have getXPositionForDataPoint with the same logic
  // Renamed to avoid conflict and kept for reference until fully removed.
  // const getXPositionForDataPointRef = (dataIndex: number) => {
  //   // For Today, scale based on 1440 minutes for full 24-hour representation
  //   const totalXAxisPoints = selectedPeriod === 'Today' ? 1440 : Math.max(data.length - 1, 1);
  //   const xPos = paddingLeft + (dataIndex / totalXAxisPoints) * graphWidth;
  //   return xPos;
  // };

  // Define gradient stops for the Y-axis based line and area gradients
  const gradientYAxisStops = Array.from({ length: 21 }, (_, i) => i * 5); // 0, 5, 10, ..., 100 for smoother gradient
  const displayYAxisLabels = [0, 20, 40, 60, 80, 100]; // Only these percentages are displayed

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <GestureDetector gesture={panGesture}>
          <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            {/* Gradient for the line - Refined with subtle variation and dynamic colors (Y-axis based) */}
            <LinearGradient id="lineGradient" x1="0%" y1={paddingTop} x2="0%" y2={paddingTop + graphHeight} gradientUnits="userSpaceOnUse">
              {gradientYAxisStops.length > 0 
                ? gradientYAxisStops.map((value, index) => {
                    // Calculate offset as a percentage of the graph height, inverted since 0% is top
                    const offset = (100 - value); // 0% burnout at bottom, 100% at top
                    const color = getBurnoutColor(value); // Get color based on the y-axis value

                    return <Stop key={`line-stop-${index}`} offset={`${offset}%`} stopColor={color} stopOpacity="1" />;
                  })
                : []}
            </LinearGradient>
            
            {/* Gradient for area under curve - Apple Weather style refined and dynamic (Y-axis based) */}
            <LinearGradient id="areaGradient" x1="0%" y1={paddingTop} x2="0%" y2={paddingTop + graphHeight} gradientUnits="userSpaceOnUse">
              {gradientYAxisStops.length > 0
                ? gradientYAxisStops.map((value, index) => {
                    const offset = (100 - value); // 0% burnout at bottom, 100% at top
                    const color = getBurnoutColor(value); // Get color based on the y-axis value
                    const lightenedColor = lightenHexColor(color, 0.3); // Lighten the color by 30%

                    let stopOpacity = 0;
                    if (value >= 95) stopOpacity = 0.95; // Almost fully opaque for highest burnout
                    else if (value >= 85) stopOpacity = 0.9;
                    else if (value >= 75) stopOpacity = 0.8;
                    else if (value >= 65) stopOpacity = 0.7;
                    else if (value >= 55) stopOpacity = 0.6;
                    else if (value >= 45) stopOpacity = 0.5;
                    else if (value >= 35) stopOpacity = 0.4;
                    else if (value >= 25) stopOpacity = 0.3;
                    else stopOpacity = 0.2; // Very visible even for low burnout
                    
                    return <Stop key={`area-stop-${index}`} offset={`${offset}%`} stopColor={lightenedColor} stopOpacity={`${stopOpacity}`} />;
                  })
                : []}
            </LinearGradient>
            
            {/* Gap gradient removed - no grey shaded areas */}

            {/* Mask for the continuous line to cut off rounded caps at gaps */}
            <Mask id="lineCutoutMask" x="0" y="0" width={chartWidth} height={chartHeight} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
              {generateMaskRects().map((rect, index) => (
                <Rect
                  key={`mask-rect-${index}`}
                  x={rect.x}
                  y={0} // Ensure mask rect covers the entire vertical extent
                  width={rect.width}
                  height={chartHeight} // Ensure mask rect covers the entire vertical extent
                  fill="white" // White makes the area visible in the mask
                />
              ))}
            </Mask>
          </Defs>

          {/* Horizontal grid lines - more prominent */}
          {displayYAxisLabels.map((value, index) => {
            const y = paddingTop + ((100 - value) / 100) * graphHeight;
            return (
              <Line
                key={`h-grid-${index}`}
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + graphWidth}
                y2={y}
                stroke="#E5E5E7"
                strokeWidth="1.5"
                strokeDasharray="0"
              />
            );
          })}

          {/* Removed vertical grid lines */}

          {/* Gap areas removed - no grey shaded areas */}

          {/* No dotted lines for gaps */}

          {/* Forecast uncertainty bands for future data */}
          {currentData.some(item => item.isForecast) && (
            <Path
              d={generateForecastUncertaintyBand()}
              fill="rgba(0, 122, 255, 0.1)"
              stroke="none"
            />
          )}

          {/* Area fill below the line - Apple Weather style (Today/Week/Month) */}
          {(selectedPeriod === 'Today' || selectedPeriod === 'Week' || selectedPeriod === 'Month') && (
            <Path
              d={selectedPeriod === 'Today' ? generateAreaPathToday() : (selectedPeriod === 'Week' ? generateAreaPathWeek() : generateAreaPathMonth())}
              fill="url(#areaGradient)"
              stroke="none"
            />
          )}

          {/* Simple line like weather app */
          }
          <Path
            d={generateLinePath()}
            stroke="url(#lineGradient)"
            strokeWidth={(selectedPeriod === 'Today' || selectedPeriod === 'Week' || selectedPeriod === 'Month') ? 6 : 3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Scrubber visuals (Today/Week) */}
          {isScrubbable && scrubIndex != null && (() => {
            const list = getInteractiveData();
            const item = list[scrubIndex!];
            if (!item) return null;
            const cx = getXPositionForDataPoint(item, scrubIndex!);
            const cy = paddingTop + graphHeight - (item.value / 100) * graphHeight;
            return (
              <>
                <Line
                  x1={cx}
                  y1={paddingTop}
                  x2={cx}
                  y2={chartHeight - paddingBottom}
                  stroke="#000000"
                  opacity={0.12}
                  strokeWidth="1.5"
                />
                <Circle cx={cx} cy={cy} r="4" fill={getBurnoutColor(item.value)} stroke="#FFFFFF" strokeWidth="1.5" />
              </>
            );
          })()}

          {/* "Now" indicator for Today view */}
          {selectedPeriod === 'Today' && (() => {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const nowX = paddingLeft + (currentMinutes / 1439) * graphWidth;
            return (
              <Line
                x1={nowX}
                y1={paddingTop}
                x2={nowX}
                y2={chartHeight - paddingBottom}
                stroke={getBurnoutColor(50)}
                strokeWidth="2"
                opacity={0.35}
              />
            );
          })()}
          
          {/* Fallback: Show individual points if line isn't visible (not for Today/Week/Month) */}
          {selectedPeriod !== 'Today' && selectedPeriod !== 'Week' && selectedPeriod !== 'Month' && currentData.filter(item => item.hasData).map((item, index) => {
            const x = getXPositionForDataPoint(item, index);
            const y = paddingTop + graphHeight - (item.value / 100) * graphHeight;
            return (
              <Circle
                key={`point-${index}`}
                cx={x}
                cy={y}
                r="3"
                fill={getBurnoutColor(item.value)}
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            );
          })}

          {/* Individual data points for isolated points (single data points) */}
          {selectedPeriod !== 'Today' && selectedPeriod !== 'Week' && selectedPeriod !== 'Month' && currentData.map((item, index) => {
            if (!item.hasData) return null;
            
            const originalIndex = data.indexOf(item);
            const x = getXPositionForDataPoint(item, index);
            const y = paddingTop + graphHeight - (item.value / 100) * graphHeight;
            const color = getBurnoutColor(item.value);
            
            // Check if this is an isolated point (no adjacent data points)
            const prevItem = index > 0 ? currentData[index - 1] : null;
            const nextItem = index < currentData.length - 1 ? currentData[index + 1] : null;
            const isIsolated = (!prevItem || !prevItem.hasData) && (!nextItem || !nextItem.hasData);
            
            if (isIsolated) {
              return (
                <Circle
                  key={`isolated-point-${index}`}
                  cx={x}
                  cy={y}
                  r={item.isForecast ? "3" : "4"}
                  fill={color}
                  stroke={item.isForecast ? "#007AFF" : "#FFFFFF"}
                  strokeWidth={item.isForecast ? "2" : "1.5"}
                  opacity={item.isForecast ? 0.8 : 1}
                />
              );
            }
            return null;
          })}

          {/* Removed current hour percentage display */}

          {/* Y-axis labels - moved to RIGHT side */}
          {displayYAxisLabels.map((value, index) => {
            const y = paddingTop + ((100 - value) / 100) * graphHeight;
            return (
              <SvgText
                key={`y-label-${index}`}
                x={paddingLeft + graphWidth + 8}
                y={y + 4}
                fontSize="12"
                fill="#8E8E93"
                textAnchor="start"
                fontWeight="500"
              >
                {value}%
              </SvgText>
            );
          })}

          {/* No gap indicators - clean gaps with no visual clutter */}
          </Svg>
        </GestureDetector>

        {/* X-axis labels positioned below to prevent overlap */}
        <View style={[styles.xAxisLabels, { 
          left: paddingLeft, 
          right: paddingRight, 
          bottom: 15 
        }]}>
          {xAxisLabels.map((label, index) => (
            <View
              key={`x-label-${index}`}
              style={[styles.xAxisLabel, { 
                position: 'absolute',
                left: label.position - paddingLeft - 12,
              }]}
            >
              <Text style={styles.xAxisLabelText}>{label.label}</Text>
            </View>
          ))}
        </View>
        {/* Tooltip overlay for scrubber (Today/Week) */}
        {isScrubbable && scrubIndex != null && (() => {
          const list = getInteractiveData();
          const item = list[scrubIndex!];
          if (!item) return null;
          const cx = getXPositionForDataPoint(item, scrubIndex!);
          const cy = paddingTop + graphHeight - (item.value / 100) * graphHeight;
          const tooltipWidth = 88;
          const clampedLeft = Math.max(paddingLeft, Math.min(paddingLeft + graphWidth - tooltipWidth, cx - tooltipWidth / 2));
          const timeLabel = isToday
            ? ((item.hour !== undefined && item.minute !== undefined)
                ? new Date(0, 0, 0, item.hour, item.minute).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                : (item.label || ''))
            : (item.label || '');
          return (
            <View style={{ position: 'absolute', left: clampedLeft, top: Math.max(8, cy - 42), width: tooltipWidth }}>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>{timeLabel} • {item.value}%</Text>
              </View>
            </View>
          );
        })()}
      </View>

      {/* Current status - clean and simple */}
      {currentData.length > 0 && (
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Current</Text>
              <Text style={[styles.statusValue, { color: getBurnoutColor(
                selectedPeriod === 'Today' && typeof currentOverride === 'number'
                  ? currentOverride
                  : (currentData.filter(item => item.hasData).pop()?.value || 0)
              ) }]}>
                {selectedPeriod === 'Today' && typeof currentOverride === 'number'
                  ? currentOverride
                  : (currentData.filter(item => item.hasData).pop()?.value || 0)}%
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Average</Text>
              <Text style={styles.statusValue}>
                {Math.round(averageValue)}%
              </Text>
            </View>
            
            {selectedPeriod === 'Today' && (
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Time</Text>
                <Text style={styles.statusValue}>
                  {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  chartContainer: {
    position: 'relative',
    paddingTop: 16,
  },
  xAxisLabels: {
    position: 'absolute',
    height: 20,
  },
  xAxisLabel: {
    alignItems: 'center',
    width: 24,
  },
  xAxisLabelText: {
    fontSize: isIOS ? 12 : 11, // iOS-optimized font size
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
    fontFamily: isIOS ? '-apple-system' : undefined, // iOS system font
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusValue: {
    fontSize: isIOS ? 17 : 16, // iOS-optimized font size
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
    fontFamily: isIOS ? '-apple-system' : undefined, // iOS system font
  },
  statusLabel: {
    fontSize: isIOS ? 12 : 11, // iOS-optimized font size
    fontWeight: '500',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: isIOS ? 0.6 : 0.5, // iOS-optimized letter spacing
    fontFamily: isIOS ? '-apple-system' : undefined, // iOS system font
  },
});

export default BurnoutGraphChart;