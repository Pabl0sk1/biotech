
export const NotDelete = ({ setNoEliminar, title, gen }) => {
    return (
        <>
            <div className="success-modal">
                <div className="success-content">
                    <div className="danger-icon">
                        <i className="bi bi-database-fill-exclamation"></i>
                    </div>
                    <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>¡No fue posible eliminar!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        {gen ? 'El' : 'La'} {title} está siendo referenciad{gen ? 'o' : 'a'} en otra tabla
                    </p>
                    <button onClick={() => setNoEliminar(null)} className="modern-button btn-ternary">
                        <i className="bi bi-x-lg"></i>Cerrar
                    </button>
                </div>
            </div>
        </>
    )
}

export default NotDelete;
