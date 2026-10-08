import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { LanguageProvider, initialLanguage } from './i18n/react';
import { localizePage } from './i18n/page';
import './styles.css';

localizePage(initialLanguage());
ReactDOM.createRoot(document.getElementById('studio')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
);
