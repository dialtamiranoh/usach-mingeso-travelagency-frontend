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

httpclient.interceptors.request.use(config => {
    if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`
    }
    return config
})

export default httpclient