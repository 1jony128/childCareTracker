import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomePage from './pages/WelcomePage';
import ChildrenListPage from './pages/ChildrenListPage';
import ChildProfilePage from './pages/ChildProfilePage';
import ActivitySelectPage from './pages/ActivitySelectPage';
import ActivityHistoryPage from './pages/ActivityHistoryPage';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['/', 'http://localhost:19006', 'https://yourdomain.com'],
  config: {
    screens: {
      Welcome: '',
      ChildrenList: 'children',
      ChildProfile: 'children/:childId',
      ActivitySelect: 'activity/:childId',
      ActivityHistory: 'history/:childId',
    },
  },
};

export default function Router() {
  return (
    <NavigationContainer linking={linking} theme={DefaultTheme}>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomePage} options={{ headerShown: false }} />
        <Stack.Screen name="ChildrenList" component={ChildrenListPage} options={{ title: 'Дети' }} />
        <Stack.Screen name="ChildProfile" component={ChildProfilePage} options={{ title: 'Профиль ребенка' }} />
        <Stack.Screen name="ActivitySelect" component={ActivitySelectPage} options={{ title: 'Выбор активности' }} />
        <Stack.Screen name="ActivityHistory" component={ActivityHistoryPage} options={{ title: 'История' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 