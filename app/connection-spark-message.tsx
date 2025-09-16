import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function ConnectionSparkMessagePage() {
  const router = useRouter();
  const { contactName, contactId } = useLocalSearchParams<{ contactName: string; contactId: string }>();
  
  const [messageText, setMessageText] = useState(
    `Hey ${contactName || 'there'}, just thinking of you — hope you're well! 💫`
  );
  const [isEditing, setIsEditing] = useState(false);

  // Alternative message templates
  const messageTemplates = [
    `Hey ${contactName || 'there'}, just thinking of you — hope you're well! 💫`,
    `Hi ${contactName || 'friend'}! Sending you some positive vibes today ✨`,
    `Hey ${contactName || 'there'}! Hope your day is going great 🌟`,
    `Hi ${contactName || 'friend'}! Just wanted to say hello and check in 💕`,
    `Hey ${contactName || 'there'}! Thinking of you and hoping you're doing well 🎯`,
  ];

  const handleTemplateSelect = (template: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessageText(template);
    setIsEditing(true);
  };

  const handleSend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement actual sending logic
    router.push('/connection-spark-complete');
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
            <Text style={styles.title}>Your Message to {contactName}</Text>
            <Text style={styles.subtitle}>Customize this low-pressure message before sending.</Text>
          </View>

          {/* Message Templates Section */}
          <View style={styles.templatesSection}>
            <Text style={styles.sectionTitle}>Choose a template or write your own:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templatesContainer}
            >
              {messageTemplates.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.templateCard,
                    messageText === template && styles.selectedTemplateCard
                  ]}
                  onPress={() => handleTemplateSelect(template)}
                >
                  <Text style={styles.templateText} numberOfLines={2}>
                    {template}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Message Editor Section */}
          <View style={styles.editorSection}>
            <Text style={styles.sectionTitle}>Your message:</Text>
            <View style={styles.messageContainer}>
              <TextInput
                style={styles.messageInput}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                placeholder="Write your message here..."
                placeholderTextColor="#9CA3AF"
                onFocus={() => setIsEditing(true)}
              />
              <View style={styles.messageFooter}>
                <Text style={styles.characterCount}>{messageText.length} characters</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path
                      fill="#6B7280"
                      d="M3,17.25V21h3.75L17.81,9.94l-3.75-3.75L3,17.25zM20.71,7.04c0.39-0.39,0.39-1.02,0-1.41l-2.34-2.34c-0.39-0.39-1.02-0.39-1.41,0l-1.83,1.83,3.75,3.75L20.71,7.04z"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Send Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
            >
              <View style={styles.buttonIconContainer}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path
                    fill="#FFFFFF"
                    d="M2.01,21L23,12L2.01,3L2,10L17,12L2,14L2.01,21Z"
                  />
                </Svg>
              </View>
              <Text style={styles.sendButtonText}>Send Message</Text>
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
  templatesSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  templatesContainer: {
    paddingRight: 32,
  },
  templateCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    marginRight: 16,
    width: 200,
    minHeight: 80,
    justifyContent: 'center',
  },
  selectedTemplateCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  templateText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  editorSection: {
    flex: 1,
    marginBottom: 40,
  },
  messageContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 20,
  },
  messageInput: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  characterCount: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  editButton: {
    padding: 8,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    backgroundColor: '#10B981',
    borderRadius: 28,
    paddingHorizontal: 24,
  },
  buttonIconContainer: {
    marginRight: 12,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});

