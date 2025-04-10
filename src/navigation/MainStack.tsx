import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { LobbyScreen } from '../screens/Lobby/LobbyScreen';
import { ChatScreen } from '../screens/Chat/ChatScreen';

export type RootStackParamList = {
  Home: undefined;
  Lobby: { sessionId: string };
  Chat: { sessionId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Lobby" component={LobbyScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}; 