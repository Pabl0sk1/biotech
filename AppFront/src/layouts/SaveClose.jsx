import { useEffect } from "react";

export const SaveClose = ({ title, onSave, onClose, onCancel }) => {

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onCancel]);

    return (
        <>
            <div className="success-modal">
                <div className="success-content">
                    <div className="danger-icon">
                        <i className="bi bi-exclamation-octagon-fill"></i>
                    </div>
                    <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>¡Cambios sin guardar!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        ¿Querés guardar los cambios en {title}?
                    </p>
                    <div>
                        <button onClick={onSave} className="modern-button btn-primary me-3">
                            <i className="bi bi-check"></i>Guardar
                        </button>
                        <button onClick={onClose} className="modern-button btn-ternary">
                            <i className="bi bi-x-lg"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SaveClose;
