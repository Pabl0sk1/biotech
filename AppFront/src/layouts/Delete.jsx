
export const Delete = ({ setEliminar, confirmar, id, title, gen }) => {
    return (
        <>
            <div className="success-modal">
                <div className="success-content">
                    <div className="danger-icon">
                        <i className="bi bi-database-fill-x"></i>
                    </div>
                    <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>¡Eliminar Registro!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        {gen ? 'El' : 'La'} {title} será eliminad{gen ? 'o' : 'a'}
                    </p>
                    <div>
                        <button onClick={() => confirmar(id)} className="modern-button btn-primary me-3">
                            <i className="bi bi-trash-fill"></i>Eliminar
                        </button>
                        <button onClick={() => setEliminar(null)} className="modern-button btn-ternary">
                            <i className="bi bi-x-lg"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Delete;
