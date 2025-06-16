// Utility functions for modifying Lottie animation colors
export interface ColorMapping {
  [key: string]: string;
}

// Modern Apple-level color schemes for the three burnout states
export const BURNOUT_COLOR_SCHEMES = {
  thriving: {
    // Modern green - Apple's system green with variations
    primary: '#30D158',      // iOS System Green
    secondary: '#32D74B',    // Lighter green
    accent: '#28CD41',       // Darker green
    gradient1: '#34C759',    // Green gradient start
    gradient2: '#30D158',    // Green gradient end
    glow: 'rgba(48, 209, 88, 0.4)',
    background: 'rgba(48, 209, 88, 0.1)',
  },
  moderate: {
    // Modern amber/orange - Apple's system orange with variations
    primary: '#FF9F0A',      // iOS System Orange
    secondary: '#FFB340',    // Lighter orange
    accent: '#FF8C00',       // Darker orange
    gradient1: '#FFCC02',    // Yellow-orange gradient start
    gradient2: '#FF9F0A',    // Orange gradient end
    glow: 'rgba(255, 159, 10, 0.4)',
    background: 'rgba(255, 159, 10, 0.1)',
  },
  burnout: {
    // Modern red - Apple's system red with variations
    primary: '#FF453A',      // iOS System Red
    secondary: '#FF6961',    // Lighter red
    accent: '#FF3B30',       // Darker red
    gradient1: '#FF6B6B',    // Red gradient start
    gradient2: '#FF453A',    // Red gradient end
    glow: 'rgba(255, 69, 58, 0.4)',
    background: 'rgba(255, 69, 58, 0.1)',
  },
};

// Function to create a color-modified version of the Lottie animation
export function createColoredLottieAnimation(
  baseAnimation: any,
  colorScheme: keyof typeof BURNOUT_COLOR_SCHEMES
): any {
  const colors = BURNOUT_COLOR_SCHEMES[colorScheme];
  
  // Deep clone the animation object
  const modifiedAnimation = JSON.parse(JSON.stringify(baseAnimation));
  
  // Function to recursively modify colors in the animation
  function modifyColors(obj: any): void {
    if (typeof obj !== 'object' || obj === null) return;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (Array.isArray(value)) {
          // Handle color arrays (RGBA values)
          if (key === 'k' && value.length === 4 && 
              typeof value[0] === 'number' && 
              typeof value[1] === 'number' && 
              typeof value[2] === 'number' && 
              typeof value[3] === 'number') {
            
            // Convert original color to determine which replacement to use
            const [r, g, b, a] = value;
            
            // Determine color based on original values
            let newColor: string;
            if (r > 0.8 && g > 0.8 && b > 0.8) {
              // White/light colors -> use secondary color
              newColor = colors.secondary;
            } else if (r > 0.5 && g < 0.5 && b < 0.5) {
              // Reddish colors -> use primary color
              newColor = colors.primary;
            } else if (r > 0.5 && g > 0.5 && b < 0.5) {
              // Yellowish colors -> use accent color
              newColor = colors.accent;
            } else if (g > 0.5 && r < 0.5 && b < 0.5) {
              // Greenish colors -> use gradient1 color
              newColor = colors.gradient1;
            } else {
              // Default to primary color
              newColor = colors.primary;
            }
            
            // Convert hex to RGBA
            const rgba = hexToRgba(newColor);
            obj[key] = [rgba.r / 255, rgba.g / 255, rgba.b / 255, a];
          } else {
            // Recursively process array elements
            value.forEach(modifyColors);
          }
        } else if (typeof value === 'object') {
          modifyColors(value);
        }
      }
    }
  }
  
  modifyColors(modifiedAnimation);
  return modifiedAnimation;
}

// Helper function to convert hex color to RGBA
function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 1
  } : { r: 0, g: 0, b: 0, a: 1 };
}

// Function to get color scheme for a given burnout percentage
export function getColorSchemeForPercentage(percentage: number): keyof typeof BURNOUT_COLOR_SCHEMES {
  if (percentage <= 33) return 'thriving';
  if (percentage <= 66) return 'moderate';
  return 'burnout';
} 