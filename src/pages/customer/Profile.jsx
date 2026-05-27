// src/pages/customer/Profile.jsx
import { useState, useEffect } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import UserService from '../../services/user.service'
import RequiredLabel from '../../components/RequiredLabel'
import { FaUser, FaEdit, FaCheck, FaTimes, FaSave } from 'react-icons/fa'

const Profile = () => {
    const { keycloak, initialized } = useKeycloak()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [formData, setFormData] = useState({ fullName: '', phone: '', documentId: '', nationality: '' })
    const [alertModal, setAlertModal] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)

    useEffect(() => {
        if (!initialized || !keycloak.authenticated) return
        const keycloakId = keycloak.tokenParsed.sub
        UserService.getByKeycloakId(keycloakId)
            .then(res => setUser(res.data))
            .catch(() => setError('Error al cargar el perfil.'))
            .finally(() => setLoading(false))
    }, [initialized, keycloak.authenticated])

    const handleEditClick = () => {
        setFormData({
            fullName: user.fullName || '',
            phone: user.phone || '',
            documentId: user.documentId || '',
            nationality: user.nationality || ''
        })
        setShowEditModal(true)
    }

    const handleEdit = () => {
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.documentId.trim() || !formData.nationality.trim()) {
        showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
        return
    }
    UserService.update(user.id, { ...user, ...formData })
        .then(() => {
            setUser(prev => ({ ...prev, ...formData }))
            setShowEditModal(false)
            showAlert('success', 'Perfil actualizado correctamente.')
        })
        .catch(() => showAlert('danger', 'Error al actualizar el perfil.'))
    }
    

    const showAlert = (type, message) => {
        setAlertModal({ type, message })
        setTimeout(() => setAlertModal(null), 2000)
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
        </div>
    )

    return (
        <>
            {/* Hero */}
            <div className="bg-dark text-white py-4">
                <div className="container">
                    <h1 className="fw-bold mb-1">
                        <FaUser className="me-2" />Hola, {user?.fullName || 'usuario'}
                    </h1>
                    <p className="text-muted mb-0">Gestiona tu información personal</p>
                </div>
            </div>

            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Datos personales</span>
                                <button className="btn btn-sm btn-outline-light"
                                    onClick={handleEditClick}>
                                    <FaEdit className="me-1" />Editar
                                </button>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled mb-0">
                                    <li className="py-2 border-bottom">
                                        <div className="text-muted small">Nombre completo</div>
                                        <div className="fw-semibold">{user?.fullName || '—'}</div>
                                    </li>
                                    <li className="py-2 border-bottom">
                                        <div className="text-muted small">Email</div>
                                        <div className="fw-semibold">{user?.email || '—'}</div>
                                    </li>
                                    <li className="py-2 border-bottom">
                                        <div className="text-muted small">Teléfono</div>
                                        <div className="fw-semibold">{user?.phone || '—'}</div>
                                    </li>
                                    <li className="py-2 border-bottom">
                                        <div className="text-muted small">Documento de identidad</div>
                                        <div className="fw-semibold">{user?.documentId || '—'}</div>
                                    </li>
                                    <li className="py-2">
                                        <div className="text-muted small">Nacionalidad</div>
                                        <div className="fw-semibold">{user?.nationality || '—'}</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Editar */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Editar perfil</h5>
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
                                    <RequiredLabel text="Nacionalidad" />
                                    <input type="text" className="form-control" value={formData.nationality}
                                        onChange={e => setFormData({ ...formData, nationality: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    <FaTimes className="me-1" />Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handleEdit}>
                                    <FaSave className="me-1" />Guardar
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
        </>
    )
}

export default Profile