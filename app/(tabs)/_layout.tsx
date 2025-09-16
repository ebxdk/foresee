import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// SVG Icon components
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      stroke={focused ? '#000000' : '#8E8E93'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const RadarIcon = ({ focused }: { focused: boolean }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      stroke={focused ? '#000000' : '#8E8E93'}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ToolsIcon = ({ focused }: { focused: boolean }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      stroke={focused ? '#000000' : '#8E8E93'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ProgressIcon = ({ focused }: { focused: boolean }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3v18h18"
      stroke={focused ? '#000000' : '#8E8E93'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"
      stroke={focused ? '#000000' : '#8E8E93'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// Tab Icon component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  if (name === 'coach') {
    return (
      <View style={styles.addButton}>
        <Text style={styles.addButtonText}>AI</Text>
      </View>
    );
  }

  return (
    <View style={styles.iconContainer}>
      {name === 'home' && <HomeIcon focused={focused} />}
      {name === 'radar' && <RadarIcon focused={focused} />}
      {name === 'tools' && <ToolsIcon focused={focused} />}
      {name === 'progress' && <ProgressIcon focused={focused} />}
    </View>
  );
};

export default function TabLayout() {
  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
      }}>
      
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      
      <Tabs.Screen
        name="radar"
        options={{
          title: 'Radar',
          tabBarIcon: ({ focused }) => <TabIcon name="radar" focused={focused} />,
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      
      <Tabs.Screen
        name="coach"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <TabIcon name="coach" focused={focused} />,
          tabBarLabel: () => null,
        }}
        listeners={{
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
        }}
      />
      
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ focused }) => <TabIcon name="tools" focused={focused} />,
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => <TabIcon name="progress" focused={focused} />,
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 88,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: '#E5E5EA',
    borderRightColor: '#E5E5EA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 0,
    shadowOpacity: 0,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    marginTop: 8,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 