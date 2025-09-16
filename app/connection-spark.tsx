import { useRouter } from 'expo-router';
import React from 'react';

export default function ConnectionSparkPage() {
  const router = useRouter();

  // Redirect to the new main page
  React.useEffect(() => {
    router.replace('/connection-spark-main');
  }, []);

  return null; // This component will unmount immediately
}
 