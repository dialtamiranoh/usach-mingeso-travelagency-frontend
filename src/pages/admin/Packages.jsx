import { useState, useEffect } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import TouristPackageService from '../../services/tourist-package.service'
import StatusService from '../../services/status.service'
import PackageTypeService from '../../services/package-type.service'
import CategoryService from '../../services/category.service'
import SeasonService from '../../services/season.service'
import DestinationService from '../../services/destination.service'
import PackageServiceService from '../../services/package-service.service'
import PromotionService from '../../services/promotion.service'
import RequiredLabel from '../../components/RequiredLabel'
import DualListBox from '../../components/DualListBox'
import { FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa'

const emptyForm = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    durationDays: '',
    price: '',
    totalSlots: '',
    availableSlots: '',
    conditions: '',
    restrictions: '',
    destination: { id: '' },
    type: { id: '' },
    category: { id: '' },
    season: { id: '' },
    status: { id: '' },
    services: [],
    promotions: []
}

const Packages = () => {
    const { keycloak, initialized } = useKeycloak()
    const [packages, setPackages] = useState([])
    const [statuses, setStatuses] = useState([])
    const [packageTypes, setPackageTypes] = useState([])
    const [categories, setCategories] = useState([])
    const [seasons, setSeasons] = useState([])
    const [destinations, setDestinations] = useState([])
    const [allServices, setAllServices] = useState([])
    const [allPromotions, setAllPromotions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [formData, setFormData] = useState(emptyForm)
    const [alertModal, setAlertModal] = useState(null)

    useEffect(() => {
        if (initialized && keycloak.authenticated) {
            fetchAll()
        }
    }, [initialized, keycloak.authenticated])

    const fetchAll = () => {
        setLoading(true)
        Promise.all([
            TouristPackageService.getAll(),
            StatusService.getByEntityType('PACKAGE'),
            PackageTypeService.getAll(),
            CategoryService.getAll(),
            SeasonService.getAll(),
            DestinationService.getAll(),
            PackageServiceService.getAll(),
            PromotionService.getAll()
        ]).then(([pkgs, sts, types, cats, seas, dests, svcs, promos]) => {
            setPackages(pkgs.data)
            setStatuses(sts.data)
            setPackageTypes(types.data)
            setCategories(cats.data)
            setSeasons(seas.data)
            setDestinations(dests.data)
            setAllServices(svcs.data)
            setAllPromotions(promos.data)
            setLoading(false)
        }).catch(() => {
            showAlert('danger', 'Error al cargar los datos')
            setLoading(false)
        })
    }

    const buildPayload = (data) => ({
        ...data,
        durationDays: parseInt(data.durationDays),
        price: parseFloat(data.price),
        totalSlots: parseInt(data.totalSlots),
        availableSlots: parseInt(data.availableSlots),
        promotions: data.promotions.map(p => ({ ...p, isAccumulable: p.isAccumulable ?? false })),
        services: data.services.map(s => ({ id: s.id })),
    })

    const handleCreate = () => {
        if (!formData.name.trim() || !formData.description.trim() || !formData.destination.id ||
            !formData.startDate || !formData.endDate || !formData.durationDays ||
            !formData.price || !formData.totalSlots ||
            !formData.type.id || !formData.category.id || !formData.season.id || !formData.status.id) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }

        if (formData.endDate <= formData.startDate) {
            showAlert('danger', 'La fecha de término debe ser posterior a la fecha de inicio')
            return
        }
        console.log('payload:', JSON.stringify(formData))

        TouristPackageService.create(buildPayload(formData))
            .then(() => {
                setShowCreateModal(false)
                setFormData(emptyForm)
                fetchAll()
                showAlert('success', 'Paquete creado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al crear el paquete'))
    }

    const handleEditClick = (pkg) => {
        setSelectedPackage(pkg)
        setFormData({
            name: pkg.name,
            description: pkg.description || '',
            startDate: pkg.startDate || '',
            endDate: pkg.endDate || '',
            durationDays: pkg.durationDays || '',
            price: pkg.price || '',
            totalSlots: pkg.totalSlots || '',
            availableSlots: pkg.availableSlots || '',
            conditions: pkg.conditions || '',
            restrictions: pkg.restrictions || '',
            destination: { id: pkg.destination?.id || '' },
            type: { id: pkg.type?.id || '' },
            category: { id: pkg.category?.id || '' },
            season: { id: pkg.season?.id || '' },
            status: { id: pkg.status?.id || '' },
            services: pkg.services || [],
            promotions: pkg.promotions || []
        })
        setShowEditModal(true)
    }

    const handleEdit = () => {
        if (!formData.name.trim() || !formData.description.trim() || !formData.destination.id ||
            !formData.startDate || !formData.endDate || !formData.durationDays ||
            !formData.price || !formData.totalSlots ||
            !formData.type.id || !formData.category.id || !formData.season.id || !formData.status.id) {
            showAlert('danger', <RequiredLabel text='Faltan campos obligatorios'/>)
            return
        }
        TouristPackageService.update(selectedPackage.id, buildPayload(formData))
            .then(() => {
                setShowEditModal(false)
                setSelectedPackage(null)
                fetchAll()
                showAlert('success', 'Paquete editado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al editar el paquete'))
    }

    const handleDeleteClick = (pkg) => {
        setSelectedPackage(pkg)
        setShowDeleteModal(true)
    }

    const handleDelete = () => {
        TouristPackageService.remove(selectedPackage.id)
            .then(() => {
                setShowDeleteModal(false)
                setSelectedPackage(null)
                fetchAll()
                showAlert('success', 'Paquete eliminado correctamente')
            })
            .catch(() => showAlert('danger', 'Error al eliminar el paquete'))
    }

    const showAlert = (type, message) => {
        setAlertModal({ type, message })
        setTimeout(() => setAlertModal(null), 2000)
    }

    const availableServices = allServices.filter(s => !formData.services.find(sel => sel.id === s.id))
    const availablePromotions = allPromotions.filter(p => !formData.promotions.find(sel => sel.id === p.id))

    const formFields = (
        <>
            <div className="row">
                <div className="col mb-3">
                    <RequiredLabel text="Nombre" />
                    <input type="text" className="form-control" value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nombre del paquete" />
                </div>
                <div className="col mb-3">
                    <RequiredLabel text="Destino" />
                    <select className="form-select" value={formData.destination.id}
                        onChange={e => setFormData({ ...formData, destination: { id: e.target.value } })}>
                        <option value="">Selecciona...</option>
                        {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="mb-3">
                <RequiredLabel text="Descripción" />
                <textarea className="form-control" rows={3} value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="row">
                <div className="col mb-3">
                    <RequiredLabel text="Fecha inicio" />
                    <input type="date" className="form-control" value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div className="col mb-3">
                    <RequiredLabel text="Fecha término" />
                    <input type="date" className="form-control" value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
                <div className="col mb-3">
                    <RequiredLabel text="Duración (días)" />
                    <input type="number" className="form-control" value={formData.durationDays}
                        onChange={e => setFormData({ ...formData, durationDays: e.target.value })} min="1" />
                </div>
            </div>
            <div className="row">
                <div className="col mb-3">
                    <RequiredLabel text="Precio" />
                    <input type="number" className="form-control" value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })} min="0" />
                </div>
            <div className="col mb-3">
                <RequiredLabel text="Cupos totales" />
                <input type="number" className="form-control" value={formData.totalSlots}
                    onChange={e => setFormData({ 
                        ...formData, 
                        totalSlots: e.target.value,
                        availableSlots: e.target.value
                    })} min="1" />
            </div>
            </div>
            <div className="row">
                <div className="col mb-3">
                    <RequiredLabel text="Tipo" />
                    <select className="form-select" value={formData.type.id}
                        onChange={e => setFormData({ ...formData, type: { id: e.target.value } })}>
                        <option value="">Selecciona...</option>
                        {packageTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div className="col mb-3">
                    <RequiredLabel text="Categoría" />
                    <select className="form-select" value={formData.category.id}
                        onChange={e => setFormData({ ...formData, category: { id: e.target.value } })}>
                        <option value="">Selecciona...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="col mb-3">
                    <RequiredLabel text="Temporada" />
                    <select className="form-select" value={formData.season.id}
                        onChange={e => setFormData({ ...formData, season: { id: e.target.value } })}>
                        <option value="">Selecciona...</option>
                        {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="col mb-3">
                    <RequiredLabel text="Estado" />
                    <select className="form-select" value={formData.status.id}
                        onChange={e => setFormData({ ...formData, status: { id: e.target.value } })}>
                        <option value="">Selecciona...</option>
                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label">Condiciones</label>
                <textarea className="form-control" rows={2} value={formData.conditions}
                    onChange={e => setFormData({ ...formData, conditions: e.target.value })} />
            </div>
            <div className="mb-3">
                <label className="form-label">Restricciones</label>
                <textarea className="form-control" rows={2} value={formData.restrictions}
                    onChange={e => setFormData({ ...formData, restrictions: e.target.value })} />
            </div>
            <div className="mb-3">
                <label className="form-label">Servicios incluidos</label>
                <DualListBox
                    available={availableServices}
                    selected={formData.services}
                    onAdd={item => setFormData({ ...formData, services: [...formData.services, item] })}
                    onRemove={item => setFormData({ ...formData, services: formData.services.filter(s => s.id !== item.id) })}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Promociones</label>
                <DualListBox
                    available={availablePromotions}
                    selected={formData.promotions}
                    onAdd={item => setFormData({ ...formData, promotions: [...formData.promotions, item] })}
                    onRemove={item => setFormData({ ...formData, promotions: formData.promotions.filter(p => p.id !== item.id) })}
                />
            </div>
        </>
    )

    if (!initialized || loading) return <div className="text-center mt-4"><div className="spinner-border" /></div>

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Paquetes Turísticos</h2>
                <button className="btn btn-success" onClick={() => { setFormData(emptyForm); setShowCreateModal(true) }}>
                    <FaPlus /> Agregar paquete
                </button>
            </div>

            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Destino</th>
                        <th>Precio</th>
                        <th>Cupos</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {packages.length === 0 ? (
                        <tr><td colSpan={7} className="text-center">No hay paquetes registrados</td></tr>
                    ) : (
                        packages.map(pkg => (
                            <tr key={pkg.id}>
                                <td>{pkg.id}</td>
                                <td>{pkg.name}</td>
                                <td>{pkg.destination?.name}</td>
                                <td>${pkg.price}</td>
                                <td>{pkg.availableSlots}/{pkg.totalSlots}</td>
                                <td>{pkg.status?.name}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(pkg)}><FaEdit /> Editar</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(pkg)}><FaTrash /> Eliminar</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Modal Crear */}
            {showCreateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Nuevo Paquete Turístico</h5>
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
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Editar Paquete Turístico</h5>
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
                                ¿Estás seguro de eliminar el paquete <strong>{selectedPackage?.name}</strong>?
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

export default Packages