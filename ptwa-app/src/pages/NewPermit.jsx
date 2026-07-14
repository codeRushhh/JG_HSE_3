import React, { useState, useEffect, useMemo } from 'react';
import FormSection from '../components/FormSection.jsx';
import FieldGrid, { Field } from '../components/FieldGrid.jsx';
import ChecklistPicker from '../components/ChecklistPicker.jsx';
import AttachmentUploader from '../components/AttachmentUploader.jsx';
import {
  PERMIT_TYPES, PPE_OPTIONS, getHazardsForType, getControlsForType,
} from '../data/permitLibrary.js';
import {
  getPermitById, createPermit, updatePermit, uploadAttachment, deleteAttachment,
  peekNextPermitNumber, getAttachmentSignedUrl,
} from '../lib/dataStore.js';

const emptyForm = {
  permitType: PERMIT_TYPES[0],
  otherTypeSpec: '',
  jobStartDate: '', jobStartTime: '',
  expiryDate: '', expiryTime: '',
  building: '', floor: '', area: '',
  description: '',
  companyName: '', companyContact: '', companyEmail: '', companyAddress: '',
  applicantName: '', applicantContact: '', applicantEmail: '',
  receiverName: '', receiverContact: '', receiverEmail: '',
  numWorkers: '', numSupervisors: '',
  hazardsIdentified: null,
  hazards: [],
  controls: [],
  ppe: [],
  attachments: [],
  applicantSignName: '', applicantSignDate: '',
  issuerName: '', issuerSignName: '', issuerContact: '', issuerComments: '',
  status: 'Active',
};

