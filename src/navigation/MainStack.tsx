import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { LobbyScreen } from '../screens/Lobby/LobbyScreen';
import { ChatScreen } from '../screens/Chat/ChatScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { CreateSessionScreen } from '../screens/CreateSession/CreateSessionScreen';
import ActiveSessionScreen from '../screens/ActiveSession/ActiveSessionScreen';

export type RootStackParamList = {
  Home: undefined;
  Lobby: { sessionId: string };
  ActiveSession: { sessionId: string };
  Chat: { sessionId: string };
  Profile: undefined;
  CreateSession: undefined;
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
      <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
    </Stack.Navigator>
  );
};