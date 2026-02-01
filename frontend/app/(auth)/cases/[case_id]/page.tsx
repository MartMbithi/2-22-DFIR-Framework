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

type Job = {
    job_id: string;
    job_status: string;
    created_at: string;
    job_progress?: string;
    job_stage?: string;
    reports?: Report[];
};

type Report = {
    report_id: string;
    report_type: string;
    report_generated_at: string;
    download_url: string;
};

/* ================= CONFIG ================= */

const PAGE_SIZE = 6;
const POLL_INTERVAL = 4000;

/* ================= PAGE ================= */

export default function CaseDetailPage() {
    const { case_id } = useParams<{ case_id: string }>();

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [uploads, setUploads] = useState<Upload[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    /* Upload modal */
    const [uploadOpen, setUploadOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    /* Delete upload modal */
    const [deleteTarget, setDeleteTarget] = useState<Upload | null>(null);
    const [deleting, setDeleting] = useState(false);

    /* ================= LOAD ================= */

    async function loadBase() {
        const c = await apiFetch(`/cases/${case_id}`);
        const u = await apiFetch(`/cases/${case_id}/uploads`);
        const j = await apiFetch(`/jobs?case_id=${case_id}`);
        const r = await apiFetch(`/reports/case/${case_id}`);

        const enrichedJobs = j.map((job: Job) => ({
            ...job,
            reports: r.filter((rep: Report) =>
                new Date(rep.report_generated_at) >= new Date(job.created_at)
            )
        }));

        setCaseData(c);
        setUploads(u);
        setJobs(enrichedJobs);
    }

    useEffect(() => {
        loadBase();
    }, []);

    /* ================= JOB POLLING ================= */

    useEffect(() => {
        const hasRunning = jobs.some(j =>
            j.job_status === 'queued' || j.job_status === 'running'
        );

        if (!hasRunning) return;

        const interval = setInterval(async () => {
            try {
                const refreshed = await apiFetch(`/jobs?case_id=${case_id}`);

                const enriched = await Promise.all(
                    refreshed.map(async (job: Job) => {
                        try {
                            const progress = await apiFetch(`/jobs/${job.job_id}/progress`);
                            const stage = await apiFetch(`/jobs/${job.job_id}/stages`);
                            return {
                                ...job,
                                job_progress: progress?.progress,
                                job_stage: stage?.current_stage
                            };
                        } catch {
                            return job;
                        }
                    })
                );

                setJobs(prev =>
                    prev.map(j => enriched.find(e => e.job_id === j.job_id) || j)
                );
            } catch {
                /* polling must never break UI */
            }
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [jobs, case_id]);

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

    /* ================= UPLOAD ================= */

    async function uploadFiles(e: React.FormEvent) {
        e.preventDefault();
        if (!files.length) return;

        setUploading(true);

        try {
            for (const file of files) {
                const form = new FormData();
                form.append('file', file);

                await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/cases/${case_id}/artifacts/upload`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        },
                        body: form
                    }
                );
            }

            setFiles([]);
            setUploadOpen(false);
            await loadBase();
        } finally {
            setUploading(false);
        }
    }

    /* ================= DELETE UPLOAD ================= */

    async function confirmDeleteUpload() {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            await apiFetch(`/cases/uploads/${deleteTarget.upload_id}`, {
                method: 'DELETE'
            });
            setDeleteTarget(null);
            loadBase();
        } finally {
            setDeleting(false);
        }
    }

    /* ================= JOB QUEUE ================= */

    async function queueJob() {
        if (selected.size === 0) return;

        await apiFetch('/jobs/', {
            method: 'POST',
            body: JSON.stringify({
                case_id,
                upload_ids: Array.from(selected),
                job_type: 'dfir_run'
            })
        });

        setSelected(new Set());
        loadBase();
    }

    if (!caseData) {
        return <div className="p-5">Loading case context…</div>;
    }

    return (
        <AuthGuard>
            <div id="app" className="app app-sidebar-fixed">

                <AppSidebar />
                <AppTopBar />

                <div id="content" className="app-content">
                    <div className="container-fluid">

                        {/* ===== HEADER ===== */}
                        <div className="row mb-4">
                            <div className="col">
                                <h1 className="mb-1">{caseData.case_name}</h1>
                                <p className="text-body text-opacity-75 small">
                                    {caseData.case_description || 'No description provided'}
                                </p>
                            </div>
                        </div>

                        <div className="row g-4">

                            {/* ===== UPLOADS ===== */}
                            <div className="col-lg-8">
                                <div className="card h-100">
                                    <div className="card-body">

                                        <div className="d-flex justify-content-between align-items-center mb-3">
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
                                            <table className="table table-hover table-borderless small align-middle mb-0">
                                                <thead className="text-body text-opacity-50">
                                                    <tr>
                                                        <th></th>
                                                        <th>File</th>
                                                        <th>Size</th>
                                                        <th>Uploaded</th>
                                                        <th className="text-end">Actions</th>
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
                                                            <td>
                                                                {(u.upload_size / 1024).toFixed(1)} KB
                                                            </td>
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
                                    <HudArrows />
                                </div>
                            </div>

                            {/* ===== JOB ACTIVITY ===== */}
                            <div className="col-lg-4">
                                <div className="card h-100">
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

                                                <p className="mb-1">
                                                    Status:{' '}
                                                    <span className={
                                                        j.job_status === 'completed'
                                                            ? 'text-success'
                                                            : j.job_status === 'failed'
                                                                ? 'text-danger'
                                                                : 'text-warning'
                                                    }>
                                                        {j.job_status}
                                                    </span>
                                                </p>

                                                {j.job_stage && (
                                                    <p className="text-body text-opacity-50 text-xs">
                                                        Stage: {j.job_stage}
                                                    </p>
                                                )}

                                                {j.job_progress && (
                                                    <div className="progress h-5px mb-2">
                                                        <div
                                                            className="progress-bar bg-theme"
                                                            style={{ width: j.job_progress }}
                                                        ></div>
                                                    </div>
                                                )}

                                                {j.reports && j.reports.length > 0 && (
                                                    <div className="pt-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-theme"
                                                            onClick={() => {
                                                                const latest = [...j.reports!].sort(
                                                                    (a, b) =>
                                                                        new Date(b.report_generated_at).getTime() -
                                                                        new Date(a.report_generated_at).getTime()
                                                                )[0];
                                                                window.location.href = latest.download_url;
                                                            }}
                                                        >
                                                            Download Report
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <HudArrows />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ===== UPLOAD MODAL ===== */}
            {/* ===== UPLOAD MODAL ===== */}
            {uploadOpen && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">

                            <form onSubmit={uploadFiles}>
                                {/* HEADER */}
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Ingest Forensic Artifacts
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setUploadOpen(false)}
                                    ></button>
                                </div>

                                {/* BODY */}
                                <div className="modal-body">

                                    <p className="small text-body text-opacity-75 mb-3">
                                        Select one or more artifacts to ingest into this case.
                                        Files are preserved verbatim and cryptographically
                                        processed after upload.
                                    </p>

                                    {/* BOOTSTRAP FILE INPUT */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            Artifact Files
                                        </label>

                                        <input
                                            type="file"
                                            className="form-control"
                                            multiple
                                            onChange={e =>
                                                setFiles(Array.from(e.target.files || []))
                                            }
                                        />

                                        <div className="form-text">
                                            Supported: disk images, memory dumps, logs,
                                            archives, binaries
                                        </div>
                                    </div>

                                    {/* SELECTED FILES PREVIEW */}
                                    {files.length > 0 && (
                                        <div className="border rounded p-3 bg-body bg-opacity-25">
                                            <div className="fw-semibold small mb-2">
                                                Files staged for ingestion
                                            </div>

                                            <ul className="list-unstyled small mb-0">
                                                {files.map((file, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="d-flex justify-content-between align-items-center mb-1"
                                                    >
                                                        <span className="font-mono text-truncate">
                                                            {file.name}
                                                        </span>
                                                        <span className="text-body text-opacity-50">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>

                                {/* FOOTER */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setUploadOpen(false)}
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-outline-theme"
                                        disabled={uploading || files.length === 0}
                                    >
                                        {uploading ? 'Ingesting…' : 'Ingest Artifacts'}
                                    </button>
                                </div>
                            </form>

                            {/* HUD ARROWS */}
                            <div className="card-arrow">
                                <div className="card-arrow-top-left"></div>
                                <div className="card-arrow-top-right"></div>
                                <div className="card-arrow-bottom-left"></div>
                                <div className="card-arrow-bottom-right"></div>
                            </div>

                        </div>
                    </div>
                </div>
            )}


            {/* ===== DELETE MODAL ===== */}
            {deleteTarget && (
                <Modal
                    title="Confirm Artifact Deletion"
                    danger
                    onClose={() => setDeleteTarget(null)}
                >
                    <p className="small">
                        You are about to permanently delete the artifact:
                    </p>
                    <p className="font-mono text-xs">
                        {deleteTarget.upload_filename}
                    </p>
                    <p className="small text-body text-opacity-75">
                        This action removes the artifact from the evidentiary chain
                        and cannot be undone.
                    </p>

                    <div className="text-end mt-3">
                        <button
                            className="btn btn-outline-danger"
                            disabled={deleting}
                            onClick={confirmDeleteUpload}
                        >
                            {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </Modal>
            )}
        </AuthGuard>
    );
}

/* ================= SHARED ================= */

function Modal({
    title,
    children,
    onClose,
    danger
}: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    danger?: boolean;
}) {
    return (
        <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className={`modal-title ${danger ? 'text-danger' : ''}`}>
                            {title}
                        </h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                    <HudArrows />
                </div>
            </div>
        </div>
    );
}

function HudArrows() {
    return (
        <div className="card-arrow">
            <div className="card-arrow-top-left"></div>
            <div className="card-arrow-top-right"></div>
            <div className="card-arrow-bottom-left"></div>
            <div className="card-arrow-bottom-right"></div>
        </div>
    );
}
