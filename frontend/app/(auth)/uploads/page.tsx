'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { HudArrows } from '@/components/Nav';

type Case = { case_id: string; case_name: string };
type Upload = { upload_id: string; case_id: string; upload_filename: string; upload_size: number; upload_status: string; uploaded_at: string };

export default function UploadsPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [sel, setSel] = useState('');
    const [uploads, setUploads] = useState<Upload[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { apiFetch('/cases/').then(setCases).catch(() => { }); }, []);
    useEffect(() => {
        if (!sel) { setUploads([]); return; }
        setLoading(true);
        apiFetch(`/uploads/${sel}`).then(setUploads).catch(() => setUploads([])).finally(() => setLoading(false));
    }, [sel]);

    const fmtSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(1)} KB`;

    return (
        <DashboardLayout>
            <h1 className="h4 mb-3">Evidence Uploads</h1>
            <div className="row mb-3">
                <div className="col-md-6">
                    <select className="form-select" value={sel} onChange={e => setSel(e.target.value)}>
                        <option value="">Select a case…</option>
                        {cases.map(c => <option key={c.case_id} value={c.case_id}>{c.case_name}</option>)}
                    </select>
                </div>
            </div>

            {loading && <div className="text-center py-4"><div className="spinner-border text-theme" /></div>}

            {!loading && sel && uploads.length === 0 && (
                <p className="text-body text-opacity-50 small">No uploads for this case. Upload evidence from the Cases page.</p>
            )}

            {uploads.length > 0 && (
                <div className="card">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover table-borderless mb-0 small">
                                <thead className="text-body text-opacity-50">
                                    <tr><th>Filename</th><th>Size</th><th>Status</th><th>Uploaded</th></tr>
                                </thead>
                                <tbody>
                                    {uploads.map(u => (
                                        <tr key={u.upload_id}>
                                            <td className="fw-semibold"><i className="bi bi-file-earmark me-1 text-theme" />{u.upload_filename}</td>
                                            <td>{fmtSize(u.upload_size)}</td>
                                            <td><span className="badge bg-success">{u.upload_status}</span></td>
                                            <td className="text-body text-opacity-50">{new Date(u.uploaded_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <HudArrows />
                </div>
            )}
        </DashboardLayout>
    );
}
