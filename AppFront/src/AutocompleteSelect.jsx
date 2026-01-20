import { useEffect, useState } from "react";

export default function AutocompleteSelect({
    options = [],
    value = null,
    onChange,
    getLabel,
    searchFields = [],
    size = 5,
    multiple = false,
    disabled = false,
    required = false,
    autofocus = false,
    className = ""
}) {
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(-1);

    const selected = multiple
        ? Array.isArray(value) ? value : []
        : value ? [value] : [];

    useEffect(() => {
        setInputValue('');
    }, [value]);

    const normalizedInput = inputValue.trim().toLowerCase();
    const filtered = options.filter(o => {
        if (searchFields.length === 0) {
            return (getLabel(o) ?? '').toLowerCase().includes(normalizedInput);
        }
        return searchFields.some(fn => (fn(o) ?? '').toString().toLowerCase().includes(normalizedInput));
    }).slice(0, size);

    const selectItem = (item) => {
        if (!multiple) {
            const isSame = value?.id === item.id;
            onChange(isSame ? null : item);
            setOpen(false);
            setInputValue('');
            return;
        }

        const exists = selected.some(s => s.id === item.id);
        const next = exists ? selected.filter(s => s.id !== item.id) : [...selected, item];
        onChange(next);
        setInputValue('');
        setOpen(true);
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

    const displayValue = () => {
        if (open && inputValue !== '') return inputValue;
        if (multiple) {
            if (open) return '';
            if (selected.length === 0) return '';
            return `${selected.length} seleccionado${selected.length > 1 ? 's' : ''}`;
        }
        return !multiple && !open && value ? getLabel(value) : inputValue;
    };

    return (
        <div className="position-relative">
            <input
                type="text"
                className={`${className ? className : ' form-control border-input w-100'}`}
                placeholder="Buscar..."
                disabled={disabled}
                value={displayValue()}
                onFocus={() => {
                    setOpen(true);
                    setInputValue('');
                }}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setOpen(true);
                    if (!multiple && e.target.value === '') {
                        onChange(null);
                    }
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => {
                    setOpen(false);
                    setInputValue('');
                }, 150)}
                autoFocus={autofocus}
                required={required}
            />
            <div className="invalid-feedback text-danger text-start">
                <i className="bi bi-exclamation-triangle-fill m-2"></i>El campo es obligatorio.
            </div>

            {open && filtered.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow z-3">
                    {filtered.map((item, idx) => {
                        const isSelected = selected.some(s => s.id === item.id);
                        return (
                            <li
                                key={item.id}
                                className={`list-group-item list-group-item-action
                                    ${idx === highlight ? 'active' : ''}
                                    ${isSelected ? 'fw-bold text-success' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onMouseDown={() => selectItem(item)}
                            >
                                {getLabel(item)}
                                {isSelected && <i className="bi bi-check-circle-fill float-end"></i>}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
