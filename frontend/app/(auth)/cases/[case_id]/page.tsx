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
    job_stage?: string;
    reports?: Report[];
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

    const [uploadOpen, setUploadOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<Upload | null>(null);
    const [deleting, setDeleting] = useState(false);

    /* ================= LOAD ================= */

    async function loadBase() {

        const [c, u, j, r] = await Promise.all([
            apiFetch(`/cases/${case_id}`),
            apiFetch(`/cases/${case_id}/uploads`),
            apiFetch(`/jobs?case_id=${case_id}`),
            apiFetch(`/reports/case/${case_id}`)
        ]);

        const enriched = j.map((job: Job) => ({
            ...job,
            reports: r.filter(
                (rep: Report) =>
                    new Date(rep.report_generated_at) >= new Date(job.created_at)
            )
        }));

        setCaseData(c);
        setUploads(u);
        setJobs(enriched);
    }

    useEffect(() => {
        loadBase();
    }, []);

    /* ================= JOB POLLING ================= */

    useEffect(() => {

        if (!jobs.some(j => j.job_status === 'queued' || j.job_status === 'running')) {
            return;
        }

        const interval = setInterval(async () => {

            try {

                const refreshed = await apiFetch(`/jobs?case_id=${case_id}`);

                setJobs(prev =>
                    prev.map(j => refreshed.find((r: Job) => r.job_id === j.job_id) || j)
                );

            } catch {
                console.warn("Polling failed");
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

    /* ================= DOWNLOAD REPORT ================= */

    async function downloadReport(reportId: string) {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/${reportId}/download`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (!res.ok) {
            alert("Report download failed");
            return;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `dfir-report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
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
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/cases/${case_id}/artifacts/upload`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        },
                        body: form
                    }
                );

                if (!res.ok) {
                    throw new Error("Upload failed");
                }
            }

            setFiles([]);
            setUploadOpen(false);
            loadBase();

        } catch (err) {

            console.error(err);
            alert("Upload failed");

        } finally {

            setUploading(false);

        }
    }

    /* ================= DELETE UPLOAD ================= */

    async function confirmDeleteUpload() {

        if (!deleteTarget) return;

        setDeleting(true);

        try {

            await apiFetch(`/uploads/${deleteTarget.upload_id}`, {
                method: 'DELETE'
            });

            setUploads(prev =>
                prev.filter(u => u.upload_id !== deleteTarget.upload_id)
            );

            setDeleteTarget(null);

        } catch (err) {

            console.error(err);
            alert("Delete failed");

        } finally {

            setDeleting(false);

        }
    }

    /* ================= QUEUE JOB ================= */

    async function queueJob() {

        if (selected.size === 0) return;

        try {

            await apiFetch('/jobs', {
                method: 'POST',
                body: JSON.stringify({
                    case_id,
                    upload_ids: Array.from(selected),
                    job_type: 'dfir'
                })
            });

            setSelected(new Set());
            loadBase();

        } catch (err) {

            console.error(err);
            alert("Failed to queue DFIR job");

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

                        <div className="row g-4">

                            {/* UPLOAD TABLE */}

                            <div className="col-lg-8">

                                <div className="card h-100">

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

                                                            <td className="font-mono">{u.upload_filename}</td>

                                                            <td>{(u.upload_size / 1024).toFixed(1)} KB</td>

                                                            <td>{new Date(u.uploaded_at).toLocaleString()}</td>

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

                            {/* JOB ACTIVITY */}

                            <div className="col-lg-4">

                                <div className="card h-100">

                                    <div className="card-body">

                                        <h5 className="mb-3">Job Activity</h5>

                                        {jobs.length === 0 && (
                                            <p className="small text-body text-opacity-50">
                                                No jobs queued yet
                                            </p>
                                        )}

                                        {jobs.map(j => (

                                            <div key={j.job_id} className="border rounded p-3 mb-3 small">

                                                <p className="font-mono">{j.job_id}</p>

                                                <p className="mb-1">
                                                    Status:
                                                    <span className="ms-2">
                                                        {j.job_status}
                                                    </span>
                                                </p>

                                                {j.job_stage && (
                                                    <p className="text-body text-opacity-50 small">
                                                        Stage: {j.job_stage}
                                                    </p>
                                                )}

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

                                    <HudArrows />

                                </div>

                            </div>

                        </div>

                    </div>
                </div>

            </div>

            {/* DELETE MODAL */}

            {deleteTarget && (

                <div className="modal fade show d-block">

                    <div className="modal-dialog modal-dialog-centered">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title text-danger">
                                    Confirm Upload Deletion
                                </h5>

                                <button
                                    className="btn-close"
                                    onClick={() => setDeleteTarget(null)}
                                />

                            </div>

                            <div className="modal-body">

                                <p>You are about to delete:</p>

                                <p className="fw-semibold font-mono">
                                    {deleteTarget.upload_filename}
                                </p>

                            </div>

                            <div className="modal-footer">

                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setDeleteTarget(null)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn btn-outline-danger"
                                    disabled={deleting}
                                    onClick={confirmDeleteUpload}
                                >
                                    {deleting ? "Deleting…" : "Delete Upload"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </AuthGuard>
    );
}

/* ================= HUD ================= */

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