// src/pages/customer/MyBookings.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKeycloak } from '@react-keycloak/web'
import { FaBookmark, FaCalendarAlt, FaUsers, FaDollarSign, FaClock } from 'react-icons/fa'
import BookingService from '../../services/booking.service'

const formatPrice = (price) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-CL')
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

const MyBookings = () => {
    const navigate = useNavigate()
    const { keycloak, initialized } = useKeycloak()

    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!initialized || !keycloak.authenticated) return
        const keycloakId = keycloak.tokenParsed.sub
        BookingService.getByKeycloak(keycloakId)
            .then(res => setBookings(res.data || []))
            .catch(() => setError('Error al cargar tus reservas.'))
            .finally(() => setLoading(false))
    }, [initialized, keycloak.authenticated])

    if (loading) return (
        <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    )

    return (
        <>
            {/* Hero */}
            <div className="bg-dark text-white py-4">
                <div className="container">
                    <h1 className="fw-bold mb-1">
                        <FaBookmark className="me-2" />Mis reservas
                    </h1>
                    <p className="text-muted mb-0">Consulta y gestiona tus reservas</p>
                </div>
            </div>

            <div className="container py-4">
                {error && <div className="alert alert-danger">{error}</div>}

                {!error && bookings.length === 0 && (
                    <div className="text-center py-5">
                        <FaBookmark size={40} className="text-muted mb-3" />
                        <p className="text-muted">No tienes reservas registradas.</p>
                        <button className="btn btn-primary btn-sm"
                            onClick={() => navigate('/')}>
                            Explorar paquetes
                        </button>
                    </div>
                )}

                {bookings.length > 0 && (
                    <>
                        <p className="text-muted small mb-3">
                            {bookings.length} reserva{bookings.length !== 1 ? 's' : ''} encontrada{bookings.length !== 1 ? 's' : ''}
                        </p>
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                            {bookings.map(booking => (
                                <div className="col" key={booking.id}>
                                    <BookingCard
                                        booking={booking}
                                        onClick={() => navigate(`/my-bookings/${booking.id}`)}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

const BookingCard = ({ booking, onClick }) => (
    <div
        className="card h-100 shadow-sm border-0"
        onClick={onClick}
        style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = ''
        }}
    >
        {/* Header */}
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <span className="fw-bold">Reserva #{booking.id}</span>
            <span className={`badge ${getStatusBadge(booking.status?.name)}`}>
                {getStatusLabel(booking.status?.name)}
            </span>
        </div>

        <div className="card-body d-flex flex-column">
            {/* Nombre paquete */}
            <h5 className="card-title fw-bold mb-1">{booking.touristPackage?.name}</h5>
            <p className="text-muted small mb-3">
                {booking.touristPackage?.destination?.name}
            </p>

            {/* Info */}
            <ul className="list-unstyled small text-muted mb-3 d-flex flex-column gap-2">
                <li className="d-flex align-items-center gap-2">
                    <FaCalendarAlt size={12} className="text-primary" />
                    Creada: {formatDate(booking.createdAt)}
                </li>
                <li className="d-flex align-items-center gap-2">
                    <FaClock size={12} className="text-primary" />
                    Expira: {formatDate(booking.expiresAt)}
                </li>
                <li className="d-flex align-items-center gap-2">
                    <FaUsers size={12} className="text-primary" />
                    {booking.passengerCount} pasajero{booking.passengerCount !== 1 ? 's' : ''}
                </li>
            </ul>

            {/* Footer precio */}
            <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                <div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Monto final</div>
                    <div className="fw-bold fs-5 text-primary">{formatPrice(booking.finalAmount)}</div>
                </div>
                {booking.discountAmount > 0 && (
                    <span className="badge text-bg-success">
                        -{formatPrice(booking.discountAmount)} desc.
                    </span>
                )}
            </div>
        </div>
    </div>
)

export default MyBookings