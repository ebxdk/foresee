import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Simple icon components since we don't need external dependencies
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const getIcon = () => {
    switch (name) {
      case 'dashboard': return '⚡';
      case 'radar': return '📡';
      case 'coach': return 'AI';
      case 'tools': return '🛠️';
      case 'progress': return '📈';
      default: return '●';
    }
  };

  if (name === 'coach') {
    return (
      <View style={styles.addButton}>
        <Text style={styles.addButtonText}>{getIcon()}</Text>
      </View>
    );
  }

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, { opacity: focused ? 1 : 0.6 }]}>
        {getIcon()}
      </Text>
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
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} />,
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
  iconText: {
    fontSize: 20,
    textAlign: 'center',
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