import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function ConnectionSparkContactsPage() {
  const router = useRouter();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  // Mock contacts data - in real app this would come from device contacts
  const energizingContacts = [
    { id: '1', name: 'Sarah', relationship: 'Best Friend', emoji: '🌟', energy: 'Always lifts my mood' },
    { id: '2', name: 'Mom', relationship: 'Family', emoji: '💕', energy: 'Gives me strength' },
    { id: '3', name: 'Alex', relationship: 'Work Buddy', emoji: '⚡', energy: 'Great conversation' },
    { id: '4', name: 'Jake', relationship: 'College Friend', emoji: '🎯', energy: 'Motivates me' },
    { id: '5', name: 'Emma', relationship: 'Sister', emoji: '💫', energy: 'Understands me' },
  ];

  const handleContactSelect = (contactId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedContact(contactId);
  };

  const handleContinue = () => {
    if (selectedContact) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const contact = energizingContacts.find(c => c.id === selectedContact);
      router.push({
        pathname: '/connection-spark-message',
        params: { 
          contactName: contact?.name,
          contactId: selectedContact 
        }
      });
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              fill="#000"
              d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"
            />
          </Svg>
        </TouchableOpacity>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Who gives you energy?</Text>
            <Text style={styles.subtitle}>Pick someone from your contacts who lifts your spirits.</Text>
          </View>

          {/* Contacts Section */}
          <View style={styles.contactsSection}>
            {energizingContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactCard,
                  selectedContact === contact.id && styles.selectedContactCard
                ]}
                onPress={() => handleContactSelect(contact.id)}
                activeOpacity={0.8}
              >
                <View style={styles.contactHeader}>
                  <Text style={styles.contactEmoji}>{contact.emoji}</Text>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                  </View>
                  {selectedContact === contact.id && (
                    <View style={styles.selectionIndicator}>
                      <Svg width={24} height={24} viewBox="0 0 24 24">
                        <Circle cx="12" cy="12" r="10" fill="#10B981" stroke="#10B981" strokeWidth="2"/>
                        <Path
                          fill="#FFFFFF"
                          d="M9,16.17L4.83,12l-1.42,1.41L9,19L21,7l-1.41-1.41L9,16.17z"
                        />
                      </Svg>
                    </View>
                  )}
                </View>
                <Text style={styles.contactEnergy}>{contact.energy}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedContact && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={!selectedContact}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 44,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  contactsSection: {
    flex: 1,
    marginBottom: 40,
  },
  contactCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedContactCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    shadowColor: '#10B981',
    shadowOpacity: 0.1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  contactRelationship: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  selectionIndicator: {
    marginLeft: 'auto',
  },
  contactEnergy: {
    fontSize: 16,
    color: '#374151',
    fontStyle: 'italic',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  continueButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});

