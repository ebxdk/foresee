import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface FoodOption {
  id: string;
  name: string;
  category: string;
  emoji: string;
  nutrition: {
    calories: number;
    [key: string]: string | number;
  };
  serving: string;
}

const foodOptions: FoodOption[] = [
  // Quick Energy
  { id: 'coffee', name: 'Coffee', category: 'Quick Energy', emoji: '☕', nutrition: { calories: 2, caffeine: '95mg', antioxidants: 'High', L_theanine: 'Yes' }, serving: '1 cup (8oz)' },
  { id: 'banana', name: 'Banana', category: 'Quick Energy', emoji: '🍌', nutrition: { calories: 105, potassium: '422mg', vitaminB6: '0.4mg', fiber: '3.1g' }, serving: '1 medium' },
  { id: 'apple', name: 'Apple', category: 'Quick Energy', emoji: '🍎', nutrition: { calories: 95, vitaminC: '4.6mg', fiber: '4.4g', antioxidants: 'High' }, serving: '1 medium' },
  { id: 'orange', name: 'Orange', category: 'Quick Energy', emoji: '🍊', nutrition: { calories: 62, vitaminC: '69.7mg', fiber: '3.1g', folate: '39mcg' }, serving: '1 medium' },
  { id: 'grapes', name: 'Grapes', category: 'Quick Energy', emoji: '🍇', nutrition: { calories: 62, vitaminC: '3.7mg', potassium: '175mg', antioxidants: 'High' }, serving: '1 cup' },
  { id: 'dates', name: 'Dates', category: 'Quick Energy', emoji: '📅', nutrition: { calories: 66, fiber: '1.6g', potassium: '167mg', magnesium: '13mg' }, serving: '2-3 pieces' },
  { id: 'honey', name: 'Honey', category: 'Quick Energy', emoji: '🍯', nutrition: { calories: 64, naturalSugar: '17g', antioxidants: 'High', antibacterial: 'Yes' }, serving: '1 tbsp' },
  { id: 'mango', name: 'Mango', category: 'Quick Energy', emoji: '🥭', nutrition: { calories: 99, vitaminC: '60.1mg', vitaminA: '1262IU', fiber: '2.6g' }, serving: '1/2 cup' },
  { id: 'pineapple', name: 'Pineapple', category: 'Quick Energy', emoji: '🍍', nutrition: { calories: 82, vitaminC: '78.9mg', bromelain: 'Yes', manganese: '1.5mg' }, serving: '1 cup' },

  // Sustained Energy
  { id: 'almonds', name: 'Almonds', category: 'Sustained Energy', emoji: '🥜', nutrition: { calories: 164, protein: '6g', healthyFats: '14g', vitaminE: '7.3mg' }, serving: '1/4 cup' },
  { id: 'peanut_butter', name: 'Peanut Butter', category: 'Sustained Energy', emoji: '🥜', nutrition: { calories: 188, protein: '8g', healthyFats: '16g', niacin: '4.2mg' }, serving: '2 tbsp' },
  { id: 'greek_yogurt', name: 'Greek Yogurt', category: 'Sustained Energy', emoji: '🥛', nutrition: { calories: 130, protein: '22g', calcium: '200mg', probiotics: 'Yes' }, serving: '1 cup' },
  { id: 'cheese', name: 'Cheese', category: 'Sustained Energy', emoji: '🧀', nutrition: { calories: 113, protein: '7g', calcium: '202mg', vitaminB12: '0.3mcg' }, serving: '1 oz' },
  { id: 'eggs', name: 'Hard Boiled Eggs', category: 'Sustained Energy', emoji: '🥚', nutrition: { calories: 78, protein: '6g', vitaminD: '1.1mcg', choline: '147mg' }, serving: '1 egg' },
  { id: 'cashews', name: 'Cashews', category: 'Sustained Energy', emoji: '🥜', nutrition: { calories: 157, protein: '5g', healthyFats: '12g', magnesium: '83mg' }, serving: '1/4 cup' },
  { id: 'pistachios', name: 'Pistachios', category: 'Sustained Energy', emoji: '🥜', nutrition: { calories: 159, protein: '6g', healthyFats: '13g', vitaminB6: '0.5mg' }, serving: '1/4 cup' },
  { id: 'sunflower_seeds', name: 'Sunflower Seeds', category: 'Sustained Energy', emoji: '🌻', nutrition: { calories: 164, protein: '6g', healthyFats: '14g', vitaminE: '10.3mg' }, serving: '1/4 cup' },
  { id: 'cottage_cheese', name: 'Cottage Cheese', category: 'Sustained Energy', emoji: '🧀', nutrition: { calories: 120, protein: '14g', calcium: '138mg', phosphorus: '189mg' }, serving: '1/2 cup' },

  // Brain Fuel
  { id: 'walnuts', name: 'Walnuts', category: 'Brain Fuel', emoji: '🌰', nutrition: { calories: 185, omega3: '2.5g', vitaminE: '0.7mg', antioxidants: 'High' }, serving: '1/4 cup' },
  { id: 'blueberries', name: 'Blueberries', category: 'Brain Fuel', emoji: '🫐', nutrition: { calories: 57, vitaminC: '9.7mg', antioxidants: 'Very High', fiber: '2.4g' }, serving: '1/2 cup' },
  { id: 'dark_chocolate', name: 'Dark Chocolate', category: 'Brain Fuel', emoji: '🍫', nutrition: { calories: 170, antioxidants: 'Very High', iron: '3.4mg', magnesium: '64mg' }, serving: '1 oz' },
  { id: 'avocado', name: 'Avocado', category: 'Brain Fuel', emoji: '🥑', nutrition: { calories: 160, healthyFats: '15g', fiber: '6.7g', potassium: '485mg' }, serving: '1/4 avocado' },
  { id: 'salmon', name: 'Salmon', category: 'Brain Fuel', emoji: '🐟', nutrition: { calories: 208, protein: '25g', omega3: '4.5g', vitaminD: '11.1mcg' }, serving: '3 oz' },
  { id: 'pumpkin_seeds', name: 'Pumpkin Seeds', category: 'Brain Fuel', emoji: '🎃', nutrition: { calories: 151, protein: '7g', magnesium: '150mg', zinc: '2.2mg' }, serving: '1/4 cup' },
  { id: 'chia_seeds', name: 'Chia Seeds', category: 'Brain Fuel', emoji: '🌱', nutrition: { calories: 138, omega3: '4.9g', fiber: '10.6g', calcium: '177mg' }, serving: '2 tbsp' },
  { id: 'flax_seeds', name: 'Flax Seeds', category: 'Brain Fuel', emoji: '🌾', nutrition: { calories: 55, omega3: '2.3g', fiber: '2.8g', lignans: 'High' }, serving: '2 tbsp' },
  { id: 'green_tea', name: 'Green Tea', category: 'Brain Fuel', emoji: '🫖', nutrition: { calories: 0, antioxidants: 'Very High', L_theanine: 'Yes', caffeine: '25mg' }, serving: '1 cup' },

  // Crash Prevention
  { id: 'oatmeal', name: 'Oatmeal', category: 'Crash Prevention', emoji: '🥣', nutrition: { calories: 150, fiber: '4g', protein: '5g', betaGlucan: '2g' }, serving: '1/2 cup' },
  { id: 'whole_wheat_bread', name: 'Whole Wheat Bread', category: 'Crash Prevention', emoji: '🍞', nutrition: { calories: 80, fiber: '2g', protein: '4g', complexCarbs: '15g' }, serving: '1 slice' },
  { id: 'sweet_potato', name: 'Sweet Potato', category: 'Crash Prevention', emoji: '🍠', nutrition: { calories: 103, vitaminA: '18443IU', fiber: '3.8g', potassium: '438mg' }, serving: '1/2 cup' },
  { id: 'brown_rice', name: 'Brown Rice', category: 'Crash Prevention', emoji: '🍚', nutrition: { calories: 110, fiber: '2.2g', magnesium: '42mg', selenium: '19mcg' }, serving: '1/2 cup' },
  { id: 'lentils', name: 'Lentils', category: 'Crash Prevention', emoji: '🫘', nutrition: { calories: 116, protein: '9g', fiber: '7.9g', iron: '3.3mg' }, serving: '1/2 cup' },
  { id: 'black_beans', name: 'Black Beans', category: 'Crash Prevention', emoji: '🫘', nutrition: { calories: 114, protein: '8g', fiber: '7.5g', folate: '128mcg' }, serving: '1/2 cup' },
  { id: 'chickpeas', name: 'Chickpeas', category: 'Crash Prevention', emoji: '🫘', nutrition: { calories: 134, protein: '7g', fiber: '6.2g', iron: '2.4mg' }, serving: '1/2 cup' },
  { id: 'whole_grain_crackers', name: 'Whole Grain Crackers', category: 'Crash Prevention', emoji: '🍞', nutrition: { calories: 120, fiber: '3g', protein: '3g', complexCarbs: '18g' }, serving: '6-8 pieces' },
  { id: 'hummus', name: 'Hummus', category: 'Crash Prevention', emoji: '🥜', nutrition: { calories: 166, protein: '8g', healthyFats: '10g', fiber: '6g' }, serving: '1/4 cup' },

  // Hydration + Energy
  { id: 'coconut_water', name: 'Coconut Water', category: 'Hydration + Energy', emoji: '🥥', nutrition: { calories: 45, potassium: '600mg', electrolytes: 'High', naturalSugar: '9g' }, serving: '1 cup' },
  { id: 'watermelon', name: 'Watermelon', category: 'Hydration + Energy', emoji: '🍉', nutrition: { calories: 46, water: '92%', vitaminC: '8.1mg', lycopene: '6.9mg' }, serving: '1 cup diced' },
  { id: 'cucumber', name: 'Cucumber', category: 'Hydration + Energy', emoji: '🥒', nutrition: { calories: 16, water: '96%', vitaminK: '16.4mcg', potassium: '147mg' }, serving: '1/2 cup sliced' },
  { id: 'celery', name: 'Celery', category: 'Hydration + Energy', emoji: '🥬', nutrition: { calories: 6, water: '95%', fiber: '0.6g', vitaminK: '29.6mcg' }, serving: '1 cup chopped' },
  { id: 'herbal_tea', name: 'Herbal Tea', category: 'Hydration + Energy', emoji: '🫖', nutrition: { calories: 0, antioxidants: 'High', hydration: '100%', caffeine: '0mg' }, serving: '1 cup' },
  { id: 'cantaloupe', name: 'Cantaloupe', category: 'Hydration + Energy', emoji: '🍈', nutrition: { calories: 34, water: '90%', vitaminA: '3382IU', vitaminC: '36.7mg' }, serving: '1 cup cubed' },
  { id: 'strawberries', name: 'Strawberries', category: 'Hydration + Energy', emoji: '🍓', nutrition: { calories: 32, water: '91%', vitaminC: '58.8mg', manganese: '0.4mg' }, serving: '1 cup' },
  { id: 'peaches', name: 'Peaches', category: 'Hydration + Energy', emoji: '🍑', nutrition: { calories: 39, water: '89%', vitaminC: '6.6mg', vitaminA: '489IU' }, serving: '1 medium' },
  { id: 'lemon_water', name: 'Lemon Water', category: 'Hydration + Energy', emoji: '🍋', nutrition: { calories: 6, vitaminC: '18.6mg', hydration: '100%', citric_acid: 'Yes' }, serving: '1 cup' },
];

