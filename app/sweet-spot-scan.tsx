import { useRouter } from 'expo-router';
import React from 'react';

export default function SweetSpotScanPage() {
  const router = useRouter();

  // Redirect to the new main page
  React.useEffect(() => {
    router.replace('/sweet-spot-scan-main');
  }, []);

  return null; // This component will unmount immediately
}
 