export default function NewPermit({ navigate, editPermitId }) {
  const isEdit = !!editPermitId;
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [displayPermitNo, setDisplayPermitNo] = useState(isEdit ? '' : '…');
  const [errors, setErrors] = useState({});
  const [savedMsg, setSavedMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
  const [signedUrls, setSignedUrls] = useState({});

  useEffect(() => {
    let active = true;
    if (isEdit) {
      getPermitById(editPermitId)
        .then((existing) => {
          if (!active) return;
          if (existing) {
            setForm({ ...emptyForm, ...existing });
            setDisplayPermitNo(existing.permitNo);
          } else {
            setLoadError('Permit not found.');
          }
          setLoading(false);
        })
        .catch((e) => { if (active) { setLoadError(e.message || 'Could not load this permit.'); setLoading(false); } });
    } else {
      peekNextPermitNumber().then((no) => { if (active) setDisplayPermitNo(no); });
    }
    return () => { active = false; };
  }, [isEdit, editPermitId]);

  useEffect(() => {
    const persisted = form.attachments.filter((a) => a.persisted);
    if (!persisted.length) return;
    let active = true;
    Promise.all(persisted.map(async (a) => [a.id, await getAttachmentSignedUrl(a.storagePath)]))
      .then((pairs) => { if (active) setSignedUrls(Object.fromEntries(pairs)); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id]);

  const typeHazards = useMemo(() => getHazardsForType(form.permitType), [form.permitType]);
  const typeControls = useMemo(() => getControlsForType(form.permitType), [form.permitType]);

  const set = (key) => (e) => {
    const val = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleAttachmentsChange = (nextAttachments) => {
    const removedPersisted = form.attachments.filter((a) => a.persisted && !nextAttachments.some((n) => n.id === a.id));
    if (removedPersisted.length) {
      setRemovedAttachmentIds((ids) => [...ids, ...removedPersisted.map((a) => a.id)]);
    }
    setForm((f) => ({ ...f, attachments: nextAttachments }));
  };

  const validate = () => {
    const req = ['jobStartDate', 'jobStartTime', 'expiryDate', 'expiryTime', 'description', 'companyName', 'applicantName', 'receiverName'];
    const errs = {};
    req.forEach((k) => { if (!String(form[k] || '').trim()) errs[k] = true; });
    if (form.hazardsIdentified === null) errs.hazardsIdentified = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) {
      setSavedMsg('Please complete the highlighted required fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSavedMsg('');
    setSubmitting(true);
    try {
      let permitId = form.id;
      if (isEdit) {
        await updatePermit(permitId, { ...form, status: form.status || 'Active' });
      } else {
        const created = await createPermit({ ...form, status: 'Active' });
        permitId = created.id;
      }

      // Upload any newly staged files
      const newFiles = form.attachments.filter((a) => a.file && !a.persisted);
      for (const item of newFiles) {
        await uploadAttachment(permitId, item.file, item.category);
      }

      // Remove any attachments deleted during edit
      for (const id of removedAttachmentIds) {
        const original = form.attachments.find((a) => a.id === id) || { id };
        await deleteAttachment(original);
      }

      navigate('permitDetail', { permitId });
    } catch (err) {
      setSavedMsg(err.message || 'Something went wrong while saving. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}><p className="text-muted">Loading permit…</p></div>;
  }
  if (loadError) {
    return (
      <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--jg-red-600)' }}>{loadError}</p>
        <button className="btn btn-primary" onClick={() => navigate('register')}>Back to Register</button>
      </div>
    );
  }

  return (
    <div className="container page-enter" style={{ paddingTop: 24, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="eyebrow">{isEdit ? 'EDIT PERMIT' : 'NEW PERMIT TO WORK'}</div>
          <h1 style={{ fontSize: 26, marginTop: 4 }}>{isEdit ? 'Edit Permit' : 'Raise a New Permit'}</h1>
        </div>
        <div className="stamp" style={{ color: 'var(--jg-green-700)' }}>{displayPermitNo}</div>
      </div>

      {savedMsg && (
        <div className="card" style={{ padding: '12px 16px', marginBottom: 16, background: 'var(--jg-red-100)', border: 'none', color: 'var(--jg-red-600)', fontSize: 13.5, fontWeight: 600 }}>
          {savedMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FormSection number="1" title="Permit For & Job Timing" subtitle="Select the type of work and validity window">
          <FieldGrid columns={2}>
            <Field label="Permit For *">
              <select className="field-select" value={form.permitType} onChange={set('permitType')}>
                {PERMIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            {form.permitType === 'Other' && (
              <Field label="Specify Other Work">
                <input className="field-input" value={form.otherTypeSpec} onChange={set('otherTypeSpec')} />
              </Field>
            )}
            <Field label="Job Start Date *">
              <input type="date" className="field-input" value={form.jobStartDate} onChange={set('jobStartDate')}
                style={errors.jobStartDate ? { borderColor: 'var(--jg-red-600)' } : undefined} />
            </Field>
            <Field label="Job Start Time *">
              <input type="time" className="field-input" value={form.jobStartTime} onChange={set('jobStartTime')}
                style={errors.jobStartTime ? { borderColor: 'var(--jg-red-600)' } : undefined} />
            </Field>
            <Field label="Expiry Date *">
              <input type="date" className="field-input" value={form.expiryDate} onChange={set('expiryDate')}
                style={errors.expiryDate ? { borderColor: 'var(--jg-red-600)' } : undefined} />
            </Field>
            <Field label="Expiry Time *">
              <input type="time" className="field-input" value={form.expiryTime} onChange={set('expiryTime')}
                style={errors.expiryTime ? { borderColor: 'var(--jg-red-600)' } : undefined} />
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection number="2" title="Location & Description of Work">
          <FieldGrid columns={3}>
            <Field label="Building"><input className="field-input" value={form.building} onChange={set('building')} /></Field>
            <Field label="Floor"><input className="field-input" value={form.floor} onChange={set('floor')} /></Field>
            <Field label="Area"><input className="field-input" value={form.area} onChange={set('area')} /></Field>
          </FieldGrid>
          <div style={{ marginTop: 14 }}>
            <Field label="Description of Work *">
              <textarea className="field-textarea" value={form.description} onChange={set('description')}
                style={errors.description ? { borderColor: 'var(--jg-red-600)' } : undefined}
                placeholder="Describe the scope of work in detail…" />
            </Field>
          </div>
        </FormSection>

        <FormSection number="3" title="PTW Applicant Details">
          <FieldGrid columns={2}>
            <Field label="Company Name *" span={2}>
              <input className="field-input" value={form.companyName} onChange={set('companyName')}
                style={errors.companyName ? { borderColor: 'var(--jg-red-600)' } : undefined} />
            </Field>
            <Field label="Company Contact No."><input className="field-input" value={form.companyContact} onChange={set('companyContact')} /></Field>
            <Field label="Company Email"><input type="email" className="field-input" value={form.companyEmail} onChange={set('companyEmail')} /></Field>
            <Field label="Company Address" span={2}><input className="field-input" value={form.companyAddress} onChange={set('companyAddress')} /></Field>

            <Field label="Permit Applicant *">
              <input className="field-input" value={form.applicantName} onChange={set('applicantName')}
                style={errors.applicantName ? { borderColor: 'var(--jg-red-600)' } : undefined} />
            </Field>
            <Field label="Applicant Contact No."><input className="field-input" value={form.applicantContact} onChange={set('applicantContact')} /></Field>
            <Field label="Applicant Email" span={2}><input type="email" className="field-input" value={form.applicantEmail} onChange={set('applicantEmail')} /></Field>

            <Field label="Permit Receiver *">
              <input className="field-input" value={form.receiverName} onChange={set('receiverName')}
                style={errors.receiverName ? { borderColor: 'var(--jg-red-600)' } : undefined} />
            </Field>
            <Field label="Receiver Contact No."><input className="field-input" value={form.receiverContact} onChange={set('receiverContact')} /></Field>
            <Field label="Receiver Email" span={2}><input type="email" className="field-input" value={form.receiverEmail} onChange={set('receiverEmail')} /></Field>

            <Field label="No. of Workers"><input type="number" min="0" className="field-input" value={form.numWorkers} onChange={set('numWorkers')} /></Field>
            <Field label="No. of Supervisors"><input type="number" min="0" className="field-input" value={form.numSupervisors} onChange={set('numSupervisors')} /></Field>
          </FieldGrid>
        </FormSection>

        <FormSection number="4" title="Hazards Identified" subtitle={`Suggested hazards for "${form.permitType}" — tick all that apply`}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {[true, false].map((v) => (
              <label key={String(v)} className={`checkbox-row ${form.hazardsIdentified === v ? 'checked' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
                <input type="radio" name="hazardsIdentified" checked={form.hazardsIdentified === v} onChange={() => setForm((f) => ({ ...f, hazardsIdentified: v }))} style={{ width: 18, height: 18 }} />
                <span style={{ fontWeight: 700 }}>{v ? 'Yes — hazards identified' : 'No hazards identified'}</span>
              </label>
            ))}
          </div>
          {errors.hazardsIdentified && <div style={{ color: 'var(--jg-red-600)', fontSize: 13, marginBottom: 12 }}>Please indicate whether hazards were identified.</div>}

          {form.hazardsIdentified && (
            <ChecklistPicker
              options={typeHazards}
              value={form.hazards}
              onChange={(v) => setForm((f) => ({ ...f, hazards: v }))}
              columns={2}
            />
          )}
        </FormSection>

        <FormSection number="5" title="Safety Precautions & Controls" subtitle="Planned or undertaken — suggested for this permit type">
          <ChecklistPicker
            options={typeControls}
            value={form.controls}
            onChange={(v) => setForm((f) => ({ ...f, controls: v }))}
            columns={2}
          />
        </FormSection>

        <FormSection number="6" title="PPE Required">
          <ChecklistPicker
            options={PPE_OPTIONS}
            value={form.ppe}
            onChange={(v) => setForm((f) => ({ ...f, ppe: v }))}
            columns={3}
            allowCustom={false}
          />
        </FormSection>

        <FormSection number="7" title="Attached Documents" subtitle="Method Statement, Risk Assessment, JSA, drawings, certificates, photos">
          <AttachmentUploader
            attachments={form.attachments}
            onChange={handleAttachmentsChange}
            signedUrls={signedUrls}
          />
        </FormSection>

        <FormSection number="8" title="Approval of PTW">
          <FieldGrid columns={2}>
            <Field label="Permit Applicant — Typed Signature">
              <input className="field-input" value={form.applicantSignName} onChange={set('applicantSignName')} placeholder="Type full name to sign" />
            </Field>
            <Field label="Date">
              <input type="date" className="field-input" value={form.applicantSignDate} onChange={set('applicantSignDate')} />
            </Field>
            <Field label="Permit Issuer (Name)">
              <input className="field-input" value={form.issuerName} onChange={set('issuerName')} />
            </Field>
            <Field label="Permit Issuer Contact No.">
              <input className="field-input" value={form.issuerContact} onChange={set('issuerContact')} />
            </Field>
            <Field label="Permit Issuer — Typed Signature" span={2}>
              <input className="field-input" value={form.issuerSignName} onChange={set('issuerSignName')} placeholder="Type full name to sign" />
            </Field>
            <Field label="Comments of Permit Issuer" span={2}>
              <textarea className="field-textarea" value={form.issuerComments} onChange={set('issuerComments')} />
            </Field>
          </FieldGrid>
        </FormSection>

        <div
          className="glass-panel"
          style={{
            display: 'flex', gap: 10, position: 'sticky', bottom: 14, marginTop: 8,
            padding: 10, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-hover)',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={() => navigate('home')} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit Permit'}
          </button>
        </div>
      </form>
    </div>
  );
}
