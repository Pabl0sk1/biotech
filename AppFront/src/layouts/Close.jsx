
export const Close = ({ confirmar, title, gen }) => {
    return (
        <>
            <div className="success-modal">
                <div className="success-content">
                    <div className="success-icon">
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>¡Transacción Completada!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        {title} guardad{gen ? 'o' : 'a'} correctamente
                    </p>
                    <button onClick={confirmar} className="modern-button btn-primary">
                        <i className="bi bi-check-lg"></i>Continuar
                    </button>
                </div>
            </div>
        </>
    )
}

export default Close;
