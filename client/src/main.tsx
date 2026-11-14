import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';
import '@fontsource/cairo/400.css';
import './styles/tokens.css';
import { App } from './App';
import { applyToDocument, getPrefs } from './state/prefs';

applyToDocument(getPrefs());
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
