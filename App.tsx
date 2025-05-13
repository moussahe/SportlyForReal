import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AuthInitializer from './src/components/AuthInitializer';
import SessionManager from './src/components/SessionManager';
import { AuthNavigator } from './src/navigation/AuthNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Provider store={store}>
          <AuthInitializer>
            <NavigationContainer>
              <SessionManager>
                <AuthNavigator />
              </SessionManager>
            </NavigationContainer>
          </AuthInitializer>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
