'use client';
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { apiFetch, apiUpload } from '@/lib/api';
import { HudArrows } from '@/components/Nav';

type Case = { case_id: string; case_name: string; case_description?: string; case_status: string; case_created_at: string };
const PAGE = 8;

export default function CasesPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Modals
    const [showCreate, setShowCreate] = useState(false);
    const [editCase, setEditCase] = useState<Case | null>(null);
    const [showUpload, setShowUpload] = useState<Case | null>(null);
    const [showLaunch, setShowLaunch] = useState<Case | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [saving, setSaving] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try { setCases(await apiFetch('/cases/')); } catch { }
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return cases.filter(c => c.case_name.toLowerCase().includes(q) || (c.case_description || '').toLowerCase().includes(q));
    }, [cases, search]);

    const totalPages = Math.ceil(filtered.length / PAGE);
    const paged = useMemo(() => filtered.slice((page - 1) * PAGE, page * PAGE), [filtered, page]);
    useEffect(() => { setPage(1); }, [search]);

    function openCreate() { setEditCase(null); setName(''); setDesc(''); setShowCreate(true); }
    function openEdit(c: Case) { setEditCase(c); setName(c.case_name); setDesc(c.case_description || ''); setShowCreate(true); }

    async function saveCase(e: React.FormEvent) {
        e.preventDefault(); setSaving(true);
        try {
            if (editCase) {
                await apiFetch(`/cases/${editCase.case_id}`, { method: 'PUT', body: JSON.stringify({ case_name: name, case_description: desc }) });
            } else {
                await apiFetch('/cases/', { method: 'POST', body: JSON.stringify({ case_name: name, case_description: desc }) });
            }
            setShowCreate(false); load();
        } finally { setSaving(false); }
    }

    async function deleteCase(c: Case) {
        if (!confirm(`Delete case "${c.case_name}"?`)) return;
        await apiFetch(`/cases/${c.case_id}`, { method: 'DELETE' });
        load();
    }

    async function uploadFiles(e: React.FormEvent) {
        e.preventDefault();
        if (!files || !showUpload) return;
        setUploading(true);
        try {
            const fd = new FormData();
            Array.from(files).forEach(f => fd.append('files', f));
            await apiUpload(`/uploads/${showUpload.case_id}`, fd);
            setMsg('Files uploaded successfully');
            setShowUpload(null); setFiles(null);
        } catch { setMsg('Upload failed'); }
        finally { setUploading(false); }
    }

    async function launchJob() {
        if (!showLaunch) return;
        setLaunching(true);
        try {
            await apiFetch('/jobs/', { method: 'POST', body: JSON.stringify({ case_id: showLaunch.case_id }) });
            setMsg(`Investigation launched for ${showLaunch.case_name}`);
            setShowLaunch(null); load();
        } catch (err: any) {
            setMsg(err.message?.includes('409') ? 'A job is already running for this case.' : 'Failed to launch job.');
        } finally { setLaunching(false); }
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div>
                    <h1 className="h4 mb-0">Cases</h1>
                    <p className="text-body text-opacity-50 small mb-0">{filtered.length} of {cases.length} cases</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <input className="form-control form-control-sm" style={{ width: 200 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
                    <button className="btn btn-theme btn-sm" onClick={openCreate}>
                        <i className="bi bi-plus-lg me-1" />New Case
                    </button>
                </div>
            </div>

            {msg && <div className="alert alert-info py-2 small">{msg} <button className="btn-close btn-sm float-end" onClick={() => setMsg(null)} /></div>}

            {/* Table */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-borderless mb-0 small align-middle">
                            <thead className="text-body text-opacity-50">
                                <tr><th>Case</th><th className="d-none d-md-table-cell">Description</th><th>Status</th><th>Created</th><th className="text-end">Actions</th></tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan={5} className="text-center py-4">Loading…</td></tr>}
                                {!loading && paged.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-body text-opacity-50">No cases found</td></tr>}
                                {paged.map(c => (
                                    <tr key={c.case_id}>
                                        <td>
                                            <div className="fw-semibold">{c.case_name}</div>
                                            <div className="text-body text-opacity-50 d-md-none text-truncate-2" style={{ maxWidth: 200 }}>{c.case_description}</div>
                                        </td>
                                        <td className="d-none d-md-table-cell text-body text-opacity-50 text-truncate" style={{ maxWidth: 250 }}>{c.case_description || '—'}</td>
                                        <td>
                                            <span className={`badge ${c.case_status === 'completed' ? 'bg-success' : c.case_status === 'processing' ? 'bg-warning text-dark' : c.case_status === 'failed' ? 'bg-danger' : 'bg-secondary'}`}>
                                                {c.case_status}
                                            </span>
                                        </td>
                                        <td className="text-nowrap">{new Date(c.case_created_at).toLocaleDateString()}</td>
                                        <td className="text-end text-nowrap">
                                            <button className="btn btn-sm btn-outline-theme me-1" title="Upload Evidence" onClick={() => setShowUpload(c)}>
                                                <i className="bi bi-cloud-upload" />
                                            </button>
                                            <button className="btn btn-sm btn-outline-success me-1" title="Launch Investigation" onClick={() => setShowLaunch(c)}>
                                                <i className="bi bi-play-fill" />
                                            </button>
                                            <button className="btn btn-sm btn-outline-secondary me-1" title="Edit" onClick={() => openEdit(c)}>
                                                <i className="bi bi-pencil" />
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => deleteCase(c)}>
                                                <i className="bi bi-trash" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <HudArrows />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="mt-3 d-flex justify-content-center">
                    <ul className="pagination pagination-sm">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {/* Create/Edit Modal */}
            {showCreate && (
                <Modal title={editCase ? 'Edit Case' : 'New Case'} onClose={() => setShowCreate(false)}>
                    <form onSubmit={saveCase}>
                        <div className="mb-3">
                            <label className="form-label small">Case Name</label>
                            <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small">Description</label>
                            <textarea className="form-control" rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
                        </div>
                        <button className="btn btn-theme w-100" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                    </form>
                </Modal>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <Modal title={`Upload Evidence — ${showUpload.case_name}`} onClose={() => setShowUpload(null)}>
                    <form onSubmit={uploadFiles}>
                        <div className="mb-3">
                            <label className="form-label small">Select log files (.log, .txt, .json, .csv)</label>
                            <input type="file" className="form-control" multiple accept=".log,.txt,.json,.csv,.audit" onChange={e => setFiles(e.target.files)} required />
                        </div>
                        <button className="btn btn-theme w-100" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</button>
                    </form>
                </Modal>
            )}

            {/* Launch Modal */}
            {showLaunch && (
                <Modal title="Launch Investigation" onClose={() => setShowLaunch(null)}>
                    <p className="small text-body text-opacity-75">
                        Launch a full DFIR investigation for <strong>{showLaunch.case_name}</strong>?
                        This will run the 2:22 DFIR pipeline including ingestion, triage, intelligence analysis, and report generation.
                    </p>
                    <div className="d-flex gap-2">
                        <button className="btn btn-theme flex-fill" disabled={launching} onClick={launchJob}>
                            {launching ? 'Launching…' : 'Launch Investigation'}
                        </button>
                        <button className="btn btn-outline-secondary" onClick={() => setShowLaunch(null)}>Cancel</button>
                    </div>
                </Modal>
            )}
        </DashboardLayout>
    );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.6)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h5 className="modal-title h6">{title}</h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">{children}</div>
                </div>
            </div>
        </div>
    );
}
