'use client';

/*
 * 2:22 DFIR — Reports Intelligence + Correlation + Preview
 */

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppSidebar from '@/components/AppSidebar';
import AppTopBar from '@/components/AppTopBar';
import { apiFetch } from '@/lib/api';

/* ================= TYPES ================= */

type Case = {
    case_id: string;
    case_name: string;
};

type Report = {
    report_id: string;
    case_id: string;
    report_type: string;
    report_generated_at: string;
};

type Job = {
    job_id: string;
    case_id: string;
    created_at: string;
};

type Artifact = {
    artifact_id: string;
    artifact_name: string;
    artifact_content?: string;
};

/* ================= PAGE ================= */

export default function ReportsPage() {

    const [cases, setCases] = useState<Case[]>([]);
    const [caseSearch, setCaseSearch] = useState('');
    const [selectedCase, setSelectedCase] = useState('');

    const [reports, setReports] = useState<Report[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);

    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    /* PREVIEW */
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [activeReport, setActiveReport] = useState<string | null>(null);

    /* INDICATOR LINKING */
    const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);

    /* ================= LOAD CASES ================= */

    useEffect(() => {
        apiFetch('/cases/').then(setCases);
    }, []);

    /* ================= LOAD DATA ================= */

    async function load(case_id: string) {

        if (!case_id) {
            setReports([]);
            setJobs([]);
            setArtifacts([]);
            return;
        }

        setLoading(true);

        try {

            const [r, j, a] = await Promise.all([
                apiFetch(`/reports/case/${case_id}`),
                apiFetch(`/jobs?case_id=${case_id}`),
                apiFetch(`/artifacts/artifacts/${case_id}`)
            ]);

            setReports(r);
            setJobs(j);
            setArtifacts(a);

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load(selectedCase);
    }, [selectedCase]);

    /* ================= CASE SEARCH ================= */

    const filteredCases = useMemo(() => {
        return cases.filter(c =>
            c.case_name.toLowerCase().includes(caseSearch.toLowerCase())
        );
    }, [cases, caseSearch]);

    /* ================= REPORT FILTER ================= */

    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            const s = r.report_type.toLowerCase().includes(search.toLowerCase());
            const t = typeFilter ? r.report_type === typeFilter : true;
            return s && t;
        });
    }, [reports, search, typeFilter]);

    const reportTypes = useMemo(() => {
        return Array.from(new Set(reports.map(r => r.report_type)));
    }, [reports]);

    /* ================= JOB LINK ================= */

    function getJobForReport(report: Report) {
        return jobs.find(j =>
            new Date(report.report_generated_at) >= new Date(j.created_at)
        );
    }

    /* ================= INDICATOR ENGINE ================= */

    function extractIndicators(text: string) {

        const ips = text.match(/\b\d{1,3}(\.\d{1,3}){3}\b/g) || [];
        const hashes = text.match(/\b[a-fA-F0-9]{32,64}\b/g) || [];
        const emails = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i) || [];

        return [...ips, ...hashes, ...emails];
    }

    const artifactIndicators = useMemo(() => {

        const map: Record<string, string[]> = {};

        artifacts.forEach(a => {
            if (!a.artifact_content) return;
            map[a.artifact_id] = extractIndicators(a.artifact_content);
        });

        return map;

    }, [artifacts]);

    /* ================= DOWNLOAD ================= */

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
            alert('Download failed');
            return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `dfir-report-${reportId}.pdf`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /* ================= PREVIEW ================= */

    async function previewReport(reportId: string) {

        setPreviewLoading(true);
        setActiveReport(reportId);

        try {

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/${reportId}/download`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);

            setPreviewUrl(url);

        } finally {
            setPreviewLoading(false);
        }
    }

    /* ================= INDICATOR → REPORT ================= */

    function openFromIndicator(indicator: string) {

        setSelectedIndicator(indicator);

        const target = reports[0]; // fallback: first report

        if (target) {
            previewReport(target.report_id);
        }
    }

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
                                <h1>Investigation Reports</h1>
                                <p className="text-body text-opacity-75 small">
                                    Correlated forensic intelligence outputs
                                </p>
                            </div>
                        </div>

                        {/* CASE SELECT */}
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

                        {/* MAIN */}
                        <div className="row g-3">

                            {/* LEFT */}
                            <div className="col-lg-5">

                                <div className="card h-100">
                                    <div className="card-body">

                                        {/* ARTIFACT INDICATORS */}
                                        <div className="mb-3">
                                            <div className="fw-semibold mb-2">
                                                Artifact Indicators
                                            </div>

                                            {artifacts.map(a => {

                                                const indicators = artifactIndicators[a.artifact_id] || [];

                                                return (
                                                    <div key={a.artifact_id} className="border rounded p-2 mb-2 small">

                                                        <div className="text-body text-opacity-75 mb-1">
                                                            {a.artifact_name}
                                                        </div>

                                                        <div className="d-flex flex-wrap gap-1">

                                                            {indicators.slice(0, 5).map((i, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="badge bg-dark"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => openFromIndicator(i)}
                                                                >
                                                                    {i}
                                                                </span>
                                                            ))}

                                                        </div>

                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* REPORT LIST */}
                                        {filteredReports.map(r => {

                                            const job = getJobForReport(r);

                                            return (
                                                <div
                                                    key={r.report_id}
                                                    className={`border rounded p-3 mb-3 small ${activeReport === r.report_id ? 'border-theme' : ''}`}
                                                >

                                                    <div className="fw-semibold">
                                                        {r.report_type}
                                                    </div>

                                                    <div className="text-body text-opacity-50 text-xs">
                                                        Job: {job?.job_id.slice(0, 8) || '—'}
                                                    </div>

                                                    <div className="text-body text-opacity-50 text-xs mb-2">
                                                        {new Date(r.report_generated_at).toLocaleString()}
                                                    </div>

                                                    <div className="d-flex gap-2">

                                                        <button
                                                            className="btn btn-sm btn-outline-theme"
                                                            onClick={() => previewReport(r.report_id)}
                                                        >
                                                            Preview
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => downloadReport(r.report_id)}
                                                        >
                                                            Download
                                                        </button>

                                                    </div>

                                                </div>
                                            );
                                        })}

                                    </div>
                                    <HudArrows />
                                </div>

                            </div>

                            {/* RIGHT PREVIEW */}
                            <div className="col-lg-7">

                                <div className="card h-100">
                                    <div className="card-body p-0">

                                        {!previewUrl && (
                                            <div className="d-flex justify-content-center align-items-center h-100 text-body text-opacity-50">
                                                Select a report to preview
                                            </div>
                                        )}

                                        {previewLoading && (
                                            <div className="d-flex justify-content-center align-items-center h-100">
                                                Loading preview…
                                            </div>
                                        )}

                                        {previewUrl && !previewLoading && (
                                            <div style={{ position: 'relative', height: '100%' }}>

                                                <iframe
                                                    src={previewUrl}
                                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                                />

                                                {selectedIndicator && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: 10,
                                                            right: 10,
                                                            background: '#000',
                                                            color: '#0f0',
                                                            padding: '6px 10px',
                                                            fontSize: '12px',
                                                            borderRadius: '6px'
                                                        }}
                                                    >
                                                        Highlight: {selectedIndicator}
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                    </div>
                                    <HudArrows />
                                </div>

                            </div>

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