import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA functionality
// This provides auto-update and offline support
const updateSW = registerSW({
    onNeedRefresh() {
        // Auto-update the service worker when new version is available
        updateSW(true)
    },
    onOfflineReady() {
        console.log('✅ App ready to work offline')
    },
    onRegistered(registration) {
        console.log('✅ Service Worker registered')
    },
    onRegisterError(error) {
        console.error('❌ Service Worker registration error:', error)
    }
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
