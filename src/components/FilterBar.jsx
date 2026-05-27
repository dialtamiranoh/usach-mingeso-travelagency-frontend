// src/components/FilterBar.jsx
import { FaMapMarkerAlt, FaStar, FaTag, FaCalendarAlt, FaTimes } from 'react-icons/fa'

const FilterBar = ({ destinations, categories, packageTypes, filters, onFilterChange, onClear }) => {

    const hasActiveFilters = Object.values(filters).some(Boolean)

    return (
        <div className="collapse" id="filterCollapse">
            <div className="card card-body border-0 bg-light rounded-0 shadow-sm">
                <div className="row g-3 align-items-end">

                    {/* Destino */}
                    <div className="col-md-2">
                        <label className="form-label small fw-semibold">
                            <FaMapMarkerAlt className="me-1 text-primary" />Destino
                        </label>
                        <select
                            className="form-select form-select-sm"
                            name="destinationId"
                            value={filters.destinationId}
                            onChange={onFilterChange}>
                            <option value="">Todos</option>
                            {destinations.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Categoría */}
                    <div className="col-md-2">
                        <label className="form-label small fw-semibold">
                            <FaStar className="me-1 text-primary" />Categoría
                        </label>
                        <select
                            className="form-select form-select-sm"
                            name="categoryId"
                            value={filters.categoryId}
                            onChange={onFilterChange}>
                            <option value="">Todas</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo */}
                    <div className="col-md-2">
                        <label className="form-label small fw-semibold">
                            <FaTag className="me-1 text-primary" />Tipo
                        </label>
                        <select
                            className="form-select form-select-sm"
                            name="packageTypeId"
                            value={filters.packageTypeId}
                            onChange={onFilterChange}>
                            <option value="">Todos</option>
                            {packageTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Precio mín */}
                    <div className="col-md-1">
                        <label className="form-label small fw-semibold">Precio mín</label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={onFilterChange}
                            placeholder="0"
                            min={0}
                        />
                    </div>

                    {/* Precio máx */}
                    <div className="col-md-1">
                        <label className="form-label small fw-semibold">Precio máx</label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={onFilterChange}
                            placeholder="9999"
                            min={0}
                        />
                    </div>

                    {/* Fecha desde */}
                    <div className="col-md-2">
                        <label className="form-label small fw-semibold">
                            <FaCalendarAlt className="me-1 text-primary" />Fecha desde
                        </label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            name="startDate"
                            value={filters.startDate}
                            onChange={onFilterChange}
                        />
                    </div>

                    {/* Fecha hasta */}
                    <div className="col-md-2">
                        <label className="form-label small fw-semibold">
                            <FaCalendarAlt className="me-1 text-primary" />Fecha hasta
                        </label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            name="endDate"
                            value={filters.endDate}
                            onChange={onFilterChange}
                        />
                    </div>

                    {/* Limpiar */}
                    {hasActiveFilters && (
                        <div className="col-md-auto">
                            <button
                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                onClick={onClear}>
                                <FaTimes /> Limpiar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FilterBar