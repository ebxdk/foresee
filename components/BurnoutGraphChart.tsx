import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
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
}

interface BurnoutGraphChartProps {
  data: BurnoutDataPoint[];
  selectedPeriod: 'Today' | 'Week' | 'Month' | 'Year';
  onDataPointPress?: (index: number) => void;
  selectedIndex?: number;
}

const BurnoutGraphChart: React.FC<BurnoutGraphChartProps> = ({
  data,
  selectedPeriod,
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

  // Helper to get X position for a data point based on its original index and selected period
  const getXPositionForDataPoint = (dataPoint: BurnoutDataPoint, index: number) => {
    let xPos = paddingLeft;
    if (selectedPeriod === 'Today') {
      // For Today, scale based on 1440 minutes for full 24-hour representation
      if (dataPoint.hour !== undefined && dataPoint.minute !== undefined) {
        xPos += (((dataPoint.hour * 60) + dataPoint.minute) / 1439) * graphWidth;
      } else {
        // Fallback if hour/minute are unexpectedly missing for 'Today'
        console.warn('BurnoutGraphChart: Missing hour/minute for Today data point.', dataPoint);
        xPos += (index / Math.max(data.length - 1, 1)) * graphWidth; // Fallback to index-based scaling
      }
    } else {
      // For Week, Month, Year, scale based on the index in the data array
      xPos += (index / Math.max(data.length - 1, 1)) * graphWidth;
    }
    return xPos;
  };

  // Color coding for burnout levels - green to orange gradient
  const getBurnoutColor = (value: number) => {
    return getAppleWeatherGradientColor(value);
  };

  // Use the data prop directly, as filtering for 'Today' is handled upstream
  const currentData = data;

  // If no data, render nothing or a placeholder to avoid SVG errors
  if (currentData.length === 0) {
    return null; // Or return a <Text>No Data</Text> component
  }
  
  // Calculate average color for gradient
  const dataWithActualValues = currentData.filter(item => item.hasData);
  const averageValue = dataWithActualValues.length > 0 
    ? dataWithActualValues.reduce((sum, item) => sum + item.value, 0) / dataWithActualValues.length 
    : 0;

  // Simple line path generation like weather app
  const generateLinePath = () => {
    let path = '';
    let isFirstPoint = true;
    
    for (let i = 0; i < currentData.length; i++) {
      const item = currentData[i];
      
      if (item.hasData) {
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
    const gapLines = [];

    for (let i = 0; i < currentData.length; i++) {
      const currentItem = currentData[i];
      const prevItem = i > 0 ? currentData[i - 1] : null;
      const nextItem = i < currentData.length - 1 ? currentData[i + 1] : null;

      // Calculate x-position for the current index
      const currentX = getXPositionForDataPoint(currentItem, i);
      // Calculate x-position for the previous index
      const prevX = i > 0 ? getXPositionForDataPoint(prevItem!, i - 1) : currentX;
      // Calculate x-position for the next index
      const nextX = i < currentData.length - 1 ? getXPositionForDataPoint(nextItem!, i + 1) : currentX;

      // Case 1: Start of a gap (previous point had data, current point does not)
      if (prevItem && prevItem.hasData && !currentItem.hasData) {
        gapLines.push({
          x1: prevX,
          y1: paddingTop,
          x2: prevX,
          y2: paddingTop + graphHeight
        });
      }

      // Case 2: End of a gap (current point has data, previous point did not)
      if (currentItem.hasData && prevItem && !prevItem.hasData) {
        gapLines.push({
          x1: currentX,
          y1: paddingTop,
          x2: currentX,
          y2: paddingTop + graphHeight
        });
      }

      // Special case: If the very first point is a gap, and the next is data, draw line at nextItem.
      // This handles a leading gap followed by data.
      if (i === 0 && !currentItem.hasData && nextItem && nextItem.hasData) {
         gapLines.push({
            x1: nextX,
            y1: paddingTop,
            x2: nextX,
            y2: paddingTop + graphHeight
         });
      }

      // Special case: If the very last point is a gap, and the previous was data, draw line at prevItem.
      // This handles a trailing gap preceded by data.
      if (i === currentData.length - 1 && !currentItem.hasData && prevItem && prevItem.hasData) {
          gapLines.push({
            x1: prevX,
            y1: paddingTop,
            x2: prevX,
            y2: paddingTop + graphHeight
          });
      }
    }
    return gapLines;
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
            
            {/* Gradient for gap areas */}
            <LinearGradient id="gapGradient" x1="0%=" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#B0B0B0" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#B0B0B0" stopOpacity="0.2" />
            </LinearGradient>

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

          {/* Gap areas (greyed out sections for missing data) */}
          {generateGapAreas().map((gap, index) => (
            <Rect
              key={`gap-${index}`}
              x={gap.x}
              y={gap.y}
              width={gap.width}
              height={gap.height}
              fill="url(#gapGradient)"
            />
          ))}

          {/* Dotted lines for gaps */}
          {generateGapLines().map((line, index) => (
            <Line
              key={`gap-line-${index}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#C7C7CC"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          ))}

          {/* Area fill below the line - Apple Weather style */}
          {/* <Path
            d={generateAreaPath()}
            fill="url(#areaGradient)"
            stroke="none"
          /> */}

          {/* Simple line like weather app */}
          <Path
            d={generateLinePath()}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Individual data points for isolated points (single data points) */}
          {selectedPeriod !== 'Today' && currentData.map((item, index) => {
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
                  r="4"
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
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
      </View>

      {/* Current status - clean and simple */}
      {currentData.length > 0 && (
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Current</Text>
              <Text style={[styles.statusValue, { color: getBurnoutColor(currentData.filter(item => item.hasData).pop()?.value || 0) }]}>
                {currentData.filter(item => item.hasData).pop()?.value || 0}%
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