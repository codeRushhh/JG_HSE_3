/**
 * dataStore.js — Phase 2 (Supabase)
 * ------------------------------------------------------------------
 * Same job as Phase 1, different backend: every function here now
 * talks to Supabase (Postgres for permits/attachments metadata,
 * Storage for the actual attached files, Auth for the single HSE
 * login) instead of localStorage. Pages call these same functions —
 * they just now return Promises, so callers use async/await.
 * ------------------------------------------------------------------
 */

import { supabase, HSE_EMAIL } from './supabaseClient.js';

const PERMIT_PREFIX = 'JG-HSE-PTW-';
const BUCKET = 'ptw-attachments';

/* ---------------------------- Auth ------------------------------ */

export async function login(password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: HSE_EMAIL,
    password,
  });
  if (error) {
    console.error('login error', error.message);
    return false;
  }
  return !!data.session;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function isLoggedIn() {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/** Subscribe to auth changes (e.g. token expiry, sign-out elsewhere). */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(!!session);
  });
  return data.subscription;
}

/* ------------------------- Permit numbering ----------------------- */

export async function nextPermitNumber() {
  const { data, error } = await supabase.rpc('next_permit_no');
  if (error) throw error;
  return `${PERMIT_PREFIX}${String(data).padStart(3, '0')}`;
}

/** Best-effort preview only — the real number is assigned atomically on submit. */
export async function peekNextPermitNumber() {
  const { data, error } = await supabase.from('permit_counter').select('value').eq('id', 1).maybeSingle();
  if (error || !data) return `${PERMIT_PREFIX}001`;
  return `${PERMIT_PREFIX}${String(data.value + 1).padStart(3, '0')}`;
}

/* --------------------------- Mapping ------------------------------ */

function toCamelPermit(row) {
  if (!row) return null;
  const attachments = (row.permit_attachments || []).map((a) => ({
    id: a.id,
    name: a.name,
    category: a.category,
    type: a.file_type,
    size: a.size,
    storagePath: a.storage_path,
    persisted: true,
  }));
  return {
    id: row.id,
    permitNo: row.permit_no,
    permitType: row.permit_type,
    otherTypeSpec: row.other_type_spec,
    jobStartDate: row.job_start_date,
    jobStartTime: row.job_start_time,
    expiryDate: row.expiry_date,
    expiryTime: row.expiry_time,
    building: row.building,
    floor: row.floor,
    area: row.area,
    description: row.description,
    companyName: row.company_name,
    companyContact: row.company_contact,
    companyEmail: row.company_email,
    companyAddress: row.company_address,
    applicantName: row.applicant_name,
    applicantContact: row.applicant_contact,
    applicantEmail: row.applicant_email,
    receiverName: row.receiver_name,
    receiverContact: row.receiver_contact,
    receiverEmail: row.receiver_email,
    numWorkers: row.num_workers,
    numSupervisors: row.num_supervisors,
    hazardsIdentified: row.hazards_identified,
    hazards: row.hazards || [],
    controls: row.controls || [],
    ppe: row.ppe || [],
    applicantSignName: row.applicant_sign_name,
    applicantSignDate: row.applicant_sign_date,
    issuerName: row.issuer_name,
    issuerSignName: row.issuer_sign_name,
    issuerContact: row.issuer_contact,
    issuerComments: row.issuer_comments,
    status: row.status,
    closeOutAt: row.close_out_at,
    closedBy: row.closed_by,
    remarks: row.remarks,
    verifiedBy: row.verified_by,
    suspensionReason: row.suspension_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachments,
  };
}

function toDbRow(permit) {
  return {
    permit_type: permit.permitType,
    other_type_spec: permit.otherTypeSpec || null,
    job_start_date: permit.jobStartDate || null,
    job_start_time: permit.jobStartTime || null,
    expiry_date: permit.expiryDate || null,
    expiry_time: permit.expiryTime || null,
    building: permit.building || null,
    floor: permit.floor || null,
    area: permit.area || null,
    description: permit.description || null,
    company_name: permit.companyName || null,
    company_contact: permit.companyContact || null,
    company_email: permit.companyEmail || null,
    company_address: permit.companyAddress || null,
    applicant_name: permit.applicantName || null,
    applicant_contact: permit.applicantContact || null,
    applicant_email: permit.applicantEmail || null,
    receiver_name: permit.receiverName || null,
    receiver_contact: permit.receiverContact || null,
    receiver_email: permit.receiverEmail || null,
    num_workers: permit.numWorkers ? Number(permit.numWorkers) : null,
    num_supervisors: permit.numSupervisors ? Number(permit.numSupervisors) : null,
    hazards_identified: permit.hazardsIdentified,
    hazards: permit.hazards || [],
    controls: permit.controls || [],
    ppe: permit.ppe || [],
    applicant_sign_name: permit.applicantSignName || null,
    applicant_sign_date: permit.applicantSignDate || null,
    issuer_name: permit.issuerName || null,
    issuer_sign_name: permit.issuerSignName || null,
    issuer_contact: permit.issuerContact || null,
    issuer_comments: permit.issuerComments || null,
    status: permit.status || 'Active',
  };
}

/* ---------------------------- Permits ----------------------------- */

export async function getAllPermits() {
  const { data, error } = await supabase
    .from('permits')
    .select('*, permit_attachments(*)')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getAllPermits error', error.message);
    return [];
  }
  return data.map(toCamelPermit);
}

export async function getPermitById(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from('permits')
    .select('*, permit_attachments(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('getPermitById error', error.message);
    return null;
  }
  return toCamelPermit(data);
}