// Custom SVG icons for foods that don't have good emojis
const FoodIcon = ({ foodId, size = 24 }: { foodId: string; size?: number }) => {
  switch (foodId) {
    case 'dates':
      return (
        <Image
          source={require('../assets/images/dates.png')}
          style={{ width: 32, height: 32 }}
        />
      );
    case 'honey':
      return <Text style={styles.emoji}>🍯</Text>;
    case 'cashews':
      return (
        <Svg width={size} height={size} viewBox="0 0 109.72 122.88" fill="none">
          <Path d="M1.27,81.08c-0.09-7.52,2.73-13.44,7.02-17.63c2.41-2.35,5.28-4.14,8.35-5.35c3.03-1.19,6.29-1.82,9.52-1.86 c6.15-0.07,12.19,2,16.44,6.37c1.44,1.47,2.6,3.01,3.82,4.63c1.55,2.05,3.22,4.27,5.51,6.35c1.69,1.54,3.36,2.75,4.99,3.61 C58.47,78,60,78.5,61.52,78.68l0.01,0c7.52,0.86,11.38-4.78,15-10.08c2.98-4.36,5.84-8.55,10.57-10.43c1.96-0.78,4-1.14,6.02-1.09 c2.06,0.06,4.08,0.53,5.95,1.42c3.24,1.54,5.63,3.51,7.32,5.78c1.73,2.32,2.71,4.91,3.11,7.64c0.49,3.33,0.1,6.85-0.82,10.34 c-2.46,9.35-8.18,18.46-15.24,25c-4.3,3.98-9.23,7.3-14.53,9.83c-6.69,3.19-14.02,5.15-21.46,5.66c-7.14,0.49-14.39-0.38-21.3-2.79 c-8.59-3-18.08-8.76-24.95-16.28C5.36,97.27,1.37,89.56,1.27,81.08L1.27,81.08z M7.17,11.89c3.43-3.5,7.8-6.26,12.55-8.16 c2.58-1.03,5.21-1.85,7.88-2.45c10.84-2.45,22.03-1.33,31.54,2.99c9.62,4.36,17.55,11.97,21.73,22.41 c0.83,2.06,1.51,4.24,2.02,6.52c0.36,1.59,0.63,3.2,0.8,4.81c0.16,1.54,0.22,3.09,0.17,4.63c-0.11,3.07-0.63,6.12-1.81,8.85 c-1.09,2.51-2.72,4.76-5.06,6.52c-1.62,1.22-3.42,2.19-5.3,2.86c-3.21,1.15-6.72,1.44-10.07,0.62c-3.41-0.83-6.61-2.79-9.13-6.14 c-1.23-1.64-2.29-3.6-3.11-5.9l0.01,0c-1.22-3.25-2.7-5.82-4.42-7.79c-1.65-1.89-3.53-3.24-5.6-4.12 c-1.28-0.54-2.62-0.87-4.03-1.02c-1.46-0.15-3.01-0.11-4.68,0.09c-1.72,0.21-3.51,0.58-5.4,1.08c-1.95,0.52-3.94,1.15-6,1.86 c-0.21,0.09-0.44,0.16-0.68,0.2c-3.29,0.62-6.16,0.58-8.58,0.01c-2.88-0.68-5.15-2.09-6.79-4.01c-1.5-1.77-2.43-3.67-2.88-5.67 c-0.48-2.11-0.4-4.27,0.12-6.4C1.53,19.16,3.93,15.2,7.17,11.89L7.17,11.89z" fill="#814832"/>
          <Path d="M4.63,81.04C4.38,60.33,29.4,53.89,40.2,64.95c3.05,3.12,5.16,7.19,9.48,11.12c3.77,3.43,7.6,5.51,11.48,5.95 c15.68,1.79,17.59-16.91,27.19-20.73c3.06-1.22,6.36-1.14,9.28,0.25c5.43,2.59,7.91,6.47,8.55,10.87 c0.93,6.33-1.91,13.75-5.23,19.88c-5.16,9.52-13.6,17.05-23.47,21.75c-12.37,5.9-26.99,7.36-40.2,2.74 C22.45,111.61,4.83,97.76,4.63,81.04L4.63,81.04z M20.97,6.85c-8.3,3.33-15.29,9.45-17.27,17.63c-0.77,3.16-0.3,6.31,2.06,9.1 c2.26,2.66,6.34,3.97,12.17,2.87c4.51-1.56,8.57-2.74,12.3-3.19c3.77-0.45,7.2-0.17,10.41,1.18c5.09,2.15,9.16,6.56,11.89,13.89 C56.83,60.36,68,60.56,74.96,55.32c3.94-2.97,5.35-7.81,5.53-12.8c0.1-2.82-0.24-5.75-0.88-8.58C73.74,8.03,45.06-2.8,20.97,6.85 L20.97,6.85z" fill="#F9E5A0" fillRule="evenodd" clipRule="evenodd"/>
          <Path d="M14.25,27.57c-0.59,0.72-1.66,0.82-2.37,0.22s-0.82-1.66-0.22-2.37c2.84-3.43,6.11-5.76,9.78-7.02 c3.66-1.25,7.69-1.43,12.06-0.55c0.91,0.18,1.51,1.07,1.33,1.98c-0.18,0.91-1.07,1.51-1.98,1.32c-3.79-0.76-7.24-0.62-10.32,0.43 C19.45,22.64,16.69,24.62,14.25,27.57L14.25,27.57z M20.3,73.83c-0.2-0.91,0.38-1.81,1.29-2c0.91-0.2,1.81,0.38,2,1.29 c0.21,0.98,0.5,1.94,0.85,2.87c2.52,6.65,8.47,12.31,15.93,15.86c7.52,3.58,16.53,5,25.09,3.13c1.62-0.35,3.22-0.82,4.78-1.41 c0.87-0.33,1.84,0.11,2.17,0.98c0.33,0.87-0.11,1.84-0.98,2.17c-1.73,0.66-3.49,1.17-5.26,1.56c-9.32,2.03-19.11,0.5-27.26-3.38 c-8.21-3.91-14.79-10.23-17.63-17.72C20.88,76.07,20.55,74.95,20.3,73.83L20.3,73.83z M86.13,87.04c-0.65,0.67-1.71,0.68-2.38,0.03 c-0.67-0.65-0.68-1.71-0.03-2.38c1.71-1.77,3.2-3.63,4.39-5.62c1.17-1.96,2.06-4.05,2.6-6.29c0.22-0.9,1.13-1.46,2.03-1.24 c0.9,0.22,1.46,1.13,1.24,2.03c-0.62,2.58-1.64,4.98-2.98,7.22C89.66,83.02,88.02,85.09,86.13,87.04L86.13,87.04z" fill="#814832"/>
        </Svg>
      );
    case 'pistachios':
      return (
        <Image
          source={require('../assets/images/pistacio.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'sunflower_seeds':
      return (
        <Image
          source={require('../assets/images/sunflowerseeds.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'cottage_cheese':
      return (
        <Image
          source={require('../assets/images/cottageCheese.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'almonds':
      return (
        <Image
          source={require('../assets/images/gourmet-almond-1.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'pumpkin_seeds':
      return (
        <Image
          source={require('../assets/images/pumpkinSeed.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'chia_seeds':
      return (
        <Image
          source={require('../assets/images/chiaseeds.png')}
          style={{ width: 32, height: 32 }}
        />
      );
    case 'flax_seeds':
      return (
        <Image
          source={require('../assets/images/flax.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'whole_grain_crackers':
      return (
        <Image
          source={require('../assets/images/wholeGrainCrackers.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'lentils':
      return (
        <Image
          source={require('../assets/images/6113506.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'chickpeas':
      return (
        <Image
          source={require('../assets/images/6113369.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'hummus':
      return (
        <Image
          source={require('../assets/images/hummus.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'lemon_water':
      return (
        <Image
          source={require('../assets/images/9916415.png')}
          style={{ width: size, height: size }}
        />
      );
    case 'whole_wheat_bread':
      return (
        <Image
          source={require('../assets/images/2646928.png')}
          style={{ width: size, height: size }}
        />
      );
    default:
      return <Text style={styles.emoji}>{foodOptions.find(f => f.id === foodId)?.emoji || '🍽️'}</Text>;
  }
};

export default function NourishmentSnackCarouselPage() {
  const [selectedSnacks, setSelectedSnacks] = useState<string[]>([]);

  const handleSnackSelect = (snackId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSnacks(prev => {
      if (prev.includes(snackId)) {
        return prev.filter(id => id !== snackId);
      } else {
        return [...prev, snackId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedSnacks.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/nourishment-reminder-setup' as any);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path fill="#000000" d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z" />
        </Svg>
      </TouchableOpacity>

      {/* Food Categories Grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
        {/* Header - now part of scrollable content */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Energy Boost</Text>
          <Text style={styles.subtitle}>Pick the snacks that match your vibe! Mix and match for your perfect energy combo 🚀</Text>
        </View>
        
        <View style={styles.categoriesContainer}>
          {['Quick Energy', 'Sustained Energy', 'Brain Fuel', 'Crash Prevention', 'Hydration + Energy'].map((category, categoryIndex) => {
            // Different sections get different card sizes
            const sectionCardSize = categoryIndex === 0 ? 'large' : 
                                  categoryIndex === 1 ? 'medium' : 
                                  categoryIndex === 2 ? 'large' : 
                                  categoryIndex === 3 ? 'small' : 'medium';
            
            const sectionCardStyle = sectionCardSize === 'large' ? styles.foodCardLarge :
                                   sectionCardSize === 'medium' ? styles.foodCardMedium :
                                   styles.foodCardSmall;
            
            return (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: '#000000' }]} />
                  <Text style={styles.categoryTitle}>{category}</Text>
                </View>
                
                {category === 'Crash Prevention' ? (
                  // Grid layout for Crash Prevention
                  <View style={styles.gridContainer}>
                    {foodOptions
                      .filter(option => option.category === category)
                      .map((option, index) => (
                        <TouchableOpacity
                          key={option.id}
                          style={[
                            styles.foodCard,
                            styles.foodCardSmall, // Use small size for grid
                            styles.gridCard, // Add grid-specific styling
                            selectedSnacks.includes(option.id) && styles.foodCardSelected
                          ]}
                          onPress={() => handleSnackSelect(option.id)}
                        >
                          {/* Serving Size - Top Right */}
                          <View style={styles.servingContainer}>
                            <Text style={styles.servingText}>{option.serving}</Text>
                          </View>
                          
                          <View style={styles.emojiContainer}>
                            <FoodIcon foodId={option.id} size={24} />
                          </View>
                          <Text style={styles.foodName}>{option.name}</Text>
                          
                          {/* Nutrition Info */}
                          <View style={styles.nutritionContainer}>
                            <Text style={styles.calories}>{option.nutrition.calories} cal</Text>
                            {Object.entries(option.nutrition).slice(1, 3).map(([key, value]) => (
                              <Text key={key} style={styles.nutritionItem}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                              </Text>
                            ))}
                          </View>
                        </TouchableOpacity>
                      ))}
                  </View>
                ) : (
                  // Horizontal scroll for other categories
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalScroll}
                    contentContainerStyle={styles.horizontalScrollContent}
                  >
                    {foodOptions
                      .filter(option => option.category === category)
                      .map((option, index) => (
                        <TouchableOpacity
                          key={option.id}
                          style={[
                            styles.foodCard,
                            sectionCardStyle, // All cards in this section get the same size
                            selectedSnacks.includes(option.id) && styles.foodCardSelected
                          ]}
                          onPress={() => handleSnackSelect(option.id)}
                        >
                          {/* Serving Size - Top Right */}
                          <View style={styles.servingContainer}>
                            <Text style={styles.servingText}>{option.serving}</Text>
                          </View>
                          
                          <View style={styles.emojiContainer}>
                            <FoodIcon foodId={option.id} size={24} />
                          </View>
                          <Text style={styles.foodName}>{option.name}</Text>
                          
                          {/* Nutrition Info */}
                          <View style={styles.nutritionContainer}>
                            <Text style={styles.calories}>{option.nutrition.calories} cal</Text>
                            {Object.entries(option.nutrition).slice(1, 3).map(([key, value]) => (
                              <Text key={key} style={styles.nutritionItem}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                              </Text>
                            ))}
                          </View>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                )}
              </View>
            );
          })}
        </View>
        
      </ScrollView>
      
      {/* Floating Continue Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            selectedSnacks.length === 0 && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={selectedSnacks.length === 0}
        >
          <Text style={styles.continueButtonText}>
            Continue {selectedSnacks.length > 0 ? `(${selectedSnacks.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Add padding to the bottom of the ScrollView
  },
  header: {
    paddingHorizontal: 32,
    paddingTop: 140,
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 44,
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 24,
    marginBottom: 40,
  },
  categoriesContainer: {
    paddingHorizontal: 32,
  },
  categorySection: {
    marginBottom: 40,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#000000',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  horizontalScroll: {
    marginLeft: -32,
    marginRight: -32,
  },
  horizontalScrollContent: {
    paddingLeft: 32,
    paddingRight: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    width: '100%',
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  foodCardSelected: {
    borderColor: '#000000',
    backgroundColor: '#F3F4F6',
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  foodCardLarge: {
    width: 280,
  },
  foodCardMedium: {
    width: 180,
  },
  foodCardSmall: {
    width: '47%',
    marginBottom: 16,
    marginHorizontal: 0,
  },
  nutritionContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  calories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  nutritionItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  continueButton: {
    width: '85%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  gridCard: {
    width: '47%',
    marginRight: 0,
    marginLeft: 0,
    marginHorizontal: 0,
    marginBottom: 16,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  servingContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  servingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});
