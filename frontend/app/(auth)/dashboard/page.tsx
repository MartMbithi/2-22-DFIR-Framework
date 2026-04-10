'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { HudArrows } from '@/components/Nav';

type Stats = {
    total_cases: number; open_cases: number; total_jobs: number;
    active_jobs: number; completed_jobs: number; total_reports: number;
    total_artifacts: number; total_uploads: number;
};
type Case = { case_id: string; case_name: string; case_status: string; case_created_at: string };
type Job = { job_id: string; case_id: string; job_status: string; job_stage: string; job_progress_percent: number; created_at: string };
type Report = { report_id: string; case_id: string; report_type: string; report_generated_at: string };

export default function DashboardPage() {
    const router = useRouter();
    const [orgName, setOrgName] = useState('');
    const [stats, setStats] = useState<Stats | null>(null);
    const [cases, setCases] = useState<Case[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const org = await apiFetch('/organizations/me');
                setOrgName(org.organization_name);
                const [s, c, j] = await Promise.all([
                    apiFetch('/dashboard/stats'),
                    apiFetch('/cases/'),
                    apiFetch('/jobs/'),
                ]);
                setStats(s); setCases(c); setJobs(j);
                // Fetch reports from first 5 cases
                const reps: Report[] = [];
                for (const cs of c.slice(0, 5)) {
                    try { reps.push(...await apiFetch(`/reports/case/${cs.case_id}`)); } catch { }
                }
                setReports(reps);
            } catch { router.replace('/onboarding/organization'); }
            finally { setLoading(false); }
        })();
    }, []);

    // Poll jobs
    useEffect(() => {
        const iv = setInterval(async () => {
            try { setJobs(await apiFetch('/jobs/')); } catch { }
        }, 5000);
        return () => clearInterval(iv);
    }, []);

    const caseMap = useMemo(() => Object.fromEntries(cases.map(c => [c.case_id, c])), [cases]);
    const recentCases = [...cases].sort((a, b) => +new Date(b.case_created_at) - +new Date(a.case_created_at)).slice(0, 5);
    const recentJobs = [...jobs].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6);
    const recentReports = [...reports].sort((a, b) => +new Date(b.report_generated_at) - +new Date(a.report_generated_at)).slice(0, 6);

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center min-vh-100">
            <div className="text-center">
                <div className="spinner-border text-theme mb-3" />
                <p className="small text-body text-opacity-50">Initializing DFIR Workspace…</p>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="row mb-4">
                <div className="col">
                    <h1 className="h3 mb-1">{orgName}</h1>
                    <p className="text-body text-opacity-75 small mb-0">Forensic operations overview</p>
                </div>
            </div>

            {/* Metrics */}
            <div className="row g-3 mb-4">
                {[
                    { title: 'Total Cases', value: stats?.total_cases || 0, icon: 'bi-folder2-open', href: '/cases' },
                    { title: 'Open Cases', value: stats?.open_cases || 0, icon: 'bi-folder', href: '/cases' },
                    { title: 'Active Jobs', value: stats?.active_jobs || 0, icon: 'bi-cpu', href: '/jobs' },
                    { title: 'Reports', value: stats?.total_reports || 0, icon: 'bi-file-earmark-text', href: '/reports' },
                    { title: 'Artifacts', value: stats?.total_artifacts || 0, icon: 'bi-search', href: '/artifacts' },
                    { title: 'Uploads', value: stats?.total_uploads || 0, icon: 'bi-cloud-upload', href: '/cases' },
                ].map(m => (
                    <div className="col-lg-2 col-md-4 col-6" key={m.title}>
                        <Link href={m.href} className="text-decoration-none">
                            <div className="card h-100 hover-shadow">
                                <div className="card-body p-3 text-center">
                                    <i className={`bi ${m.icon} fs-3 text-theme d-block mb-1`} />
                                    <div className="fs-4 fw-bold text-body">{m.value}</div>
                                    <div className="small text-body text-opacity-50">{m.title}</div>
                                </div>
                                <HudArrows />
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Recent Cases & Jobs */}
            <div className="row g-3 mb-4">
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Recent Cases</h6>
                                <Link href="/cases" className="btn btn-sm btn-outline-theme">View All</Link>
                            </div>
                            {recentCases.length === 0 && <p className="text-body text-opacity-50 small">No cases yet.</p>}
                            {recentCases.map(c => (
                                <div key={c.case_id} className="mb-2 small">
                                    <Link href="/cases" className="fw-semibold text-theme text-decoration-none">{c.case_name}</Link>
                                    <div className="text-body text-opacity-50">
                                        {c.case_status} · {new Date(c.case_created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <HudArrows />
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Job Activity</h6>
                                <Link href="/jobs" className="btn btn-sm btn-outline-theme">View All</Link>
                            </div>
                            {recentJobs.length === 0 && <p className="text-body text-opacity-50 small">No jobs yet.</p>}
                            {recentJobs.map(j => (
                                <div key={j.job_id} className="mb-2 small">
                                    <span className={`fw-semibold ${j.job_status === 'completed' ? 'text-success' : j.job_status === 'running' ? 'text-warning' : j.job_status === 'failed' ? 'text-danger' : 'text-theme'}`}>
                                        {j.job_status.toUpperCase()}
                                    </span>
                                    {j.job_status === 'running' && (
                                        <span className="ms-2 text-body text-opacity-50">{j.job_progress_percent}%</span>
                                    )}
                                    <div className="text-body text-opacity-50">
                                        {caseMap[j.case_id]?.case_name || j.case_id}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <HudArrows />
                    </div>
                </div>
            </div>

            {/* Reports */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Latest Reports</h6>
                                <Link href="/reports" className="btn btn-sm btn-outline-theme">View All</Link>
                            </div>
                            {recentReports.length === 0 && <p className="text-body text-opacity-50 small">No reports generated yet.</p>}
                            {recentReports.map(r => (
                                <div key={r.report_id} className="mb-2 small">
                                    <span className="fw-semibold text-theme">{r.report_type.toUpperCase()}</span>
                                    <span className="text-body text-opacity-50 ms-2">
                                        {caseMap[r.case_id]?.case_name || r.case_id} · {new Date(r.report_generated_at).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <HudArrows />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
