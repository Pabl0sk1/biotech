import { useEffect, useRef, useState } from "react";

export default function AutocompleteSelect({
    options = [],
    value = null,
    onChange,
    getLabel,
    searchFields = [],
    disabled = false,
    required = false
}) {
    const [input, setInput] = useState('');
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(-1);
    const listRef = useRef(null);

    useEffect(() => {
        const forms = document.querySelectorAll('.needs-validation');
        Array.from(forms).forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, []);

    useEffect(() => {
        if (value) {
            const label = getLabel(value);
            setInput(label ?? '');
        } else {
            setInput('');
        }
    }, [value, getLabel]);

    const findExactMatch = (text) => {
        const normalized = text.trim().toLowerCase();
        return options.find(o => {
            if (searchFields.length === 0) {
                return (getLabel(o) ?? '').toLowerCase() === normalized;
            }

            return searchFields.some(fn =>
                String(fn(o)).toLowerCase() === normalized
            );
        }) || null;
    };

    const normalizedInput = (input ?? '').trim().toLowerCase();
    const filtered = options.filter(o => {
        if (searchFields.length === 0) {
            return (getLabel(o) ?? '').toLowerCase().includes(normalizedInput);
        }

        return searchFields.some(fn => {
            const val = fn(o);
            if (val === null || val === undefined) return false;

            return String(val).toLowerCase().includes(normalizedInput);
        });
    }).slice(0, 5);

    const selectItem = (item) => {
        onChange(item);
        setInput(getLabel(item));
        setOpen(false);
        setHighlight(-1);
    };

    const handleKeyDown = (e) => {
        if (!open) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight(h => Math.min(h + 1, filtered.length - 1));
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight(h => Math.max(h - 1, 0));
        }

        if (e.key === "Enter" && highlight >= 0) {
            e.preventDefault();
            selectItem(filtered[highlight]);
        }

        if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div className="position-relative">
            <input
                type="text"
                className="form-control border-input w-100"
                placeholder="Buscar..."
                value={input}
                disabled={disabled}
                onChange={(e) => {
                    const text = e.target.value;
                    setInput(text);
                    setOpen(true);
                    const match = findExactMatch(text);
                    if (!match && value !== null) onChange(null);
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                    setTimeout(() => {
                        const match = findExactMatch(input);
                        if (!match) {
                            setInput('');
                            onChange(null);
                        }
                        setOpen(false);
                    }, 150);
                }}
                required={required}
            />
            <div className="invalid-feedback text-danger text-start">
                <i className="bi bi-exclamation-triangle-fill m-2"></i>El campo es obligatorio.
            </div>

            {open && filtered.length > 0 && (
                <ul
                    ref={listRef}
                    className="list-group position-absolute w-100 shadow z-3"
                >
                    {filtered.map((item, idx) => (
                        <li
                            key={item.id}
                            className={`list-group-item list-group-item-action
                ${idx === highlight ? 'active' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onMouseDown={() => selectItem(item)}
                        >
                            {getLabel(item)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
