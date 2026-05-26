import { useState, useEffect } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import PromotionService from '../../services/promotion.service'
import StatusService from '../../services/status.service'
import RequiredLabel from '../../components/RequiredLabel'
import { FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa'

const emptyForm = {
    name: '',
    discountPercentage: '',
    minPassengers: '',
    minBookingsSession: '',
    minBookingsHistory: '',
    isAccumulable: false,
    startDate: '',
    endDate: '',
    status: { id: '' }
}

const Promotions = () => {
    const { keycloak, initialized } = useKeycloak()
    const [promotions, setPromotions] = useState([])
    const [statuses, setStatuses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPromotion, setSelectedPromotion] = useState(null)
    const [formData, setFormData] = useState(emptyForm)
    const [alertModal, setAlertModal] = useState(null)

    useEffect(() => {
        if (initialized && keycloak.authenticated) {
            fetchPromotions()
            fetchStatuses()
        }
    }, [initialized, keycloak.authenticated])

    const fetchPromotions = () => {
        setLoading(true)
        PromotionService.getAll()
            .then(response => { setPromotions(response.data); setLoading(false) })
            .catch(() => { showAlert('danger', 'Error al cargar las promociones'); setLoading(false) })
    }

    const fetchStatuses = () => {
        StatusService.getByEntityType('PROMOTION')
            .then(response => setStatuses(response.data))
            .catch(() => showAlert('danger', 'Error al cargar los estados'))
    }

    const buildPayload = (data) => ({
        ...data,
        discountPercentage: data.discountPercentage || null,
        minPassengers: data.minPassengers !== '' ? parseInt(data.minPassengers) : null,
        minBookingsSession: data.minBookingsSession !== '' ? parseInt(data.minBookingsSession) : null,
        minBookingsHistory: data.minBookingsHistory !== '' ? parseInt(data.minBookingsHistory) : null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
    })

    const handleCreate = () => {
        if (!formData.name.trim() || !formData.discountPercentage || !formData.status.id) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }
        PromotionService.create(buildPayload(formData))
            .then(() => {
                setShowCreateModal(false)
                setFormData(emptyForm)
                fetchPromotions()
                showAlert('success', 'Promoción creada correctamente')
            })
            .catch(() => showAlert('danger', 'Error al crear la promoción'))
    }

    const handleEditClick = (promotion) => {
        setSelectedPromotion(promotion)
        setFormData({
            name: promotion.name,
            discountPercentage: promotion.discountPercentage || '',
            minPassengers: promotion.minPassengers ?? '',
            minBookingsSession: promotion.minBookingsSession ?? '',
            minBookingsHistory: promotion.minBookingsHistory ?? '',
            isAccumulable: promotion.isAccumulable || false,
            startDate: promotion.startDate ? promotion.startDate.substring(0, 16) : '',
            endDate: promotion.endDate ? promotion.endDate.substring(0, 16) : '',
            status: { id: promotion.status?.id || '' }
        })
        setShowEditModal(true)
    }

    const handleEdit = () => {
        if (!formData.name.trim() || !formData.discountPercentage || !formData.status.id) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }
        PromotionService.update(selectedPromotion.id, buildPayload(formData))
            .then(() => {
                setShowEditModal(false)
                setSelectedPromotion(null)
                fetchPromotions()
                showAlert('success', 'Promoción editada correctamente')
            })
            .catch(() => showAlert('danger', 'Error al editar la promoción'))
    }

    const handleDeleteClick = (promotion) => {
        setSelectedPromotion(promotion)
        setShowDeleteModal(true)
    }

    const handleDelete = () => {
        PromotionService.remove(selectedPromotion.id)
            .then(() => {
                setShowDeleteModal(false)
                setSelectedPromotion(null)
                fetchPromotions()
                showAlert('success', 'Promoción eliminada correctamente')
            })
            .catch(() => showAlert('danger', 'Error al eliminar la promoción'))
    }

    const showAlert = (type, message) => {
        setAlertModal({ type, message })
        setTimeout(() => setAlertModal(null), 2000)
    }

    const formFields = (
        <>
            <div className="mb-3">
                <RequiredLabel text="Nombre" />
                <input type="text" className="form-control" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Descuento verano" />
            </div>
            <div className="mb-3">
                <RequiredLabel text="% Descuento" />
                <input type="number" className="form-control" value={formData.discountPercentage}
                    onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                    placeholder="Ej: 10" min="0" max="100" />
            </div>
            <div className="row">
                <div className="col mb-3">
                    <label className="form-label">Mín. pasajeros</label>
                    <input type="number" className="form-control" value={formData.minPassengers}
                        onChange={e => setFormData({ ...formData, minPassengers: e.target.value })}
                        placeholder="Vacío = no aplica" min="0" />
                </div>
                <div className="col mb-3">
                    <label className="form-label">Mín. reservas sesión</label>
                    <input type="number" className="form-control" value={formData.minBookingsSession}
                        onChange={e => setFormData({ ...formData, minBookingsSession: e.target.value })}
                        placeholder="Vacío = no aplica" min="0" />
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label">Mín. reservas históricas</label>
                <input type="number" className="form-control" value={formData.minBookingsHistory}
                    onChange={e => setFormData({ ...formData, minBookingsHistory: e.target.value })}
                    placeholder="Vacío = no aplica" min="0" />
            </div>
            <div className="row">
                <div className="col mb-3">
                    <label className="form-label">Fecha inicio</label>
                    <input type="datetime-local" className="form-control" value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div className="col mb-3">
                    <label className="form-label">Fecha término</label>
                    <input type="datetime-local" className="form-control" value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
            </div>
            <div className="mb-3">
                <RequiredLabel text="Estado" />
                <select className="form-select" value={formData.status.id}
                    onChange={e => setFormData({ ...formData, status: { id: e.target.value } })}>
                    <option value="">Selecciona...</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="isAccumulable"
                    checked={formData.isAccumulable}
                    onChange={e => setFormData({ ...formData, isAccumulable: e.target.checked })} />
                <label className="form-check-label" htmlFor="isAccumulable">¿Es acumulable?</label>
            </div>
        </>
    )

    if (!initialized || loading) return <div className="text-center mt-4"><div className="spinner-border" /></div>

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Promociones</h2>
                <button className="btn btn-success" onClick={() => { setFormData(emptyForm); setShowCreateModal(true) }}>
                    <FaPlus /> Agregar promoción
                </button>
            </div>

            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>% Descuento</th>
                        <th>Acumulable</th>
                        <th>Inicio</th>
                        <th>Término</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {promotions.length === 0 ? (
                        <tr><td colSpan={8} className="text-center">No hay promociones registradas</td></tr>
                    ) : (
                        promotions.map(promotion => (
                            <tr key={promotion.id}>
                                <td>{promotion.id}</td>
                                <td>{promotion.name}</td>
                                <td>{promotion.discountPercentage}%</td>
                                <td>{promotion.isAccumulable ? 'Sí' : 'No'}</td>
                                <td>{promotion.startDate ? new Date(promotion.startDate).toLocaleDateString() : '-'}</td>
                                <td>{promotion.endDate ? new Date(promotion.endDate).toLocaleDateString() : '-'}</td>
                                <td>{promotion.status?.name}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(promotion)}><FaEdit /> Editar</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(promotion)}><FaTrash /> Eliminar</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Modal Crear */}
            {showCreateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Nueva Promoción</h5>
                                <button className="btn-close" onClick={() => setShowCreateModal(false)} />
                            </div>
                            <div className="modal-body">{formFields}</div>
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
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Editar Promoción</h5>
                                <button className="btn-close" onClick={() => setShowEditModal(false)} />
                            </div>
                            <div className="modal-body">{formFields}</div>
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
                                ¿Estás seguro de eliminar la promoción <strong>{selectedPromotion?.name}</strong>?
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

export default Promotions