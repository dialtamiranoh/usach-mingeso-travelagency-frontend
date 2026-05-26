import { useState, useEffect } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import PaymentService from '../../services/payment.service'
import BookingService from '../../services/booking.service'
import RequiredLabel from '../../components/RequiredLabel'
import { FaCheck, FaTimes, FaEye, FaCreditCard } from 'react-icons/fa'

const Payments = () => {
    const { keycloak, initialized } = useKeycloak()
    const [payments, setPayments] = useState([])
    const [pendingBookings, setPendingBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [showProcessModal, setShowProcessModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [formData, setFormData] = useState({ bookingId: '', cardNumber: '', cardExpiry: '', cardCvv: '' })
    const [alertModal, setAlertModal] = useState(null)

    useEffect(() => {
        if (initialized && keycloak.authenticated) fetchAll()
    }, [initialized, keycloak.authenticated])

    const fetchAll = () => {
        setLoading(true)
        Promise.all([
            PaymentService.getAll(),
            BookingService.getAll()
        ]).then(([pays, bookings]) => {
            setPayments(pays.data)
            setPendingBookings(bookings.data.filter(b => b.status?.name === 'PENDING_PAYMENT'))
            setLoading(false)
        }).catch(() => {
            showAlert('danger', 'Error al cargar los datos')
            setLoading(false)
        })
    }

    const selectedBooking = pendingBookings.find(b => b.id === parseInt(formData.bookingId))

    const handleProcess = () => {

        console.log('formData:', formData)

        if (!formData.bookingId || !formData.cardNumber || !formData.cardExpiry || !formData.cardCvv) {
            showAlert('danger', <RequiredLabel text="Faltan campos obligatorios" />)
            return
        }
        PaymentService.processPayment(formData.bookingId, formData.cardNumber, formData.cardExpiry, formData.cardCvv)
            .then(() => {
                setShowProcessModal(false)
                setFormData({ bookingId: '', cardNumber: '', cardExpiry: '', cardCvv: '' })
                fetchAll()
                showAlert('success', 'Pago procesado correctamente')
            })
            .catch(err => showAlert('danger', err.response?.data || 'Error al procesar el pago'))
    }

    const maskCard = (cardNumber) => {
        if (!cardNumber) return '-'
        return '**** **** **** ' + cardNumber.slice(-4)
    }

    const showAlert = (type, message) => {
        setAlertModal({ type, message })
        setTimeout(() => setAlertModal(null), 2000)
    }

    if (!initialized || loading) return <div className="text-center mt-4"><div className="spinner-border" /></div>

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Pagos</h2>
                <button className="btn btn-success" onClick={() => { setFormData({ bookingId: '', cardNumber: '', cardExpiry: '', cardCvv: '' }); setShowProcessModal(true) }}>
                    <FaCreditCard /> Procesar pago
                </button>
            </div>

            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Reserva</th>
                        <th>Usuario</th>
                        <th>Monto</th>
                        <th>Tarjeta</th>
                        <th>Transacción</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.length === 0 ? (
                        <tr><td colSpan={9} className="text-center">No hay pagos registrados</td></tr>
                    ) : (
                        payments.map(payment => (
                            <tr key={payment.id}>
                                <td>{payment.id}</td>
                                <td>#{payment.booking?.id}</td>
                                <td>{payment.booking?.user?.fullName}</td>
                                <td>${payment.amount}</td>
                                <td>{maskCard(payment.cardNumber)}</td>
                                <td><small>{payment.transactionCode}</small></td>
                                <td><span className="badge bg-success">{payment.status?.name}</span></td>
                                <td>{new Date(payment.paidAt).toLocaleString()}</td>
                                <td>
                                    <button className="btn btn-sm btn-info text-white"
                                        onClick={() => { setSelectedPayment(payment); setShowDetailModal(true) }}>
                                        <FaEye /> Ver
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Modal Procesar Pago */}
            {showProcessModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Procesar Pago</h5>
                                <button className="btn-close" onClick={() => setShowProcessModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <RequiredLabel text="Reserva" />
                                    <select className="form-select" value={formData.bookingId}
                                        onChange={e => setFormData({ ...formData, bookingId: e.target.value })}>
                                        <option value="">Selecciona...</option>
                                        {pendingBookings.map(b => (
                                            <option key={b.id} value={b.id}>
                                                #{b.id} - {b.user?.fullName} - ${b.finalAmount}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedBooking && (
                                    <div className="alert alert-info mb-3">
                                        <strong>Resumen:</strong><br />
                                        Paquete: {selectedBooking.touristPackage?.name}<br />
                                        Monto base: ${selectedBooking.baseAmount}<br />
                                        Descuento: ${selectedBooking.discountAmount}<br />
                                        <strong>Total a pagar: ${selectedBooking.finalAmount}</strong>
                                        {selectedBooking.discountDetail && (
                                            <><br /><small>Descuentos: {selectedBooking.discountDetail}</small></>
                                        )}
                                    </div>
                                )}

                                <hr />
                                <p className="text-muted small">Datos de tarjeta de crédito</p>

                                <div className="mb-3">
                                    <RequiredLabel text="Número de tarjeta" />
                                    <input type="text" className="form-control" value={formData.cardNumber}
                                        onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                                        placeholder="1234 5678 9012 3456" maxLength="19" />
                                </div>
                                <div className="row">
                                    <div className="col mb-3">
                                        <RequiredLabel text="Fecha expiración" />
                                        <input type="text" className="form-control" value={formData.cardExpiry}
                                            onChange={e => setFormData({ ...formData, cardExpiry: e.target.value })}
                                            placeholder="MM/AA" maxLength="5" />
                                    </div>
                                    <div className="col mb-3">
                                        <RequiredLabel text="CVV" />
                                        <input type="text" className="form-control" value={formData.cardCvv}
                                            onChange={e => setFormData({ ...formData, cardCvv: e.target.value })}
                                            placeholder="123" maxLength="4" />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowProcessModal(false)}><FaTimes /> Cancelar</button>
                                <button className="btn btn-success" onClick={handleProcess}><FaCheck /> Confirmar pago</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalle */}
            {showDetailModal && selectedPayment && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-info text-white">
                                <h5 className="modal-title">Detalle Pago #{selectedPayment.id}</h5>
                                <button className="btn-close" onClick={() => setShowDetailModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>Reserva:</strong> #{selectedPayment.booking?.id}</p>
                                        <p><strong>Cliente:</strong> {selectedPayment.booking?.user?.fullName}</p>
                                        <p><strong>Paquete:</strong> {selectedPayment.booking?.touristPackage?.name}</p>
                                        <p><strong>Pasajeros:</strong> {selectedPayment.booking?.passengerCount}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Monto:</strong> ${selectedPayment.amount}</p>
                                        <p><strong>Tarjeta:</strong> {maskCard(selectedPayment.cardNumber)}</p>
                                        <p><strong>Código transacción:</strong> {selectedPayment.transactionCode}</p>
                                        <p><strong>Estado:</strong> <span className="badge bg-success">{selectedPayment.status?.name}</span></p>
                                        <p><strong>Fecha:</strong> {new Date(selectedPayment.paidAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Alerta */}
            {alertModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-sm">
                        <div className="modal-content">
                            <div className={`modal-header bg-${alertModal.type} text-white`}>
                                <h5 className="modal-title">
                                    {alertModal.type === 'success' ? <FaCheck className="me-2" /> : <FaTimes className="me-2" />}
                                    {alertModal.type === 'success' ? 'Éxito' : 'Error'}
                                </h5>
                                <button className="btn-close btn-close-white" onClick={() => setAlertModal(null)} />
                            </div>
                            <div className="modal-body text-center">{alertModal.message}</div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary btn-sm" onClick={() => setAlertModal(null)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Payments