
export const FiltroModal = ({
    filtroActivo,
    setFiltroActivo,
    setQuery,
    setFiltrosAplicados,
    generarFiltro
}) => {
    if (!filtroActivo.visible) return null;

    const isMobile = filtroActivo.isMobile;

    const aplicarFiltro = () => {
        const filtroString = generarFiltro(filtroActivo);
        if (!filtroString) return;
        setQuery(q => ({
            ...q,
            page: 0,
            filter: [
                ...q.filter.filter(x => !x.startsWith(filtroActivo.field + ":")),
                filtroString
            ]
        }));
        setFiltroActivo(f => ({ ...f, visible: false }));
        setFiltrosAplicados(prev => ({
            ...prev,
            [filtroActivo.field]: filtroActivo
        }));
    };

    const limpiarFiltro = () => {
        setQuery(q => ({
            ...q,
            page: 0,
            filter: q.filter.filter(x => !x.startsWith(filtroActivo.field + ":"))
        }));
        setFiltroActivo(f => ({ ...f, op: "eq", value: "", value1: "", value2: "" }));
        setFiltrosAplicados(prev => ({ ...prev, [filtroActivo.field]: undefined }));
    };

    const filtroTxt = (txt) => {
        const pt = txt.split('.');
        return pt[pt.length - 1] || '';
    };

    const cerrar = () => setFiltroActivo(f => ({ ...f, visible: false }));

    // Estilos condicionales: móvil = centrado, desktop = anclado al ícono
    const containerStyle = isMobile
        ? {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '320px',
            zIndex: 21,
        }
        : {
            position: 'fixed',
            top: filtroActivo.coords?.top,
            left: filtroActivo.coords?.left,
            maxWidth: '320px',
            zIndex: 21,
        };

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed', inset: 0, zIndex: 20,
                    background: isMobile ? 'rgba(0,0,0,0.35)' : 'transparent',
                    backdropFilter: isMobile ? 'blur(2px)' : 'none',
                }}
                onClick={cerrar}
            />

            {/* Panel del filtro */}
            <div
                className="bg-white border border-secondary shadow-lg rounded-3 p-3"
                style={containerStyle}
            >
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                    <span className="fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-funnel-fill text-success"></i>
                        <span className="text-capitalize">{filtroTxt(filtroActivo.field)}</span>
                    </span>
                    <div className="d-flex align-items-center gap-2">
                        <i
                            className="bi bi-eraser-fill text-danger"
                            style={{ cursor: 'pointer', fontSize: '1rem' }}
                            onClick={limpiarFiltro}
                            title="Borrar filtro"
                        />
                        <button
                            className="btn-close"
                            style={{ fontSize: '0.65rem' }}
                            onClick={cerrar}
                        />
                    </div>
                </div>

                {/* Contenido según tipo */}
                {["boolean", "string"].includes(filtroActivo.type) && (
                    <>
                        <select
                            className="form-select form-select-sm mb-2"
                            value={filtroActivo.op}
                            onChange={e => setFiltroActivo({ ...filtroActivo, op: e.target.value })}
                        >
                            <option value="eq">Igual que</option>
                            <option value="neq">Distinto de</option>
                            <option value="starts">Comienza con</option>
                            <option value="ends">Termina con</option>
                            <option value="contains">Contiene</option>
                        </select>
                        <input
                            type="text"
                            className="form-control form-control-sm mb-2"
                            placeholder="Valor..."
                            value={filtroActivo.value || ""}
                            onChange={e => setFiltroActivo({ ...filtroActivo, value: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && aplicarFiltro()}
                            autoFocus
                        />
                    </>
                )}

                {["number", "date", "time", "datetime-local"].includes(filtroActivo.type) && (
                    <>
                        <select
                            className="form-select form-select-sm mb-2"
                            value={filtroActivo.op}
                            onChange={e => setFiltroActivo({ ...filtroActivo, op: e.target.value })}
                        >
                            <option value="eq">Igual que</option>
                            <option value="neq">Distinto de</option>
                            <option value="gt">Mayor que</option>
                            <option value="gte">Mayor o igual que</option>
                            <option value="lt">Menor que</option>
                            <option value="lte">Menor o igual que</option>
                            <option value="between">Entre</option>
                        </select>

                        {filtroActivo.op !== "between" ? (
                            <input
                                type={filtroActivo.type}
                                className="form-control form-control-sm mb-2"
                                placeholder="Valor..."
                                value={filtroActivo.value || ""}
                                onChange={e => setFiltroActivo({ ...filtroActivo, value: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && aplicarFiltro()}
                                autoFocus
                            />
                        ) : (
                            <div className="d-flex gap-2 mb-2">
                                <input
                                    type={filtroActivo.type}
                                    className="form-control form-control-sm"
                                    placeholder="Desde"
                                    value={filtroActivo.value1 || ""}
                                    onChange={e => setFiltroActivo({ ...filtroActivo, value1: e.target.value })}
                                />
                                <input
                                    type={filtroActivo.type}
                                    className="form-control form-control-sm"
                                    placeholder="Hasta"
                                    value={filtroActivo.value2 || ""}
                                    onChange={e => setFiltroActivo({ ...filtroActivo, value2: e.target.value })}
                                />
                            </div>
                        )}
                    </>
                )}

                <button className="btn btn-success btn-sm w-100 fw-bold" onClick={aplicarFiltro}>
                    <i className="bi bi-check-lg me-1"></i>Aplicar
                </button>
            </div>
        </>
    );
};
