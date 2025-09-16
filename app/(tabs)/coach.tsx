// Removed useBottomTabBarHeight import as it's not compatible with Expo Router
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    LayoutAnimation,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    UIManager,
    View
} from 'react-native';
import ReanimatedAnimated, { FadeIn } from 'react-native-reanimated';
import { convertToOpenAIMessages, getChatCompletionStream } from '../../services/openai';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const sidebarAnimation = useRef(new Animated.Value(0)).current;
  const blurAnimation = useRef(new Animated.Value(0)).current;
  const lastHapticTime = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userScrollEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNearBottom = useRef(true);
  const lastContentHeight = useRef(0);
  
  // Use a constant for tab bar height since we're using Expo Router tabs
  const tabBarHeight = 88; // Based on the tab bar height from _layout.tsx

  const suggestedPrompts = [
    "How can I improve my energy levels?",
    "Help me plan my day effectively",
    "What are some strategies for managing stress?",
    "How can I build stronger connections with others?",
    "Suggest a short mindfulness exercise."
  ];

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsInputFocused(true);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        setKeyboardHeight(0);
        setIsInputFocused(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [tabBarHeight]); // inputContainerAnimation removed from dependency array

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      if (userScrollEndTimeout.current) {
        clearTimeout(userScrollEndTimeout.current);
      }
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const scrollToBottom = (contentWidth: number, contentHeight: number) => {
    if (!isUserScrolling && isNearBottom.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    lastContentHeight.current = contentHeight;
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50; // 50 is a tolerance
    isNearBottom.current = isAtBottom;
  };

  const handleScrollEnd = () => {
    if (userScrollEndTimeout.current) {
      clearTimeout(userScrollEndTimeout.current);
    }
    userScrollEndTimeout.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 500); // Debounce scroll end
  };

  const handleScrollBeginDrag = () => {
    setIsUserScrolling(true);
    if (userScrollEndTimeout.current) {
      clearTimeout(userScrollEndTimeout.current);
    }
  };

  const openSidebar = () => {
    setSidebarVisible(true);
    LayoutAnimation.configureNext({
      duration: 450,
      create: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.9,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.9,
      },
    });

    Animated.parallel([
      Animated.spring(sidebarAnimation, {
        toValue: 1,
        useNativeDriver: false,
        tension: 40,
        friction: 10,
      }),
      Animated.timing(blurAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closeSidebar = () => {
    LayoutAnimation.configureNext({
      duration: 400,
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.95,
      },
    });

    Animated.parallel([
      Animated.spring(sidebarAnimation, {
        toValue: 0,
        useNativeDriver: false,
        tension: 50,
        friction: 12,
      }),
      Animated.timing(blurAnimation, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setSidebarVisible(false);
    });
  };

  const startNewChat = () => {
    if (messages.length > 0 && currentChatId) {
      const chatToUpdate = chatHistory.find(chat => chat.id === currentChatId);
      if (chatToUpdate) {
        setChatHistory(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages, lastMessage: messages[messages.length - 1]?.text || '' }
            : chat
        ));
      }
    } else if (messages.length > 0) {
      const newChat: ChatHistory = {
        id: Date.now().toString(),
        title: generateChatTitle(messages[0]?.text || 'New Chat'),
        lastMessage: messages[messages.length - 1]?.text || '',
        timestamp: new Date(),
        messages: messages
      };
      setChatHistory(prev => [newChat, ...prev]);
    }
    setMessages([]);
    setCurrentChatId(null);
    closeSidebar();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const loadChat = (chat: ChatHistory) => {
    if (messages.length > 0 && currentChatId && currentChatId !== chat.id) {
      setChatHistory(prev => prev.map(c => 
        c.id === currentChatId 
          ? { ...c, messages, lastMessage: messages[messages.length - 1]?.text || '' }
          : c
      ));
    }
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    closeSidebar();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setMessages([]);
      setCurrentChatId(null);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.trim().split(' ').slice(0, 4);
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    if (messages.length === 0) {
      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
      const newChat: ChatHistory = {
        id: newChatId,
        title: generateChatTitle(userMessage.text),
        lastMessage: userMessage.text,
        timestamp: new Date(),
        messages: newMessages
      };
      setChatHistory(prev => [newChat, ...prev]);
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    isNearBottom.current = true;
    setIsUserScrolling(false);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);

    getAIResponseStream(userMessage.text, newMessages);
  };

  const getAIResponseStream = async (userInput: string, conversationHistory: Message[]): Promise<void> => {
    try {
      setIsThinking(true);
      setIsTyping(false);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const openAIMessages = convertToOpenAIMessages(
        conversationHistory.map(msg => ({ text: msg.text, isUser: msg.isUser }))
      );
      
      openAIMessages.push({ role: 'user', content: userInput });
      
      const streamingMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        isUser: false,
        timestamp: new Date(),
      };
      
      let accumulatedText = '';
      let isFirstChunk = true;
      
      for await (const chunk of getChatCompletionStream(openAIMessages)) {
        if (isFirstChunk) {
          setIsThinking(false);
          setStreamingMessage(streamingMsg);
          typingAnimation.stopAnimation();
          isFirstChunk = false;
        }
        
        accumulatedText += chunk;
        setStreamingMessage(prev => prev ? { ...prev, text: accumulatedText } : null);
        
        const now = Date.now();
        if (now - lastHapticTime.current > 200) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          lastHapticTime.current = now;
        }
        
        if (!isUserScrolling && isNearBottom.current) {
          if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
          }
          scrollTimeout.current = setTimeout(() => {
            if (!isUserScrolling && isNearBottom.current) {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }, 300);
        }
      }
      
      const finalMessage: Message = {
        ...streamingMsg,
        text: accumulatedText || "I'm sorry, I couldn't generate a response right now.",
      };
      
      setMessages(prev => [...prev, finalMessage]);
      setStreamingMessage(null);
      setIsThinking(false);
      
      setTimeout(() => {
        if (!isUserScrolling && isNearBottom.current) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }, 150);
      
      if (currentChatId) {
        setChatHistory(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: [...conversationHistory, finalMessage], lastMessage: finalMessage.text }
            : chat
        ));
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error getting AI response stream:', error);
      setStreamingMessage(null);
      setIsTyping(false);
      setIsThinking(false);
      typingAnimation.stopAnimation();
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorResponse]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Automatically send the message after selecting a prompt
    // sendMessage(); // This would send immediately, might not be desired.
  };

  const formatAIText = (text: string) => {
    if (!text) return text;

    const lines = text.split('\n');
    const formattedElements: any[] = [];

    lines.forEach((line, lineIndex) => {
      if (line.match(/^#{1,3}\s+/)) {
        const level = line.match(/^#+/)?.[0].length || 1;
        const headerText = line.replace(/^#+\s+/, '');
        const fontSize = level === 1 ? 20 : level === 2 ? 18 : 16;
        const fontWeight = level === 1 ? '700' : level === 2 ? '600' : '500';
        
        formattedElements.push(
          <Text key={`header-${lineIndex}`} style={[styles.aiMessageText, { fontSize, fontWeight, marginTop: lineIndex > 0 ? 8 : 0, marginBottom: 4 }]}>
            {headerText}
          </Text>
        );
        return;
      }

      if (line.match(/^[\s]*[-*]\s+/)) {
        const indent = (line.match(/^[\s]*/)?.[0].length || 0) * 10;
        const bulletText = line.replace(/^[\s]*[-*]\s+/, '');
        
        formattedElements.push(
          <Text key={`bullet-${lineIndex}`} style={[styles.aiMessageText, { marginLeft: indent, marginTop: 2 }]}>
            <Text style={{ fontWeight: '600' }}>• </Text>
            {formatInlineText(bulletText)}
          </Text>
        );
        return;
      }

      if (line.match(/^[\s]*\d+\.\s+/)) {
        const indent = (line.match(/^[\s]*/)?.[0].length || 0) * 10;
        const numberMatch = line.match(/^[\s]*(\d+)\.\s+/);
        const number = numberMatch?.[1] || '1';
        const listText = line.replace(/^[\s]*\d+\.\s+/, '');
        
        formattedElements.push(
          <Text key={`number-${lineIndex}`} style={[styles.aiMessageText, { marginLeft: indent, marginTop: 2 }]}>
            <Text style={{ fontWeight: '600' }}>{number}. </Text>
            {formatInlineText(listText)}
          </Text>
        );
        return;
      }

      if (line.match(/^```/)) {
        const codeText = line.replace(/```/g, '');
        if (codeText.trim()) {
          formattedElements.push(
            <Text key={`code-${lineIndex}`} style={[styles.aiMessageText, { backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontFamily: 'Menlo, Monaco, monospace', fontSize: 15, marginVertical: 2 }]}>
              {codeText}
            </Text>
          );
        }
        return;
      }

      if (line.trim()) {
        formattedElements.push(
          <Text key={`text-${lineIndex}`} style={[styles.aiMessageText, { marginTop: lineIndex > 0 && formattedElements.length > 0 ? 4 : 0 }]}>
            {formatInlineText(line)}
          </Text>
        );
      } else if (formattedElements.length > 0) {
        formattedElements.push(
          <Text key={`space-${lineIndex}`} style={[styles.aiMessageText, { height: 8 }]}>{' '}</Text>
        );
      }
    });

    return formattedElements.length > 0 ? formattedElements : text;
  };

  const formatInlineText = (text: string) => {
    if (!text) return text;

    const elements: any[] = [];
    let currentIndex = 0;
    
    const patterns = [
      { regex: /\*\*(.*?)\*\*/g, style: { fontWeight: '700' } },
      { regex: /\*(.*?)\*/g, style: { fontWeight: '600' } },
      { regex: /_(.*?)_/g, style: { fontStyle: 'italic' } },
      { regex: /`(.*?)`/g, style: { backgroundColor: '#F5F5F5', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3, fontFamily: 'Menlo, Monaco, monospace', fontSize: 15 } },
    ];

    const allMatches: any[] = [];
    patterns.forEach((pattern, patternIndex) => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[1],
          style: pattern.style,
          fullMatch: match[0]
        });
      }
    });

    allMatches.sort((a, b) => a.start - b.start);

    const filteredMatches = allMatches.filter((match, index) => {
      for (let i = 0; i < index; i++) {
        if (allMatches[i].end > match.start) {
          return false;
        }
      }
      return true;
    });

    if (filteredMatches.length === 0) {
      return text;
    }

    filteredMatches.forEach((match, index) => {
      if (match.start > currentIndex) {
        const beforeText = text.substring(currentIndex, match.start);
        elements.push(beforeText);
      }

      elements.push(
        <Text key={`format-${index}`} style={match.style}>
          {match.content}
        </Text>
      );

      currentIndex = match.end;
    });

    if (currentIndex < text.length) {
      elements.push(text.substring(currentIndex));
    }

    return elements;
  };

  const renderMessage = (message: Message) => (
    <ReanimatedAnimated.View 
      key={message.id} 
      style={[
        styles.messageContainer, 
        message.isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}
    >
      <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
        {message.isUser ? (
          <Text style={[styles.messageText, styles.userMessageText]}>
            {message.text}
          </Text>
        ) : (
          <Text style={[styles.messageText, styles.aiMessageText]}>
            {formatAIText(message.text)}
          </Text>
        )}
      </View>
    </ReanimatedAnimated.View>
  );

  const renderTypingIndicator = () => {
    const dot1 = typingAnimation.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.4, 1, 0.4, 0.4],
    });
    const dot2 = typingAnimation.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.4, 0.4, 1, 0.4],
    });
    const dot3 = typingAnimation.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.4, 0.4, 0.4, 1],
    });

    return (
      <ReanimatedAnimated.View 
        style={[styles.messageContainer, styles.aiMessageContainer]}
      >
        <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
          <View style={styles.typingIndicator}>
            <ReanimatedAnimated.View style={[styles.typingDot, { opacity: dot1 }]} />
            <ReanimatedAnimated.View style={[styles.typingDot, { opacity: dot2 }]} />
            <ReanimatedAnimated.View style={[styles.typingDot, { opacity: dot3 }]} />
          </View>
        </View>
      </ReanimatedAnimated.View>
    );
  };

  const renderThinkingIndicator = () => {
    const pulseAnimation = typingAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.6, 1, 0.6],
    });

    const scaleAnimation = typingAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.98, 1.02, 0.98],
    });

    const shimmerAnimation = typingAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0],
    });

    return (
      <ReanimatedAnimated.View 
        style={[styles.messageContainer, styles.aiMessageContainer]}
      >
        <ReanimatedAnimated.View style={[
          styles.thinkingBubble,
          {
            opacity: pulseAnimation,
            transform: [{ scale: scaleAnimation }],
          }
        ]}>
          <View style={styles.thinkingContent}>
            <View style={styles.thinkingIcon}>
              <ReanimatedAnimated.View style={[
                styles.thinkingShimmer,
                {
                  opacity: shimmerAnimation,
                }
              ]} />
              <Text style={styles.thinkingIconText}>🧠</Text>
            </View>
            <Text style={styles.thinkingText}>Thinking...</Text>
            <View style={styles.thinkingDots}>
              <ReanimatedAnimated.View style={[styles.thinkingDot, { opacity: pulseAnimation }]} />
              <ReanimatedAnimated.View style={[styles.thinkingDot, { opacity: pulseAnimation }]} />
              <ReanimatedAnimated.View style={[styles.thinkingDot, { opacity: pulseAnimation }]} />
            </View>
          </View>
        </ReanimatedAnimated.View>
      </ReanimatedAnimated.View>
    );
  };

  const renderSidebar = () => {
    const sidebarTranslateX = sidebarAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-screenWidth * 0.85, 0],
    });

    const blurOpacity = blurAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Modal
        visible={sidebarVisible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
        statusBarTranslucent
      >
        <View style={styles.sidebarContainer}>
          {/* Apple-style Frosted Glass Blur Background */}
          <ReanimatedAnimated.View 
            style={[
              styles.blurBackground,
              {
                opacity: blurOpacity,
              }
            ]}
          >
            <BlurView
              intensity={100}
              style={StyleSheet.absoluteFillObject}
              tint="systemMaterial"
            />
            {/* Additional frosted glass overlay */}
            <View style={styles.frostedOverlay} />
            <TouchableWithoutFeedback onPress={closeSidebar}>
              <View style={styles.overlayTouchable} />
            </TouchableWithoutFeedback>
          </ReanimatedAnimated.View>
          
          {/* Sidebar without bounce animation */}
          <ReanimatedAnimated.View 
            style={[
              styles.sidebar,
              { 
                transform: [{ translateX: sidebarTranslateX }],
                borderTopRightRadius: 24,
                borderBottomRightRadius: 24,
              }
            ]}
          >
            <SafeAreaView style={styles.sidebarContent}>
              {/* Sidebar Header */}
              <View style={styles.sidebarHeader}>
                <TouchableOpacity
                  style={styles.newChatButton}
                  onPress={startNewChat}
                  activeOpacity={0.8}
                >
                  <Text style={styles.newChatIcon}>+</Text>
                  <Text style={styles.newChatText}>New Chat</Text>
              </TouchableOpacity>
            </View>

              {/* Chat History */}
              <ScrollView style={styles.chatHistoryContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.historyTitle}>Recent Chats</Text>
                {chatHistory.map((chat) => (
                  <TouchableOpacity
                    key={chat.id}
                    style={[
                      styles.chatHistoryItem,
                      currentChatId === chat.id && styles.activeChatItem
                    ]}
                    onPress={() => loadChat(chat)}
                    onLongPress={() => deleteChat(chat.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.chatItemContent}>
                      <Text style={styles.chatTitle} numberOfLines={1}>
                        {chat.title}
                      </Text>
                      <Text style={styles.chatLastMessage} numberOfLines={2}>
                        {chat.lastMessage}
                      </Text>
                      <Text style={styles.chatTimestamp}>
                        {formatRelativeTime(chat.timestamp)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {chatHistory.length === 0 && (
                  <View style={styles.emptyChatHistory}>
                    <Text style={styles.emptyChatText}>No chat history yet</Text>
                    <Text style={styles.emptyChatSubtext}>Start a conversation to see your chats here</Text>
          </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </ReanimatedAnimated.View>
        </View>
      </Modal>
    );
  };

  // This handles auto-scrolling when new messages arrive
  useEffect(() => {
    // Only auto-scroll if user isn't manually scrolling or if content height changed significantly (new message)
    if (!isUserScrolling && isNearBottom.current) {
      // Add a small delay to ensure layout has updated after new message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, streamingMessage, isUserScrolling, isNearBottom.current]); // Depend on messages, streaming message, and user scroll status

  const renderMessages = () => {
    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: tabBarHeight + 100 } // Dynamically set paddingBottom
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToBottom}
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50; // 50 is a tolerance
          isNearBottom.current = isAtBottom;
        }}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEnd}
      >
        {messages.map(renderMessage)}

        {/* Thinking indicator */}
        {isThinking && renderThinkingIndicator()}

        {/* Streaming message */}
        {streamingMessage && renderMessage(streamingMessage)}

        {/* Typing indicator (optional, if distinct from thinking) */}
        {isTyping && renderTypingIndicator()}
      </ScrollView>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ReanimatedAnimated.View 
        style={styles.container}
        entering={FadeIn.duration(200)}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={openSidebar}
            activeOpacity={0.6}
          >
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Capacity Coach</Text>
          </View>
          {/* Placeholder to balance the header when menu is open/closed */}
          <View style={styles.menuButtonPlaceholder} />
        </View>

        {/* EK Icon - moved outside the header to float */}
        <LinearGradient
          colors={['#D1D1D6', '#8E8E93']} // Subtle gradient from lighter to darker grey
          style={styles.profileIconAbsolute} // Removed inline style adjustment
        >
          <Text style={styles.profileInitials}>EK</Text>
        </LinearGradient>

        {/* Main Content Area */}
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0} // Set offset for iOS to 0 as input container handles tab bar
        >
          {renderMessages()}
        </KeyboardAvoidingView>

        {/* Suggested prompts (only show if no messages yet and input not focused) */}
        {messages.length === 0 && !isInputFocused && (
          <View 
            style={[
              styles.suggestedPromptsContainer,
              { bottom: tabBarHeight + 70 } // Initial guess, will refine
            ]}
          >
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedPromptsScrollContent}
            >
              {suggestedPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestedPrompt}
                  onPress={() => handleSuggestedPrompt(prompt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestedPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input area */}
        <ReanimatedAnimated.View style={[
          styles.inputContainer,
          { paddingBottom: tabBarHeight } // Dynamically set paddingBottom here
        ]}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              activeOpacity={0.7}
            >
              <Text style={styles.attachIcon}>+</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask anything"
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={500}
              textAlignVertical="center"
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />
            <TouchableOpacity 
              style={styles.micButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              activeOpacity={0.7}
            >
              <Text style={styles.micIcon}>🎤</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.sendButton,
                inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={inputText.trim() ? sendMessage : () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              activeOpacity={0.8}
              disabled={!inputText.trim()}
            >
              <Text style={[
                styles.sendIcon,
                inputText.trim() ? styles.sendIconActive : styles.sendIconInactive
              ]}>
                ↑
              </Text>
            </TouchableOpacity>
          </View>
        </ReanimatedAnimated.View>

        {/* Sidebar */}
        {renderSidebar()}
      </ReanimatedAnimated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA', // Off-white background
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Revert to space-between
    // Removed paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.33,
    borderBottomColor: '#E5E5EA',
    zIndex: 1,
  },
  menuButton: {
    // position: 'absolute',
    left: 20, // Align with screen edge
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: '#1C1C1E',
    marginVertical: 2,
    borderRadius: 1,
  },
  headerCenter: {
    flex: 1, // Take up available space
    alignItems: 'center', // Center content horizontally
    // Removed position: 'absolute',
    // Removed left: 0,
    // Removed right: 0,
  },
  headerTitle: {
    fontSize: 20, // Smaller and modest
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.45,
  },
  menuButtonPlaceholder: {
    width: 44, // Same width as menuButton to balance spacing
    height: 44,
    // Adjust positioning as needed if it impacts the EK icon
  },
  // Removed refreshButton and refreshIcon styles
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageContainer: {
    marginVertical: 3,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#F2F2F7',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: -0.41,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#1C1C1E',
  },
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
    marginHorizontal: 2,
  },
  suggestedPromptsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Removed paddingHorizontal: 20,
    // Removed marginBottom: 10,
    backgroundColor: 'transparent', // Transparent background for the floating container
  },
  suggestedPromptsScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10, // Adjust padding for the scrollable content
  },
  suggestedPrompt: {
    backgroundColor: '#FFFFFF', // Changed to white
    borderRadius: 8, // Made rectangular
    paddingHorizontal: 16,
    paddingVertical: 8, // Reduced vertical padding
    marginBottom: 8,
    marginRight: 10, // Added right margin for horizontal spacing
    borderWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 }, // Reduced shadow offset
    shadowOpacity: 0.05, // Reduced opacity for lighter shadow
    shadowRadius: 3, // Reduced radius for lighter shadow
    elevation: 2, // Reduced elevation
  },
  suggestedPromptText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    lineHeight: 20,
    letterSpacing: -0.41,
  },
  inputContainer: {
    // Removed position: 'absolute', left, right, and bottom
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    // Removed shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9F9F9',
    borderRadius: 22,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 0,
    marginBottom: 10,
    // Removed shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  attachIcon: {
    fontSize: 20,
    fontWeight: '300',
    color: '#8E8E93',
    lineHeight: 22,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    color: '#1C1C1E',
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    maxHeight: 120,
    minHeight: 36,
    letterSpacing: -0.41,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  micIcon: {
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonInactive: {
    backgroundColor: '#F2F2F7',
  },
  sendIcon: {
    fontSize: 20,
    fontWeight: '300',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  sendIconActive: {
    color: '#FFFFFF',
  },
  sendIconInactive: {
    color: '#8E8E93',
  },
  profileIconAbsolute: {
    position: 'absolute',
    top: 50, // Re-adding top to correctly position the EK icon
    right: 20, // Align with screen edge
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Higher z-index to float above everything
  },
  profileInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text for better contrast on darker background
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  // Sidebar Styles
  sidebarContainer: {
    flex: 1,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  frostedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(20px) saturate(180%)',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: screenWidth * 0.85,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  sidebarHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 0.33,
    borderBottomColor: '#E5E5EA',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  newChatIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 10,
  },
  newChatText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: -0.41,
  },
  chatHistoryContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 24,
    marginBottom: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: -0.41,
  },
  chatHistoryItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    borderWidth: 0.33,
    borderColor: '#E5E5EA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activeChatItem: {
    backgroundColor: '#EBF5FF',
    borderColor: '#007AFF',
    borderWidth: 1,
    shadowColor: '#007AFF',
    shadowOpacity: 0.1,
  },
  chatItemContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: -0.41,
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  emptyChatHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyChatText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  emptyChatSubtext: {
    fontSize: 15,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  // Thinking Indicator Styles
  thinkingBubble: {
    backgroundColor: '#F0F8FF',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginVertical: 3,
    maxWidth: screenWidth * 0.75,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thinkingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thinkingIcon: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thinkingIconText: {
    fontSize: 18,
    lineHeight: 22,
  },
  thinkingShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderRadius: 12,
  },
  thinkingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: -0.32,
    marginLeft: 12,
    flex: 1,
  },
  thinkingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginHorizontal: 1.5,
  },
  // These are the new styles from the last attempt - I need to integrate them correctly
  messagesScrollView: {
    flex: 1,
  },
  messagesContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  thinkingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  samplePromptsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  samplePromptButton: {
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 10,
    borderWidth: 0.33,
    borderColor: '#D1D1D6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  samplePromptText: {
    fontSize: 17,
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    lineHeight: 24,
    letterSpacing: -0.41,
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: -0.41,
  },
});