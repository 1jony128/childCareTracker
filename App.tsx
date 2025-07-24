import React from 'react';
import { AppStateProvider } from './AppState';
import Router from './router';

export default function App() {
  return (
    <AppStateProvider>
      <Router />
    </AppStateProvider>
  );
}
