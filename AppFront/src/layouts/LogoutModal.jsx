
export const LogoutModal = ({ confirm, setClose }) => {
    return (
        <>
            <div className="modal-overlay"></div>
            <div className="logout-modal">
                <div className="logout-card">
                    <i className="bi bi-box-arrow-right logout-icon"></i>
                    <h2 className="logout-title">¿Seguro que querés cerrar sesión?</h2>
                    <p className="logout-subtitle">
                        Tu sesión actual será finalizada y tendrás que volver a iniciar sesión.
                    </p>

                    <div className="logout-actions">
                        <button className="btn-logout-confirm" onClick={confirm}>
                            <i className="bi bi-check2-circle me-2"></i> Sí, cerrar
                        </button>

                        <button className="btn-logout-cancel" onClick={() => setClose(false)}>
                            <i className="bi bi-x-circle me-2"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LogoutModal;
