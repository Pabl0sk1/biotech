import { useNavigate } from 'react-router-dom';

export const Header = ({ usuarioUsed, title = "Inicio", onToggleSidebar, showSidebarButton = true, icon = "list-task" }) => {
    const navigate = useNavigate();

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm position-fixed top-0 w-100 px-3 py-2 z-3 border-bottom border-dark">
            {/* Sección izquierda: botón y título */}
            <div className="d-flex align-items-center">
                {showSidebarButton && (
                    <button
                        className="btn btn-light me-1 d-flex align-items-center justify-content-center"
                        style={{ width: '30px', height: '30px', padding: 0 }}
                        onClick={onToggleSidebar ? onToggleSidebar : () => navigate('/asist/home')}
                    >
                        <i className={`bi bi-${icon} fs-5`}></i>
                    </button>
                )}
                <h5 className="m-0 fw-bold">{title}</h5>
            </div>

            {/* Sección derecha: info usuario y logo */}
            <div className="d-flex align-items-center ms-auto">
                <div className="d-flex align-items-center text-success me-3">
                    <i className="bi bi-person fs-4 me-2"></i>
                    <span>{usuarioUsed?.tipousuario?.tipousuario || "Invitado"}</span>
                </div>
                <img
                    className='logo-img-bar'
                    src="/logo2.svg"
                    alt="Biotech"
                />
            </div>
        </nav>
    );
};

export default Header;
