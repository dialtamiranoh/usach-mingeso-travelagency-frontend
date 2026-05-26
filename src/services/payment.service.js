// payment.service.js
import httpclient from '../http-common'

const getAll = () => httpclient.get("api/payments")
const get = (id) => httpclient.get(`api/payments/${id}`)
const getByBooking = (bookingId) => httpclient.get(`api/payments/booking/${bookingId}`)
const create = (data) => httpclient.post("api/payments", data)
const update = (id, data) => httpclient.put(`api/payments/${id}`, data)

const processPayment = (bookingId, cardNumber, cardExpiry, cardCvv) =>
    httpclient.post(`api/payments/process?bookingId=${parseInt(bookingId)}&cardNumber=${cardNumber}&cardExpiry=${cardExpiry}&cardCvv=${cardCvv}`)

const PaymentService = { getAll, get, getByBooking, create, update, processPayment }
export default PaymentService