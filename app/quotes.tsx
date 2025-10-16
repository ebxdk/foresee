import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { getValidAccessToken, signInWithSpotify } from '../services/spotifyAuth';
import { spotifyRemote } from '../services/SpotifyRemote';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface Quote {
  id: number;
  text: string;
  keywords: string[];
  gradientColors: string[];
  spotifyUri: string; // spotify:track:...
  startMs: number; // where to start playback
}

const DEFAULT_TRACK_URI = 'spotify:track:3ZCTVFBt2Brf31RLEnCkWJ'; // Example track URI

const quotes: Quote[] = [
  {
    id: 1,
    text: "You were never meant to run on empty.",
    keywords: ["empty"],
    gradientColors: ['#FF6B6B', '#FF8E8E'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 2,
    text: "Every yes costs something.",
    keywords: ["yes"],
    gradientColors: ['#4ECDC4', '#6ED4D2'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 3,
    text: "Your capacity is elastic, not infinite.",
    keywords: ["elastic", "infinite"],
    gradientColors: ['#45B7D1', '#6BC5E0'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 4,
    text: "You need permission to pause.",
    keywords: ["permission", "pause"],
    gradientColors: ['#9B59B6', '#B06AC1'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 5,
    text: "Burnout starts with a flicker.",
    keywords: ["Burnout", "flicker"],
    gradientColors: ['#F39C12', '#F7B32B'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  }
];

export default function QuotesPage() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [authReady, setAuthReady] = useState(false);

  // Ensure Spotify auth before attempting App Remote
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      const existing = await getValidAccessToken();
      if (!existing) {
        await signInWithSpotify([
          'app-remote-control',
          'user-modify-playback-state',
          'user-read-playback-state',
          'user-read-email',
          'user-read-private',
        ]);
      }
      if (mounted) setAuthReady(true);
    };
    initAuth();
    return () => {
      mounted = false;
      spotifyRemote.pause().catch(() => {});
    };
  }, []);

  const renderQuoteText = (quote: Quote) => {
    const words = quote.text.split(' ');
    return (
      <Text style={styles.quoteText}>
        {words.map((word, index) => {
          const cleanWord = word.replace(/[.,!?;:]/, '');
          const isKeyword = quote.keywords.includes(cleanWord);
          const punctuation = word.match(/[.,!?;:]$/)?.[0] || '';
          
          return (
            <Text key={index}>
              <Text style={isKeyword ? styles.quoteKeyword : styles.quoteNormal}>
                {cleanWord}
              </Text>
              {punctuation && (
                <Text style={styles.quoteNormal}>{punctuation}</Text>
              )}
              {index < words.length - 1 && <Text style={styles.quoteNormal}> </Text>}
            </Text>
          );
        })}
      </Text>
    );
  };

  const renderQuote = ({ item }: { item: Quote }) => (
    <LinearGradient
      colors={item.gradientColors as [string, string]}
      style={styles.slideContainer}
    >
      <View style={styles.quoteCard}>
        <View style={styles.quoteContent}>
          {renderQuoteText(item)}
        </View>
      </View>
    </LinearGradient>
  );

  const onViewableItemsChanged = useRef(async ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index as number;
      setCurrentIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const item: Quote = quotes[index];
      if (authReady && item?.spotifyUri) {
        await spotifyRemote.playUriAt(item.spotifyUri, item.startMs).catch(() => {});
      }
    } else {
      await spotifyRemote.pause().catch(() => {});
    }
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Bell Notification Icon */}
      <TouchableOpacity style={styles.bellButton}>
        <Text style={styles.bellIcon}>🔔</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={quotes}
        renderItem={renderQuote}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 90,
        }}
        getItemLayout={(data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  slideContainer: {
    height: screenHeight,
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    paddingTop: 40,
    paddingRight: 40,
    paddingBottom: 40,
    paddingLeft: 24,
    width: screenWidth - 48,
    minHeight: 600,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  quoteContent: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  quoteText: {
    textAlign: 'left',
    lineHeight: 60,
    fontFamily: 'System',
  },
  quoteKeyword: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quoteNormal: {
    fontSize: 48,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bellButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bellIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
}); 