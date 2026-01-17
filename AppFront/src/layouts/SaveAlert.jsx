
export const SaveAlert = ({ setClose }) => {
    return (
        <>
            <div className="success-modal">
                <div className="success-content">
                    <div className="danger-icon">
                        <i className="bi bi-x-circle-fill"></i>
                    </div>
                    <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>¡Formulario Incompleto!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        Faltan completar datos para guardar el registro
                    </p>
                    <button onClick={() => setClose(null)} className="modern-button btn-ternary">
                        <i className="bi bi-x-lg"></i>Cerrar
                    </button>
                </div>
            </div>
        </>
    )
}

export default SaveAlert;