/** Creates a new permit, atomically assigning the next permit number. */
export async function createPermit(permit) {
  const permitNo = await nextPermitNumber();
  const row = { ...toDbRow(permit), permit_no: permitNo };
  const { data, error } = await supabase.from('permits').insert(row).select().single();
  if (error) throw error;
  return toCamelPermit({ ...data, permit_attachments: [] });
}

export async function updatePermit(id, permit) {
  const row = toDbRow(permit);
  const { data, error } = await supabase.from('permits').update(row).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function updatePermitStatus(id, statusUpdate) {
  const row = {};
  if (statusUpdate.status !== undefined) row.status = statusUpdate.status;
  if (statusUpdate.closeOutAt !== undefined) row.close_out_at = statusUpdate.closeOutAt;
  if (statusUpdate.closedBy !== undefined) row.closed_by = statusUpdate.closedBy;
  if (statusUpdate.remarks !== undefined) row.remarks = statusUpdate.remarks;
  if (statusUpdate.verifiedBy !== undefined) row.verified_by = statusUpdate.verifiedBy;
  if (statusUpdate.suspensionReason !== undefined) row.suspension_reason = statusUpdate.suspensionReason;
  const { error } = await supabase.from('permits').update(row).eq('id', id);
  if (error) throw error;
  return true;
}

export async function deletePermit(id) {
  const { error } = await supabase.from('permits').delete().eq('id', id);
  if (error) throw error;
  return true;
}

/* ------------------------- Dashboard stats ------------------------ */

export async function getDashboardStats() {
  const all = await getAllPermits();
  const statusCounts = {
    Active: 0,
    'Job Completed': 0,
    Suspended: 0,
    Cancelled: 0,
    Revalidated: 0,
  };
  all.forEach((p) => {
    if (statusCounts[p.status] !== undefined) statusCounts[p.status] += 1;
  });

  const today = new Date();
  const isSameDay = (d) => {
    const dt = new Date(d);
    return dt.toDateString() === today.toDateString();
  };
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayCount = all.filter((p) => isSameDay(p.createdAt)).length;
  const weekCount = all.filter((p) => new Date(p.createdAt) >= startOfWeek).length;
  const monthCount = all.filter((p) => new Date(p.createdAt) >= startOfMonth).length;

  const byType = {};
  all.forEach((p) => {
    byType[p.permitType] = (byType[p.permitType] || 0) + 1;
  });

  return {
    total: all.length,
    statusCounts,
    todayCount,
    weekCount,
    monthCount,
    byType,
  };
}

/* ------------------------- Attachments ----------------------------- */

/** Compresses images client-side (JPEG, quality 0.6) before upload; passes through non-images unchanged. */
export function compressToBlob(file, maxDim = 1400, quality = 0.6) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve({ blob: file, type: file.type });
      return;
    }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve({ blob, type: 'image/jpeg' }), 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadAttachment(permitId, file, category) {
  const { blob, type } = await compressToBlob(file);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${permitId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('permit_attachments')
    .insert({
      permit_id: permitId,
      name: file.name,
      category,
      file_type: type,
      size: blob.size,
      storage_path: path,
    })
    .select()
    .single();
  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    type: data.file_type,
    size: data.size,
    storagePath: data.storage_path,
    persisted: true,
  };
}

export async function deleteAttachment(attachment) {
  if (attachment.storagePath) {
    await supabase.storage.from(BUCKET).remove([attachment.storagePath]);
  }
  if (attachment.id) {
    await supabase.from('permit_attachments').delete().eq('id', attachment.id);
  }
  return true;
}

export async function getAttachmentSignedUrl(storagePath, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, expiresIn);
  if (error) {
    console.error('getAttachmentSignedUrl error', error.message);
    return null;
  }
  return data.signedUrl;
}

/* ------------------------- Export helpers -------------------------- */

export function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function permitsToCSV(permits) {
  const headers = [
    'S.No', 'PTW No.', 'Date Raised', 'Permit Type', 'Location', 'Description of Work',
    'Contractor / Company', 'Applicant Name', 'Applicant Contact', 'Permit Receiver',
    'No. of Workers', 'No. of Supervisors', 'Job Start Date', 'Job Start Time',
    'Expiry Date', 'Expiry Time', 'Hazards Identified', 'MS/RA/JSA Attached',
    'NOC / Third-Party Cert.', 'PPE Required', 'Permit Issuer', 'Issuer Approval Date & Time',
    'Permit Status', 'Close-out Date & Time', 'Closed By', 'Suspension/Cancellation Reason',
    'Remarks', 'Verified By',
  ];

  const rows = permits.map((p, i) => [
    i + 1,
    p.permitNo,
    formatDate(p.createdAt),
    p.permitType,
    [p.building, p.floor, p.area].filter(Boolean).join(' / '),
    p.description,
    p.companyName,
    p.applicantName,
    p.applicantContact,
    p.receiverName,
    p.numWorkers,
    p.numSupervisors,
    p.jobStartDate,
    p.jobStartTime,
    p.expiryDate,
    p.expiryTime,
    p.hazardsIdentified ? 'Yes' : 'No',
    p.attachments?.some((a) => a.category === 'Method Statement' || a.category === 'Risk Assessment' || a.category === 'Job Safety Analysis') ? 'Yes' : 'No',
    p.attachments?.some((a) => a.category === 'Stakeholder Approval (NOC)' || a.category === 'Third Party Certificates') ? 'Yes' : 'No',
    (p.ppe || []).join('; '),
    p.issuerName,
    p.issuerApprovalAt ? formatDate(p.issuerApprovalAt) : '',
    p.status,
    p.closeOutAt ? formatDate(p.closeOutAt) : '',
    p.closedBy || '',
    p.suspensionReason || '',
    p.remarks || '',
    p.verifiedBy || '',
  ]);

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
  return csv;
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
