import { useState, useEffect } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import PackageTypeService from '../../services/package-type.service'
import StatusService from '../../services/status.service'
import RequiredLabel from '../../components/RequiredLabel'
import { FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa'

const PackageTypes = () => {
    const { keycloak, initialized } = useKeycloak()
    const [packageTypes, setPackageTypes] = useState([])
    const [statuses, setStatuses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPackageType, setSelectedPackageType] = useState(null)
    const [formData, setFormData] = useState({ name: '', status: { id: '' } })
    const [alertModal, setAlertModal] = useState(null)

    useEffect(() => {
        if (initialized && keycloak.authenticated) {
            fetchPackageTypes()
            fetchStatuses()
        }
    }, [initialized, keycloak.authenticated])

    const fetchPackageTypes = () => {
        setLoading(true)
        PackageTypeService.getAll()
            .then(response => { setPackageTypes(response.data); setLoading(false) })
            .catch(() => { showAlert('danger', 'Error al cargar los tipos de paquete'); setLoading(false) })
    }

    const fetchStatuses = () => {
        StatusService.getByEntityType('PACKAGE_TYPE')
            .then(response => setStatuses(response.data))
            .catch(() => showAlert('danger', 'Error al cargar los estados'))
    }

    const handleCreate = () => {
        if (!formData.name.trim() || !formData.status.id) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }
        PackageTypeService.create(formData)
            .then(() => {
                setShowCreateModal(false)
                setFormData({ name: '', status: { id: '' } })
                fetchPackageTypes()
                showAlert('success', 'Tipo de paquete creado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al crear el tipo de paquete'))
    }

    const handleEditClick = (packageType) => {
        setSelectedPackageType(packageType)
        setFormData({ name: packageType.name, status: { id: packageType.status?.id || '' } })
        setShowEditModal(true)
    }

    const handleEdit = () => {
        if (!formData.name.trim() || !formData.status.id) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }
        PackageTypeService.update(selectedPackageType.id, formData)
            .then(() => {
                setShowEditModal(false)
                setSelectedPackageType(null)
                fetchPackageTypes()
                showAlert('success', 'Tipo de paquete editado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al editar el tipo de paquete'))
    }

    const handleDeleteClick = (packageType) => {
        setSelectedPackageType(packageType)
        setShowDeleteModal(true)
    }

    const handleDelete = () => {
        PackageTypeService.remove(selectedPackageType.id)
            .then(() => {
                setShowDeleteModal(false)
                setSelectedPackageType(null)
                fetchPackageTypes()
                showAlert('success', 'Tipo de paquete eliminado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al eliminar el tipo de paquete'))
    }

    const showAlert = (type, message) => {
        setAlertModal({ type, message })
        setTimeout(() => setAlertModal(null), 2000)
    }

    if (!initialized || loading) return <div className="text-center mt-4"><div className="spinner-border" /></div>

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Tipos de Paquete</h2>
                <button className="btn btn-success" onClick={() => { setFormData({ name: '', status: { id: '' } }); setShowCreateModal(true) }}>
                    <FaPlus /> Agregar tipo
                </button>
            </div>

            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Fecha creación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {packageTypes.length === 0 ? (
                        <tr><td colSpan={5} className="text-center">No hay tipos de paquete registrados</td></tr>
                    ) : (
                        packageTypes.map(packageType => (
                            <tr key={packageType.id}>
                                <td>{packageType.id}</td>
                                <td>{packageType.name}</td>
                                <td>{packageType.status?.name}</td>
                                <td>{new Date(packageType.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(packageType)}><FaEdit /> Editar</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(packageType)}><FaTrash /> Eliminar</button>
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
                                <h5 className="modal-title">Nuevo Tipo de Paquete</h5>
                                <button className="btn-close" onClick={() => setShowCreateModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <RequiredLabel text="Nombre" />
                                    <input type="text" className="form-control" value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: NATIONAL" />
                                </div>
                                <div className="mb-3">
                                    <RequiredLabel text="Estado" />
                                    <select className="form-select" value={formData.status.id}
                                        onChange={e => setFormData({ ...formData, status: { id: e.target.value } })}>
                                        <option value="">Selecciona...</option>
                                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}><FaTimes /> Cancelar</button>
                                <button className="btn btn-primary" onClick={handleCreate}><FaSave /> Guardar</button>
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
                                <h5 className="modal-title">Editar Tipo de Paquete</h5>
                                <button className="btn-close" onClick={() => setShowEditModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <RequiredLabel text="Nombre" />
                                    <input type="text" className="form-control" value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <RequiredLabel text="Estado" />
                                    <select className="form-select" value={formData.status.id}
                                        onChange={e => setFormData({ ...formData, status: { id: e.target.value } })}>
                                        <option value="">Selecciona...</option>
                                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}><FaTimes /> Cancelar</button>
                                <button className="btn btn-primary" onClick={handleEdit}><FaSave /> Guardar</button>
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
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Confirmar eliminación</h5>
                                <button className="btn-close" onClick={() => setShowDeleteModal(false)} />
                            </div>
                            <div className="modal-body">
                                ¿Estás seguro de eliminar el tipo <strong>{selectedPackageType?.name}</strong>?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}><FaTimes /> Cancelar</button>
                                <button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Eliminar</button>
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
                                <button className="btn btn-secondary btn-sm" onClick={() => setAlertModal(null)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PackageTypes