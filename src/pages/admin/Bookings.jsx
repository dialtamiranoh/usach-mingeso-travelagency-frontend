import { useState, useEffect } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import BookingService from '../../services/booking.service'
import StatusService from '../../services/status.service'
import TouristPackageService from '../../services/tourist-package.service'
import UserService from '../../services/user.service'
import RequiredLabel from '../../components/RequiredLabel'
import { FaCheck, FaTimes, FaPlus, FaEye, FaBan, FaEdit } from 'react-icons/fa'

const Bookings = () => {
    const { keycloak, initialized } = useKeycloak()
    const [bookings, setBookings] = useState([])
    const [statuses, setStatuses] = useState([])
    const [packages, setPackages] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [filterStatusId, setFilterStatusId] = useState('')
    const [formData, setFormData] = useState({ packageId: '', userId: '', passengerCount: '' })
    const [editData, setEditData] = useState({ statusId: '', passengerCount: '' })
    const [alertModal, setAlertModal] = useState(null)
    

    useEffect(() => {
        if (initialized && keycloak.authenticated) fetchAll()
    }, [initialized, keycloak.authenticated])

    const fetchAll = () => {
        setLoading(true)
        Promise.all([
            BookingService.getAll(),
            StatusService.getByEntityType('BOOKING'),
            TouristPackageService.getAll(),
            UserService.getAll()
        ]).then(([bkgs, sts, pkgs, usrs]) => {
            setBookings(bkgs.data)
            setStatuses(sts.data)
            setPackages(pkgs.data)
            setUsers(usrs.data)
            setLoading(false)
        }).catch(() => {
            showAlert('danger', 'Error al cargar los datos')
            setLoading(false)
        })
    }

    const handleCreate = () => {
        if (!formData.packageId || !formData.userId || !formData.passengerCount) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }
        const user = users.find(u => u.id === parseInt(formData.userId))
        if (!user?.keycloakId) {
            showAlert('danger', 'El usuario no tiene keycloakId registrado')
            return
        }
        BookingService.createBooking(formData.packageId, formData.passengerCount, user.keycloakId)
            .then(() => {
                setShowCreateModal(false)
                setFormData({ packageId: '', userId: '', passengerCount: '' })
                fetchAll()
                showAlert('success', 'Reserva creada correctamente')
            })
            .catch(err => showAlert('danger', err.response?.data || 'Error al crear la reserva'))
    }

    const handleEditClick = (booking) => {
        setSelectedBooking(booking)
        setEditData({
            statusId: booking.status?.id || '',
            passengerCount: booking.passengerCount
        })
        setShowEditModal(true)
    }

