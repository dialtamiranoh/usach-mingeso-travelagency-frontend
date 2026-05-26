// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { useKeycloak } from '@react-keycloak/web'
import {
    FaHome, FaTachometerAlt, FaBox, FaBookmark, FaCreditCard,
    FaUsers, FaTag, FaMapMarkerAlt, FaLeaf, FaCubes,
    FaConciergeBell, FaPercent, FaToggleOn, FaChartBar
} from 'react-icons/fa'

const Sidebar = () => {
    const { keycloak } = useKeycloak()
    const isAdmin = keycloak?.tokenParsed?.realm_access?.roles?.includes('ADMIN')
    const username = keycloak?.tokenParsed?.preferred_username

    const linkClass = ({ isActive }) =>
        `nav-link ${isActive ? 'active' : 'text-white'}`

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark" style={{ width: '280px', minHeight: '100vh' }}>
            <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4">✈️ TravelAgency</span>
            </a>
            <hr />

            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <NavLink to="/" className={linkClass} end>
                        <FaHome className="me-2" /> Inicio
                    </NavLink>
                </li>

                {isAdmin && (
                    <>
                        <li className="nav-item mt-2">
                            <small className="text-muted text-uppercase px-2">Administración</small>
                        </li>
                        <li>
                            <NavLink to="/admin/dashboard" className={linkClass}>
                                <FaTachometerAlt className="me-2" /> Dashboard
                            </NavLink>
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
                            <NavLink to="/my-bookings" className={linkClass}>
                                <FaBookmark className="me-2" /> Mis reservas
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/my-payments" className={linkClass}>
                                <FaCreditCard className="me-2" /> Mis pagos
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>

            <hr />
            <div className="dropdown">
                <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    <FaUsers className="me-2" />
                    <strong>{username}</strong>
                </a>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
                    <li><a className="dropdown-item" href="#">Perfil</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <a className="dropdown-item" href="#"
                            onClick={() => keycloak.logout({ redirectUri: window.location.origin })}>
                            Cerrar sesión
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Sidebar