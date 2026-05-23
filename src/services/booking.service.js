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

const BookingService = {
    getAll,
    create,
    update,
    get,
    remove
}

export default BookingService