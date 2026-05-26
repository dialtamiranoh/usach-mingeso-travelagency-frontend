// src/components/DualListBox.jsx
const DualListBox = ({ available, selected, onAdd, onRemove, labelKey = 'name' }) => {
    const handleAdd = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(o => JSON.parse(o.value))
        selectedOptions.forEach(item => onAdd(item))
    }

    const handleRemove = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(o => JSON.parse(o.value))
        selectedOptions.forEach(item => onRemove(item))
    }

    return (
        <div className="d-flex align-items-center gap-2">
            {/* Lista disponibles */}
            <div className="flex-fill">
                <label className="form-label text-muted small">Disponibles</label>
                <select className="form-select" multiple style={{ height: '150px' }} onChange={handleAdd}>
                    {available.map(item => (
                        <option key={item.id} value={JSON.stringify(item)}>
                            {item[labelKey]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Botones */}
            <div className="d-flex flex-column gap-2">
                <button type="button" className="btn btn-sm btn-outline-primary" title="Agregar"
                    onClick={() => {
                        if (available.length > 0) onAdd(available[0])
                    }}>
                    &gt;&gt;
                </button>
                <button type="button" className="btn btn-sm btn-outline-danger" title="Quitar"
                    onClick={() => {
                        if (selected.length > 0) onRemove(selected[0])
                    }}>
                    &lt;&lt;
                </button>
            </div>

            {/* Lista seleccionados */}
            <div className="flex-fill">
                <label className="form-label text-muted small">Seleccionados</label>
                <select className="form-select" multiple style={{ height: '150px' }} onChange={handleRemove}>
                    {selected.map(item => (
                        <option key={item.id} value={JSON.stringify(item)}>
                            {item[labelKey]}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default DualListBox