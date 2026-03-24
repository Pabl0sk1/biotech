import { useState, useEffect, useMemo, useRef } from "react";
import { ListControls } from "./ListControls";
import { FiltroModal } from "./FiltroModal";
import { obtenerClaseEstadoReg, obtenerClaseEstadoInf } from './utils/StatusBadge.js';
import { DateHourFormat, HourFormat } from './utils/DateHourFormat.js';
import { TruncDots } from './utils/TruncDots.js';

/* =======================
    Utilidades
======================= */
const getNestedValue = (obj, path) => {
    if (!path || !obj) return "";
    return path.split(".").reduce((current, prop) => current?.[prop], obj) || "";
};

const evalValue = (spec, row, fallback) => {
    if (typeof spec === "function") return spec(row);
    if (typeof spec === "string") return getNestedValue(row, spec);
    if (spec !== undefined) return spec;
    return fallback;
};

const renderStatusBadge = (activo, label) => (
    <span className={`status-badge ${obtenerClaseEstadoReg(activo)}`}>
        {label}
    </span>
);

const renderReportBadged = (estado) => (
    <span className={`status-badge ${obtenerClaseEstadoInf(estado)}`}>
        {estado}
    </span>
);

const formatCellValue = (col, row, userLog) => {
    const renderers = {
        statusreg: (col, row) => {
            const activo = evalValue(col.render.renval1, row, false);
            const label = evalValue(col.render.renval2, row, "");
            return renderStatusBadge(activo, label);
        },

        statusinf: (col, row) => {
            const label = evalValue(col.render.renval1, row, "");
            return renderReportBadged(label);
        },

        truncate: (col, row) => {
            const text = evalValue(col.render.renval1, row);
            return TruncDots(text, col.render.renval2 ?? 30);
        },

        token: (col, row) => {
            const cadena = row.token ?? "";
            const usuarioId = row.usuario?.id;
            const activo = row.activo;

            if (userLog?.id === 1 || userLog?.id === usuarioId) {
                return (
                    <p className={`${activo ? '' : 'text-decoration-line-through'} m-0`}>
                        {cadena}
                    </p>
                );
            }

            return (
                <>
                    {Array.from({ length: cadena.length }).map((_, i) => (
                        <i key={i} className="bi bi-asterisk text-muted ms-1" style={{ fontSize: '7px' }}></i>
                    ))}
                </>
            );
        },
    };

    // If a custom render function is provided, use it directly
    if (typeof col.render === "function") {
        return col.render(row);
    }

    // Special render config (object-based): { rentype, ... }
    if (col.render && typeof col.render === "object") {
        const renderer = renderers[col.render.rentype];
        if (renderer) return renderer(col, row);
    }

    // Fallback formatting based on column type
    const rawValue = getNestedValue(row, col.field);
    switch (col.type) {
        case "date":
            return DateHourFormat(rawValue, 2);
        case "datetime-local":
            return DateHourFormat(rawValue, 1);
        case "time":
            return HourFormat(rawValue);
        case "boolean":
            return rawValue
                ? <i className="bi bi-toggle-on text-success fs-5"></i>
                : <i className="bi bi-toggle-off text-secondary fs-5"></i>;
        default:
            return rawValue;
    }
};

// Generador de filtro por defecto similar al usado en muchos componentes
const defaultGenerarFiltro = (f) => {
    if (!f) return null;
    if (!f.op) {
        f = ({ ...f, op: "eq" });
    }

    const field = f.field.trim();
    const op = f.op.trim();
    let filtro = "";

    if (op === "between") {
        if (!f.value1 || !f.value2) return null;
        filtro = `${field}:between:${f.value1}..${f.value2}`;
    } else {
        if (!f.value) return null;
        filtro = `${field}:${op}:${f.value}`;
    }

    return filtro;
};

