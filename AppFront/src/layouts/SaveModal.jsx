
export const SaveModal = ({ setGuardar, title, gen, fun }) => {
    return (
        <>
            <div className="success-modal">
                <div className="success-content">
                    <div className="success-icon">
                        <i className="bi bi-cloud-plus-fill"></i>
                    </div>
                    <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>¡Nuevo Registro!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        Insertar {gen ? 'un nuevo' : 'una nueva'} {title}
                    </p>
                    <div>
                        <button onClick={async () => await fun()} className="modern-button btn-primary me-3">
                            <i className="bi bi-check"></i>Aceptar
                        </button>
                        <button onClick={() => setGuardar(null)} className="modern-button btn-ternary">
                            <i className="bi bi-x-lg"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SaveModal;
