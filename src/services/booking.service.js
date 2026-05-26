import httpclient from '../http-common'

const getAll = () => {
    return httpclient.get("api/bookings")
}

const getByUser = (userId) => httpclient.get(`api/bookings/user/${userId}`)

const create = (data) => {
    return httpclient.post("api/bookings", data)
}

const update = (id, data) => {
    return httpclient.put(`api/bookings/${id}`, data)
} 

const get = (id) => {
    return httpclient.get(`api/bookings/${id}`)
}

const remove = (id) => {
    return httpclient.delete(`api/bookings/${id}`)
}

const createBooking = (packageId, passengerCount, keycloakId) =>
    httpclient.post(`api/bookings/create?packageId=${packageId}&passengerCount=${passengerCount}`)


const getByKeycloak = (keycloakId) => httpclient.get(`api/bookings/keycloak/${keycloakId}`)

const BookingService = { getAll, get, getByUser, getByKeycloak, createBooking, create, update, remove }


export default BookingService