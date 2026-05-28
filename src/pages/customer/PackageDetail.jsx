// src/pages/customer/PackageDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useKeycloak } from '@react-keycloak/web'
import {
    FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers,
    FaConciergeBell, FaPercent, FaInfoCircle, FaExclamationTriangle,
    FaCheck, FaTimes, FaArrowLeft
} from 'react-icons/fa'
import TouristPackageService from '../../services/tourist-package.service'
import BookingService from '../../services/booking.service'

const formatPrice = (price) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

const PackageDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { keycloak } = useKeycloak()

    const isAuthenticated = keycloak.authenticated
    const isAdmin = keycloak?.tokenParsed?.realm_access?.roles?.includes('ADMIN')

    const [pkg, setPkg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [passengerCount, setPassengerCount] = useState(1)
    const [booking, setBooking] = useState(false)
    const [alertModal, setAlertModal] = useState(null)

    useEffect(() => {
        TouristPackageService.get(id)
            .then(res => setPkg(res.data))
            .catch(() => setError('No se pudo cargar el paquete.'))
            .finally(() => setLoading(false))
    }, [id])

    const showAlert = (type, message) => {
        setAlertModal({ type, message })
        setTimeout(() => setAlertModal(null), 2000)
    }

    const handleReservar = () => {
        if (!passengerCount || passengerCount < 1) {
            showAlert('danger', 'Ingresa una cantidad válida de pasajeros.')
            return
        }
        if (passengerCount > pkg.availableSlots) {
            showAlert('danger', `Solo hay ${pkg.availableSlots} cupos disponibles.`)
            return
        }
        const keycloakId = keycloak.tokenParsed.sub
        setBooking(true)
        BookingService.createBooking(id, passengerCount, keycloakId)
            .then(res => {
                const bookingId = res.data?.id
                navigate(`/my-bookings/${bookingId}`)
            })
            .catch(err => {
                showAlert('danger', err.response?.data || 'Error al crear la reserva.')
                setBooking(false)
            })
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
            <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
                <FaArrowLeft className="me-2" />Volver
            </button>
        </div>
    )

    if (!pkg) return null

    const sinCupos = pkg.availableSlots === 0

    return (
        <>
            {/* Hero */}
            <div className="bg-dark text-white py-4">
                <div className="container">
                    <button className="btn btn-outline-light btn-sm mb-3"
                        onClick={() => navigate('/')}>
                        <FaArrowLeft className="me-2" />Volver al listado
                    </button>
                    <h1 className="fw-bold mb-1">{pkg.name}</h1>
                    {pkg.destination && (
                        <p className="text-muted mb-0 d-flex align-items-center gap-2">
                            <FaMapMarkerAlt /> {pkg.destination.name}
                        </p>
                    )}
                </div>
            </div>

            <div className="container py-4">
                <div className="row g-4">

                    {/* Columna izquierda — info del paquete */}
                    <div className="col-md-8">

                        {/* Placeholder imagen */}
                        <div className="bg-secondary d-flex align-items-center justify-content-center rounded mb-4"
                            style={{ height: '280px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"
                                fill="rgba(255,255,255,0.4)" viewBox="0 0 16 16">
                                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z" />
                            </svg>
                        </div>

                        {/* Badges */}
                        <div className="d-flex gap-2 flex-wrap mb-3">
                            {pkg.category && <span className="badge text-bg-primary">{pkg.category.name}</span>}
                            {pkg.type && <span className="badge text-bg-warning text-dark">{pkg.type.name}</span>}
                            {pkg.season && <span className="badge text-bg-success">{pkg.season.name}</span>}
                            {sinCupos && <span className="badge text-bg-danger">Sin cupos</span>}
                        </div>

                        {/* Descripción */}
                        <h5 className="fw-bold">Descripción</h5>
                        <p className="text-muted">{pkg.description}</p>

                        {/* Info general */}
                        <div className="row g-3 mb-4">
                            <div className="col-sm-4">
                                <div className="border rounded p-3 text-center">
                                    <FaCalendarAlt className="text-primary mb-1" size={18} />
                                    <div className="small text-muted">Fechas</div>
                                    <div className="fw-semibold small">{formatDate(pkg.startDate)} — {formatDate(pkg.endDate)}</div>
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div className="border rounded p-3 text-center">
                                    <FaClock className="text-primary mb-1" size={18} />
                                    <div className="small text-muted">Duración</div>
                                    <div className="fw-semibold">{pkg.durationDays} día{pkg.durationDays !== 1 ? 's' : ''}</div>
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div className="border rounded p-3 text-center">
                                    <FaUsers className="text-primary mb-1" size={18} />
                                    <div className="small text-muted">Cupos disponibles</div>
                                    <div className="fw-semibold">{pkg.availableSlots} de {pkg.totalSlots}</div>
                                </div>
                            </div>
                        </div>

                        {/* Servicios incluidos */}
                        {pkg.services?.length > 0 && (
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

                        {/* Promociones activas */}
                        {pkg.promotions?.length > 0 && (
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

                        {/* Condiciones */}
                        {pkg.conditions && (
                            <>
                                <h5 className="fw-bold">
                                    <FaInfoCircle className="me-2 text-primary" />Condiciones
                                </h5>
                                <p className="text-muted">{pkg.conditions}</p>
                            </>
                        )}

                        {/* Restricciones */}
                        {pkg.restrictions && (
                            <>
                                <h5 className="fw-bold">
                                    <FaExclamationTriangle className="me-2 text-warning" />Restricciones
                                </h5>
                                <p className="text-muted">{pkg.restrictions}</p>
                            </>
                        )}
                    </div>

                    {/* Columna derecha — card reserva */}
                    <div className="col-md-4">
                        {isAdmin ? (
                            <div className="card shadow-sm border-0 sticky-top" style={{ top: '80px' }}>
                                <div className="card-header bg-dark text-white">
                                    <span className="fw-bold">Información del paquete</span>
                                </div>
                                <div className="card-body">
                                    <ul className="list-unstyled mb-0">
                                        <li className="d-flex justify-content-between py-1 border-bottom">
                                            <span className="text-muted small">Precio por persona</span>
                                            <span className="fw-bold text-primary">{formatPrice(pkg.price)}</span>
                                        </li>
                                        <li className="d-flex justify-content-between py-1 border-bottom">
                                            <span className="text-muted small">Cupos disponibles</span>
                                            <span className="fw-bold">{pkg.availableSlots} de {pkg.totalSlots}</span>
                                        </li>
                                        <li className="d-flex justify-content-between py-1">
                                            <span className="text-muted small">Estado</span>
                                            <span className="badge text-bg-primary">{pkg.status?.name}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <>
                                {!sinCupos && isAuthenticated && (
                                    <div className="card shadow-sm border-0 sticky-top" style={{ top: '80px' }}>
                                        <div className="card-header bg-primary text-white">
                                            <h5 className="mb-0">Reservar paquete</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <div className="text-muted small">Precio por persona</div>
                                                <div className="fw-bold fs-4 text-primary">{formatPrice(pkg.price)}</div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    Cantidad de pasajeros <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={passengerCount}
                                                    onChange={e => setPassengerCount(parseInt(e.target.value) || 1)}
                                                    min={1}
                                                    max={pkg.availableSlots}
                                                />
                                                <div className="form-text">Máximo {pkg.availableSlots} pasajeros</div>
                                            </div>
                                            <div className="border-top pt-3 mb-3">
                                                <div className="d-flex justify-content-between">
                                                    <span className="text-muted">Total estimado</span>
                                                    <span className="fw-bold">{formatPrice(pkg.price * passengerCount)}</span>
                                                </div>
                                                <div className="small text-muted">
                                                    * El monto final puede variar según promociones aplicadas
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={handleReservar}
                                                disabled={booking}>
                                                {booking
                                                    ? <><span className="spinner-border spinner-border-sm me-2" />Procesando...</>
                                                    : 'Reservar ahora'
                                                }
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!sinCupos && !isAuthenticated && (
                                    <div className="card shadow-sm border-0 sticky-top" style={{ top: '80px' }}>
                                        <div className="card-body text-center py-4">
                                            <p className="text-muted mb-3">Inicia sesión para reservar este paquete</p>
                                            <button className="btn btn-primary w-100" onClick={() => keycloak.login()}>
                                                Iniciar sesión
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {sinCupos && (
                                    <div className="alert alert-danger d-flex align-items-center gap-2">
                                        <FaTimes />
                                        Este paquete no tiene cupos disponibles.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
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

export default PackageDetail