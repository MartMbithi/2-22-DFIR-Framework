'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { HudArrows } from '@/components/Nav';

type Job = {
    job_id: string; case_id: string; job_type: string; job_status: string;
    job_stage: string | null; job_progress_percent: number;
    job_progress: string | null; job_error: string | null;
    created_at: string; started_at: string | null; completed_at: string | null;
};

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    async function load() { try { setJobs(await apiFetch('/jobs/')); } catch { } setLoading(false); }
    useEffect(() => { load(); }, []);
    useEffect(() => {
        const iv = setInterval(load, 4000);
        return () => clearInterval(iv);
    }, []);

    const statusColor = (s: string) =>
        s === 'completed' ? 'bg-success' : s === 'running' ? 'bg-warning text-dark' : s === 'failed' ? 'bg-danger' : s === 'queued' ? 'bg-info text-dark' : 'bg-secondary';

    return (
        <DashboardLayout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h4 mb-0">Investigation Jobs</h1>
                <span className="badge bg-theme">{jobs.length} total</span>
            </div>

            {loading && <div className="text-center py-5"><div className="spinner-border text-theme" /></div>}

            <div className="row g-3">
                {jobs.map(j => (
                    <div className="col-lg-6 col-12" key={j.job_id}>
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <span className={`badge ${statusColor(j.job_status)} me-2`}>{j.job_status}</span>
                                        <span className="small text-body text-opacity-50">{j.job_type}</span>
                                    </div>
                                    <span className="small text-body text-opacity-50 text-nowrap">{j.job_id.slice(0, 8)}</span>
                                </div>

                                <div className="small mb-2">
                                    <strong>Case:</strong> {j.case_id}
                                </div>

                                {(j.job_status === 'running' || j.job_status === 'queued') && (
                                    <div className="mb-2">
                                        <div className="progress" style={{ height: 6 }}>
                                            <div className="progress-bar bg-theme progress-bar-striped progress-bar-animated"
                                                style={{ width: `${j.job_progress_percent}%` }} />
                                        </div>
                                        <div className="small text-body text-opacity-50 mt-1">
                                            {j.job_stage || 'Queued'} — {j.job_progress_percent}%
                                            {j.job_progress && ` · ${j.job_progress}`}
                                        </div>
                                    </div>
                                )}

                                <div className="small text-body text-opacity-50">
                                    Created: {new Date(j.created_at).toLocaleString()}
                                    {j.completed_at && <> · Completed: {new Date(j.completed_at).toLocaleString()}</>}
                                </div>

                                {j.job_error && (
                                    <>
                                        <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => setExpanded(expanded === j.job_id ? null : j.job_id)}>
                                            {expanded === j.job_id ? 'Hide Error' : 'Show Error'}
                                        </button>
                                        {expanded === j.job_id && (
                                            <pre className="mt-2 p-2 bg-dark text-danger small" style={{ maxHeight: 200, overflow: 'auto', fontSize: '0.7rem' }}>
                                                {j.job_error}
                                            </pre>
                                        )}
                                    </>
                                )}
                            </div>
                            <HudArrows />
                        </div>
                    </div>
                ))}
            </div>

            {!loading && jobs.length === 0 && (
                <div className="text-center py-5 text-body text-opacity-50">
                    <i className="bi bi-cpu fs-1 d-block mb-2" />
                    <p>No investigation jobs yet. Create a case and launch an investigation.</p>
                </div>
            )}
        </DashboardLayout>
    );
}
