import axios from 'axios'
import keycloak from './keycloak'

const travelAgencyBackendServer = import.meta.env.VITE_TRAVELAGENCY_BACKEND_SERVER
const travelAgencyBackendPort = import.meta.env.VITE_TRAVELAGENCY_BACKEND_PORT

const httpclient = axios.create({
    baseURL: `http://${travelAgencyBackendServer}:${travelAgencyBackendPort}`,
    headers: {
        'Content-type': 'application/json'
    }
})

httpclient.interceptors.request.use(async config => {
    console.log('Token:', keycloak.token)
    if (keycloak.token) {
        await keycloak.updateToken(30) // Refresh the token if it will expire in 30 seconds or less
        config.headers.Authorization = `Bearer ${keycloak.token}`
    }
    return config
})

export default httpclient