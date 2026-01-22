import { useState, useRef, useEffect } from 'react';

export const ListControls = ({
    query,
    setQuery,
    totalPages = 1,
    totalItems = 0,
    onAdd,
    onRefresh,
    onErpImport,
    canAdd = true,
    canImport = false,
    showErpButton = true,
    showAddButton = true,
    pageSizeOptions = [5, 10, 30, 50, 100],
    addData = null
}) => {
    const [editingPage, setEditingPage] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (editingPage && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingPage]);

    const handlePageChange = () => {
        const newPage = parseInt(pageInput) - 1;
        if (!isNaN(newPage) && newPage >= 0 && newPage < totalPages) {
            setQuery(q => ({ ...q, page: newPage }));
        }
        setEditingPage(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handlePageChange();
        } else if (e.key === 'Escape') {
            setEditingPage(false);
        }
    };

    const nextPage = () => {
        if (query.page + 1 < totalPages) {
            setQuery(q => ({ ...q, page: q.page + 1 }));
        }
    };

    const prevPage = () => {
        if (query.page > 0) {
            setQuery(q => ({ ...q, page: q.page - 1 }));
        }
    };

    const goToFirstPage = () => {
        if (query.page !== 0) {
            setQuery(q => ({ ...q, page: 0 }));
        }
    };

    const goToLastPage = () => {
        if (query.page !== totalPages - 1) {
            setQuery(q => ({ ...q, page: totalPages - 1 }));
        }
    };

    return (
        <div className="border-top border-2 border-black pt-2 pb-2 ps-2 ps-md-3 pe-2 pe-md-3 m-0 user-select-none">
            {/* Layout para móvil y tablet */}
            <div className="d-flex d-lg-none flex-column gap-3">
                {/* Fila 1: Botones de acción */}
                <div className="d-flex gap-2 flex-wrap">
                    {showAddButton && (
                        <button
                            onClick={onAdd}
                            className="btn btn-secondary fw-bold flex-fill flex-sm-grow-0"
                            disabled={!canAdd}
                            title="Agregar nuevo"
                        >
                            <i className="bi bi-plus-circle"></i>
                            <span className="d-none d-sm-inline ms-2">Agregar</span>
                        </button>
                    )}
                    <button
                        onClick={onRefresh}
                        className="btn btn-secondary fw-bold flex-fill flex-sm-grow-0"
                        title="Refrescar"
                    >
                        <i className="bi bi-arrow-repeat"></i>
                        <span className="d-none d-sm-inline ms-2">Refrescar</span>
                    </button>
                    {showErpButton && (
                        <button
                            onClick={onErpImport}
                            className="btn btn-secondary fw-bold flex-fill flex-sm-grow-0"
                            disabled={!canImport}
                            title="Importar desde ERP"
                        >
                            <i className="bi bi-cloud-check"></i>
                            <span className="d-none d-sm-inline ms-2">ERP</span>
                        </button>
                    )}
                </div>

                {/* Fila 2: Tamaño y Total */}
                <div className="d-flex gap-3 align-items-center flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                        <label className="fw-semibold mb-0 small">Tamaño</label>
                        <select
                            className="form-select form-select-sm border-black"
                            style={{ width: 'auto', minWidth: '70px' }}
                            value={query.size}
                            onChange={(e) => {
                                const newSize = Number(e.target.value);
                                setQuery(q => ({
                                    ...q,
                                    page: 0,
                                    size: newSize
                                }));
                            }}
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <label className="fw-semibold mb-0 small">Total:</label>
                        <span className="badge bg-secondary">{totalItems}</span>
                    </div>
                </div>

                {/* Fila 3: Paginación */}
                <nav aria-label="page navigation" className="d-flex justify-content-center">
                    <ul className="pagination m-0 pagination-sm">
                        <li className={`page-item ${query.page === 0 ? 'disabled' : ''}`}>
                            <button
                                className={`page-link border-black rounded-end-0 ${query.page === 0 ? 'text-black' : 'text-success'}`}
                                onClick={goToFirstPage}
                                disabled={query.page === 0}
                                title="Primera página"
                            >
                                <i className="bi bi-chevron-double-left"></i>
                            </button>
                        </li>
                        <li className={`page-item ${query.page === 0 ? 'disabled' : ''}`}>
                            <button
                                className={`page-link border-black rounded-0 ${query.page === 0 ? 'text-black' : 'text-success'}`}
                                onClick={prevPage}
                                disabled={query.page === 0}
                            >
                                <i className="bi bi-arrow-left"></i>
                            </button>
                        </li>
                        <li className="page-item">
                            {editingPage ? (
                                <input
                                    ref={inputRef}
                                    type="number"
                                    className="form-control form-control-sm text-center fw-bold border-black rounded-0 border-start-0"
                                    value={pageInput}
                                    onChange={(e) => setPageInput(e.target.value)}
                                    onBlur={handlePageChange}
                                    onKeyDown={handleKeyDown}
                                    min="1"
                                    max={totalPages}
                                />
                            ) : (
                                <button
                                    className="page-link text-bg-secondary border-black fw-bold rounded-0"
                                    onClick={() => {
                                        setPageInput((query.page + 1).toString());
                                        setEditingPage(true);
                                    }}
                                    title="Click para editar"
                                >
                                    {query.page + 1} de {totalPages || 1}
                                </button>
                            )}
                        </li>
                        <li className={`page-item ${query.page + 1 >= totalPages ? 'disabled' : ''}`}>
                            <button
                                className={`page-link border-black rounded-0 ${query.page + 1 >= totalPages ? 'text-black' : 'text-success'}`}
                                onClick={nextPage}
                                disabled={query.page + 1 >= totalPages}
                            >
                                <i className="bi bi-arrow-right"></i>
                            </button>
                        </li>
                        <li className={`page-item ${query.page + 1 >= totalPages ? 'disabled' : ''}`}>
                            <button
                                className={`page-link border-black rounded-start-0 ${query.page + 1 >= totalPages ? 'text-black' : 'text-success'}`}
                                onClick={goToLastPage}
                                disabled={query.page + 1 >= totalPages}
                                title="Última página"
                            >
                                <i className="bi bi-chevron-double-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Layout para desktop */}
            <div className="d-none d-lg-flex align-items-center gap-2">
                {/* Botones de acción */}
                {showAddButton && (
                    <button
                        onClick={() => onAdd && onAdd(addData)}
                        className="btn btn-secondary fw-bold"
                        disabled={!canAdd}
                        title="Agregar nuevo"
                    >
                        <i className="bi bi-plus-circle"></i>
                    </button>
                )}
                <button
                    onClick={() => onRefresh && onRefresh()}
                    className="btn btn-secondary fw-bold"
                    title="Refrescar"
                >
                    <i className="bi bi-arrow-repeat"></i>
                </button>
                {showErpButton && (
                    <button
                        onClick={() => onErpImport && onErpImport()}
                        className="btn btn-secondary fw-bold"
                        disabled={!canImport}
                        title="Importar desde ERP"
                    >
                        <i className="bi bi-cloud-check"></i>
                    </button>
                )}

                {/* Separador */}
                <div className="vr mx-2"></div>

                {/* Tamaño */}
                <div className="d-flex align-items-center gap-2">
                    <label className="fw-semibold mb-0">Tamaño</label>
                    <select
                        className="form-select form-select-sm border-black"
                        style={{ width: 'auto' }}
                        value={query.size}
                        onChange={(e) => {
                            const newSize = Number(e.target.value);
                            setQuery(q => ({
                                ...q,
                                page: 0,
                                size: newSize
                            }));
                        }}
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>

                {/* Total */}
                <div className="d-flex align-items-center gap-2 ms-3">
                    <label className="fw-semibold mb-0">Total:</label>
                    <span className="badge bg-secondary fs-6">{totalItems}</span>
                </div>

                {/* Paginación */}
                <nav aria-label="page navigation" className="ms-auto">
                    <ul className="pagination m-0">
                        <li className={`page-item ${query.page === 0 ? 'disabled' : ''}`}>
                            <button
                                className={`page-link border-black rounded-end-0 ${query.page === 0 ? 'text-black' : 'text-success'}`}
                                onClick={goToFirstPage}
                                disabled={query.page === 0}
                                title="Primera página"
                            >
                                <i className="bi bi-chevron-double-left"></i>
                            </button>
                        </li>
                        <li className={`page-item ${query.page === 0 ? 'disabled' : ''}`}>
                            <button
                                className={`page-link border-black rounded-0 ${query.page === 0 ? 'text-black' : 'text-success'}`}
                                onClick={prevPage}
                                disabled={query.page === 0}
                            >
                                <i className="bi bi-arrow-left"></i>
                            </button>
                        </li>
                        <li className="page-item">
                            {editingPage ? (
                                <input
                                    ref={inputRef}
                                    type="number"
                                    className="form-control text-center fw-bold border-black rounded-0 border-start-0"
                                    value={pageInput}
                                    onChange={(e) => setPageInput(e.target.value)}
                                    onBlur={handlePageChange}
                                    onKeyDown={handleKeyDown}
                                    min="1"
                                    max={totalPages}
                                />
                            ) : (
                                <button
                                    className="page-link text-bg-secondary fw-bold border-black rounded-0"
                                    onClick={() => {
                                        setPageInput((query.page + 1).toString());
                                        setEditingPage(true);
                                    }}
                                    title="Click para editar página"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {query.page + 1} de {totalPages || 1}
                                </button>
                            )}
                        </li>
                        <li className={`page-item ${query.page + 1 >= totalPages ? 'disabled' : ''}`}>
                            <button
                                className={`page-link border-black rounded-0 ${query.page + 1 >= totalPages ? 'text-black' : 'text-success'}`}
                                onClick={nextPage}
                                disabled={query.page + 1 >= totalPages}
                            >
                                <i className="bi bi-arrow-right"></i>
                            </button>
                        </li>
                        <li className={`page-item ${query.page + 1 >= totalPages ? 'disabled' : ''}`}>
                            <button
                                className={`page-link border-black rounded-start-0 ${query.page + 1 >= totalPages ? 'text-black' : 'text-success'}`}
                                onClick={goToLastPage}
                                disabled={query.page + 1 >= totalPages}
                                title="Última página"
                            >
                                <i className="bi bi-chevron-double-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};
