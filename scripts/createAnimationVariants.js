const fs = require('fs');

// Load the base animation
const baseAnimation = JSON.parse(fs.readFileSync('./assets/Animation - 1750062394107.json', 'utf8'));

// Modern Apple-level color schemes
const colorSchemes = {
  thriving: {
    primary: [0.188, 0.820, 0.345, 1],      // #30D158 - iOS System Green
    secondary: [0.196, 0.843, 0.294, 1],    // #32D74B
    accent: [0.157, 0.804, 0.255, 1],       // #28CD41
    gradient1: [0.204, 0.780, 0.349, 1],    // #34C759
    gradient2: [0.188, 0.820, 0.345, 1],    // #30D158
  },
  moderate: {
    primary: [1.000, 0.624, 0.039, 1],      // #FF9F0A - iOS System Orange
    secondary: [1.000, 0.702, 0.251, 1],    // #FFB340
    accent: [1.000, 0.549, 0.000, 1],       // #FF8C00
    gradient1: [1.000, 0.800, 0.008, 1],    // #FFCC02
    gradient2: [1.000, 0.624, 0.039, 1],    // #FF9F0A
  },
  burnout: {
    primary: [1.000, 0.271, 0.227, 1],      // #FF453A - iOS System Red
    secondary: [1.000, 0.412, 0.380, 1],    // #FF6961
    accent: [1.000, 0.231, 0.188, 1],       // #FF3B30
    gradient1: [1.000, 0.420, 0.420, 1],    // #FF6B6B
    gradient2: [1.000, 0.271, 0.227, 1],    // #FF453A
  }
};

function removeSparkles(animation) {
  // Find and remove sparkle elements (comp_3 contains the small animated ellipses)
  const comp3 = animation.assets.find(asset => asset.id === 'comp_3');
  if (comp3) {
    // Remove the sparkle layer (Shape Layer 1 which contains the small animated ellipse)
    comp3.layers = comp3.layers.filter(layer => layer.nm !== 'Shape Layer 1');
  }
  
  // Also remove references to comp_3 from comp_2 to eliminate sparkles completely
  const comp2 = animation.assets.find(asset => asset.id === 'comp_2');
  if (comp2) {
    // Remove layers that reference comp_3 (the sparkle compositions)
    comp2.layers = comp2.layers.filter(layer => layer.refId !== 'comp_3');
  }
  
  return animation;
}

function replaceColors(obj, colors) {
  if (typeof obj !== 'object' || obj === null) return;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (Array.isArray(value)) {
        // Handle color arrays (RGBA values in Lottie format)
        if (key === 'k' && value.length === 4 && 
            typeof value[0] === 'number' && 
            typeof value[1] === 'number' && 
            typeof value[2] === 'number' && 
            typeof value[3] === 'number') {
          
          const [r, g, b, a] = value;
          
          // Determine which color to replace based on original values
          if (r > 0.9 && g > 0.9 && b > 0.4 && b < 0.7) {
            // Yellow/warm colors -> use gradient1
            obj[key] = [...colors.gradient1];
            obj[key][3] = a; // Preserve original alpha
          } else if (r > 0.9 && g < 0.5 && b < 0.5) {
            // Red/pink colors -> use primary
            obj[key] = [...colors.primary];
            obj[key][3] = a;
          } else if (r > 0.8 && g > 0.8 && b > 0.8) {
            // White/light colors -> use secondary
            obj[key] = [...colors.secondary];
            obj[key][3] = a;
          } else if (g > 0.5 && r < 0.5 && b < 0.5) {
            // Green colors -> use accent
            obj[key] = [...colors.accent];
            obj[key][3] = a;
          } else if ((r + g + b) / 3 > 0.5) {
            // Other bright colors -> use gradient2
            obj[key] = [...colors.gradient2];
            obj[key][3] = a;
          }
        } else {
          // Recursively process array elements
          value.forEach(item => replaceColors(item, colors));
        }
      } else if (typeof value === 'object') {
        replaceColors(value, colors);
      }
    }
  }
}

// Create three variants
Object.keys(colorSchemes).forEach(schemeName => {
  console.log(`Creating ${schemeName} variant...`);
  
  // Deep clone the base animation
  let animationVariant = JSON.parse(JSON.stringify(baseAnimation));
  
  // Remove sparkles
  animationVariant = removeSparkles(animationVariant);
  
  // Replace colors
  replaceColors(animationVariant, colorSchemes[schemeName]);
  
  // Save the variant
  const filename = `./assets/Animation-${schemeName.charAt(0).toUpperCase() + schemeName.slice(1)}.json`;
  fs.writeFileSync(filename, JSON.stringify(animationVariant));
  
  console.log(`✅ Created ${filename}`);
});

console.log('\n🎉 All animation variants created successfully!');
console.log('Files created:');
console.log('- assets/Animation-Thriving.json (Green)');
console.log('- assets/Animation-Moderate.json (Orange)');
console.log('- assets/Animation-Burnout.json (Red)'); 