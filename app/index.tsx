import { Redirect } from 'expo-router';

export default function Index() {
  // Always start from the login screen
  return <Redirect href="/get-started" />;
} 