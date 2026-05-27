// src/pages/customer/MyBookingDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useKeycloak } from '@react-keycloak/web'
import {
    FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers,
    FaConciergeBell, FaPercent, FaInfoCircle, FaExclamationTriangle,
    FaCheck, FaTimes, FaArrowLeft, FaCreditCard, FaBan, FaEye
} from 'react-icons/fa'
import BookingService from '../../services/booking.service'
import PaymentService from '../../services/payment.service'
import StatusService from '../../services/status.service'

const formatPrice = (price) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-CL')
}

const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('es-CL')
}

const formatDatePkg = (dateStr) => {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

const getStatusBadge = (name) => {
    switch (name) {
        case 'CONFIRMED': return 'text-bg-success'
        case 'PENDING_PAYMENT': return 'text-bg-warning'
        case 'CANCELLED': return 'text-bg-danger'
        case 'EXPIRED': return 'text-bg-secondary'
        default: return 'text-bg-primary'
    }
}

const getStatusLabel = (name) => {
    switch (name) {
        case 'CONFIRMED': return 'Confirmada'
        case 'PENDING_PAYMENT': return 'Pendiente de pago'
        case 'CANCELLED': return 'Cancelada'
        case 'EXPIRED': return 'Expirada'
        default: return name
    }
}

const MyBookingDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { keycloak, initialized } = useKeycloak()

    const [booking, setBooking] = useState(null)
    const [payment, setPayment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [showPayModal, setShowPayModal] = useState(false)
    const [payForm, setPayForm] = useState({ cardNumber: '', cardExpiry: '', cardCvv: '' })
    const [paying, setPaying] = useState(false)

    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelling, setCancelling] = useState(false)

    const [showVoucherModal, setShowVoucherModal] = useState(false)

    const [alertModal, setAlertModal] = useState(null)
    const [statuses, setStatuses] = useState([])

    useEffect(() => {
        if (!initialized || !keycloak.authenticated) return
        Promise.all([
            BookingService.get(id),
            StatusService.getByEntityType('BOOKING')
        ])
            .then(([bRes, sRes]) => {
                setBooking(bRes.data)
                setStatuses(sRes.data || [])
                return PaymentService.getByBooking(id)
            })
            .then(pRes => setPayment(pRes.data || null))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [initialized, keycloak.authenticated, id])

    const showAlert = (type, message) => {
        setAlertModal({ type, message })
        setTimeout(() => setAlertModal(null), 2000)
    }

    const handlePay = () => {
        if (!payForm.cardNumber || !payForm.cardExpiry || !payForm.cardCvv) {
            showAlert('danger', 'Completa todos los datos de la tarjeta.')
            return
        }
        setPaying(true)
        PaymentService.processPayment(id, payForm.cardNumber, payForm.cardExpiry, payForm.cardCvv)
            .then(() => {
                setShowPayModal(false)
                return Promise.all([
                    BookingService.get(id),
                    PaymentService.getByBooking(id)
                ])
            })
            .then(([bRes, pRes]) => {
                setBooking(bRes.data)
                setPayment(pRes.data || null)
                showAlert('success', 'Pago procesado correctamente.')
            })
            .catch(err => showAlert('danger', err.response?.data || 'Error al procesar el pago.'))
            .finally(() => setPaying(false))
    }

    const handleCancel = () => {
        const cancelledStatus = statuses.find(s => s.name === 'CANCELLED')
        if (!cancelledStatus) return
        setCancelling(true)
        BookingService.updateBooking(id, booking.passengerCount, cancelledStatus.id)
            .then(() => {
                setShowCancelModal(false)
                return BookingService.get(id)
            })
            .then(res => {
                setBooking(res.data)
                showAlert('success', 'Reserva cancelada correctamente.')
            })
            .catch(err => showAlert('danger', err.response?.data || 'Error al cancelar la reserva.'))
            .finally(() => setCancelling(false))
    }

    if (loading) return (
        <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    )

    if (error) return (
        <div className="container py-4">
            <div className="alert alert-danger">{error}</div>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/my-bookings')}>
                <FaArrowLeft className="me-2" />Volver
            </button>
        </div>
    )

    if (!booking) return null

    const pkg = booking.touristPackage
    const statusName = booking.status?.name
    const isPendingPayment = statusName === 'PENDING_PAYMENT'
    const canPay = isPendingPayment
    const canCancel = isPendingPayment

    return (
        <>
            {/* Hero */}
            <div className="bg-dark text-white py-4">
                <div className="container">
                    <button className="btn btn-outline-light btn-sm mb-3"
                        onClick={() => navigate('/my-bookings')}>
                        <FaArrowLeft className="me-2" />Volver a mis reservas
                    </button>
                    <h1 className="fw-bold mb-1">{pkg?.name}</h1>
                    {pkg?.destination && (
                        <p className="text-muted mb-0 d-flex align-items-center gap-2">
                            <FaMapMarkerAlt /> {pkg.destination.name}
                        </p>
                    )}
                </div>
            </div>

            <div className="container py-4">
                <div className="row g-4">

                    {/* Columna izquierda */}
                    <div className="col-md-8">

                        <div className="bg-secondary d-flex align-items-center justify-content-center rounded mb-4"
                            style={{ height: '280px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"
                                fill="rgba(255,255,255,0.4)" viewBox="0 0 16 16">
                                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z" />
                            </svg>
                        </div>

                        <div className="d-flex gap-2 flex-wrap mb-3">
                            {pkg?.category && <span className="badge text-bg-primary">{pkg.category.name}</span>}
                            {pkg?.type && <span className="badge text-bg-warning text-dark">{pkg.type.name}</span>}
                            {pkg?.season && <span className="badge text-bg-success">{pkg.season.name}</span>}
                        </div>

                        <h5 className="fw-bold">Descripción</h5>
                        <p className="text-muted">{pkg?.description}</p>

                        <div className="row g-3 mb-4">
                            <div className="col-sm-4">
                                <div className="border rounded p-3 text-center">
                                    <FaCalendarAlt className="text-primary mb-1" size={18} />
                                    <div className="small text-muted">Fechas</div>
                                    <div className="fw-semibold small">
                                        {formatDatePkg(pkg?.startDate)} — {formatDatePkg(pkg?.endDate)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div className="border rounded p-3 text-center">
                                    <FaClock className="text-primary mb-1" size={18} />
                                    <div className="small text-muted">Duración</div>
                                    <div className="fw-semibold">{pkg?.durationDays} día{pkg?.durationDays !== 1 ? 's' : ''}</div>
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div className="border rounded p-3 text-center">
                                    <FaUsers className="text-primary mb-1" size={18} />
                                    <div className="small text-muted">Tus pasajeros</div>
                                    <div className="fw-semibold">{booking.passengerCount}</div>
                                </div>
                            </div>
                        </div>

                        {pkg?.services?.length > 0 && (
                            <>
                                <h5 className="fw-bold">
                                    <FaConciergeBell className="me-2 text-primary" />Servicios incluidos
                                </h5>
                                <ul className="list-group list-group-flush mb-4">
                                    {pkg.services.map(s => (
                                        <li key={s.id} className="list-group-item d-flex align-items-center gap-2">
                                            <FaCheck className="text-success" size={12} /> {s.name}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {pkg?.promotions?.length > 0 && (
                            <>
                                <h5 className="fw-bold">
                                    <FaPercent className="me-2 text-primary" />Promociones disponibles
                                </h5>
                                <ul className="list-group list-group-flush mb-4">
                                    {pkg.promotions.map(p => (
                                        <li key={p.id} className="list-group-item">
                                            <div className="fw-semibold">{p.name}</div>
                                            <div className="small text-muted">{p.discountPercentage}% de descuento</div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {pkg?.conditions && (
                            <>
                                <h5 className="fw-bold">
                                    <FaInfoCircle className="me-2 text-primary" />Condiciones
                                </h5>
                                <p className="text-muted">{pkg.conditions}</p>
                            </>
                        )}

                        {pkg?.restrictions && (
                            <>
                                <h5 className="fw-bold">
                                    <FaExclamationTriangle className="me-2 text-warning" />Restricciones
                                </h5>
                                <p className="text-muted">{pkg.restrictions}</p>
                            </>
                        )}
                    </div>

                    {/* Columna derecha */}
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 sticky-top" style={{ top: '80px' }}>
                            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Reserva #{booking.id}</span>
                                <span className={`badge ${getStatusBadge(statusName)}`}>
                                    {getStatusLabel(statusName)}
                                </span>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled mb-3">
                                    <li className="d-flex justify-content-between py-1 border-bottom">
                                        <span className="text-muted small">Monto base</span>
                                        <span>{formatPrice(booking.baseAmount)}</span>
                                    </li>
                                    <li className="d-flex justify-content-between py-1 border-bottom">
                                        <span className="text-muted small">Descuento</span>
                                        <span className="text-success">-{formatPrice(booking.discountAmount)}</span>
                                    </li>
                                    <li className="d-flex justify-content-between py-2">
                                        <span className="fw-bold">Total</span>
                                        <span className="fw-bold fs-5 text-primary">{formatPrice(booking.finalAmount)}</span>
                                    </li>
                                </ul>

                                {booking.discountDetail && (
                                    <div className="alert alert-success small py-2 mb-3">
                                        <FaPercent className="me-1" />{booking.discountDetail}
                                    </div>
                                )}

                                <ul className="list-unstyled small text-muted mb-3">
                                    <li className="d-flex align-items-center gap-2 mb-1">
                                        <FaCalendarAlt size={11} className="text-primary" />
                                        Creada: {formatDateTime(booking.createdAt)}
                                    </li>
                                    <li className="d-flex align-items-center gap-2">
                                        <FaClock size={11} className="text-primary" />
                                        Expira: {formatDateTime(booking.expiresAt)}
                                    </li>
                                </ul>

                                <div className="d-flex flex-column gap-2">
                                    {statusName === 'CONFIRMED' && (
                                        <button className="btn btn-info text-white w-100"
                                            onClick={() => setShowVoucherModal(true)}>
                                            <FaEye className="me-2" />Ver comprobante
                                        </button>
                                    )}
                                    {canPay && (
                                        <button className="btn btn-primary w-100"
                                            onClick={() => setShowPayModal(true)}>
                                            <FaCreditCard className="me-2" />Pagar ahora
                                        </button>
                                    )}
                                    {canCancel && (
                                        <button className="btn btn-outline-danger w-100"
                                            onClick={() => setShowCancelModal(true)}>
                                            <FaBan className="me-2" />Cancelar reserva
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Comprobante */}
            {showVoucherModal && payment && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-info text-white">
                                <h5 className="modal-title">Detalle Pago #{payment.id}</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowVoucherModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>Reserva:</strong> #{booking.id}</p>
                                        <p><strong>Cliente:</strong> {booking.user?.fullName}</p>
                                        <p><strong>Paquete:</strong> {pkg?.name}</p>
                                        <p><strong>Pasajeros:</strong> {booking.passengerCount}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Monto:</strong> ${payment.amount}</p>
                                        <p><strong>Tarjeta:</strong> **** **** **** {payment.cardNumber?.slice(-4)}</p>
                                        <p><strong>Código transacción:</strong> {payment.transactionCode}</p>
                                        <p><strong>Estado:</strong> <span className="badge bg-success">{payment.status?.name}</span></p>
                                        <p><strong>Fecha:</strong> {new Date(payment.paidAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowVoucherModal(false)}>
                                    Cerrar
                                </button>
                                <button className="btn btn-primary" 
                                
                                    onClick={() => {
                                        const orginalTitle = document.title
                                        document.title = `Comprobante_Pago_${payment.transactionCode}`
                                        window.print()
                                        document.title = orginalTitle

                                    }}>
                                    Imprimir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Pagar */}
            {showPayModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title"><FaCreditCard className="me-2" />Datos de pago</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowPayModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Número de tarjeta <span className="text-danger">*</span>
                                    </label>
                                    <input type="text" className="form-control"
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={16}
                                        value={payForm.cardNumber}
                                        onChange={e => setPayForm({ ...payForm, cardNumber: e.target.value })} />
                                </div>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <label className="form-label fw-semibold">
                                            Vencimiento <span className="text-danger">*</span>
                                        </label>
                                        <input type="text" className="form-control"
                                            placeholder="MM/AA"
                                            maxLength={5}
                                            value={payForm.cardExpiry}
                                            onChange={e => setPayForm({ ...payForm, cardExpiry: e.target.value })} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-semibold">
                                            CVV <span className="text-danger">*</span>
                                        </label>
                                        <input type="text" className="form-control"
                                            placeholder="123"
                                            maxLength={4}
                                            value={payForm.cardCvv}
                                            onChange={e => setPayForm({ ...payForm, cardCvv: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowPayModal(false)}>
                                    <FaTimes className="me-1" />Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handlePay} disabled={paying}>
                                    {paying
                                        ? <><span className="spinner-border spinner-border-sm me-2" />Procesando...</>
                                        : <><FaCheck className="me-1" />Confirmar pago</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Cancelar */}
            {showCancelModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title"><FaBan className="me-2" />Cancelar reserva</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowCancelModal(false)} />
                            </div>
                            <div className="modal-body">
                                ¿Estás seguro de cancelar la reserva <strong>#{booking.id}</strong>?
                                Esta acción no se puede deshacer.
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                                    <FaTimes className="me-1" />No
                                </button>
                                <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                                    {cancelling
                                        ? <><span className="spinner-border spinner-border-sm me-2" />Cancelando...</>
                                        : <><FaBan className="me-1" />Sí, cancelar</>
                                    }
                                </button>
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
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default MyBookingDetail