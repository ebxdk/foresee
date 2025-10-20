import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ApiService } from '../../services/ApiService';
import PDFViewer from '../../components/PDFViewer';

interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
}

export default function SettingsProfile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [editedName, setEditedName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [currentPDF, setCurrentPDF] = useState<{ title: string; path: any } | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserProfile(user);
        setEditedName(user.name || '');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(userProfile.name || '');
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsSavingName(true);
    try {
      // Update name on server
      const response = await ApiService.updateUserProfile(editedName.trim());
      
      if (response.success) {
        // Update local user profile with server response
        const updatedUser = { ...userProfile, name: response.user?.name || editedName.trim() };
        setUserProfile(updatedUser);
        
        // Also update AsyncStorage for offline access
        await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
        
        setIsEditingName(false);
        Alert.alert('Success', 'Name updated successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to update name. Please try again.');
      }
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsSavingName(false);
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

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await ApiService.deleteAccount();
              if (result.success) {
                Alert.alert(
                  'Account Deleted',
                  'Your account has been successfully deleted.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        router.replace('/get-started');
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Error', result.message || 'Failed to delete account. Please try again.');
              }
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
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
    setCurrentPDF({
      title: 'Privacy Policy',
      path: require('../../assets/Privacy Policy - Final.pdf'),
    });
    setShowPDFViewer(true);
  };

  const handleTermsPress = () => {
    setCurrentPDF({
      title: 'Terms of Service',
      path: require('../../assets/Terms of Service (Beta) - Final.pdf'),
    });
    setShowPDFViewer(true);
  };

  const handleProfilePress = () => {
    Alert.alert('Profile', 'Profile details coming soon!');
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
        <View style={styles.sectionsContainer}>
          {/* Profile Information Card */}
          <BlurView intensity={60} tint="light" style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Ionicons name="person-circle-outline" size={24} color="#1C1C1E" />
              <Text style={styles.settingsHeaderTitle}>Profile</Text>
            </View>

            <View style={styles.settingsSection}>
              <View style={styles.settingsField}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldLabel}>Name</Text>
                  {!isEditingName ? (
                    <TouchableOpacity onPress={handleEditName}>
                      <Ionicons name="pencil" size={16} color="#007AFF" />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={handleCancelEdit} style={styles.editActionButton}>
                        <Ionicons name="close" size={16} color="#FF6B6B" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={handleSaveName} 
                        style={styles.editActionButton}
                        disabled={isSavingName}
                      >
                        <Ionicons name="checkmark" size={16} color="#4CAF50" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <TextInput
                  style={[
                    styles.fieldInput, 
                    isEditingName && styles.fieldInputEditing
                  ]}
                  value={isEditingName ? editedName : (userProfile.name || '')}
                  onChangeText={setEditedName}
                  editable={isEditingName}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
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

              <TouchableOpacity style={styles.settingsButton} onPress={handlePrivacyPress}>
                <View style={styles.settingsButtonContent}>
                  <Ionicons name="shield-checkmark-outline" size={24} color="#1C1C1E" />
                  <Text style={styles.settingsButtonText}>Privacy Settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Settings & Preferences */}
          <BlurView intensity={60} tint="light" style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Ionicons name="settings-outline" size={24} color="#1C1C1E" />
              <Text style={styles.settingsHeaderTitle}>Settings & Preferences</Text>
            </View>
            
            <TouchableOpacity style={styles.settingsButton} onPress={handleBiometricPress}>
              <View style={styles.settingsButtonContent}>
                <Ionicons name="finger-print-outline" size={24} color="#1C1C1E" />
                <Text style={styles.settingsButtonText}>Biometric Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
          {/* Removed duplicate Privacy Settings from here; moved under Profile */}
          </BlurView>

          {/* Account Actions */}
          <BlurView intensity={60} tint="light" style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={handleLogout}
              disabled={isLoading}
            >
              <View style={styles.settingsButtonContent}>
                <Ionicons name="log-out-outline" size={24} color="#1C1C1E" />
                <Text style={styles.settingsButtonText}>
                  {isLoading ? 'Logging out...' : 'Logout'}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingsButton, styles.deleteButton]}
              onPress={handleDeleteAccount}
              disabled={isLoading}
            >
              <View style={styles.settingsButtonContent}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                <Text style={[styles.settingsButtonText, styles.deleteButtonText]}>
                  {isLoading ? 'Deleting account...' : 'Delete Account'}
                </Text>
              </View>
            </TouchableOpacity>
          </BlurView>
        </View>

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

      {/* PDF Viewer Modal */}
      {currentPDF && (
        <PDFViewer
          visible={showPDFViewer}
          onClose={() => setShowPDFViewer(false)}
          pdfPath={currentPDF.path}
          title={currentPDF.title}
        />
      )}
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
    paddingTop: 140,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  sectionsContainer: {
    gap: 16,
  },
  // Settings cards & sections
  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  settingsHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  settingsSection: {
    gap: 14,
  },
  settingsField: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  fieldInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    color: '#1C1C1E',
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verificationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Settings buttons
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  logoutButton: {
    backgroundColor: '#FFF6F6',
    borderColor: '#FAD4D4',
  },
  // Edit name functionality styles
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  fieldInputEditing: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  // Footer styles
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textDecorationLine: 'underline',
  },
  deleteButton: {
    backgroundColor: '#FFF6F6',
    borderColor: '#FAD4D4',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
});