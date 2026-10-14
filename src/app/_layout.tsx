import { Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Outfit_700Bold });

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}