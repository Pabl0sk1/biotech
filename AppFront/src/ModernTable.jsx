import { useState } from "react";
import { ListControls } from "./ListControls";
import { FiltroModal } from "./FiltroModal";

/* =======================
    Utilidades
======================= */
const getNestedValue = (obj, path) => {
    if (!path || !obj) return "";
    return path.split(".").reduce((current, prop) => current?.[prop], obj) || "";
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
    tableClassName = "table table-hover align-middle m-0 list-table",
    theadClassName = "table-secondary",
    rowClassName,
    columnSettings = {} // key: {label, sortable, filtered, type, render, order, classname, field}
}) => {
    // construimos el array de columnas a partir de la configuración
    // El "key" es el identificador usado en la UI; "field" es el path usado para sorting/filtering y para obtener el valor del row.
    const columns = Object.entries(columnSettings).map(([key, cfg]) => {
        const field = cfg.field || key;
        return {
            key,
            field,
            ...cfg
        };
    });

    // opcionalmente ordenar las columnas si la configuración incluye order numérico
    columns.sort((a, b) => (a.order || 0) - (b.order || 0));
    const [filtroActivo, setFiltroActivo] = useState({ visible: false });
    const [filtrosAplicados, setFiltrosAplicados] = useState({});
    const generarFiltro = defaultGenerarFiltro;

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
        const previo = filtrosAplicados[field] ?? {};
        setFiltroActivo({
            field,
            type,
            visible: true,
            op: previo.op,
            value: previo.value,
            value1: previo.value1,
            value2: previo.value2,
            coords: {
                top: rect.bottom - 95,
                left: rect.left
            }
        });
    };

    const handleRefresh = () => {
        setQuery(q => ({ ...q, order: "", filter: [] }));
        setFiltrosAplicados({});
        onRefresh?.();
    };

    const handleRowClick = (row, e) => {
        if (e) e.stopPropagation();
        if (canEdit && onEdit) {
            onEdit(row);
        }
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
                <table className={tableClassName}>
                    <thead className={theadClassName}>
                        <tr>
                            {columns.map(col => {
                                const colSettings = columnSettings[col?.key] || {};
                                const sort = col?.sortable ?? true;
                                const filter = col?.filtered ?? true;
                                return (
                                    <th
                                        key={col?.key}
                                        onClick={() => sort && toggleOrder(col?.field)}
                                        className={sort ? "sortable-header" : ""}
                                        style={{ cursor: sort ? "pointer" : "default" }}
                                    >
                                        {col?.label}
                                        {sort && (
                                            <i className={`bi ${getSortIcon(col?.field)} ms-2`}></i>
                                        )}
                                        {filter && (
                                            <i
                                                className="bi bi-funnel-fill btn btn-primary p-0 px-2 border-0 ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => handleFilterClick(e, col?.field, colSettings?.type || "string")}
                                            ></i>
                                        )}
                                    </th>
                                );
                            })}
                            <th style={{ cursor: 'default' }}>Opciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (canEdit || canDelete || canView ? 1 : 0)}
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
                                    onClick={(e) => handleRowClick(row, e)}
                                    style={{ cursor: canEdit ? "pointer" : "default" }}
                                >
                                    {columns.map(col => {
                                        let value = getNestedValue(row, col?.field);

                                        if (col?.render) {
                                            return <td
                                                key={col?.key}
                                                className={col?.classname}
                                            >
                                                {col?.render(row)}
                                            </td>;
                                        }

                                        return (
                                            <td
                                                key={col?.key}
                                                className={col?.classname}
                                            >
                                                {value}
                                            </td>
                                        );
                                    })}

                                    <td onClick={e => e.stopPropagation()} className="bg-light" style={{ cursor: 'default' }}>
                                        <div className="d-flex justify-content-evenly">
                                            <button
                                                onClick={() => { if (canDelete) onDelete(row) }}
                                                className="icon-action"
                                                title="Eliminar"
                                                style={{ cursor: canDelete ? 'pointer' : 'default' }}
                                                disabled={!canDelete}
                                            >
                                                <i className={`bi bi-trash-fill ${canDelete ? 'text-danger' : 'text-danger-emphasis'}`}></i>
                                            </button>
                                            <button
                                                onClick={async (e) => { if (canView) onView(row) }}
                                                className="icon-action"
                                                title="Ver"
                                                style={{ cursor: canView ? 'pointer' : 'default' }}
                                                disabled={!canView}
                                            >
                                                <i className={`bi bi-eye-fill ${canView ? 'text-primary' : 'text-primary-emphasis'}`}></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className='bg-light border-top border-secondary-subtle p-3' />
            </div>
        </div>
    );
};

export default SmartTable;
