import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const Header = ({ userLog, title = "Inicio", onToggleSidebar, showSidebarButton = true, icon = "list-task" }) => {
    const navigate = useNavigate();

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm position-fixed top-0 w-100 px-3 py-1 z-3 border-bottom border-success border-4">
            {/* Sección izquierda: botón y título */}
            <div className="d-flex align-items-center">
                {showSidebarButton && (
                    <button
                        className="btn btn-light me-1 d-flex align-items-center justify-content-center"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                        onClick={onToggleSidebar ? onToggleSidebar : () => navigate(-1)}
                    >
                        <i className={`bi bi-${icon} fs-5`}></i>
                    </button>
                )}
                <h5 className="m-0 fw-bold">{title}</h5>
            </div>

            {/* Sección derecha: info usuario y logo */}
            <div className="d-flex align-items-center ms-auto">
                <div className="d-flex flex-column text-end me-3">
                    <span className="fw-semibold text-success">
                        <i className="bi bi-person-circle me-1"></i>
                        {userLog.tipousuario.tipousuario}
                    </span>

                    <small className="text-muted">{userLog.nombreusuario}</small>
                </div>
                <Link to="https://biotech.biosafrasgroup.com.py/docs" className='p-0 me-2'>
                    <img
                        className='logo-img-bar px-2'
                        src="/biotech/api.svg"
                        alt="API"
                    />
                </Link>
                <Link to="/home" className='p-0 me-2'>
                    <img
                        className='logo-img-bar px-2'
                        src="/biotech/logo2.svg"
                        alt="Biotech"
                    />
                </Link>
            </div>
        </nav>
    );
};

export default Header;
