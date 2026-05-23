// components/BookingTable.jsx
import { useState, useEffect } from 'react'
import BookingService from '../services/booking.service'

const BookingTable = ({ isAdmin = false, userId = null }) => {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = () => {
        setLoading(true)
        const request = isAdmin
            ? BookingService.getAll()
            : BookingService.getByUser(userId)

        request
            .then(response => {
                setBookings(response.data)
                setLoading(false)
            })
            .catch(error => {
                setError('Error al cargar las reservas')
                setLoading(false)
            })
    }

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta reserva?')) {
            BookingService.remove(id)
                .then(() => fetchBookings())
                .catch(() => setError('Error al eliminar la reserva'))
        }
    }

    if (loading) return <div className="text-center"><div className="spinner-border" /></div>
    if (error) return <div className="alert alert-danger">{error}</div>

    return (
        <div className="table-responsive">
            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Paquete</th>
                        <th>Pasajeros</th>
                        <th>Monto base</th>
                        <th>Descuento</th>
                        <th>Monto final</th>
                        <th>Estado</th>
                        <th>Fecha creación</th>
                        {isAdmin && <th>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {bookings.length === 0 ? (
                        <tr>
                            <td colSpan={isAdmin ? 9 : 8} className="text-center">
                                No hay reservas registradas
                            </td>
                        </tr>
                    ) : (
                        bookings.map(booking => (
                            <tr key={booking.id}>
                                <td>{booking.id}</td>
                                <td>{booking.touristPackage?.name || '-'}</td>
                                <td>{booking.passengerCount}</td>
                                <td>${booking.baseAmount}</td>
                                <td>${booking.discountAmount}</td>
                                <td>${booking.finalAmount}</td>
                                <td>
                                    <span className={`badge ${getStatusBadge(booking.status?.name)}`}>
                                        {booking.status?.name || '-'}
                                    </span>
                                </td>
                                <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                                {isAdmin && (
                                    <td>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(booking.id)}>
                                            Eliminar
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

const getStatusBadge = (status) => {
    switch (status) {
        case 'CONFIRMED': return 'bg-success'
        case 'PENDING_PAYMENT': return 'bg-warning text-dark'
        case 'CANCELLED': return 'bg-danger'
        case 'EXPIRED': return 'bg-secondary'
        default: return 'bg-primary'
    }
}

export default BookingTable