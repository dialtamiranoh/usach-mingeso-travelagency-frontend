// src/components/HeaderFooter.jsx
import { useKeycloak } from '@react-keycloak/web'
import { FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa'

const HeaderFooter = ({ children }) => {
    const { keycloak } = useKeycloak()
    const username = keycloak?.tokenParsed?.preferred_username

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar */}
            <nav className="navbar navbar-dark bg-dark sticky-top shadow-sm">
                <div className="container-fluid">
                    {/* Toggle Sidebar */}
                    <button
                        className="navbar-toggler border-0"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#sidebarOffcanvas"
                        aria-controls="sidebarOffcanvas"
                        aria-label="Abrir menú">
                        <FaBars />
                    </button>

                    {/* Brand */}
                    <span className="navbar-brand ms-2">
                        ✈️ TravelAgency
                    </span>

                    {/* Usuario + logout */}
                    <div className="dropdown ms-auto">
                        <a href="#"
                            className="d-flex align-items-center gap-2 text-white text-decoration-none dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">
                            <FaUserCircle size={20} />
                            <span>{username}</span>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow">
                            <li>
                                <span className="dropdown-item-text text-muted small">
                                    {keycloak?.tokenParsed?.email}
                                </span>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <a className="dropdown-item d-flex align-items-center gap-2" href="#"
                                    onClick={() => keycloak.logout({ redirectUri: window.location.origin })}>
                                    <FaSignOutAlt /> Cerrar sesión
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="flex-grow-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="footer bg-dark text-white py-3 mt-auto">
                <div className="container-fluid text-center">
                    <span className="text-muted small">
                        © {new Date().getFullYear()} TravelAgency — Todos los derechos reservados
                    </span>
                </div>
            </footer>
        </div>
    )
}

export default HeaderFooter