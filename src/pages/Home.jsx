// src/pages/Home.jsx
import { useState, useEffect, useCallback } from 'react'
import { useKeycloak } from '@react-keycloak/web'
import { FaSearch, FaFilter, FaSlidersH } from 'react-icons/fa'
import PackageCard from '../components/PackageCard'
import FilterBar from '../components/FilterBar'
import TouristPackageService from '../services/tourist-package.service'
import DestinationService from '../services/destination.service'
import CategoryService from '../services/category.service'
import PackageTypeService from '../services/package-type.service'



const initialFilters = {
    destinationId: '',
    categoryId: '',
    packageTypeId: '',
    minPrice: '',
    maxPrice: '',
    startDate: '',
    endDate: ''
}

const Home = () => {

    const { keycloak, initialized } = useKeycloak()
    
    // Catálogos
    const [destinations, setDestinations] = useState([])
    const [categories, setCategories] = useState([])
    const [packageTypes, setPackageTypes] = useState([])

    // Filtros
    const [filters, setFilters] = useState(initialFilters)
    const [search, setSearch] = useState('')

    // Resultados
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Cargar catálogos
    useEffect(() => {
        if (!initialized || !keycloak.authenticated) return
        Promise.all([
            DestinationService.getAll(),
            CategoryService.getAll(),
            PackageTypeService.getAll()
        ]).then(([dRes, cRes, ptRes]) => {
            setDestinations(dRes.data || [])
            setCategories(cRes.data || [])
            setPackageTypes(ptRes.data || [])
        }).catch(() => {})
    }, [initialized, keycloak.authenticated])

    

    // Cargar paquetes — se dispara cada vez que cambia un filtro
    const fetchPackages = useCallback(() => {
        if (!initialized || !keycloak.authenticated) return
        setLoading(true)
        setError(null)
        const params = {}
        if (filters.destinationId) params.destinationId = filters.destinationId
        if (filters.categoryId) params.categoryId = filters.categoryId
        if (filters.packageTypeId) params.packageTypeId = filters.packageTypeId
        if (filters.minPrice) params.minPrice = filters.minPrice
        if (filters.maxPrice) params.maxPrice = filters.maxPrice
        if (filters.startDate) params.startDate = filters.startDate
        if (filters.endDate) params.endDate = filters.endDate

        TouristPackageService.getAvailable(params)
            .then(res => setPackages(res.data || []))
            .catch(() => setError('Error al cargar los paquetes disponibles.'))
            .finally(() => setLoading(false))
    }, [filters, initialized, keycloak.authenticated])

    useEffect(() => {
        if (!initialized || !keycloak.authenticated) return
        fetchPackages()
    }, [fetchPackages, initialized, keycloak.authenticated])

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const handleClear = () => {
        setFilters(initialFilters)
        setSearch('')
    }

    // Filtro local por nombre/descripción/destino
    const displayed = packages.filter(pkg => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            pkg.name?.toLowerCase().includes(q) ||
            pkg.description?.toLowerCase().includes(q) ||
            pkg.destination?.name?.toLowerCase().includes(q)
        )
    })

    return (
        <>
            {/* Hero */}
            <div className="bg-dark text-white py-5">
                <div className="container">
                    <h1 className="fw-bold mb-1">Explora nuestros paquetes</h1>
                    <p className="text-muted mb-4">Encuentra el viaje perfecto para ti</p>

                    {/* Buscador + botón filtros */}
                    <div className="d-flex gap-2">
                        <div className="input-group" style={{ maxWidth: '480px' }}>
                            <span className="input-group-text bg-white border-end-0">
                                <FaSearch className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Buscar por nombre, destino o descripción..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            {search && (
                                <button className="btn btn-outline-secondary"
                                    onClick={() => setSearch('')}>
                                    &times;
                                </button>
                            )}
                        </div>
                        <button
                            className="btn btn-outline-light d-flex align-items-center gap-2"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#filterCollapse"
                            aria-expanded="false"
                            aria-controls="filterCollapse">
                            <FaSlidersH /> Filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* FilterBar */}
            <FilterBar
                destinations={destinations}
                categories={categories}
                packageTypes={packageTypes}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClear}
            />

            {/* Contenido */}
            <div className="container py-4">
                {/* Contador */}
                <p className="text-muted small mb-3">
                    {loading ? 'Cargando...' : `${displayed.length} paquete${displayed.length !== 1 ? 's' : ''} encontrado${displayed.length !== 1 ? 's' : ''}`}
                </p>

                {/* Error */}
                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                )}

                {/* Sin resultados */}
                {!loading && !error && displayed.length === 0 && (
                    <div className="text-center py-5">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <p className="text-muted">No se encontraron paquetes con los filtros actuales.</p>
                        <button className="btn btn-outline-primary btn-sm" onClick={handleClear}>
                            Limpiar filtros
                        </button>
                    </div>
                )}

                {/* Grid Album style */}
                {!loading && !error && displayed.length > 0 && (
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                        {displayed.map(pkg => (
                            <div className="col" key={pkg.id}>
                                <PackageCard pkg={pkg} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default Home