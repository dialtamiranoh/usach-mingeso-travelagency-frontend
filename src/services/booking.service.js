import httpclient from '../http-common'

const getAll = () => {
    return httpclient.get("api/bookings")
}

const getByUser = (userId) => httpclient.get(`api/bookings/user/${userId}`)

const get = (id) => {
    return httpclient.get(`api/bookings/${id}`)
}

const createBooking = (packageId, passengerCount, keycloakId = null) => {
    let url = `api/bookings/create?packageId=${packageId}&passengerCount=${passengerCount}`
    if (keycloakId) url += `&keycloakId=${keycloakId}`
    return httpclient.post(url)
}

const updateBooking = (id, passengerCount, statusId) =>
    httpclient.put(`api/bookings/${id}/update?passengerCount=${passengerCount}&statusId=${statusId}`)




const getByKeycloak = (keycloakId) => httpclient.get(`api/bookings/keycloak/${keycloakId}`)

const BookingService = { getAll, get, getByUser, getByKeycloak, createBooking, updateBooking }


export default BookingService