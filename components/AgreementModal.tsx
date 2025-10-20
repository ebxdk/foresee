import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import PDFViewer from './PDFViewer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AgreementModalProps {
  visible: boolean;
  onComplete: (agreed: boolean) => void;
  onCancel: () => void;
}

const AGREEMENT_DOCUMENTS = [
  {
    id: 'terms',
    title: 'Terms of Service',
    pdfPath: require('../assets/Terms of Service (Beta) - Final.pdf'),
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    pdfPath: require('../assets/Privacy Policy - Final.pdf'),
  },
  {
    id: 'disclaimers',
    title: 'In-App Disclaimers',
    pdfPath: require('../assets/In-App Disclaimers Final.pdf'),
  },
];

export default function AgreementModal({
  visible,
  onComplete,
  onCancel,
}: AgreementModalProps) {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [agreedDocuments, setAgreedDocuments] = useState<Set<string>>(new Set());
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  const currentDocument = AGREEMENT_DOCUMENTS[currentDocumentIndex];
  const isLastDocument = currentDocumentIndex === AGREEMENT_DOCUMENTS.length - 1;
  const hasAgreedToCurrent = agreedDocuments.has(currentDocument.id);

  useEffect(() => {
    if (visible) {
      setCurrentDocumentIndex(0);
      setAgreedDocuments(new Set());
      setShowPDFViewer(false);
    }
  }, [visible]);

  const handleViewDocument = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPDFViewer(true);
  };

  const handleAgree = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newAgreedDocuments = new Set(agreedDocuments);
    newAgreedDocuments.add(currentDocument.id);
    setAgreedDocuments(newAgreedDocuments);

    if (isLastDocument) {
      // All documents agreed to
      onComplete(true);
    } else {
      // Move to next document
      setCurrentDocumentIndex(currentDocumentIndex + 1);
    }
  };

  const handleDisagree = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Agreement Required',
      'You must agree to all terms and conditions to continue with your account creation.',
      [
        {
          text: 'Cancel Signup',
          style: 'destructive',
          onPress: () => {
            onComplete(false);
            onCancel();
          },
        },
        {
          text: 'Continue Reading',
          style: 'default',
        },
      ]
    );
  };

  const handlePDFClose = () => {
    setShowPDFViewer(false);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Cancel Signup',
      'Are you sure you want to cancel your account creation?',
      [
        {
          text: 'Continue Signup',
          style: 'cancel',
        },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            onComplete(false);
            onCancel();
          },
        },
      ]
    );
  };

  const getProgressText = () => {
    const agreedCount = agreedDocuments.size;
    const totalCount = AGREEMENT_DOCUMENTS.length;
    return `${agreedCount}/${totalCount} documents agreed`;
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Legal Agreements</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{getProgressText()}</Text>
            <View style={styles.progressBar}>
              {AGREEMENT_DOCUMENTS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index <= currentDocumentIndex && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <Ionicons name="document-text" size={32} color="#007AFF" />
                <Text style={styles.documentTitle}>{currentDocument.title}</Text>
              </View>
              
              <Text style={styles.documentDescription}>
                Please review the {currentDocument.title.toLowerCase()} carefully. 
                You must agree to this document to continue.
              </Text>

              {hasAgreedToCurrent && (
                <View style={styles.agreedIndicator}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.agreedText}>You have agreed to this document</Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={handleViewDocument}
              >
                <Ionicons name="eye" size={20} color="#007AFF" />
                <Text style={styles.viewButtonText}>View Document</Text>
              </TouchableOpacity>

              <View style={styles.agreeButtons}>
                <TouchableOpacity
                  style={[styles.agreeButton, styles.disagreeButton]}
                  onPress={handleDisagree}
                >
                  <Text style={styles.disagreeButtonText}>Disagree</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.agreeButton,
                    styles.agreeButtonStyle,
                    hasAgreedToCurrent && styles.agreedButton,
                  ]}
                  onPress={handleAgree}
                >
                  <Text style={[
                    styles.agreeButtonText,
                    hasAgreedToCurrent && styles.agreedButtonText,
                  ]}>
                    {hasAgreedToCurrent ? 'Agreed' : isLastDocument ? 'Complete' : 'Agree & Continue'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* PDF Viewer Modal */}
      <PDFViewer
        visible={showPDFViewer}
        onClose={handlePDFClose}
        pdfPath={currentDocument.pdfPath}
        title={currentDocument.title}
        showAgreeButton={true}
        onAgree={() => {
          setShowPDFViewer(false);
          handleAgree();
        }}
        onDisagree={() => {
          setShowPDFViewer(false);
          handleDisagree();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 60,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  documentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 12,
  },
  documentDescription: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  agreedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  agreedText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 8,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 16,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    gap: 8,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  agreeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  agreeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disagreeButton: {
    backgroundColor: '#F2F2F7',
  },
  agreeButtonStyle: {
    backgroundColor: '#007AFF',
  },
  agreedButton: {
    backgroundColor: '#34C759',
  },
  disagreeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  agreeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  agreedButtonText: {
    color: '#FFFFFF',
  },
});

