import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const Header = ({
    userLog,
    title = "Inicio",
    onToggleSidebar,
    showSidebarButton = true,
    icon = "list-task"
}) => {
    const navigate = useNavigate();

    return (
        <nav className="modern-header">
            <div className="header-container">
                {/* Sección izquierda */}
                <div className="header-left">
                    {showSidebarButton && (
                        <button
                            className="sidebar-toggle-btn"
                            onClick={onToggleSidebar ? onToggleSidebar : () => navigate(-1)}
                            aria-label="Toggle sidebar"
                        >
                            <i className={`bi bi-${icon}`}></i>
                        </button>
                    )}
                    <div className="header-title-wrapper">
                        <i className="bi bi-circle-fill title-indicator"></i>
                        <h5 className="header-title">{title}</h5>
                    </div>
                </div>

                {/* Sección derecha */}
                <div className="header-right">
                    {/* Info del usuario */}
                    <div className="user-info">
                        <div className="user-avatar">
                            <i className="bi bi-person-circle"></i>
                        </div>
                        <div className="user-details">
                            <span className="user-role">
                                {userLog?.tipousuario?.tipousuario}
                            </span>
                            <span className="user-name">{userLog?.nombreusuario}</span>
                        </div>
                    </div>

                    {/* Separador */}
                    <div className="header-divider"></div>

                    {/* Enlaces de acción */}
                    <div className="header-actions">
                        <Link
                            to="https://biotech.biosafrasgroup.com.py/docs"
                            className="header-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Documentación API"
                        >
                            <img
                                className="header-logo"
                                src="/biotech/api.svg"
                                alt="API"
                            />
                        </Link>
                        <Link
                            to="/home"
                            className="header-link"
                            title="Inicio"
                        >
                            <img
                                className="header-logo"
                                src="/biotech/logo2.svg"
                                alt="Biotech"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;