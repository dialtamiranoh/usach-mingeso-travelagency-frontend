import { useState, useEffect } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import StatusService from '../../services/status.service'
import RequiredLabel from '../../components/RequiredLabel'
import { FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa'

const ENTITY_TYPES = [
    'PACKAGE', 'BOOKING', 'PAYMENT', 'PROMOTION', 'USER',
    'CATEGORY', 'SEASON', 'DESTINATION', 'PACKAGE_TYPE', 'SERVICE'
]

const Statuses = () => {
    const { keycloak, initialized } = useKeycloak()
    const [statuses, setStatuses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(null)
    const [formData, setFormData] = useState({ name: '', entityType: '' })
    const [alertModal, setAlertModal] = useState(null) // { type: 'success'|'danger', message: '' }

    useEffect(() => {
        if (initialized && keycloak.authenticated) fetchStatuses()
    }, [initialized, keycloak.authenticated])

    const fetchStatuses = () => {
        setLoading(true)
        StatusService.getAll()
            .then(response => { setStatuses(response.data); setLoading(false) })
            .catch(() => { setError('Error al cargar los estados'); setLoading(false) })
    }

    const handleCreate = () => {
        if (!formData.name.trim() || !formData.entityType) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }
        StatusService.create(formData)
            .then(() => {
                setShowCreateModal(false)
                setFormData({ name: '', entityType: '' })
                fetchStatuses()
                showAlert('success', 'Estado creado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al crear el estado'))
    }

    const handleEditClick = (status) => {
        setSelectedStatus(status)
        setFormData({ name: status.name, entityType: status.entityType })
        setShowEditModal(true)
    }

    const handleEdit = () => {
        if (!formData.name.trim() || !formData.entityType) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }
        StatusService.update(selectedStatus.id, formData)
            .then(() => {
                setShowEditModal(false)
                setSelectedStatus(null)
                fetchStatuses()
                showAlert('success', 'Estado editado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al editar el estado'))
    }

    const handleDeleteClick = (status) => {
        setSelectedStatus(status)
        setShowDeleteModal(true)
    }

    const handleDelete = () => {
        StatusService.remove(selectedStatus.id)
            .then(() => {
                setShowDeleteModal(false)
                setSelectedStatus(null)
                fetchStatuses()
                showAlert('success', 'Estado eliminado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al eliminar el estado'))
    }


    // Función para mostrar alertas temporales
    const showAlert = (type, message) => {
    setAlertModal({ type, message })
    setTimeout(() => setAlertModal(null), 2000)
    }

    if (!initialized || loading) return <div className="text-center mt-4"><div className="spinner-border" /></div>
    if (error) return <div className="alert alert-danger m-4">{error}</div>

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Estados</h2>
                <button className="btn btn-success" onClick={() => { setFormData({ name: '', entityType: '' }); setShowCreateModal(true) }}>
                     <FaPlus/> Agregar estado
                </button>
            </div>

            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Tipo entidad</th>
                        <th>Fecha creación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {statuses.length === 0 ? (
                        <tr><td colSpan={5} className="text-center">No hay estados registrados</td></tr>
                    ) : (
                        statuses.map(status => (
                            <tr key={status.id}>
                                <td>{status.id}</td>
                                <td>{status.name}</td>
                                <td>{status.entityType}</td>
                                <td>{new Date(status.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(status)}><FaEdit/> Editar</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(status)}><FaTrash/> Eliminar</button>
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
                                <h5 className="modal-title">Nuevo Estado</h5>
                                <button className="btn-close" onClick={() => setShowCreateModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <RequiredLabel text='Nombre'/>
                                    <input type="text" className="form-control" value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: AVAILABLE" />
                                </div>
                                <div className="mb-3">
                                    <RequiredLabel text='Tipo de entidad'/>
                                    <select className="form-select" value={formData.entityType}
                                        onChange={e => setFormData({ ...formData, entityType: e.target.value })}>
                                        <option value="">Selecciona...</option>
                                        {ENTITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}><FaTimes/> Cancelar</button>
                                <button className="btn btn-primary" onClick={handleCreate}><FaSave/> Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Editar Estado</h5>
                                <button className="btn-close" onClick={() => setShowEditModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <RequiredLabel text='Nombre'/>
                                    <input type="text" className="form-control" value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <RequiredLabel text='Tipo de entidad'/>
                                    <select className="form-select" value={formData.entityType}
                                        onChange={e => setFormData({ ...formData, entityType: e.target.value })}>
                                        <option value="">Selecciona...</option>
                                        {ENTITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}><FaTimes/> Cancelar</button>
                                <button className="btn btn-primary" onClick={handleEdit}><FaSave/> Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Eliminar */}
            {showDeleteModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Confirmar eliminación</h5>
                                <button className="btn-close" onClick={() => setShowDeleteModal(false)} />
                            </div>
                            <div className="modal-body">
                                ¿Estás seguro de eliminar el estado <strong>{selectedStatus?.name}</strong>?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}><FaTimes/> Cancelar</button>
                                <button className="btn btn-danger" onClick={handleDelete}><FaTrash/> Eliminar</button>
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
                            <div className="modal-body text-center">
                                {alertModal.message}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary btn-sm" onClick={() => setAlertModal(null)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}




export default Statuses