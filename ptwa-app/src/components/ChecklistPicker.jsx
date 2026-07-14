import React, { useState } from 'react';

/**
 * Generic multi-select checklist with an "add custom item" input.
 * options: array of strings
 * value: array of strings currently selected
 */
export default function ChecklistPicker({ options, value, onChange, columns = 2, allowCustom = true }) {
  const [customText, setCustomText] = useState('');

  const toggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const addCustom = () => {
    const t = customText.trim();
    if (t && !value.includes(t)) {
      onChange([...value, t]);
      setCustomText('');
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 8,
        }}
        className="field-grid"
      >
        {options.map((opt) => {
          const label = typeof opt === 'string' ? opt : opt.label;
          const checked = value.includes(label);
          return (
            <label key={label} className={`checkbox-row ${checked ? 'checked' : ''}`}>
              <input type="checkbox" checked={checked} onChange={() => toggle(label)} />
              <span style={{ fontSize: 14 }}>
                {label}
                {typeof opt !== 'string' && opt.impact && (
                  <span
                    className="text-mono"
                    style={{
                      marginLeft: 6, fontSize: 10, fontWeight: 700,
                      color: opt.impact === 'High' ? 'var(--jg-red-600)' : opt.impact === 'Medium' ? 'var(--jg-amber-600)' : 'var(--jg-green-700)',
                    }}
                  >
                    {opt.impact.toUpperCase()}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {allowCustom && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            className="field-input"
            placeholder="Add other item…"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={addCustom}>Add</button>
        </div>
      )}

      {value.filter((v) => !options.some((o) => (typeof o === 'string' ? o : o.label) === v)).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {value
            .filter((v) => !options.some((o) => (typeof o === 'string' ? o : o.label) === v))
            .map((v) => (
              <span
                key={v}
                className="status-badge"
                style={{ background: 'var(--jg-grey-100)', color: 'var(--jg-charcoal-700)', cursor: 'pointer' }}
                onClick={() => toggle(v)}
                title="Click to remove"
              >
                {v} ✕
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
