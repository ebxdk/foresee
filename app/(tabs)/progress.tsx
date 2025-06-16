import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../logos/logo.png')} 
          style={styles.brandLogo}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Progress</Text>
        
        <View style={styles.widget}>
          <Text style={styles.widgetText}>Your progress will appear here</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  brandLogo: {
    width: 200,
    height: 200,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  widget: {
    alignItems: 'center',
  },
  widgetText: {
    fontSize: 48,
    marginBottom: 16,
  },
}); 