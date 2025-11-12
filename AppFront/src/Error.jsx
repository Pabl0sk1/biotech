import { Link } from "react-router-dom";

export const Error = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 loginBack">
            <div className="rounded-3 p-4 w-75" style={{ boxShadow: '0 0 25px rgba(0, 0, 0, 0.4)' }}>
                <h1 className="text-black mb-2 fw-bolder">¡Ooops!</h1>
                <h2 className="text-danger fw-bolder">ERROR 404</h2>
                <div className="mb-5 fs-4 fw-lighter">
                    <p>Ruta no encontrada</p>
                    <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '5rem' }}></i>
                </div>
                <Link className='btn btn-danger fw-bold px-4 text-black' to={"/biotech/home"}>
                    <i className="bi bi-escape me-2"></i>Volver
                </Link>
            </div>
        </div>
    );
};
