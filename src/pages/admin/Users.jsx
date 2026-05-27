// src/pages/admin/Users.jsx
import { useState, useEffect } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import UserService from '../../services/user.service'
import StatusService from '../../services/status.service'
import RequiredLabel from '../../components/RequiredLabel'
import { FaCheck, FaTimes, FaEdit, FaTrash, FaSave } from 'react-icons/fa'

const Users = () => {
    const { keycloak, initialized } = useKeycloak()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [formData, setFormData] = useState({ fullName: '', phone: '', documentId: '', nationality: '', status: { id: '' } })
    const [alertModal, setAlertModal] = useState(null)
    const [statuses, setStatuses] = useState([])
    const [showActivateModal, setShowActivateModal] = useState(false)

    useEffect(() => {
        if (initialized && keycloak.authenticated) {
            fetchUsers()
            fetchStatuses()
        }
    }, [initialized, keycloak.authenticated])

    const fetchUsers = () => {
        setLoading(true)
        UserService.getAll()
            .then(res => { setUsers(res.data); setLoading(false) })
            .catch(() => { showAlert('danger', 'Error al cargar los usuarios'); setLoading(false) })
    }

    const fetchStatuses = () => {
        StatusService.getByEntityType('USER')
            .then(response => setStatuses(response.data))
            .catch(() => showAlert('danger', 'Error al cargar los estados'))
    }

    const handleEditClick = (user) => {
        setSelectedUser(user)
        setFormData({
            fullName: user.fullName || '',
            phone: user.phone || '',
            documentId: user.documentId || '',
            nationality: user.nationality || '',
            status: user.status || { id: '' }
        })
        setShowEditModal(true)
    }

    const handleActivateClick = (user) => {
    setSelectedUser(user)
    setShowActivateModal(true)
    }

    const handleActivate = () => {
        const activeStatus = statuses.find(s => s.name === 'ACTIVE')
        UserService.update(selectedUser.id, { ...selectedUser, status: { id: activeStatus.id } })
            .then(() => {
                setShowActivateModal(false)
                setSelectedUser(null)
                fetchUsers()
                showAlert('success', 'Usuario activado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al activar el usuario'))
    }

    const handleEdit = () => {
        if (!formData.fullName.trim()||!formData.phone.trim()||!formData.documentId.trim()||!formData.status.id) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios' />)
            return
        }
        UserService.update(selectedUser.id, { ...selectedUser, ...formData })
            .then(() => {
                setShowEditModal(false)
                setSelectedUser(null)
                fetchUsers()
                showAlert('success', 'Usuario actualizado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al actualizar el usuario'))
    }

    const handleDeleteClick = (user) => {
        setSelectedUser(user)
        setShowDeleteModal(true)
    }

    const handleDelete = () => {
        const inactiveStatus = statuses.find(s => s.name === 'INACTIVE')
        UserService.update(selectedUser.id, { ...selectedUser, status: { id: inactiveStatus.id } })
            .then(() => {
                setShowDeleteModal(false)
                setSelectedUser(null)
                fetchUsers()
                showAlert('success', 'Usuario desactivado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al desactivar el usuario'))
    }

    const showAlert = (type, message) => {
        setAlertModal({ type, message })
        setTimeout(() => setAlertModal(null), 2000)
    }

    if (!initialized || loading) return <div className="text-center mt-4"><div className="spinner-border" /></div>

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Usuarios</h2>
            </div>

            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nombre completo</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Documento</th>
                        <th>Nacionalidad</th>
                        <th>Estado</th>
                        <th>Fecha creación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr><td colSpan={9} className="text-center">No hay usuarios registrados</td></tr>
                    ) : (
                        users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || '—'}</td>
                                <td>{user.documentId || '—'}</td>
                                <td>{user.nationality || '—'}</td>
                                <td>{user.status?.name}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2"
                                        onClick={() => handleEditClick(user)}>
                                        <FaEdit /> Editar
                                    </button>
                                    {user.status?.name === 'INACTIVE' ? (
                                    <button className="btn btn-sm btn-success"
                                        onClick={() => handleActivateClick(user)}>
                                        <FaCheck /> Activar
                                    </button>
                                        ) : (
                                            <button className="btn btn-sm btn-danger"
                                                onClick={() => handleDeleteClick(user)}>
                                                <FaTrash /> Desactivar
                                            </button>
                                        )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Modal Editar */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Editar Usuario</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowEditModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <RequiredLabel text="Nombre completo" />
                                    <input type="text" className="form-control" value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <RequiredLabel text="Teléfono" />
                                    <input type="text" className="form-control" value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <RequiredLabel text="Documento de identidad" />
                                    <input type="text" className="form-control" value={formData.documentId}
                                        onChange={e => setFormData({ ...formData, documentId: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Nacionalidad</label>
                                    <input type="text" className="form-control" value={formData.nationality}
                                        onChange={e => setFormData({ ...formData, nationality: e.target.value })} />
                                </div>
                                 <div className="mb-3">
                                    <RequiredLabel text='Estado'/>
                                    <select className="form-select" value={formData.status.id}
                                        onChange={e => setFormData({ ...formData, status: { id: e.target.value } })}>
                                        <option value="">Selecciona...</option>
                                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    <FaTimes /> Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handleEdit}>
                                    <FaSave /> Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Desactivar */}
            {showDeleteModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Confirmar desactivación</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)} />
                            </div>
                            <div className="modal-body">
                                ¿Estás seguro de desactivar al usuario <strong>{selectedUser?.fullName}</strong>?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                    <FaTimes /> Cancelar
                                </button>
                            <button className="btn btn-sm btn-danger"
                                onClick={handleDelete}
                                disabled={selectedUser?.status?.name === 'INACTIVE'}>
                                <FaTrash /> Desactivar
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            
            {/* Modal Activar */}
            {showActivateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">Confirmar activación</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowActivateModal(false)} />
                            </div>
                            <div className="modal-body">
                                ¿Estás seguro de activar al usuario <strong>{selectedUser?.fullName}</strong>?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowActivateModal(false)}>
                                    <FaTimes /> Cancelar
                                </button>
                                <button className="btn btn-success" onClick={handleActivate}>
                                    <FaCheck /> Activar
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

export default Users