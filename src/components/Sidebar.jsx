// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { useKeycloak } from '@react-keycloak/web'
import {
    FaHome, FaTachometerAlt, FaBox, FaBookmark, FaCreditCard,
    FaUsers, FaTag, FaMapMarkerAlt, FaLeaf, FaCubes,
    FaConciergeBell, FaPercent, FaToggleOn, FaChartBar, FaUser
} from 'react-icons/fa'

const Sidebar = () => {
    const { keycloak } = useKeycloak()
    const isAdmin = keycloak?.tokenParsed?.realm_access?.roles?.includes('ADMIN')

    const linkClass = ({ isActive }) =>
        `nav-link ${isActive ? 'active' : 'text-white'}`

    return (
        <div className="offcanvas offcanvas-start text-bg-dark"
            tabIndex="-1"
            id="sidebarOffcanvas"
            aria-labelledby="sidebarOffcanvasLabel"
            style={{ width: '280px' }}>

            <div className="offcanvas-header">
                <span className="offcanvas-title fs-4 text-white" id="sidebarOffcanvasLabel">
                    ✈️ TravelAgency
                </span>
                <button type="button"
                    className="btn-close btn-close-white"
                    data-bs-dismiss="offcanvas"
                    aria-label="Cerrar" />
            </div>

            <div className="offcanvas-body d-flex flex-column p-3">
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <NavLink to="/" className={linkClass} end
                            onClick={() => document.getElementById('sidebarOffcanvas').classList.remove('show')}>
                            <FaHome className="me-2" /> Inicio
                        </NavLink>
                    </li>

                    {isAdmin && (
                        <>
                            <li className="nav-item mt-2">
                                <small className="text-muted text-uppercase px-2">Administración</small>
                            </li>
                            <li>
                                <NavLink to="/admin/users" className={linkClass}>
                                    <FaUsers className="me-2" /> Usuarios
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/bookings" className={linkClass}>
                                    <FaBookmark className="me-2" /> Reservas
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/payments" className={linkClass}>
                                    <FaCreditCard className="me-2" /> Pagos
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/reports" className={linkClass}>
                                    <FaChartBar className="me-2" /> Reportes
                                </NavLink>
                            </li>
                            <li className="nav-item mt-2">
                                <small className="text-muted text-uppercase px-2">Catálogos</small>
                            </li>
                            <li>
                                <NavLink to="/admin/packages" className={linkClass}>
                                    <FaBox className="me-2" /> Paquetes
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/statuses" className={linkClass}>
                                    <FaToggleOn className="me-2" /> Estados
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/categories" className={linkClass}>
                                    <FaCubes className="me-2" /> Categorías
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/destinations" className={linkClass}>
                                    <FaMapMarkerAlt className="me-2" /> Destinos
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/seasons" className={linkClass}>
                                    <FaLeaf className="me-2" /> Temporadas
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/package-types" className={linkClass}>
                                    <FaTag className="me-2" /> Tipos de paquete
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/services" className={linkClass}>
                                    <FaConciergeBell className="me-2" /> Servicios
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/promotions" className={linkClass}>
                                    <FaPercent className="me-2" /> Promociones
                                </NavLink>
                            </li>
                        </>
                    )}

                    {!isAdmin && (
                        <>
                            <li className="nav-item mt-2">
                                <small className="text-muted text-uppercase px-2">Mi cuenta</small>
                            </li>
                            <li>
                                <NavLink to="/profile" className={linkClass}>
                                    <FaUser className="me-2" /> Perfil
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/my-bookings" className={linkClass}>
                                    <FaBookmark className="me-2" /> Mis reservas
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    )
}

export default Sidebar