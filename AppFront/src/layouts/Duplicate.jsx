
export const Duplicate = ({ setDuplicado, title, gen }) => {
    return (
        <>
            <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
            <div className="position-fixed top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                <div className="bg-white border border-1 border-black rounded-2 p-0 m-0 shadow-lg">
                    <div className="alert alert-success alert-dismissible fade show m-2 p-3 shadow-sm text-black" role="alert">
                        <div className="fw-bolder d-flex flex-column align-items-center">
                            <i className="bi bi-dash-circle-fill" style={{ fontSize: '7rem' }}></i>
                            <p className='fs-5'>{gen ? 'El' : 'La'} {title} ya existe</p>
                        </div>
                        <button
                            onClick={() => setDuplicado(null)}
                            className="btn btn-danger mt-3 fw-bold text-black">
                            <i className="bi bi-x-lg me-2"></i>Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Duplicate;
