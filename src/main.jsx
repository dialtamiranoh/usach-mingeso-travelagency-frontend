// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'
import App from './App'
import 'bootstrap/scss/bootstrap.scss'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const eventLogger = (event, error) => {
    console.log('Keycloak event:', event, error)
}

const tokenLogger = (tokens) => {
    if (tokens.token) {
        const decoded = JSON.parse(atob(tokens.token.split('.')[1]))
        console.log('decoded:', decoded)
        
        import('./services/user.service').then(({ default: UserService }) => {
            UserService.getByKeycloakId(decoded.sub)
                .then(response => {
                    console.log('Usuario existe:', response.data)
                })
                .catch(() => {
                    console.log('Usuario no existe, creando...')
                    UserService.create({
                        keycloakId: decoded.sub,
                        fullName: decoded.name || decoded.preferred_username,
                        email: decoded.email,
                        phone: decoded.phone || '',
                        documentId: decoded.documentId || '',
                        nationality: decoded.nationality || ''
                    }).then(r => console.log('Usuario creado:', r.data))
                    .catch(e => console.log('Error al crear:', e))
                })
        })
    }
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ReactKeycloakProvider
            authClient={keycloak}
            onEvent={eventLogger}
            onTokens={tokenLogger}
            initOptions={{
                onLoad: 'check-sso',
                checkLoginIframe: false,
                silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
            }}
        >
            <App />
        </ReactKeycloakProvider>
    </StrictMode>
)

