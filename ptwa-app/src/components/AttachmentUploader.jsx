import React, { useRef, useState, useEffect } from 'react';
import { DOCUMENT_CATEGORIES } from '../data/permitLibrary.js';

/**
 * attachments item shape:
 *  New, not yet uploaded:  { id, name, category, type, size, file: File, previewUrl }
 *  Already saved (edit):   { id, name, category, type, size, storagePath, persisted: true }
 * Actual upload to Supabase Storage happens on form submit (see NewPermit.jsx),
 * not here — this component only stages files.
 */
export default function AttachmentUploader({ attachments, onChange, signedUrls = {} }) {
  const fileRef = useRef(null);
  const [category, setCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => () => {
    attachments.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = (fileList) => {
    const newItems = Array.from(fileList).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      category,
      type: file.type,
      size: file.size,
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    onChange([...attachments, ...newItems]);
  };

  const removeAttachment = (id) => {
    const item = attachments.find((a) => a.id === id);
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <select className="field-select" style={{ maxWidth: 260 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
          Choose File(s)
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--jg-green-700)' : 'var(--jg-grey-200)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 18,
          textAlign: 'center',
          color: 'var(--jg-charcoal-500)',
          fontSize: 13,
          background: dragOver ? 'var(--jg-green-50)' : 'transparent',
          marginBottom: 14,
        }}
      >
        Drag & drop files here under the selected category, or use "Choose File(s)". Files upload when you submit the permit.
      </div>

      {attachments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {attachments.map((a) => {
            const thumb = a.previewUrl || (a.persisted ? signedUrls[a.id] : null);
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  border: '1.5px solid var(--jg-grey-200)', borderRadius: 'var(--radius-sm)',
                }}
              >
                {thumb ? (
                  <img src={thumb} alt={a.name} style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 38, height: 38, borderRadius: 6, background: 'var(--jg-grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--jg-charcoal-500)' }}>
                    FILE
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>
                    {a.category}{a.persisted ? ' · saved' : ' · will upload on submit'}
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeAttachment(a.id)}>Remove</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
