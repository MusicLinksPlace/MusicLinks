import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// LOGS ULTRA-PRÉCOCES - AVANT RENDER
console.log('🚀 MAIN - React démarrage');
console.log('🌐 MAIN - URL actuelle:', window.location.href);
console.log('🌐 MAIN - Pathname:', window.location.pathname);
console.log('🌐 MAIN - Hash:', window.location.hash);
console.log('🌐 MAIN - Search:', window.location.search);

createRoot(document.getElementById("root")!).render(<App />);
