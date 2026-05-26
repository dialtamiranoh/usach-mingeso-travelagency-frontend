// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'
import App from './App'
import './scss/styles.scss'

const eventLogger = (event, error) => {
    console.log('Keycloak event:', event, error)
}

const tokenLogger = (tokens) => {
    console.log('Keycloak tokens:', tokens)
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ReactKeycloakProvider
            authClient={keycloak}
            onEvent={eventLogger}
            onTokens={tokenLogger}
            initOptions={{
                onLoad: 'login-required',
                checkLoginIframe: false
            }}
        >
            <App />
        </ReactKeycloakProvider>
    </StrictMode>
)