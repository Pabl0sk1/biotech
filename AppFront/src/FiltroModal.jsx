
export const FiltroModal = ({
    filtroActivo,
    setFiltroActivo,
    setQuery,
    setFiltrosAplicados,
    generarFiltro
}) => {
    if (!filtroActivo.visible) return null;

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

    const filtroTxt = (txt) => {
        const pt = txt.split('.');
        const ultimo = pt[pt.length - 1];
        return ultimo || '';
    }

    return (
        <>
            <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{ zIndex: 20 }}
                onClick={() => setFiltroActivo(f => ({ ...f, visible: false }))}
            ></div>

            <div
                className="position-absolute bg-white border border-black shadow p-3 rounded"
                style={{
                    top: filtroActivo.coords?.top ?? "150px",
                    left: filtroActivo.coords?.left ?? "500px",
                    zIndex: 21
                }}
            >
                <h6 className="fw-bold mb-2 d-flex align-items-center justify-content-between">
                    <span>
                        Filtro: <span className="fw-semibold text-success">{filtroTxt(filtroActivo.field)}</span>
                    </span>
                    {/* Icono de borrador */}
                    <i
                        className="bi bi-eraser-fill text-danger"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            // Limpiar filtro del campo
                            setQuery(q => ({
                                ...q,
                                page: 0,
                                filter: q.filter.filter(x => !x.startsWith(filtroActivo.field + ":"))
                            }));
                            // Limpiar el estado del filtro activo y aplicado
                            setFiltroActivo(f => ({ ...f, op: "eq", value: "", value1: "", value2: "" }));
                            setFiltrosAplicados(prev => ({ ...prev, [filtroActivo.field]: undefined }));
                        }}
                        title="Borrar filtro"
                    ></i>
                </h6>

                {filtroActivo.type === "string" && (
                    <>
                        <select
                            className="form-select mb-2"
                            value={filtroActivo.op}
                            onChange={e =>
                                setFiltroActivo({ ...filtroActivo, op: e.target.value })
                            }
                        >
                            <option value="eq">Igual que</option>
                            <option value="neq">Distinto de</option>
                            <option value="starts">Comienza con</option>
                            <option value="ends">Termina con</option>
                            <option value="contains">Contiene</option>
                        </select>

                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Valor..."
                            value={filtroActivo.value || ""}
                            onChange={e =>
                                setFiltroActivo({ ...filtroActivo, value: e.target.value })
                            }
                        />

                        <button className="btn btn-success w-100 fw-bold" onClick={aplicarFiltro}>
                            Aplicar
                        </button>
                    </>
                )}

                {(["number", "date", "datetime-local"].includes(filtroActivo.type)) && (
                    <>
                        <select
                            className="form-select mb-2"
                            value={filtroActivo.op}
                            onChange={e =>
                                setFiltroActivo({ ...filtroActivo, op: e.target.value })
                            }
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
                                className="form-control mb-2"
                                placeholder="Valor..."
                                value={filtroActivo.value || ""}
                                onChange={e =>
                                    setFiltroActivo({ ...filtroActivo, value: e.target.value })
                                }
                            />
                        ) : (
                            <>
                                <input
                                    type={filtroActivo.type}
                                    className="form-control mb-2"
                                    placeholder="Valor..."
                                    value={filtroActivo.value1 || ""}
                                    onChange={e =>
                                        setFiltroActivo({ ...filtroActivo, value1: e.target.value })
                                    }
                                />
                                <input
                                    type={filtroActivo.type}
                                    className="form-control mb-2"
                                    placeholder="Valor..."
                                    value={filtroActivo.value2 || ""}
                                    onChange={e =>
                                        setFiltroActivo({ ...filtroActivo, value2: e.target.value })
                                    }
                                />
                            </>
                        )}

                        <button className="btn btn-success w-100 fw-bold" onClick={aplicarFiltro}>
                            Aplicar
                        </button>
                    </>
                )}
            </div>
        </>
    );
};
