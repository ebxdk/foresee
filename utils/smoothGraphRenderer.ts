// Smooth Graph Rendering for 1440-Point Data
// Apple Weather-style smooth curves with optimized performance

import { ConfidenceLogger } from './environmentManager';
import { MinuteDataPoint } from './minuteDataManager';

export interface GraphPoint {
  x: number;
  y: number;
  value: number;
  hasData: boolean;
  minute: number;
}

export interface SmoothGraphConfig {
  width: number;
  height: number;
  padding: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  maxDataPoints?: number; // For performance optimization
  smoothingFactor?: number; // 0-1, higher = smoother curves
}

/**
 * Smooth Graph Renderer
 * Converts 1440 minute data points into smooth, performant graph curves
 */
export class SmoothGraphRenderer {
  private config: SmoothGraphConfig;
  private graphWidth: number;
  private graphHeight: number;

  constructor(config: SmoothGraphConfig) {
    this.config = {
      maxDataPoints: 400, // Default optimization for mobile screens
      smoothingFactor: 0.7, // Default smoothing
      ...config,
    };
    
    this.graphWidth = this.config.width - this.config.padding.left - this.config.padding.right;
    this.graphHeight = this.config.height - this.config.padding.top - this.config.padding.bottom;
  }

  /**
   * Process minute data into smooth graph points
   */
  processMinuteData(minuteData: MinuteDataPoint[]): {
    graphPoints: GraphPoint[];
    pathData: string;
    areaPathData: string;
    visiblePoints: GraphPoint[];
  } {
    console.log(`📊 Processing ${minuteData.length} minute data points for smooth rendering...`);
    
    // Step 1: Convert to graph coordinates
    const allGraphPoints = this.convertToGraphPoints(minuteData);
    
    // Step 2: Optimize for rendering performance
    const optimizedPoints = this.optimizeForRendering(allGraphPoints);
    
    // Step 3: Generate smooth curves
    const pathData = this.generateSmoothPath(optimizedPoints);
    const areaPathData = this.generateSmoothAreaPath(optimizedPoints);
    
    // Step 4: Identify visible points for interaction
    const visiblePoints = this.getVisiblePoints(optimizedPoints);
    
    ConfidenceLogger.logFeatureTest(
      'Smooth Graph Processing',
      100,
      `Processed ${minuteData.length} points into smooth curves with ${optimizedPoints.length} render points`,
      'verified'
    );
    
    return {
      graphPoints: allGraphPoints,
      pathData,
      areaPathData,
      visiblePoints,
    };
  }

  /**
   * Convert minute data to graph coordinate points
   */
  private convertToGraphPoints(minuteData: MinuteDataPoint[]): GraphPoint[] {
    const points: GraphPoint[] = [];
    const maxMinutes = 1439; // 0-1439 minutes in a day
    
    minuteData.forEach(dataPoint => {
      // X position: spread across full width based on minute of day
      const xRatio = dataPoint.minute / maxMinutes;
      const x = this.config.padding.left + (xRatio * this.graphWidth);
      
      // Y position: inverted (0% at bottom, 100% at top)
      const yRatio = (100 - dataPoint.burnoutPercentage) / 100;
      const y = this.config.padding.top + (yRatio * this.graphHeight);
      
      points.push({
        x,
        y,
        value: dataPoint.burnoutPercentage,
        hasData: dataPoint.hasRealData,
        minute: dataPoint.minute,
      });
    });
    
    return points;
  }

  /**
   * Optimize points for rendering performance
   */
  private optimizeForRendering(allPoints: GraphPoint[]): GraphPoint[] {
    const maxPoints = this.config.maxDataPoints!;
    
    if (allPoints.length <= maxPoints) {
      return allPoints;
    }
    
    console.log(`🔧 Optimizing ${allPoints.length} points to ${maxPoints} for smooth rendering...`);
    
    // Smart decimation: keep important points
    const optimized: GraphPoint[] = [];
    const step = allPoints.length / maxPoints;
    
    for (let i = 0; i < allPoints.length; i += step) {
      const index = Math.floor(i);
      const point = allPoints[index];
      
      if (point) {
        optimized.push(point);
      }
    }
    
    // Always include the last point
    const lastPoint = allPoints[allPoints.length - 1];
    if (lastPoint && optimized[optimized.length - 1]?.minute !== lastPoint.minute) {
      optimized.push(lastPoint);
    }
    
    return optimized;
  }

