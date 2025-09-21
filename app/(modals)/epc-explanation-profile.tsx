import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { ApiService } from '../../services/ApiService';

interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
}

export default function SettingsProfile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserProfile(user);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await ApiService.logout();
              await AsyncStorage.removeItem('current_user');
              router.replace('/get-started');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert('Privacy', 'Privacy settings coming soon!');
  };

  const handleBiometricPress = () => {
    Alert.alert('Biometric Data', 'Biometric settings coming soon!');
  };

  const handlePrivacyPolicyPress = () => {
    Alert.alert('Privacy Policy', 'Privacy Policy coming soon!');
  };

  const handleTermsPress = () => {
    Alert.alert('Terms of Service', 'Terms of Service coming soon!');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeXButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={24} color="#1C1C1E" />
      </TouchableOpacity>
      <BlurView intensity={80} tint="light" style={styles.headerContainer}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your profile and preferences</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Profile Information Section */}
        <BlurView intensity={60} tint="light" style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.settingsHeaderTitle}>Profile Information</Text>
          </View>
          
          <View style={styles.settingsSection}>
            <View style={styles.settingsField}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={userProfile.name || ''}
                editable={false}
                placeholder="No name set"
              />
            </View>
            
            <View style={styles.settingsField}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.fieldInput}
                value={userProfile.email || ''}
                editable={false}
                placeholder="No email set"
              />
            </View>
            
            <View style={styles.settingsField}>
              <Text style={styles.fieldLabel}>Email Status</Text>
              <View style={styles.verificationContainer}>
                <Text style={[styles.verificationText, { color: userProfile.emailVerified ? '#4CAF50' : '#FF6B6B' }]}>
                  {userProfile.emailVerified ? 'Verified' : 'Not Verified'}
                </Text>
                <Ionicons 
                  name={userProfile.emailVerified ? "checkmark-circle" : "alert-circle"} 
                  size={16} 
                  color={userProfile.emailVerified ? '#4CAF50' : '#FF6B6B'} 
                />
              </View>
            </View>
          </View>
        </BlurView>

        {/* Settings & Preferences */}
        <BlurView intensity={60} tint="light" style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
            <Text style={styles.settingsHeaderTitle}>Settings & Preferences</Text>
          </View>
          
          <TouchableOpacity style={styles.settingsButton} onPress={handleBiometricPress}>
            <View style={styles.settingsButtonContent}>
              <Ionicons name="finger-print-outline" size={24} color="#333" />
              <Text style={styles.settingsButtonText}>Biometric Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsButton} onPress={handlePrivacyPress}>
            <View style={styles.settingsButtonContent}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
              <Text style={styles.settingsButtonText}>Privacy Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </BlurView>

        {/* Account Actions */}
        <BlurView intensity={60} tint="light" style={styles.settingsCard}>
          <TouchableOpacity 
            style={[styles.settingsButton, styles.logoutButton]} 
            onPress={handleLogout}
            disabled={isLoading}
          >
            <View style={styles.settingsButtonContent}>
              <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
              <Text style={[styles.settingsButtonText, { color: '#FF6B6B' }]}>
                {isLoading ? 'Logging out...' : 'Logout'}
              </Text>
            </View>
          </TouchableOpacity>
        </BlurView>

        {/* Footer Links */}
        <View style={styles.footerContainer}>
          <TouchableOpacity onPress={handlePrivacyPolicyPress}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.footerSeparator}>•</Text>
          <TouchableOpacity onPress={handleTermsPress}>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA', // Match app theme background
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 5,
  },
  closeXButton: {
    position: 'absolute',
    top: 30,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1C1C1E',
    paddingHorizontal: 24,
    paddingTop: 30,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
    lineHeight: 22,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scrollViewContent: {
    paddingHorizontal: 24,
    paddingTop: 140, // Adjusted for slimmer header
    paddingBottom: 100, // More bottom padding
  },
  mainCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mainCardHeader: {
    padding: 24,
  },
  mainCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainCardEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  mainCardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  mainCardScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  mainCardBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainCardBarBackground: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  mainCardBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  subCardsContainer: {
    padding: 20,
    gap: 16,
  },
  subCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  subCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subCardText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  closeButton: {
    display: 'none',
  },
  closeButtonText: {
    display: 'none',
  },
});