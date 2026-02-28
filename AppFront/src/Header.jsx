import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SaveClose from './layouts/SaveClose.jsx';

export const Header = ({
    userLog,
    title = "Inicio",
    onToggleSidebar,
    showSidebarButton = true,
    icon = "list-task",
    Close = true,
    hasUnsavedChanges = false,
    onSave = null,
    modulotxt = 'modulo'
}) => {

    const navigate = useNavigate();
    const [NotClose, setNotClose] = useState(false);

    const escapeModule = () => {
        if (Close) navigate(-1);
        else {
            if (hasUnsavedChanges && onSave) setNotClose(true);
            else navigate(-1);
        };
    }

    const handleSaveAndClose = async () => {
        if (onSave) {
            setNotClose(false);
            const success = await onSave();
            if (success) {
                setNotClose(false);
                navigate(-1);
            }
        }
    }

    const handleCloseWithoutSaving = () => {
        setNotClose(false);
        navigate(-1);
    };

    const handleCancelModal = () => {
        setNotClose(false);
    };

    return (
        <>

            {NotClose && (
                <SaveClose title={modulotxt} onSave={handleSaveAndClose} onClose={handleCloseWithoutSaving} onCancel={handleCancelModal} />
            )}

            <nav className="modern-header">
                <div className="header-container">
                    {/* Sección izquierda */}
                    <div className="header-left">
                        {showSidebarButton && (
                            <button
                                className="sidebar-toggle-btn"
                                onClick={onToggleSidebar ? onToggleSidebar : () => escapeModule()}
                                aria-label="Toggle sidebar"
                            >
                                <i className={`bi bi-${icon}`}></i>
                            </button>
                        )}
                        <div className="header-title-wrapper">
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
        </>
    );
};

export default Header;
