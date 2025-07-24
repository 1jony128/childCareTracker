import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppStateProvider } from './AppState';
import Router from './router';

export default function App() {
  return (
    <PaperProvider>
      <AppStateProvider>
        <Router />
      </AppStateProvider>
    </PaperProvider>
  );
}
