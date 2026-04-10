'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { apiFetch, getToken } from '@/lib/api';
import { HudArrows } from '@/components/Nav';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
type Case = { case_id: string; case_name: string };
type Report = { report_id: string; case_id: string; report_type: string; report_path: string; report_generated_at: string };

export default function ReportsPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const cs = await apiFetch('/cases/');
                setCases(cs);
                const reps: Report[] = [];
                for (const c of cs) {
                    try { reps.push(...await apiFetch(`/reports/case/${c.case_id}`)); } catch { }
                }
                setReports(reps.sort((a, b) => +new Date(b.report_generated_at) - +new Date(a.report_generated_at)));
            } catch { }
            setLoading(false);
        })();
    }, []);

    const caseMap = Object.fromEntries(cases.map(c => [c.case_id, c.case_name]));

    function download(r: Report) {
        const token = getToken();
        const url = `${API}/reports/${r.report_id}/download`;
        const a = document.createElement('a');
        // Use fetch with auth header to download
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                a.href = blobUrl;
                a.download = `${r.case_id}_report.${r.report_type}`;
                a.click();
                URL.revokeObjectURL(blobUrl);
            });
    }

    return (
        <DashboardLayout>
            <h1 className="h4 mb-3">Forensic Reports</h1>

            {loading && <div className="text-center py-5"><div className="spinner-border text-theme" /></div>}

            {!loading && reports.length === 0 && (
                <div className="text-center py-5 text-body text-opacity-50">
                    <i className="bi bi-file-earmark-text fs-1 d-block mb-2" />
                    <p>No reports generated yet. Run an investigation to generate forensic reports.</p>
                </div>
            )}

            <div className="row g-3">
                {reports.map(r => (
                    <div className="col-lg-4 col-md-6" key={r.report_id}>
                        <div className="card h-100 hover-shadow">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className={`badge ${r.report_type === 'pdf' ? 'bg-danger' : 'bg-secondary'} text-uppercase`}>
                                        {r.report_type}
                                    </span>
                                    <span className="small text-body text-opacity-50">{r.report_id.slice(0, 8)}</span>
                                </div>
                                <div className="fw-semibold small mb-1">{caseMap[r.case_id] || r.case_id}</div>
                                <div className="small text-body text-opacity-50 mb-3">
                                    {new Date(r.report_generated_at).toLocaleString()}
                                </div>
                                <button className="btn btn-sm btn-outline-theme w-100" onClick={() => download(r)}>
                                    <i className="bi bi-download me-1" />Download
                                </button>
                            </div>
                            <HudArrows />
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
