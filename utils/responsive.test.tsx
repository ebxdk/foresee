/**
 * Test file to verify responsive scaling
 * Run this on different devices to confirm iPhone 14 Pro gets 1:1 scaling
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    baseHeight,
    baseWidth,
    getDeviceType,
    hp,
    isIPhone14Pro,
    moderateScale,
    RFValue,
    scale,
    screenHeight,
    screenWidth,
    wp
} from './responsive';

export default function ResponsiveTest() {
  const scaleFactor = screenWidth / baseWidth;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>📱 Device Info</Text>
        <Text style={styles.text}>Screen: {screenWidth} x {screenHeight}</Text>
        <Text style={styles.text}>Base (iPhone 14 Pro): {baseWidth} x {baseHeight}</Text>
        <Text style={styles.text}>Scale Factor: {scaleFactor.toFixed(4)}</Text>
        <Text style={styles.text}>Is iPhone 14 Pro: {isIPhone14Pro() ? 'YES ✅' : 'NO'}</Text>
        <Text style={styles.text}>Device Type: {getDeviceType()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>🔢 Scale Tests (Base Value: 16)</Text>
        <Text style={styles.text}>Original: 16</Text>
        <Text style={styles.text}>scale(16): {scale(16).toFixed(2)}</Text>
        <Text style={styles.text}>moderateScale(16): {moderateScale(16).toFixed(2)}</Text>
        <Text style={styles.text}>RFValue(16): {RFValue(16)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>📏 Percentage Tests</Text>
        <Text style={styles.text}>90% width: {wp(90).toFixed(2)}</Text>
        <Text style={styles.text}>50% height: {hp(50).toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>✅ iPhone 14 Pro Verification</Text>
        {isIPhone14Pro() ? (
          <>
            <Text style={styles.successText}>✅ Running on iPhone 14 Pro!</Text>
            <Text style={styles.text}>scale(16) = {scale(16).toFixed(2)} (should be 16.00)</Text>
            <Text style={styles.text}>RFValue(20) = {RFValue(20)} (should be 20)</Text>
            <Text style={styles.successText}>All values are 1:1 - No visual changes! ✨</Text>
          </>
        ) : (
          <>
            <Text style={styles.warningText}>📱 Running on different device</Text>
            <Text style={styles.text}>Values will scale proportionally</Text>
            <Text style={styles.text}>scale(16) = {scale(16).toFixed(2)}</Text>
            <Text style={styles.text}>This ensures consistent visual appearance</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>🎨 Visual Comparison</Text>
        
        {/* Hardcoded box */}
        <View style={styles.comparisonRow}>
          <View style={styles.hardcodedBox}>
            <Text style={styles.boxLabel}>Hardcoded</Text>
            <Text style={styles.boxText}>100x100</Text>
          </View>
          
          {/* Scaled box */}
          <View style={[styles.hardcodedBox, { 
            width: scale(100), 
            height: scale(100) 
          }]}>
            <Text style={styles.boxLabel}>Scaled</Text>
            <Text style={styles.boxText}>{scale(100).toFixed(0)}x{scale(100).toFixed(0)}</Text>
          </View>
        </View>
        
        <Text style={styles.helpText}>
          On iPhone 14 Pro, both boxes should be identical
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  text: {
    fontSize: 14,
    marginBottom: 6,
    color: '#3C3C3E',
  },
  successText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#34C759',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#FF9500',
    fontWeight: '600',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  hardcodedBox: {
    width: 100,
    height: 100,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  boxText: {
    fontSize: 10,
    color: '#fff',
  },
  helpText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});


