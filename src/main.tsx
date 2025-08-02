import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { wpGoogleServices } from './services/wordpressStyleGoogle'

// Initialize WordPress-style Google services
wpGoogleServices.initializeAll();

createRoot(document.getElementById("root")!).render(<App />);
