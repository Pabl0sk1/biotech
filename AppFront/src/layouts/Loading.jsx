
export const Loading = () => {
    return (
        <>
            <div className="position-fixed top-0 start-0 z-2 w-100 h-100 bg-dark opacity-25"></div>
            <div className="position-fixed bg-light d-flex flex-column p-3 border border-success rounded-2 top-50 start-50 z-3 d-flex align-items-center justify-content-center translate-middle user-select-none">
                <div className="spinner-border text-success fs-4" role="status"></div>
                <span className="mt-2 fw-bolder fs-5">Cargando...</span>
            </div>
        </>
    )
}

export default Loading;
