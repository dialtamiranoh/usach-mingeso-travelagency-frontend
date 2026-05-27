// src/components/PackageCard.jsx
import { useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa'

const formatPrice = (price) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

const PackageCard = ({ pkg }) => {
    const navigate = useNavigate()

    return (
        <div
            className="card h-100 shadow-sm border-0"
            onClick={() => navigate(`/customer/packages/${pkg.id}`)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = ''
            }}
        >
            {/* Imagen / Placeholder */}
            <div className="bg-secondary d-flex align-items-center justify-content-center"
                style={{ height: '180px', borderRadius: '0.375rem 0.375rem 0 0' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="rgba(255,255,255,0.4)" viewBox="0 0 16 16">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                    <path d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/>
                    <path d="M6.354 11.854a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L6 10.793l5.646-5.647a.5.5 0 0 1 .708.708l-6 6z"/>
                </svg>
            </div>

            <div className="card-body d-flex flex-column">
                {/* Badges */}
                <div className="d-flex gap-1 flex-wrap mb-2">
                    {pkg.category && (
                        <span className="badge text-bg-primary">{pkg.category.name}</span>
                    )}
                    {pkg.type && (
                        <span className="badge text-bg-warning text-dark">{pkg.type.name}</span>
                    )}
                    {pkg.season && (
                        <span className="badge text-bg-success">{pkg.season.name}</span>
                    )}
                    {pkg.availableSlots === 0 && (
                        <span className="badge text-bg-danger ms-auto">Sin cupos</span>
                    )}
                </div>

                {/* Nombre */}
                <h5 className="card-title fw-bold mb-1">{pkg.name}</h5>

                {/* Destino */}
                {pkg.destination && (
                    <p className="text-muted small mb-2 d-flex align-items-center gap-1">
                        <FaMapMarkerAlt size={12} /> {pkg.destination.name}
                    </p>
                )}

                {/* Descripción */}
                <p className="card-text small text-muted flex-grow-1"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                    {pkg.description}
                </p>

                {/* Info */}
                <ul className="list-unstyled small text-muted mb-3 mt-2 d-flex flex-column gap-1">
                    <li className="d-flex align-items-center gap-2">
                        <FaCalendarAlt size={12} className="text-primary" />
                        {formatDate(pkg.startDate)} — {formatDate(pkg.endDate)}
                    </li>
                    <li className="d-flex align-items-center gap-2">
                        <FaClock size={12} className="text-primary" />
                        {pkg.durationDays} día{pkg.durationDays !== 1 ? 's' : ''}
                    </li>
                    <li className="d-flex align-items-center gap-2">
                        <FaUsers size={12} className="text-primary" />
                        {pkg.availableSlots} de {pkg.totalSlots} cupos disponibles
                    </li>
                </ul>

                {/* Footer precio + CTA */}
                <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>Precio por persona</div>
                        <div className="fw-bold fs-5 text-primary">{formatPrice(pkg.price)}</div>
                    </div>
                    <button
                        className={`btn btn-sm ${pkg.availableSlots > 0 ? 'btn-primary' : 'btn-secondary'}`}
                        disabled={pkg.availableSlots === 0}
                        onClick={e => e.stopPropagation()}>
                        Ver detalle
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PackageCard