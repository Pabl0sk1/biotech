import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddAccess } from "./utils/AddAccess.js";
import { tienePermisoRuta } from './utils/RouteAccess.js';
import AutocompleteSelect from "./AutocompleteSelect";

/* =======================
    Utils
======================= */
const getColClass = (columns) => {
    switch (columns) {
        case 1: return "col-12";
        case 2: return "col-md-6";
        case 3: return "col-md-4";
        case 4: return "col-md-3";
        default: return "col-md-6";
    }
};

const labelize = (key) =>
    key
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, c => c.toUpperCase());

const getMultipleOpts = (stringValue, opts, idfield) => {
    if (!stringValue || stringValue.length === 0) return [];

    const optsArray = stringValue.split(',').map(c => c.trim().toLowerCase());
    return opts.filter(v =>
        optsArray.includes(v[idfield].toLowerCase())
    );
};

/* =======================
    Campo automático
======================= */
const AutoField = ({ name, value, onChange, disabled, settings, mode }) => {
    const type = settings?.type ?? "text";
    const required = settings?.notnull || false;
    const optMul = settings?.options || [];

    const common = {
        id: name,
        name,
        disabled: disabled,
        required: required,
        autoFocus: settings?.autofocus,
        className: `${type === "checkbox" ? "form-check-input p-3" : "modern-input-edit"}`,
        value: value ?? "",
        checked: type === "checkbox" ? !!value : undefined,
        placeholder: !disabled ? "Escribe..." : "",
        onChange: e =>
            onChange(
                name,
                type === "checkbox" ? e.target.checked : e.target.value
            )
    };

    if (type === "checkbox") {
        return (
            <div className="form-check d-flex justify-content-center">
                <input type="checkbox" {...common} />
            </div>
        );
    }

    if (type == "select") {
        return (
            <select {...common}>
                {(settings.options || []).map(opt => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        );
    }

    const searchFields = settings?.searches ? settings?.searches.map(field => v => {
        const parts = field.split('.');
        return parts.reduce((current, prop) => current?.[prop], v);
    }) : [];
    if (type === "object") {
        return (
            <AutocompleteSelect
                options={settings?.options || []}
                value={value}
                onChange={(val) => onChange(name, val)}
                getLabel={settings?.getLabel}
                searchFields={searchFields}
                disabled={disabled}
                multiple={false}
                autofocus={settings?.autofocus}
            />
        );
    }
    if (type === "object.multiple") {
        const idfield = settings?.idfield;
        return (
            <AutocompleteSelect
                options={settings?.options || []}
                value={getMultipleOpts(value, optMul, idfield)}
                onChange={(val) => {
                    const stringVal = val.map(v => v[idfield]).join(',');
                    onChange(name, stringVal);
                }}
                getLabel={settings?.getLabel}
                searchFields={searchFields}
                disabled={disabled}
                multiple={true}
                autofocus={settings?.autofocus}
            />
        );
    }

    if (type === "textarea") return <textarea {...common} rows={3} />;

    return <input type={type} {...common} />;
};

/* =======================
    Modal principal
======================= */
export const SmartModal = ({
    open,
    onClose,
    title,
    data,
    onSave,
    mode = "view",
    columns: columnsProp = 2,
    fieldSettings = {}, // key: { label, description, type, options, searches, hidden, disabled, notnull, order, autofocus, idfield, module, listPath, popupTitle }
    userLog
}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [columns, setColumns] = useState(columnsProp);
    const [errors, setErrors] = useState({});
    const [canCreateMap, setCanCreateMap] = useState({});

    useEffect(() => {
        setFormData(data || {});
        setErrors({});
    }, [data]);

    useEffect(() => {
        setColumns(columnsProp);
    }, [columnsProp]);

    useEffect(() => {
        // if parent provided explicit canCreate map, use it
        const keys = Object.keys(fieldSettings || {});
        const modulesToCheck = keys
            .map(k => ({ key: k, module: fieldSettings[k]?.module }))
            .filter(x => x.module);

        if (modulesToCheck.length === 0) return;

        let mounted = true;
        (async () => {
            const entries = await Promise.all(modulesToCheck.map(async ({ key, module }) => {
                try {
                    const id = userLog?.tipousuario?.id ?? userLog;
                    const ok = await tienePermisoRuta(module, id);
                    return [key, !!ok];
                } catch (e) {
                    return [key, false];
                }
            }));
            if (!mounted) return;
            const map = {};
            entries.forEach(([k, v]) => map[k] = v);
            setCanCreateMap(prev => ({ ...prev, ...map }));
        })();

        return () => { mounted = false };
    }, [fieldSettings, userLog]);

    if (!open) return null;

    const disabledAll = mode === "view";
    const colClass = getColClass(columns);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        // Limpiar error para este campo al cambiar
        setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const validateForm = () => {
        const newErrors = {};
        orderedKeys.forEach(key => {
            const settings = fieldSettings[key] || {};
            if (settings.notnull && (!formData[key] || (Array.isArray(formData[key]) && formData[key].length === 0))) {
                newErrors[key] = "Este campo es obligatorio.";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Use fieldSettings keys for deterministic ordering and presence
    const orderedKeys = Object.keys(formData)
        .filter(key => !fieldSettings[key]?.hidden)
        .sort((a, b) => {
            const orderA = fieldSettings[a]?.order ?? 999;
            const orderB = fieldSettings[b]?.order ?? 999;
            return orderA - orderB;
        });

    return (
        <>
            <div className="modal-backdrop fade show" onClick={onClose} />

            <div className="modal d-block">
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">
                                {mode === "create" && "Crear "}
                                {mode === "edit" && "Editar "}
                                {mode === "view" && "Ver "}
                                {title}
                            </h5>
                            {mode !== "view" && (
                                <select
                                    className="form-select form-select-sm ms-3"
                                    style={{ width: 'auto' }}
                                    value={columns}
                                    onChange={(e) => setColumns(parseInt(e.target.value))}
                                >
                                    <option value={1}>1 Columna</option>
                                    <option value={2}>2 Columnas</option>
                                    <option value={3}>3 Columnas</option>
                                    <option value={4}>4 Columnas</option>
                                </select>
                            )}
                            <button className="btn-close" onClick={onClose} />
                        </div>

                        <div className="modal-body">
                            <div className="row g-3">
                                {orderedKeys.map(key => {
                                    const settings = fieldSettings[key] || {};

                                    return (
                                        <div key={key} className={colClass}>
                                            <label className="form-label fw-semibold">
                                                {settings?.label ?? labelize(key)}
                                                {settings?.notnull && mode !== "view" && <i className="text-danger ms-1">*</i>}
                                            </label>
                                            {['object', 'object.multiple'].includes(settings?.type) && mode !== "view" && (() => {
                                                const allowed = canCreateMap[key];
                                                return (
                                                    <button
                                                        type="button"
                                                        className={`btn-action ${allowed ? "enabled" : "disabled"}`}
                                                        onClick={async () => {
                                                            if (!allowed) return;
                                                            const titleForAccess = settings?.popupTitle || key;
                                                            await AddAccess('Consultar', 0, userLog, titleForAccess);
                                                            const target = settings?.listPath;
                                                            navigate(target);
                                                        }}
                                                        title={allowed ? "Agregar nuevo registro" : "Sin permiso"}
                                                    >
                                                        <i className={`bi bi-plus-lg ${allowed ? 'text-success' : 'text-secondary'}`} ></i>
                                                    </button>
                                                );
                                            })()}
                                            {/* compute dynamic disabled status based on other field values */}
                                            {
                                                (() => {
                                                    let dynamicDisabled = settings?.disabled || false;
                                                    if (!dynamicDisabled && settings?.disabledifvalues && Array.isArray(settings.disabledifvalues)) {
                                                        dynamicDisabled = settings.disabledifvalues.some(fld => {
                                                            const val = formData[fld];
                                                            // treat null/undefined/empty string as empty
                                                            return val !== null && val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0);
                                                        });
                                                    }
                                                    return (
                                                        <AutoField
                                                            name={key}
                                                            value={formData[key]}
                                                            onChange={handleChange}
                                                            disabled={disabledAll || dynamicDisabled}
                                                            settings={settings}
                                                            mode={mode}
                                                        />
                                                    );
                                                })()
                                            }
                                            {settings.description && (
                                                <small className="text-muted d-block mt-1">
                                                    <i className="bi bi-info-circle me-1"></i>
                                                    {settings.description}
                                                </small>
                                            )}
                                            {errors[key] && (
                                                <small className="text-danger d-block mt-1">
                                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                                    {errors[key]}
                                                </small>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="modal-footer">
                            {!disabledAll && (
                                <button className="btn btn-success" onClick={() => {
                                    if (validateForm()) {
                                        onSave(formData);
                                    }
                                }}>
                                    Guardar
                                </button>
                            )}
                            <button className="btn btn-danger" onClick={onClose}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SmartModal;
