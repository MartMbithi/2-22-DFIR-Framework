'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { apiFetch } from '@/lib/api';

/* ================= TYPES ================= */

type Case = {
    case_id: string;
    case_name: string;
    case_status: string;
    case_created_at: string;
};

type Job = {
    job_id: string;
    case_id: string;
    job_status: 'pending' | 'queued' | 'running' | 'completed' | 'failed';
    created_at: string;
};

type Report = {
    report_id: string;
    case_id: string;
    report_type: string;
    report_generated_at: string;
};

type Upload = {
    upload_id: string;
};

/* ================= PAGE ================= */

export default function DashboardPage() {
    const router = useRouter();

    const [orgName, setOrgName] = useState('');
    const [cases, setCases] = useState<Case[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [uploadsByCase, setUploadsByCase] = useState<Record<string, Upload[]>>({});
    const [loading, setLoading] = useState(true);

    /* ================= INITIAL LOAD ================= */

    useEffect(() => {
        async function load() {
            try {
                const org = await apiFetch('/organizations/me');
                setOrgName(org.organization_name);

                const casesData = await apiFetch('/cases/');
                setCases(casesData);

                const jobsData = await apiFetch('/jobs/');
                setJobs(jobsData);

                const allReports: Report[] = [];
                const uploadsMap: Record<string, Upload[]> = {};

                for (const c of casesData) {
                    try {
                        const r = await apiFetch(`/reports/case/${c.case_id}`);
                        allReports.push(...r);

                        const u = await apiFetch(`/cases/${c.case_id}/uploads`);
                        uploadsMap[c.case_id] = u;
                    } catch {
                        uploadsMap[c.case_id] = [];
                    }
                }

                setReports(allReports);
                setUploadsByCase(uploadsMap);
            } catch {
                router.replace('/onboarding/organization');
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    /* ================= JOB POLLING ================= */

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                setJobs(await apiFetch('/jobs/'));
            } catch { }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    /* ================= DERIVED ================= */

    const caseMap = useMemo(
        () => Object.fromEntries(cases.map(c => [c.case_id, c])),
        [cases]
    );

    const openCases = cases.filter(c => c.case_status !== 'closed').length;
    const activeJobs = jobs.filter(j => ['queued', 'running'].includes(j.job_status)).length;

    const recentCases = [...cases]
        .sort((a, b) => +new Date(b.case_created_at) - +new Date(a.case_created_at))
        .slice(0, 5);

    const recentJobs = [...jobs]
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
        .slice(0, 6);

    const recentReports = [...reports]
        .sort((a, b) => +new Date(b.report_generated_at) - +new Date(a.report_generated_at))
        .slice(0, 6);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <div className="card w-600px">
                    <div className="card-body text-center">
                        <i className="bi bi-shield-lock fs-1 text-theme mb-3"></i>
                        <h5>Initializing DFIR Workspace</h5>
                        <p className="small text-body text-opacity-50">
                            Loading organization, cases, jobs, and evidentiary context…
                        </p>
                        <div className="progress h-5px mt-3">
                            <div className="progress-bar bg-theme progress-bar-striped progress-bar-animated w-100"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>

            {/* ================= HEADER ================= */}
            <div className="row mb-4">
                <div className="col">
                    <h1 className="mb-1">{orgName}</h1>
                    <p className="text-body text-opacity-75">
                        Organization forensic operations overview
                    </p>
                </div>
            </div>

            {/* ================= METRICS ================= */}
            <div className="row g-3 mb-4">

                <Metric
                    title="Total Cases"
                    value={cases.length}
                    icon="bi-folder2-open"
                    href="/cases"
                />

                <Metric
                    title="Open Cases"
                    value={openCases}
                    icon="bi-folder"
                    href="/cases"
                />

                <Metric
                    title="Active Jobs"
                    value={activeJobs}
                    icon="bi-cpu"
                    href="/jobs"
                />

                <Metric
                    title="Reports Generated"
                    value={reports.length}
                    icon="bi-file-earmark-text"
                    href="/reports"
                />

            </div>

            {/* ================= CASES & JOBS ================= */}
            <div className="row g-3 mb-4">

                {/* RECENT CASES */}
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5>Recent Cases</h5>

                            <ul className="list-unstyled small mt-3 mb-0">
                                {recentCases.map(c => (
                                    <li key={c.case_id} className="mb-2">
                                        <Link href={`/cases/${c.case_id}`} className="fw-semibold text-decoration-none text-theme">
                                            {c.case_name}
                                        </Link>
                                        <div className="text-body text-opacity-50">
                                            Status: {c.case_status} ·{' '}
                                            {uploadsByCase[c.case_id]?.length || 0} uploads
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <HudArrows />
                    </div>
                </div>

                {/* JOB QUEUE */}
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5>Job Activity</h5>

                            <ul className="list-unstyled small mt-3 mb-0">
                                {recentJobs.map(j => (
                                    <li key={j.job_id} className="mb-2">
                                        <Link
                                            href={`/cases/${j.case_id}`}
                                            className={`fw-semibold text-decoration-none ${jobColor(j.job_status)}`}
                                        >
                                            {j.job_status.toUpperCase()}
                                        </Link>
                                        <div className="text-body text-opacity-50">
                                            Case: {caseMap[j.case_id]?.case_name || j.case_id}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <HudArrows />
                    </div>
                </div>

            </div>

            {/* ================= REPORTS ================= */}
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-body">
                            <h5>Latest Reports</h5>

                            <ul className="list-unstyled small mt-3 mb-0">
                                {recentReports.length === 0 && (
                                    <li className="text-body text-opacity-50">
                                        No reports generated yet
                                    </li>
                                )}

                                {recentReports.map(r => (
                                    <li key={r.report_id} className="mb-2">
                                        <Link
                                            href={`/cases/${r.case_id}`}
                                            className="fw-semibold text-theme text-decoration-none"
                                        >
                                            {r.report_type}
                                        </Link>
                                        <div className="text-body text-opacity-50">
                                            Case: {caseMap[r.case_id]?.case_name} ·{' '}
                                            {new Date(r.report_generated_at).toLocaleString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <HudArrows />
                    </div>
                </div>
            </div>

        </DashboardLayout>
    );
}

/* ================= HELPERS ================= */

function jobColor(status: Job['job_status']) {
    switch (status) {
        case 'completed':
            return 'text-success';
        case 'running':
            return 'text-warning';
        case 'queued':
            return 'text-theme';
        case 'failed':
            return 'text-danger';
        default:
            return 'text-body';
    }
}

/* ================= COMPONENTS ================= */

function Metric({
    title,
    value,
    icon,
    href,
}: {
    title: string;
    value: number | string;
    icon: string;
    href: string;
}) {
    return (
        <div className="col-lg-3 col-md-6">
            <Link href={href} className="text-decoration-none">
                <div className="card h-100 hover-shadow">
                    <div className="card-body d-flex align-items-center">
                        <i className={`bi ${icon} fs-2 me-3 text-theme`}></i>
                        <div>
                            <div className="small text-body text-opacity-50">{title}</div>
                            <div className="fs-4 fw-bold text-body">{value}</div>
                        </div>
                    </div>
                    <HudArrows />
                </div>
            </Link>
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
