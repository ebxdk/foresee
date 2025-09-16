import { useRouter } from 'expo-router';
import React from 'react';

export default function MentalUnloadPage() {
  const router = useRouter();

  // Redirect to the new main page
  React.useEffect(() => {
    router.replace('/mental-unload-main');
  }, []);

  return null; // This component will unmount immediately
}

 