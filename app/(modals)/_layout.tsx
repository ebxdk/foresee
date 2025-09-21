import { TransitionPresets } from '@react-navigation/stack';
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="epc-explanation-modal"
        options={{
          ...TransitionPresets.ModalSlideFromBottomIOS,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="epc-explanation-profile"
        options={{
          ...TransitionPresets.ModalSlideFromBottomIOS,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
