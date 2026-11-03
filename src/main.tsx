import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LocalizationProvider } from './context/LocalizationContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <LocalizationProvider>
    <App />
  </LocalizationProvider>
);
