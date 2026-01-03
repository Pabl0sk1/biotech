
export const Delete = ({ setEliminar, confirmar, id, title, gen }) => {
    return (
        <>
            <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
            <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                    <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                        <div className="fw-bolder d-flex flex-column align-items-center">
                            <i className="bi bi-question-circle" style={{ fontSize: '7rem' }}></i>
                            <p className='fs-5'>¿Estás seguro de que deseas eliminar {gen ? 'el' : 'la'} {title}?</p>
                        </div>
                        <div className="mt-3">
                            <button
                                onClick={() => confirmar(id)}
                                className="btn btn-success text-black me-4 fw-bold"
                            >
                                <i className="bi bi-trash-fill me-2"></i>Eliminar
                            </button>
                            <button
                                onClick={() => setEliminar(null)}
                                className="btn btn-danger text-black ms-4 fw-bold"
                            >
                                <i className="bi bi-x-lg me-2"></i>Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Delete;
