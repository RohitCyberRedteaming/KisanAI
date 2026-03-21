import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../contexts/AppContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './login';

function RootNavigator() {
  const { isLoggedIn, login } = useApp();
  if (!isLoggedIn) {
    return <LoginScreen onLogin={login} />;
  }
  return (
    <>
      <StatusBar style="light" backgroundColor="#1a4d14" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="analyzing" options={{ presentation: 'modal' }} />
        <Stack.Screen name="scan-detail" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
