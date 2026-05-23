import axios from "axios"


const travelAgencyBackendServer = import.meta.env.VITE_TRAVELAGENCY_BACKEND_SERVER
const travelAgencyFrontendPort = import.meta.env.VITE_TRAVELAGENCY_FRONTEND_PORT

// console.log("Travel Agency Backend Server:", travelAgencyBackendServer)
// console.log("Travel Agency Frontend Port:", travelAgencyFrontendPort)

export default axios.create({
  baseURL: `http://${travelAgencyBackendServer}:${travelAgencyFrontendPort}`,
  headers: {
    "Content-type": "application/json",
  },
  
});

