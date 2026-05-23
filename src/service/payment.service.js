// payment.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/payments")
const get = (id) => httpclient.get(`api/payments/${id}`)
const getByBooking = (bookingId) => httpclient.get(`api/payments/booking/${bookingId}`)
const create = (data) => httpclient.post("api/payments", data)
const update = (id, data) => httpclient.put(`api/payments/${id}`, data)
const remove = (id) => httpclient.delete(`api/payments/${id}`)

const PaymentService = { getAll, get, getByBooking, create, update, remove }
export default PaymentService