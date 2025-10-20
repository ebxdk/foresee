import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PDFViewerProps {
  visible: boolean;
  onClose: () => void;
  pdfPath: string;
  title: string;
  showAgreeButton?: boolean;
  onAgree?: () => void;
  onDisagree?: () => void;
}

export default function PDFViewer({
  visible,
  onClose,
  pdfPath,
  title,
  showAgreeButton = false,
  onAgree,
  onDisagree,
}: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      if (typeof pdfPath === 'string') {
        setPdfUri(pdfPath);
        setIsLoading(false);
      } else {
        try {
          // For local files, create an HTML page that embeds the PDF
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { margin: 0; padding: 0; }
                embed { width: 100%; height: 100vh; }
              </style>
            </head>
            <body>
              <embed src="${pdfPath}" type="application/pdf" />
            </body>
            </html>
          `;
          setPdfUri(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading PDF:', error);
          Alert.alert('Error', 'Failed to load PDF. Please try again.');
          setIsLoading(false);
        }
      }
    };

    if (visible) {
      loadPDF();
    }
  }, [visible, pdfPath]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleAgree = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAgree?.();
  };

  const handleDisagree = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDisagree?.();
  };

  const handleWebViewLoad = () => {
    setIsLoading(false);
  };

  const handleWebViewError = () => {
    setIsLoading(false);
    Alert.alert('Error', 'Failed to load PDF. Please try again.');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* PDF Content */}
        <View style={styles.content}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading PDF...</Text>
            </View>
          )}
          
          {pdfUri && (
            <WebView
              source={{ uri: pdfUri }}
              style={styles.webview}
              onLoad={handleWebViewLoad}
              onError={handleWebViewError}
              startInLoadingState={true}
              scalesPageToFit={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={true}
            />
          )}
        </View>

        {/* Action Buttons */}
        {showAgreeButton && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.disagreeButton]}
              onPress={handleDisagree}
            >
              <Text style={styles.disagreeButtonText}>Disagree</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.agreeButton]}
              onPress={handleAgree}
            >
              <Text style={styles.agreeButtonText}>Agree</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disagreeButton: {
    backgroundColor: '#F2F2F7',
  },
  agreeButton: {
    backgroundColor: '#007AFF',
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
});
