import { useState, useEffect } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import SeasonService from '../../services/season.service'
import StatusService from '../../services/status.service'
import requiredLabel from '../../components/RequiredLabel'
import { FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa'

const Seasons = () => {
    const { keycloak, initialized } = useKeycloak()
    const [seasons, setSeasons] = useState([])
    const [statuses, setStatuses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedSeason, setSelectedSeason] = useState(null)
    const [formData, setFormData] = useState({ name: '', status: { id: '' } })
    const [alertModal, setAlertModal] = useState(null)

    useEffect(() => {
        if (initialized && keycloak.authenticated) {
            fetchSeasons()
            fetchStatuses()
        }
    }, [initialized, keycloak.authenticated])

    const fetchSeasons = () => {
        setLoading(true)
        SeasonService.getAll()
            .then(response => { setSeasons(response.data); setLoading(false) })
            .catch(() => { showAlert('danger', 'Error al cargar las temporadas'); setLoading(false) })
    }

    const fetchStatuses = () => {
        StatusService.getByEntityType('SEASON')
            .then(response => setStatuses(response.data))
            .catch(() => showAlert('danger', 'Error al cargar los estados'))
    }

    const handleCreate = () => {
        if (!formData.name.trim() || !formData.status.id) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }
        SeasonService.create(formData)
            .then(() => {
                setShowCreateModal(false)
                setFormData({ name: '', status: { id: '' } })
                fetchSeasons()
                showAlert('success', 'Temporada creada correctamente')
            })
            .catch(() => showAlert('danger', 'Error al crear la temporada'))
    }

    const handleEditClick = (season) => {
        setSelectedSeason(season)
        setFormData({ name: season.name, status: { id: season.status?.id || '' } })
        setShowEditModal(true)
    }

    const handleEdit = () => {
        if (!formData.name.trim() || !formData.status.id) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }
        SeasonService.update(selectedSeason.id, formData)
            .then(() => {
                setShowEditModal(false)
                setSelectedSeason(null)
                fetchSeasons()
                showAlert('success', 'Temporada editada correctamente')
            })
            .catch(() => showAlert('danger', 'Error al editar la temporada'))
    }

    const handleDeleteClick = (season) => {
        setSelectedSeason(season)
        setShowDeleteModal(true)
    }

    const handleDelete = () => {
        SeasonService.remove(selectedSeason.id)
            .then(() => {
                setShowDeleteModal(false)
                setSelectedSeason(null)
                fetchSeasons()
                showAlert('success', 'Temporada eliminada correctamente')
            })
            .catch(() => showAlert('danger', 'Error al eliminar la temporada'))
    }

    const showAlert = (type, message) => {
        setAlertModal({ type, message })
        setTimeout(() => setAlertModal(null), 2000)
    }

    if (!initialized || loading) return <div className="text-center mt-4"><div className="spinner-border" /></div>

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Temporadas</h2>
                <button className="btn btn-success" onClick={() => { setFormData({ name: '', status: { id: '' } }); setShowCreateModal(true) }}>
                    <FaPlus /> Agregar temporada
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
                    {seasons.length === 0 ? (
                        <tr><td colSpan={5} className="text-center">No hay temporadas registradas</td></tr>
                    ) : (
                        seasons.map(season => (
                            <tr key={season.id}>
                                <td>{season.id}</td>
                                <td>{season.name}</td>
                                <td>{season.status?.name}</td>
                                <td>{new Date(season.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(season)}><FaEdit /> Editar</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(season)}><FaTrash /> Eliminar</button>
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
                                <h5 className="modal-title">Nueva Temporada</h5>
                                <button className="btn-close" onClick={() => setShowCreateModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <RequiredLabel text='Nombre'/>
                                    <input type="text" className="form-control" value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: SUMMER" />
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
                                <h5 className="modal-title">Editar Temporada</h5>
                                <button className="btn-close" onClick={() => setShowEditModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <RequiredLabel text='Nombre'/>
                                    <input type="text" className="form-control" value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })} />
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
                                ¿Estás seguro de eliminar la temporada <strong>{selectedSeason?.name}</strong>?
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

export default Seasons