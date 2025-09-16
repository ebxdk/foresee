import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { QuestionnaireProvider } from '../utils/QuestionnaireContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              name="quotes" 
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
        </ThemeProvider>
      </QuestionnaireProvider>
    </GestureHandlerRootView>
  );
}
