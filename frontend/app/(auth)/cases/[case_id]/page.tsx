'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppSidebar from '@/components/AppSidebar';
import AppTopBar from '@/components/AppTopBar';
import { apiFetch } from '@/lib/api';

/* ================= TYPES ================= */

type Case = {
    case_id: string;
    case_name: string;
    case_description?: string;
};

type Upload = {
    upload_id: string;
    upload_filename: string;
    upload_size: number;
    uploaded_at: string;
};

type Report = {
    report_id: string;
    report_type: string;
    report_generated_at: string;
};

type Job = {
    job_id: string;
    job_status: 'queued' | 'running' | 'completed' | 'failed';
    created_at: string;
    job_progress?: string;
    job_stage?: string;
    reports?: Report[];
};

/* ================= CONFIG ================= */

const PAGE_SIZE = 6;
const POLL_INTERVAL = 4000;

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/* ================= HELPERS ================= */

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ================= PAGE ================= */

export default function CaseDetailPage() {
    const { case_id } = useParams<{ case_id: string }>();

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [uploads, setUploads] = useState<Upload[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const [uploadOpen, setUploadOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<Upload | null>(null);
    const [deleting, setDeleting] = useState(false);

    /* ================= LOAD DATA ================= */

    async function loadBase() {
        try {
            const [c, u, j, r] = await Promise.all([
                apiFetch(`/cases/${case_id}`),
                apiFetch(`/cases/${case_id}/uploads`),
                apiFetch(`/jobs?case_id=${case_id}`),
                apiFetch(`/reports/case/${case_id}`),
            ]);

            const enrichedJobs = j.map((job: Job) => ({
                ...job,
                reports: r.filter(
                    (rep: Report) =>
                        new Date(rep.report_generated_at) >= new Date(job.created_at)
                ),
            }));

            setCaseData(c);
            setUploads(u);
            setJobs(enrichedJobs);
        } catch (err) {
            console.error('Failed loading case data', err);
        }
    }

    useEffect(() => {
        loadBase();
    }, []);

    /* ================= JOB POLLING ================= */

    useEffect(() => {
        if (!jobs.some(j => j.job_status === 'queued' || j.job_status === 'running'))
            return;

        const interval = setInterval(async () => {
            try {
                const refreshed = await apiFetch(`/jobs?case_id=${case_id}`);

                setJobs(prev =>
                    prev.map(j => refreshed.find((r: Job) => r.job_id === j.job_id) || j)
                );
            } catch (err) {
                console.error('Polling error', err);
            }
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [jobs.length, case_id]);

    /* ================= FILTER + PAGINATION ================= */

    const filteredUploads = useMemo(() => {
        const q = search.toLowerCase();
        return uploads.filter(u =>
            u.upload_filename.toLowerCase().includes(q)
        );
    }, [uploads, search]);

    const pageUploads = filteredUploads.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    useEffect(() => setPage(1), [search]);

    /* ================= REPORT DOWNLOAD ================= */

    async function downloadReport(reportId: string) {
        try {
            const res = await fetch(`${API_BASE}/reports/${reportId}/download`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `dfir-report-${reportId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Report download failed');
            console.error(err);
        }
    }

    /* ================= UPLOAD ================= */

    async function uploadFiles(e: React.FormEvent) {
        e.preventDefault();
        if (!files.length) return;

        setUploading(true);

        try {
            for (const file of files) {
                const form = new FormData();
                form.append('file', file);

                const res = await fetch(
                    `${API_BASE}/cases/${case_id}/artifacts/upload`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: form,
                    }
                );

                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || 'Upload failed');
                }
            }

            setFiles([]);
            setUploadOpen(false);
            await loadBase();
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    }

    /* ================= DELETE ================= */

    async function confirmDeleteUpload() {
        if (!deleteTarget) return;

        setDeleting(true);

        try {
            await apiFetch(`/cases/uploads/${deleteTarget.upload_id}`, {
                method: 'DELETE',
            });

            setDeleteTarget(null);
            loadBase();
        } catch (err) {
            alert('Delete failed');
            console.error(err);
        } finally {
            setDeleting(false);
        }
    }

    /* ================= JOB QUEUE ================= */

    async function queueJob() {
        if (selected.size === 0) return;

        try {
            await apiFetch('/jobs/', {
                method: 'POST',
                body: JSON.stringify({
                    case_id,
                    upload_ids: Array.from(selected),
                    job_type: 'dfir_run',
                }),
            });

            setSelected(new Set());
            loadBase();
        } catch (err) {
            alert('Job queue failed');
            console.error(err);
        }
    }

    if (!caseData) return <div className="p-5">Loading case context…</div>;

    return (
        <AuthGuard>
            <div id="app" className="app app-sidebar-fixed">
                <AppSidebar />
                <AppTopBar />

                <div id="content" className="app-content">
                    <div className="container-fluid">

                        {/* HEADER */}

                        <div className="row mb-4">
                            <div className="col">
                                <h1>{caseData.case_name}</h1>
                                <p className="text-body text-opacity-75 small">
                                    {caseData.case_description || 'No description provided'}
                                </p>
                            </div>
                        </div>

                        {/* CONTENT */}

                        <div className="row g-4">

                            {/* UPLOAD TABLE */}

                            <div className="col-lg-8">
                                <div className="card">
                                    <div className="card-body">

                                        <div className="d-flex justify-content-between mb-3">

                                            <input
                                                className="form-control form-control-sm w-50"
                                                placeholder="Search uploads…"
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                            />

                                            <div className="d-flex gap-2">

                                                <button
                                                    className="btn btn-outline-theme btn-sm"
                                                    onClick={() => setUploadOpen(true)}
                                                >
                                                    Upload
                                                </button>

                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    disabled={selected.size === 0}
                                                    onClick={queueJob}
                                                >
                                                    Queue Job
                                                </button>

                                            </div>

                                        </div>

                                        <div className="table-responsive">
                                            <table className="table table-hover small">

                                                <thead>
                                                    <tr>
                                                        <th></th>
                                                        <th>File</th>
                                                        <th>Size</th>
                                                        <th>Uploaded</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {pageUploads.map(u => (
                                                        <tr key={u.upload_id}>

                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selected.has(u.upload_id)}
                                                                    onChange={() => {
                                                                        const s = new Set(selected);
                                                                        s.has(u.upload_id)
                                                                            ? s.delete(u.upload_id)
                                                                            : s.add(u.upload_id);
                                                                        setSelected(s);
                                                                    }}
                                                                />
                                                            </td>

                                                            <td className="font-mono text-xs break-all">
                                                                {u.upload_filename}
                                                            </td>

                                                            <td>{formatSize(u.upload_size)}</td>

                                                            <td>
                                                                {new Date(u.uploaded_at).toLocaleString()}
                                                            </td>

                                                            <td className="text-end">

                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => setDeleteTarget(u)}
                                                                >
                                                                    Delete
                                                                </button>

                                                            </td>

                                                        </tr>
                                                    ))}
                                                </tbody>

                                            </table>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* JOB PANEL */}

                            <div className="col-lg-4">
                                <div className="card">

                                    <div className="card-body">

                                        <h5 className="mb-3">Job Activity</h5>

                                        {jobs.length === 0 && (
                                            <p className="small text-body text-opacity-50">
                                                No jobs queued yet.
                                            </p>
                                        )}

                                        {jobs.map(j => (
                                            <div key={j.job_id} className="border rounded p-3 mb-3 small">

                                                <p className="font-mono text-xs break-all">
                                                    {j.job_id}
                                                </p>

                                                <p>
                                                    Status:{' '}
                                                    <span className={
                                                        j.job_status === 'completed'
                                                            ? 'text-success'
                                                            : j.job_status === 'failed'
                                                                ? 'text-danger'
                                                                : j.job_status === 'queued'
                                                                    ? 'text-primary'
                                                                    : 'text-warning'
                                                    }>
                                                        {j.job_status}
                                                    </span>
                                                </p>

                                                {j.reports && j.reports.length > 0 && (

                                                    <button
                                                        className="btn btn-sm btn-outline-theme"
                                                        onClick={() => {
                                                            const latest = [...j.reports!].sort(
                                                                (a, b) =>
                                                                    new Date(b.report_generated_at).getTime() -
                                                                    new Date(a.report_generated_at).getTime()
                                                            )[0];

                                                            downloadReport(latest.report_id);
                                                        }}
                                                    >
                                                        Download Report
                                                    </button>

                                                )}

                                            </div>
                                        ))}

                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ================= UPLOAD MODAL ================= */}

                {uploadOpen && (
                    <div className="modal fade show d-block" style={{ background: '#0008' }}>

                        <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5>Upload Evidence Artifacts</h5>

                                    <button
                                        className="btn-close"
                                        onClick={() => setUploadOpen(false)}
                                    />
                                </div>

                                <form onSubmit={uploadFiles}>

                                    <div className="modal-body">

                                        <input
                                            type="file"
                                            multiple
                                            className="form-control"
                                            onChange={e => {
                                                if (!e.target.files) return;
                                                setFiles(Array.from(e.target.files));
                                            }}
                                        />

                                        {files.length > 0 && (
                                            <p className="small mt-2 text-body text-opacity-75">
                                                {files.length} file(s) selected
                                            </p>
                                        )}

                                    </div>

                                    <div className="modal-footer">

                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setUploadOpen(false)}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-theme"
                                            disabled={uploading}
                                        >
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </button>

                                    </div>

                                </form>

                            </div>
                        </div>

                    </div>
                )}

            </div>
        </AuthGuard>
    );
}