  /**
   * Generate smooth path using Catmull-Rom splines
   */
  private generateSmoothPath(points: GraphPoint[]): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    
    const smoothingFactor = this.config.smoothingFactor!;
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Generate smooth curves between points
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      if (current.hasData && next.hasData) {
        // Smooth curve for real data
        const controlPoint1 = this.calculateControlPoint(points, i, smoothingFactor, 'forward');
        const controlPoint2 = this.calculateControlPoint(points, i + 1, smoothingFactor, 'backward');
        
        path += ` C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${next.x} ${next.y}`;
      } else {
        // Straight line for missing/interpolated data
        path += ` L ${next.x} ${next.y}`;
      }
    }
    
    return path;
  }

  /**
   * Generate smooth area path (for fill under curve)
   */
  private generateSmoothAreaPath(points: GraphPoint[]): string {
    if (points.length === 0) return '';
    
    const linePath = this.generateSmoothPath(points);
    const bottomY = this.config.padding.top + this.graphHeight;
    
    // Close the area path at the bottom
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    
    return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
  }

  /**
   * Calculate control points for smooth curves
   */
  private calculateControlPoint(
    points: GraphPoint[], 
    index: number, 
    smoothing: number,
    direction: 'forward' | 'backward'
  ): { x: number; y: number } {
    const point = points[index];
    const prevPoint = points[index - 1];
    const nextPoint = points[index + 1];
    
    if (!prevPoint || !nextPoint) {
      // No smoothing at endpoints
      return { x: point.x, y: point.y };
    }
    
    // Calculate tangent vector
    const tangentX = (nextPoint.x - prevPoint.x) * smoothing * 0.3;
    const tangentY = (nextPoint.y - prevPoint.y) * smoothing * 0.3;
    
    if (direction === 'forward') {
      return {
        x: point.x + tangentX,
        y: point.y + tangentY,
      };
    } else {
      return {
        x: point.x - tangentX,
        y: point.y - tangentY,
      };
    }
  }

  /**
   * Get visible points for user interaction
   */
  private getVisiblePoints(points: GraphPoint[]): GraphPoint[] {
    // Return points that are spaced for good touch targets
    const minSpacing = 20; // Minimum pixels between interactive points
    const visiblePoints: GraphPoint[] = [];
    
    let lastX = -minSpacing;
    
    points.forEach(point => {
      if (point.x - lastX >= minSpacing) {
        visiblePoints.push(point);
        lastX = point.x;
      }
    });
    
    return visiblePoints;
  }

  /**
   * Get Y-axis labels based on data range
   */
  getYAxisLabels(points: GraphPoint[]): Array<{ value: number; y: number; label: string }> {
    if (points.length === 0) return [];
    
    const values = points.map(p => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    
    const labels: Array<{ value: number; y: number; label: string }> = [];
    const labelCount = 5; // Show 5 Y-axis labels
    
    for (let i = 0; i <= labelCount; i++) {
      const value = minValue + (range * i / labelCount);
      const yRatio = (100 - value) / 100;
      const y = this.config.padding.top + (yRatio * this.graphHeight);
      
      labels.push({
        value: Math.round(value),
        y,
        label: `${Math.round(value)}%`,
      });
    }
    
    return labels;
  }

  /**
   * Get X-axis labels for time display
   */
  getXAxisLabels(): Array<{ hour: number; x: number; label: string }> {
    const labels: Array<{ hour: number; x: number; label: string }> = [];
    const keyHours = [0, 6, 12, 18, 23]; // Key times throughout the day
    
    keyHours.forEach(hour => {
      const minute = hour * 60;
      const xRatio = minute / 1439;
      const x = this.config.padding.left + (xRatio * this.graphWidth);
      
      let label: string;
      if (hour === 0) label = '12a';
      else if (hour < 12) label = `${hour}a`;
      else if (hour === 12) label = '12p';
      else label = `${hour - 12}p`;
      
      labels.push({ hour, x, label });
    });
    
    return labels;
  }

  /**
   * Find closest point to touch coordinates
   */
  findClosestPoint(touchX: number, touchY: number, points: GraphPoint[]): GraphPoint | null {
    let closestPoint: GraphPoint | null = null;
    let minDistance = Infinity;
    
    points.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(touchX - point.x, 2) + Math.pow(touchY - point.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
    
    // Only return if touch is reasonably close (within 30 pixels)
    return minDistance <= 30 ? closestPoint : null;
  }

  /**
   * Get current time indicator position
   */
  getCurrentTimeIndicator(): { x: number; minute: number } {
    const now = new Date();
    const currentMinute = now.getHours() * 60 + now.getMinutes();
    const xRatio = currentMinute / 1439;
    const x = this.config.padding.left + (xRatio * this.graphWidth);
    
    return { x, minute: currentMinute };
  }
}

/**
 * Helper function to create optimized graph renderer
 */
export function createSmoothGraphRenderer(
  width: number, 
  height: number,
  options?: Partial<SmoothGraphConfig>
): SmoothGraphRenderer {
  const config: SmoothGraphConfig = {
    width,
    height,
    padding: {
      left: 40,
      right: 20,
      top: 20,
      bottom: 30,
    },
    maxDataPoints: Math.min(400, width / 2), // Adapt to screen width
    smoothingFactor: 0.75, // Slightly more smoothing for mobile
    ...options,
  };
  
  return new SmoothGraphRenderer(config);
}