/* =======================
    Componente Principal
======================= */
export const SmartTable = ({
    data = [],
    customReg = 'register',
    userLog,
    query = { page: 0, size: 10, order: "", filter: [] },
    setQuery,
    totalPages = 1,
    totalItems = 0,
    onAdd,
    onRefresh,
    onErpImport,
    canAdd = false,
    canImport = false,
    showErpButton = false,
    showAddButton = true,
    onEdit,
    onDelete,
    onView,
    canEdit = true,
    canDelete = true,
    canView = true,
    tableClassName = "table table-hover align-middle m-0 list-table vh-100",
    theadClassName = "table-secondary align-middle",
    rowClassName,
    columnSettings = {} // key: {label, sortable, filtered, type, render, order, classname, field}
}) => {
    // construimos el array de columnas a partir de la configuración
    // El "key" es el identificador usado en la UI; "field" es el path usado para sorting/filtering y para obtener el valor del row.
    const columns = useMemo(() => {
        const cols = Object.entries(columnSettings).map(([key, cfg]) => {
            const field = cfg.field || key;
            return {
                key,
                field,
                ...cfg
            };
        });

        // opcionalmente ordenar las columnas si la configuración incluye order numérico
        cols.sort((a, b) => (a.order || 0) - (b.order || 0));
        return cols;
    }, [columnSettings]);

    const [filtroActivo, setFiltroActivo] = useState({ visible: false });
    const [filtrosAplicados, setFiltrosAplicados] = useState({});
    const [columnMenuOpen, setColumnMenuOpen] = useState(false);
    const getDefaultVisible = (cols) =>
        cols
            .filter(c => !c.hidden)
            .filter(c => c.default ?? false)
            .map(c => c.key);

    const columnSignature = useMemo(() => {
        return columns
            .map(c => `${c.key}:${c.hidden ?? false}:${c.default ?? false}`)
            .sort()
            .join("|");
    }, [columns]);

    const [visibleColumns, setVisibleColumns] = useState(() => getDefaultVisible(columns));
    const prevColumnSignature = useRef(columnSignature);

    // Mantener lista de columnas visibles cuando cambian las columnas reales (solo si cambia la configuración)
    useEffect(() => {
        if (prevColumnSignature.current === columnSignature) return;
        prevColumnSignature.current = columnSignature;
        setVisibleColumns(getDefaultVisible(columns));
    }, [columnSignature, columns]);

    const displayedColumns = columns.filter(c => visibleColumns.includes(c.key));
    const generarFiltro = defaultGenerarFiltro;

    // Agregar junto a los otros useState
    const [colWidths, setColWidths] = useState({});
    const handleResizeStart = (e, colKey) => {
        e.preventDefault();
        e.stopPropagation();

        const initialX = e.clientX;
        const initialWidth = colWidths[colKey] || 150;
        let resizeStarted = false;

        const onMouseMove = (moveEvent) => {
            const diff = moveEvent.clientX - initialX;

            if (!resizeStarted && Math.abs(diff) < 5) return;
            resizeStarted = true;

            const newWidth = Math.max(60, initialWidth + diff);
            setColWidths(prev => ({ ...prev, [colKey]: newWidth }));
            document.body.classList.add('table-resizing');
        };

        const onMouseUp = () => {
            document.body.classList.remove('table-resizing');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const toggleOrder = (field) => {
        const [currentField, dir] = query.order.split(",");
        const newDir = (currentField === field && dir === "asc") ? "desc" : "asc";
        setQuery(q => ({ ...q, order: `${field},${newDir}` }));
    };

    const getSortIcon = (field) => {
        const [currentField, direction] = query.order.split(",");
        if (currentField !== field) return "bi-chevron-expand";
        return direction === "asc" ? "bi-chevron-up" : "bi-chevron-down";
    };

    const handleFilterClick = (e, field, type = "string") => {
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        const previo = filtrosAplicados[field] ?? {};

        // Calcular posición para que no se salga de pantalla
        const modalWidth = 260;
        const modalHeight = 220;
        let left = rect.left;
        let top = rect.bottom + 4;

        if (!isMobile) {
            // Ajustar si se sale por la derecha
            if (left + modalWidth > window.innerWidth - 12) {
                left = window.innerWidth - modalWidth - 12;
            }
            // Ajustar si se sale por abajo
            if (top + modalHeight > window.innerHeight - 12) {
                top = rect.top - modalHeight - 4;
            }
        }

        setFiltroActivo({
            field,
            type,
            visible: true,
            op: previo.op,
            value: previo.value,
            value1: previo.value1,
            value2: previo.value2,
            isMobile,
            coords: { top, left }
        });
    };

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            if (prev.includes(key)) {
                if (prev.length <= 1) return prev;
                return prev.filter(k => k !== key);
            }
            return [...prev, key];
        });
    };

    const handleRefresh = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
        onRefresh?.();
    };

    const handleReg = (op, row, can, on) => {
        let custom = true;

        if (customReg === 'report' && ['edit', 'delete'].includes(op)) {
            if (row?.estado === 'Aprobado' && userLog?.id !== 1) {
                custom = false;
            }
        } else if (customReg === 'token' && ['delete'].includes(op)) {
            if (row?.usuario?.id !== userLog?.id && userLog?.id !== 1) {
                custom = false;
            }
        } else if (customReg === 'user' && ['edit', 'delete'].includes(op)) {
            if (row?.id === userLog?.id || row?.id === 1) {
                custom = false;
            }
        }

        return can && custom && on;
    };

    return (
        <div className="form-card">
            {/* Controles de listado */}
            <ListControls
                query={query}
                setQuery={setQuery}
                totalPages={totalPages}
                totalItems={totalItems}
                onAdd={onAdd}
                onRefresh={handleRefresh}
                onErpImport={onErpImport}
                canAdd={canAdd}
                canImport={canImport}
                showErpButton={showErpButton}
                showAddButton={showAddButton}
                columns={columns}
                visibleColumns={visibleColumns}
                toggleColumn={toggleColumn}
                columnMenuOpen={columnMenuOpen}
                setColumnMenuOpen={setColumnMenuOpen}
            />

            <div style={{ position: "relative" }}>
                {/* Modal de filtros */}
                <FiltroModal
                    filtroActivo={filtroActivo}
                    setFiltroActivo={setFiltroActivo}
                    setQuery={setQuery}
                    setFiltrosAplicados={setFiltrosAplicados}
                    generarFiltro={generarFiltro}
                />
                {/* Tabla */}
                <div className="table-scroll-wrapper">
                    <table className={tableClassName}>
                        <thead className={theadClassName}>
                            <tr>
                                <th style={{ cursor: 'default' }}>Opciones</th>
                                {displayedColumns.map(col => {
                                    const colSettings = columnSettings[col?.key] || {};
                                    const sort = col?.sortable ?? true;
                                    const filter = col?.filtered ?? true;
                                    return (
                                        <th
                                            key={col?.key}
                                            onClick={() => sort && toggleOrder(col?.field)}
                                            className={sort ? "sortable-header" : ""}
                                            style={{
                                                cursor: sort ? "pointer" : "default",
                                                position: 'relative',
                                                width: colWidths[col?.key] || 'auto',
                                                minWidth: 60,
                                                userSelect: 'none',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {col?.label}
                                            {sort && <i className={`bi ${getSortIcon(col?.field)} ms-2`}></i>}
                                            {filter && (
                                                <i
                                                    className="bi bi-funnel-fill btn btn-primary p-0 px-1 border-0 ms-2 icon-filter"
                                                    onClick={(e) => handleFilterClick(e, col?.field, colSettings?.type || "string")}
                                                />
                                            )}
                                            {/* Handle de resize */}
                                            <span
                                                onMouseDown={(e) => handleResizeStart(e, col?.key)}
                                                onClick={e => e.stopPropagation()}
                                                style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: '6px',
                                                    cursor: 'col-resize',
                                                    background: 'transparent',
                                                    zIndex: 1,
                                                }}
                                                className="col-resize-handle"
                                            />
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={displayedColumns.length + (canEdit || canDelete || canView ? 1 : 0)}
                                        className="text-center py-3 text-muted fs-3 fw-bold"
                                    >
                                        No hay registros
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, index) => (
                                    <tr
                                        key={row.id || `row-${index}`}
                                        className={`text-center align-middle ${rowClassName || ""}`}
                                        onClick={() => { if (handleReg('edit', row, canEdit, onEdit)) onEdit(row) }}
                                        style={{ cursor: handleReg('edit', row, canEdit, onEdit) ? "pointer" : "default" }}
                                    >
                                        <td onClick={e => e.stopPropagation()} className="bg-light" style={{ cursor: 'default' }}>
                                            <div className="d-flex justify-content-evenly">
                                                {onDelete && (
                                                    <button
                                                        onClick={() => { if (handleReg('delete', row, canDelete, onDelete)) onDelete(row) }}
                                                        className="icon-action"
                                                        title="Eliminar"
                                                        style={{ cursor: handleReg('delete', row, canDelete, onDelete) ? 'pointer' : 'default' }}
                                                        disabled={!handleReg('delete', row, canDelete, onDelete)}
                                                    >
                                                        <i className={`bi bi-trash-fill ${handleReg('delete', row, canDelete, onDelete) ? 'text-danger' : 'text-danger-emphasis'}`}></i>
                                                    </button>
                                                )}
                                                {onView && (
                                                    <button
                                                        onClick={() => { if (handleReg('view', row, canView, onView)) onView(row) }}
                                                        className="icon-action"
                                                        title="Ver"
                                                        style={{ cursor: handleReg('view', row, canView, onView) ? 'pointer' : 'default' }}
                                                        disabled={!handleReg('view', row, canView, onView)}
                                                    >
                                                        <i className={`bi bi-eye-fill ${handleReg('view', row, canView, onView) ? 'text-primary' : 'text-primary-emphasis'}`}></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        {displayedColumns.map(col => (
                                            <td key={col?.key} className={col?.classname}>
                                                {formatCellValue(col, row, userLog)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className='bg-light border-top border-secondary-subtle p-3' />
            </div>
        </div>
    );
};

export default SmartTable;
