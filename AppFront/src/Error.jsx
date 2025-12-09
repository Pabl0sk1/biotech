import { Link } from "react-router-dom";

export const Error = () => {
    return (
        <div className="error-container">
            <div className="error-content">
                {/* Animación del número 404 */}
                <div className="error-number">
                    <span className="error-digit">4</span>
                    <span className="error-digit error-zero">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                    </span>
                    <span className="error-digit">4</span>
                </div>

                {/* Título y descripción */}
                <h1 className="error-title">¡Página no encontrada!</h1>
                <p className="error-description">
                    Lo sentimos, la página que estás buscando no existe o no tienes permiso.
                </p>

                {/* Sugerencias */}
                <div className="error-suggestions">
                    <p className="error-suggestions-title">Puedes intentar:</p>
                    <ul className="error-list">
                        <li>Verificar la URL ingresada</li>
                        <li>Regresar a la página anterior</li>
                    </ul>
                </div>

                {/* Botones de acción */}
                <div className="error-actions">
                    <Link to={-1} className="btn-error btn-home">
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver atrás
                    </Link>
                </div>
            </div>
        </div>
    );
};