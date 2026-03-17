'use client';

/*
 * 2:22 DFIR — Analysis Jobs Control Plane
 */

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppSidebar from '@/components/AppSidebar';
import AppTopBar from '@/components/AppTopBar';
import { apiFetch } from '@/lib/api';

/* ================= TYPES ================= */

type Job = {
    job_id: string;
    case_id: string;
    job_status: 'queued' | 'running' | 'completed' | 'failed';
    created_at: string;
    job_progress?: string;
    job_stage?: string;
};

type Case = {
    case_id: string;
    case_name: string;
};

/* ================= CONFIG ================= */

const POLL_INTERVAL = 4000;

/* ================= PAGE ================= */

export default function JobsPage() {

    const [cases, setCases] = useState<Case[]>([]);
    const [caseSearch, setCaseSearch] = useState('');
    const [selectedCase, setSelectedCase] = useState('');

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    /* ================= LOAD CASES ================= */

    useEffect(() => {
        apiFetch('/cases/').then(setCases);
    }, []);

    /* ================= LOAD JOBS ================= */

    async function loadJobs(case_id: string) {

        if (!case_id) {
            setJobs([]);
            return;
        }

        setLoading(true);

        try {
            const allJobs = await apiFetch('/jobs/');

            const caseJobs = allJobs.filter((j: Job) => j.case_id === case_id);

            /* ===== ENRICH WITH PROGRESS + STAGE ===== */

            const enriched = await Promise.all(
                caseJobs.map(async (j: Job) => {
                    try {
                        const progress = await apiFetch(`/jobs/${j.job_id}/progress`);
                        const stage = await apiFetch(`/jobs/${j.job_id}/stages`);

                        return {
                            ...j,
                            job_progress: progress?.progress,
                            job_stage: stage?.current_stage
                        };
                    } catch {
                        return j;
                    }
                })
            );

            setJobs(enriched);

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadJobs(selectedCase);
    }, [selectedCase]);

    /* ================= POLLING ================= */

    useEffect(() => {

        if (!selectedCase) return;

        const interval = setInterval(() => {
            loadJobs(selectedCase);
        }, POLL_INTERVAL);

        return () => clearInterval(interval);

    }, [selectedCase]);

    /* ================= CASE SEARCH ================= */

    const filteredCases = useMemo(() => {

        return cases.filter(c =>
            c.case_name.toLowerCase().includes(caseSearch.toLowerCase())
        );

    }, [cases, caseSearch]);

    /* ================= FILTER JOBS ================= */

    const filteredJobs = useMemo(() => {

        return jobs.filter(j => {

            const matchesSearch =
                j.job_id.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter ? j.job_status === statusFilter : true;

            return matchesSearch && matchesStatus;

        });

    }, [jobs, search, statusFilter]);

    /* ================= UI ================= */

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
                                <h1>Analysis Jobs</h1>
                                <p className="text-body text-opacity-75 small">
                                    DFIR execution pipeline monitoring and control
                                </p>
                            </div>
                        </div>

                        {/* CASE SELECTOR */}

                        <div className="card mb-3">
                            <div className="card-body">

                                <input
                                    className="form-control form-control-sm mb-2"
                                    placeholder="Search case..."
                                    value={caseSearch}
                                    onChange={e => setCaseSearch(e.target.value)}
                                />

                                <select
                                    className="form-select form-select-sm"
                                    value={selectedCase}
                                    onChange={e => setSelectedCase(e.target.value)}
                                >
                                    <option value="">Select Case</option>

                                    {filteredCases.map(c => (
                                        <option key={c.case_id} value={c.case_id}>
                                            {c.case_name}
                                        </option>
                                    ))}

                                </select>

                            </div>
                            <HudArrows />
                        </div>

                        {/* FILTER BAR */}

                        {selectedCase && (

                            <div className="card mb-3">
                                <div className="card-body d-flex gap-2 flex-wrap">

                                    <input
                                        className="form-control form-control-sm w-25"
                                        placeholder="Search job ID..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />

                                    <select
                                        className="form-select form-select-sm w-auto"
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="queued">Queued</option>
                                        <option value="running">Running</option>
                                        <option value="completed">Completed</option>
                                        <option value="failed">Failed</option>
                                    </select>

                                </div>
                                <HudArrows />
                            </div>

                        )}

                        {/* TABLE */}

                        <div className="card">

                            <div className="card-body">

                                {!selectedCase && (
                                    <p className="text-center text-body text-opacity-50">
                                        Select a case to view jobs
                                    </p>
                                )}

                                {loading && (
                                    <p className="text-center">
                                        Loading analysis jobs…
                                    </p>
                                )}

                                {selectedCase && !loading && filteredJobs.length === 0 && (
                                    <p className="text-center text-body text-opacity-50">
                                        No jobs found for this case
                                    </p>
                                )}

                                {selectedCase && !loading && filteredJobs.length > 0 && (

                                    <div className="table-responsive">

                                        <table className="table table-hover small align-middle">

                                            <thead>
                                                <tr>
                                                    <th>Job ID</th>
                                                    <th>Status</th>
                                                    <th>Stage</th>
                                                    <th>Progress</th>
                                                    <th>Created</th>
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {filteredJobs.map(j => (

                                                    <tr key={j.job_id}>

                                                        <td className="font-monospace text-xs">
                                                            {j.job_id.slice(0, 10)}
                                                        </td>

                                                        <td>
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
                                                        </td>

                                                        <td className="text-body text-opacity-75 small">
                                                            {j.job_stage || '—'}
                                                        </td>

                                                        <td>

                                                            {j.job_progress && (

                                                                <div className="progress h-5px">

                                                                    <div
                                                                        className="progress-bar bg-theme"
                                                                        style={{ width: j.job_progress }}
                                                                    />

                                                                </div>

                                                            )}

                                                        </td>

                                                        <td>
                                                            {new Date(j.created_at).toLocaleString()}
                                                        </td>

                                                    </tr>

                                                ))}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </div>

                            <HudArrows />

                        </div>

                    </div>

                </div>

            </div>

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