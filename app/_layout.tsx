import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { registerDecayBackgroundFetch } from '../utils/backgroundTasks';
import { initializeNotifications } from '../utils/notificationService';
import { QuestionnaireProvider } from '../utils/QuestionnaireContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Register background fetch task that runs decay/score tails
    registerDecayBackgroundFetch();
    
    // Initialize notification system
    initializeNotifications().catch(error => {
      console.error('Failed to initialize notifications:', error);
    });
  }, []);

  // Preload image assets during splash
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const imageAssets = [
          require('../assets/images/foreseelogoapp.png'),
          require('../assets/images/8CDE2926-8B4A-44A9-84DC-18DD2CB81594-removebg-preview 2.png'),
          require('../assets/images/Capcity_Creator_Logo_copy-removebg-preview.png'),
          require('../assets/images/yearRecap.png'),
          require('../assets/images/gourmet-almond-1.png'),
          require('../assets/images/9916415.png'),
          require('../assets/images/hummus.png'),
          require('../assets/images/wholeGrainCrackers.png'),
          require('../assets/images/2646928.png'),
          require('../assets/images/6113369.png'),
          require('../assets/images/6113506.png'),
          require('../assets/images/flax.png'),
          require('../assets/images/chiaseeds.png'),
          require('../assets/images/pumpkinSeed.png'),
          require('../assets/images/cottageCheese.png'),
          require('../assets/images/sunflowerseeds.png'),
          require('../assets/images/pistacio.png'),
          require('../assets/images/dates.png'),
          require('../assets/images/avatar.png'),
          require('../assets/images/toolsimg2.png'),
          require('../assets/images/toolsimg.png'),
          require('../assets/images/splash-icon.png'),
          require('../assets/images/react-logo@3x.png'),
          require('../assets/images/react-logo@2x.png'),
          require('../assets/images/react-logo.png'),
          require('../assets/images/partial-react-logo.png'),
          require('../assets/images/favicon.png'),
          require('../assets/images/adaptive-icon.png'),
        ];

        await Promise.all(imageAssets.map(src => Asset.fromModule(src).downloadAsync()));
        setAssetsLoaded(true);
      } catch (e) {
        console.warn('Asset preload failed', e);
        setAssetsLoaded(true); // proceed even if some assets fail
      }
    };

    loadAssets();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (loaded && assetsLoaded) {
      await SplashScreen.hideAsync();
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => setOverlayVisible(false));
    }
  }, [loaded, assetsLoaded, overlayOpacity]);

  if (!loaded || !assetsLoaded) {
    return null; // Keep splash visible
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QuestionnaireProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="get-started" />
            <Stack.Screen name="login-signup" />
            <Stack.Screen 
              name="name-input" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="email-input" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="verification-code" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="password-setup" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="question-1" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="question-2" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="question-3" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="question-4" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="question-5" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="question-6" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="question-7" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="question-8" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="question-9" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="question-10" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="epc-score" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="subscription" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="quotes" 
              options={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
          <Stack.Screen 
            name="spotify-diagnostics" 
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="connect-apps" />
            <Stack.Screen name="loading" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="(modals)" 
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="tasks" 
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            />
            <Stack.Screen 
              name="burnout-details" 
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            />
            <Stack.Screen 
              name="scores-details" 
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            />
            <Stack.Screen 
              name="capacity-recap-stories" 
              options={{
                presentation: 'fullScreenModal',
                headerShown: false,
                gestureEnabled: false, // We handle gestures manually
                animation: 'fade',
              }}
            />
            <Stack.Screen 
              name="hydration-intake-modal" 
              options={{
                presentation: 'card',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="hydration-habit-stacking" 
              options={{
                presentation: 'card',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="hydration-summary" 
              options={{
                presentation: 'card',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen 
              name="post-it-task-entry" 
              options={{
                presentation: 'card',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="post-it-task-select" 
              options={{
                presentation: 'card',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="post-it-timer" 
              options={{
                presentation: 'card',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="post-it-congrats" 
              options={{
                presentation: 'card',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="oxygen-mask-get-started" 
              options={{
                presentation: 'card',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="oxygen-mask-breathe" 
              options={{
                presentation: 'card',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen 
              name="oxygen-mask-complete" 
              options={{
                presentation: 'card',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
            <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Oops!' }} />
          </Stack>
          <StatusBar style="dark" translucent={false} backgroundColor="#FFFFFF" />
          {overlayVisible ? (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                opacity: overlayOpacity,
              }}
            >
              <Image
                source={require('../assets/images/foreseelogoapp.png')}
                style={{ width: 180, height: 180, resizeMode: 'contain' }}
              />
            </Animated.View>
          ) : null}
        </ThemeProvider>
      </QuestionnaireProvider>
    </GestureHandlerRootView>
  );
}