const handleEdit = () => {
    if (!editData.statusId || !editData.passengerCount) {
        showAlert('danger', <RequiredLabel text='Faltan campos obligatorios' />)
        return
    }
    BookingService.updateBooking(selectedBooking.id, editData.passengerCount, editData.statusId)
        .then(() => {
            setShowEditModal(false)
            setSelectedBooking(null)
            fetchAll()
            showAlert('success', 'Reserva actualizada correctamente')
        })
        .catch(err => showAlert('danger', err.response?.data || 'Error al actualizar la reserva'))
}

    const handleCancelClick = (booking) => {
        setSelectedBooking(booking)
        setEditData({
            statusId: statuses.find(s => s.name === 'CANCELLED')?.id || '',
            passengerCount: booking.passengerCount
        })
        setShowCancelModal(true)
    }

    const handleCancel = () => {
        BookingService.updateBooking(selectedBooking.id, selectedBooking.passengerCount, editData.statusId)
            .then(() => {
                setShowCancelModal(false)
                setSelectedBooking(null)
                fetchAll()
                showAlert('success', 'Reserva cancelada correctamente')
            })
            .catch(err => showAlert('danger', err.response?.data || 'Error al cancelar la reserva'))
    }

    const showAlert = (type, message) => {
        setAlertModal({ type, message })
        setTimeout(() => setAlertModal(null), 2000)
    }

    const getStatusBadge = (name) => {
        switch (name) {
            case 'CONFIRMED': return 'bg-success'
            case 'PENDING_PAYMENT': return 'bg-warning text-dark'
            case 'CANCELLED': return 'bg-danger'
            case 'EXPIRED': return 'bg-secondary'
            default: return 'bg-primary'
        }
    }

    const filteredBookings = filterStatusId
        ? bookings.filter(b => b.status?.id === parseInt(filterStatusId))
        : bookings

    if (!initialized || loading) return <div className="text-center mt-4"><div className="spinner-border" /></div>

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Reservas</h2>
                <button className="btn btn-success"
                    onClick={() => { setFormData({ packageId: '', userId: '', passengerCount: '' }); setShowCreateModal(true) }}>
                    <FaPlus /> Nueva reserva
                </button>
            </div>

            <div className="mb-3" style={{ maxWidth: '250px' }}>
                <select className="form-select" value={filterStatusId}
                    onChange={e => setFilterStatusId(e.target.value)}>
                    <option value="">Todos los estados</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Paquete</th>
                        <th>Pasajeros</th>
                        <th>Monto base</th>
                        <th>Descuento</th>
                        <th>Monto final</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.length === 0 ? (
                        <tr><td colSpan={10} className="text-center">No hay reservas registradas</td></tr>
                    ) : (
                        filteredBookings.map(booking => (
                            <tr key={booking.id}>
                                <td>{booking.id}</td>
                                <td>{booking.user?.fullName}</td>
                                <td>{booking.touristPackage?.name}</td>
                                <td>{booking.passengerCount}</td>
                                <td>${booking.baseAmount}</td>
                                <td>${booking.discountAmount}</td>
                                <td>${booking.finalAmount}</td>
                                <td>
                                    <span className={`badge ${getStatusBadge(booking.status?.name)}`}>
                                        {booking.status?.name}
                                    </span>
                                </td>
                                <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn btn-sm btn-info me-2 text-white"
                                        onClick={() => { setSelectedBooking(booking); setShowDetailModal(true) }}>
                                        <FaEye /> Ver
                                    </button>
                                    <button className="btn btn-sm btn-warning me-2"
                                        onClick={() => handleEditClick(booking)}>
                                        <FaEdit /> Editar
                                    </button>
                                    {booking.status?.name !== 'CANCELLED' && booking.status?.name !== 'E' && booking.status?.name !== 'CONFIRMED' && (
                                        <button className="btn btn-sm btn-danger"
                                            onClick={() => handleCancelClick(booking)}>
                                            <FaBan /> Cancelar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Modal Crear */}
            {showCreateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Nueva Reserva</h5>
                                <button className="btn-close" onClick={() => setShowCreateModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <RequiredLabel text="Usuario" />
                                    <select className="form-select" value={formData.userId}
                                        onChange={e => setFormData({ ...formData, userId: e.target.value })}>
                                        <option value="">Selecciona...</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <RequiredLabel text="Paquete" />
                                    <select className="form-select" value={formData.packageId}
                                        onChange={e => setFormData({ ...formData, packageId: e.target.value })}>
                                        <option value="">Selecciona...</option>
                                        {packages.filter(p => p.status?.name === 'AVAILABLE').map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} - ${p.price} ({p.availableSlots} cupos)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <RequiredLabel text="Cantidad de pasajeros" />
                                    <input type="number" className="form-control" value={formData.passengerCount}
                                        onChange={e => setFormData({ ...formData, passengerCount: e.target.value })}
                                        min="1" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}><FaTimes /> Cancelar</button>
                                <button className="btn btn-primary" onClick={handleCreate}><FaCheck /> Crear reserva</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar */}
            {showEditModal && selectedBooking && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Editar Reserva #{selectedBooking.id}</h5>
                                <button className="btn-close" onClick={() => setShowEditModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <RequiredLabel text="Estado" />
                                    <select className="form-select" value={editData.statusId}
                                        onChange={e => setEditData({ ...editData, statusId: e.target.value })}>
                                        <option value="">Selecciona...</option>
                                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <RequiredLabel text="Cantidad de pasajeros" />
                                    <input type="number" className="form-control" value={editData.passengerCount}
                                        onChange={e => setEditData({ ...editData, passengerCount: e.target.value })}
                                        min="1" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}><FaTimes /> Cancelar</button>
                                <button className="btn btn-primary" onClick={handleEdit}><FaCheck /> Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalle */}
            {showDetailModal && selectedBooking && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-info text-white">
                                <h5 className="modal-title">Detalle Reserva #{selectedBooking.id}</h5>
                                <button className="btn-close" onClick={() => setShowDetailModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>Cliente:</strong> {selectedBooking.user?.fullName}</p>
                                        <p><strong>Email:</strong> {selectedBooking.user?.email}</p>
                                        <p><strong>Paquete:</strong> {selectedBooking.touristPackage?.name}</p>
                                        <p><strong>Destino:</strong> {selectedBooking.touristPackage?.destination?.name}</p>
                                        <p><strong>Pasajeros:</strong> {selectedBooking.passengerCount}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Monto base:</strong> ${selectedBooking.baseAmount}</p>
                                        <p><strong>Descuento:</strong> ${selectedBooking.discountAmount}</p>
                                        <p><strong>Monto final:</strong> <span className="fw-bold text-success">${selectedBooking.finalAmount}</span></p>
                                        <p><strong>Descuentos aplicados:</strong> {selectedBooking.discountDetail || 'Ninguno'}</p>
                                        <p><strong>Estado:</strong> <span className={`badge ${getStatusBadge(selectedBooking.status?.name)}`}>{selectedBooking.status?.name}</span></p>
                                        <p><strong>Fecha creación:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</p>
                                        <p><strong>Expira:</strong> {selectedBooking.expiresAt ? new Date(selectedBooking.expiresAt).toLocaleString() : '-'}</p>
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

            {/* Modal Cancelar */}
            {showCancelModal && selectedBooking && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Cancelar Reserva</h5>
                                <button className="btn-close" onClick={() => setShowCancelModal(false)} />
                            </div>
                            <div className="modal-body">
                                ¿Estás seguro de cancelar la reserva <strong>#{selectedBooking.id}</strong> de <strong>{selectedBooking.user?.fullName}</strong>?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}><FaTimes /> No</button>
                                <button className="btn btn-danger" onClick={handleCancel}><FaBan /> Sí, cancelar</button>
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

export default Bookings