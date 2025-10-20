import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState /*, useEffect */ } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
// import { getValidAccessToken, signInWithSpotify } from '../services/spotifyAuth';
// import { spotifyRemote } from '../services/SpotifyRemote';
import { generateQuotes, GeneratedQuote } from '../services/quoteGenerator';

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
  },
  {
    id: 6,
    text: "Rest is not a luxury, it's a necessity.",
    keywords: ["Rest", "necessity"],
    gradientColors: ['#E74C3C', '#F1948A'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 7,
    text: "Your worth is not measured by your productivity.",
    keywords: ["worth", "productivity"],
    gradientColors: ['#8E44AD', '#BB8FCE'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 8,
    text: "Boundaries are love in action.",
    keywords: ["Boundaries", "love"],
    gradientColors: ['#3498DB', '#85C1E9'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 9,
    text: "You can't pour from an empty cup.",
    keywords: ["empty", "cup"],
    gradientColors: ['#E67E22', '#F5B041'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 10,
    text: "Self-care is not selfish, it's survival.",
    keywords: ["Self-care", "survival"],
    gradientColors: ['#1ABC9C', '#7DCEA0'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 11,
    text: "Your mental health is not negotiable.",
    keywords: ["mental", "health"],
    gradientColors: ['#E91E63', '#F48FB1'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 12,
    text: "Progress over perfection, always.",
    keywords: ["Progress", "perfection"],
    gradientColors: ['#673AB7', '#9575CD'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 13,
    text: "You are enough, exactly as you are.",
    keywords: ["enough"],
    gradientColors: ['#FF5722', '#FFAB91'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 14,
    text: "Recovery is not a sign of weakness.",
    keywords: ["Recovery", "weakness"],
    gradientColors: ['#795548', '#A1887F'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 15,
    text: "Your energy is sacred, protect it.",
    keywords: ["energy", "sacred"],
    gradientColors: ['#607D8B', '#90A4AE'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 16,
    text: "No is a complete sentence.",
    keywords: ["No"],
    gradientColors: ['#3F51B5', '#7986CB'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 17,
    text: "You deserve rest, not just sleep.",
    keywords: ["deserve", "rest"],
    gradientColors: ['#009688', '#4DB6AC'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 18,
    text: "Healing is not linear, and that's okay.",
    keywords: ["Healing", "linear"],
    gradientColors: ['#FF9800', '#FFB74D'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 19,
    text: "Your peace is worth more than their approval.",
    keywords: ["peace", "approval"],
    gradientColors: ['#9C27B0', '#BA68C8'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 20,
    text: "You are not your productivity.",
    keywords: ["productivity"],
    gradientColors: ['#F44336', '#EF5350'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 21,
    text: "Rest is resistance to hustle culture.",
    keywords: ["Rest", "resistance"],
    gradientColors: ['#4CAF50', '#81C784'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 22,
    text: "Your worth is not tied to your output.",
    keywords: ["worth", "output"],
    gradientColors: ['#2196F3', '#64B5F6'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 23,
    text: "Slow down, you're moving too fast.",
    keywords: ["Slow", "fast"],
    gradientColors: ['#FFC107', '#FFD54F'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 24,
    text: "You are allowed to take up space.",
    keywords: ["allowed", "space"],
    gradientColors: ['#00BCD4', '#4DD0E1'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  },
  {
    id: 25,
    text: "Your needs matter, prioritize them.",
    keywords: ["needs", "matter"],
    gradientColors: ['#CDDC39', '#DCE775'],
    spotifyUri: DEFAULT_TRACK_URI,
    startMs: 2000
  }
];

export default function QuotesPage() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // const [authReady, setAuthReady] = useState(false);
  const [allQuotes, setAllQuotes] = useState<Quote[]>(quotes);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [nextId, setNextId] = useState(26); // Start from 26 since we have 25 static quotes
  const [isLoadingMoreRef, setIsLoadingMoreRef] = useState(false); // Ref to prevent multiple calls
  const lastLoadTime = useRef(0); // Track last load time for debouncing
  const [refreshing, setRefreshing] = useState(false);

  // Ensure Spotify auth before attempting App Remote
  // useEffect(() => {
  //   let mounted = true;
  //   const initAuth = async () => {
  //     const existing = await getValidAccessToken();
  //     if (!existing) {
  //       await signInWithSpotify([
  //         'app-remote-control',
  //         'user-modify-playback-state',
  //         'user-read-playback-state',
  //         'user-read-email',
  //         'user-read-private',
  //       ]);
  //     }
  //     if (mounted) setAuthReady(true);
  //   };
  //   initAuth();
  //   return () => {
  //     mounted = false;
  //     spotifyRemote.pause().catch(() => {});
  //   };
  // }, []);

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

  const loadMoreQuotes = async () => {
    const now = Date.now();
    
    // Debounce: prevent loading if called within 2 seconds of last load
    if (now - lastLoadTime.current < 2000) {
      console.log('Debounced: Too soon since last load');
      return;
    }
    
    // Double check to prevent multiple simultaneous calls
    if (isLoadingMore || hasReachedEnd || isLoadingMoreRef) {
      console.log('Already loading or reached end');
      return;
    }
    
    lastLoadTime.current = now;
    setIsLoadingMore(true);
    setIsLoadingMoreRef(true);
    
    try {
      console.log('Loading 10 more quotes...');
      const newGeneratedQuotes = await generateQuotes(10);
      const newQuotes: Quote[] = newGeneratedQuotes.map((generated, index) => ({
        id: nextId + index, // Use sequential IDs starting from nextId
        text: generated.text,
        keywords: generated.keywords,
        gradientColors: generated.gradientColors,
        spotifyUri: DEFAULT_TRACK_URI,
        startMs: 2000
      }));
      
      setNextId(prev => prev + newQuotes.length); // Update nextId for future quotes
      setAllQuotes(prev => {
        const newTotal = prev.length + newQuotes.length;
        console.log(`Added ${newQuotes.length} new quotes. Total: ${newTotal}`);
        return [...prev, ...newQuotes];
      });
    } catch (error) {
      console.error('Error loading more quotes:', error);
    } finally {
      setIsLoadingMore(false);
      setIsLoadingMoreRef(false);
    }
  };

  const onViewableItemsChanged = useRef(async ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index as number;
      setCurrentIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Spotify playback temporarily disabled.
    // const item: Quote = allQuotes[index];
    // if (authReady && item?.spotifyUri) {
    //   await spotifyRemote.playUriAt(item.spotifyUri, item.startMs).catch(() => {});
    // } else {
    //   await spotifyRemote.pause().catch(() => {});
    // }
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMoreQuotes();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!isLoadingMore && !isLoadingMoreRef) {
      await loadMoreQuotes();
    }
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
        data={allQuotes}
        renderItem={renderQuote}
        keyExtractor={(item, index) => `quote-${item.id}-${index}`}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            title="Pull to load more quotes"
            titleColor="#FFFFFF"
          />
        }
        ListFooterComponent={() => (
          <View style={styles.footerContainer}>
            {isLoadingMore ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Generating 10 more quotes...</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.loadMoreButton} 
                onPress={handleLoadMore}
                disabled={isLoadingMore || isLoadingMoreRef}
              >
                <Text style={styles.loadMoreText}>
                  {isLoadingMore || isLoadingMoreRef ? 'Loading...' : 'Load 10 More Quotes'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  loadingContainer: {
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '600',
  },
  footerContainer: {
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadMoreText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
}); 
