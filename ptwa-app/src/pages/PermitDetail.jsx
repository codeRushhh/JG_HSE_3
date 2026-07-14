import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import { getPermitById, updatePermitStatus, formatDate, getAttachmentSignedUrl } from '../lib/dataStore.js';
import { CLOSE_OUT_OPTIONS } from '../data/permitLibrary.js';

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--jg-grey-100)', fontSize: 13.5 }}>
      <span className="text-muted">{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );
}

export default function PermitDetail({ permitId, navigate }) {
  const [permit, setPermit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [attachmentUrls, setAttachmentUrls] = useState({});

  const [closeOutMode, setCloseOutMode] = useState(false);
  const [closeAction, setCloseAction] = useState('Job Completed');
  const [closedBy, setClosedBy] = useState('');
  const [remarks, setRemarks] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPermitById(permitId)
      .then((p) => { if (active) { setPermit(p); setLoading(false); } })
      .catch((e) => { if (active) { setError(e.message || 'Could not load this permit.'); setLoading(false); } });
    return () => { active = false; };
  }, [permitId, refreshKey]);

  useEffect(() => {
    if (!permit?.attachments?.length) return;
    let active = true;
    Promise.all(
      permit.attachments.map(async (a) => {
        const url = await getAttachmentSignedUrl(a.storagePath);
        return [a.id, url];
      })
    ).then((pairs) => {
      if (active) setAttachmentUrls(Object.fromEntries(pairs));
    });
    return () => { active = false; };
  }, [permit]);

  const handleCloseOut = async () => {
    setSaving(true);
    try {
      await updatePermitStatus(permit.id, {
        status: closeAction,
        closeOutAt: new Date().toISOString(),
        closedBy,
        remarks,
        verifiedBy,
        suspensionReason: (closeAction === 'Suspended' || closeAction === 'Cancelled') ? suspensionReason : '',
      });
      setCloseOutMode(false);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setError(e.message || 'Could not save the close-out.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}><p className="text-muted">Loading permit…</p></div>;
  }

  if (error && !permit) {
    return (
      <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--jg-red-600)' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('register')}>Back to Register</button>
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>
        <p>Permit not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('register')}>Back to Register</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('register')} style={{ marginBottom: 8, paddingLeft: 0 }}>← Back to Register</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 24 }}>{permit.permitNo}</h1>
            <StatusBadge status={permit.status} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('newPermit', { editPermitId: permit.id })}>Edit</button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>Print / Save PDF</button>
          {permit.status === 'Active' && (
            <button className="btn btn-amber btn-sm" onClick={() => setCloseOutMode(true)}>Close-out Permit</button>
          )}
        </div>
      </div>

      {error && (
        <div className="card no-print" style={{ padding: '12px 16px', marginBottom: 16, background: 'var(--jg-red-100)', border: 'none', color: 'var(--jg-red-600)', fontSize: 13.5, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {closeOutMode && (
        <div className="card no-print" style={{ padding: 20, marginBottom: 18, border: '1.5px solid var(--jg-amber-600)' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>PERMIT CLOSE-OUT</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {CLOSE_OUT_OPTIONS.map((opt) => (
              <label key={opt} className={`checkbox-row ${closeAction === opt ? 'checked' : ''}`} style={{ flex: '1 1 140px' }}>
                <input type="radio" name="closeAction" checked={closeAction === opt} onChange={() => setCloseAction(opt)} />
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{opt}</span>
              </label>
            ))}
          </div>

          {(closeAction === 'Suspended' || closeAction === 'Cancelled') && (
            <div style={{ marginBottom: 12 }}>
              <label className="field-label">Suspension / Cancellation Reason</label>
              <input className="field-input" value={suspensionReason} onChange={(e) => setSuspensionReason(e.target.value)} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }} className="field-grid">
            <div>
              <label className="field-label">Closed By</label>
              <input className="field-input" value={closedBy} onChange={(e) => setClosedBy(e.target.value)} placeholder="Typed signature" />
            </div>
            <div>
              <label className="field-label">Verified By (HSE Manager)</label>
              <input className="field-input" value={verifiedBy} onChange={(e) => setVerifiedBy(e.target.value)} placeholder="Typed signature" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Close-out Remarks</label>
            <textarea className="field-textarea" value={remarks} onChange={(e) => setRemarks(e.target.value)}
              placeholder="Work area inspected and found safe. All workers accounted for. Tools and equipment returned to safe condition." />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setCloseOutMode(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCloseOut} disabled={saving}>
              {saving ? 'Saving…' : 'Confirm Close-out'}
            </button>
          </div>
        </div>
      )}

      {/* Printable permit sheet */}
      <div className="card" style={{ padding: 28 }} id="printable-permit">
        <div className="brand-stripe no-print" style={{ margin: '-28px -28px 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--jg-navy-700)', paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Joseph Group" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>JOSEPH GROUP</div>
              <div className="text-muted" style={{ fontSize: 11 }}>Permit to Work &middot; HSE Department &middot; Since 1978</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stamp" style={{ color: 'var(--jg-green-700)' }}>{permit.permitNo}</div>
            <div className="text-muted" style={{ fontSize: 11, marginTop: 6 }}>Raised {formatDate(permit.createdAt)}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 32px' }} className="field-grid">
          <DetailRow label="Permit For" value={permit.permitType === 'Other' ? permit.otherTypeSpec : permit.permitType} />
          <DetailRow label="Status" value={permit.status} />
          <DetailRow label="Job Start" value={`${permit.jobStartDate || ''} ${permit.jobStartTime || ''}`} />
          <DetailRow label="Expiry" value={`${permit.expiryDate || ''} ${permit.expiryTime || ''}`} />
          <DetailRow label="Location" value={[permit.building, permit.floor, permit.area].filter(Boolean).join(' / ')} />
          <DetailRow label="No. of Workers / Supervisors" value={`${permit.numWorkers || 0} / ${permit.numSupervisors || 0}`} />
        </div>

        <div style={{ margin: '18px 0' }}>
          <div className="field-label">Description of Work</div>
          <p style={{ fontSize: 14, lineHeight: 1.5 }}>{permit.description}</p>
        </div>

        <div className="eyebrow" style={{ margin: '18px 0 8px' }}>APPLICANT DETAILS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 32px' }} className="field-grid">
          <DetailRow label="Company" value={permit.companyName} />
          <DetailRow label="Company Contact" value={permit.companyContact} />
          <DetailRow label="Permit Applicant" value={permit.applicantName} />
          <DetailRow label="Applicant Contact" value={permit.applicantContact} />
          <DetailRow label="Permit Receiver" value={permit.receiverName} />
          <DetailRow label="Receiver Contact" value={permit.receiverContact} />
        </div>

        <div className="eyebrow" style={{ margin: '18px 0 8px' }}>HAZARDS & CONTROLS</div>
        <DetailRow label="Hazards Identified" value={permit.hazardsIdentified ? 'Yes' : 'No'} />
        {permit.hazards?.length > 0 && (
          <div style={{ margin: '10px 0' }}>
            <div className="field-label">Hazards</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {permit.hazards.map((h) => <span key={h} className="status-badge" style={{ background: 'var(--jg-red-100)', color: 'var(--jg-red-600)' }}>{h}</span>)}
            </div>
          </div>
        )}
        {permit.controls?.length > 0 && (
          <div style={{ margin: '10px 0' }}>
            <div className="field-label">Precautions & Controls</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {permit.controls.map((c) => <span key={c} className="status-badge" style={{ background: 'var(--jg-green-100)', color: 'var(--jg-green-900)' }}>{c}</span>)}
            </div>
          </div>
        )}
        {permit.ppe?.length > 0 && (
          <div style={{ margin: '10px 0' }}>
            <div className="field-label">PPE Required</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {permit.ppe.map((p) => <span key={p} className="status-badge" style={{ background: 'var(--jg-blue-100)', color: 'var(--jg-blue-600)' }}>{p}</span>)}
            </div>
          </div>
        )}

        {permit.attachments?.length > 0 && (
          <>
            <div className="eyebrow no-print" style={{ margin: '18px 0 8px' }}>ATTACHED DOCUMENTS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {permit.attachments.map((a) => (
                <a
                  key={a.id}
                  href={attachmentUrls[a.id] || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="card no-print"
                  style={{ padding: '8px 12px', fontSize: 12.5, textDecoration: 'none', color: 'var(--jg-charcoal-900)', opacity: attachmentUrls[a.id] ? 1 : 0.5 }}
                >
                  {a.category}: {a.name}
                </a>
              ))}
            </div>
          </>
        )}

        <div className="eyebrow" style={{ margin: '18px 0 8px' }}>APPROVAL</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 32px' }} className="field-grid">
          <DetailRow label="Permit Applicant Signature" value={permit.applicantSignName} />
          <DetailRow label="Applicant Sign Date" value={permit.applicantSignDate} />
          <DetailRow label="Permit Issuer" value={permit.issuerName} />
          <DetailRow label="Issuer Signature" value={permit.issuerSignName} />
        </div>
        {permit.issuerComments && <DetailRow label="Issuer Comments" value={permit.issuerComments} />}

        {permit.status !== 'Active' && (
          <>
            <div className="eyebrow" style={{ margin: '18px 0 8px' }}>CLOSE-OUT</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 32px' }} className="field-grid">
              <DetailRow label="Close-out Date & Time" value={formatDate(permit.closeOutAt)} />
              <DetailRow label="Closed By" value={permit.closedBy} />
              <DetailRow label="Verified By (HSE Manager)" value={permit.verifiedBy} />
              {permit.suspensionReason && <DetailRow label="Reason" value={permit.suspensionReason} />}
            </div>
            {permit.remarks && (
              <div style={{ marginTop: 10 }}>
                <div className="field-label">Close-out Remarks</div>
                <p style={{ fontSize: 14 }}>{permit.remarks}</p>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 26, paddingTop: 14, borderTop: '1px solid var(--jg-grey-100)', fontSize: 10.5, color: 'var(--jg-charcoal-500)' }}>
          This Permit to Work is issued for the above work and location(s) ONLY, and only on condition that all required documentation and permits have been completed and communicated to all involved persons. Valid within the stated work location only. All completed permits must be returned to HSE Personnel.
        </div>
      </div>
    </div>
  );
}
