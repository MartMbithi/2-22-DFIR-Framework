'use client';

/*
 * 2:22 DFIR — Advanced Artifacts Intelligence Layer
 */

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppSidebar from '@/components/AppSidebar';
import AppTopBar from '@/components/AppTopBar';
import { apiFetch } from '@/lib/api';

/* ================= TYPES ================= */

type Artifact = {
    artifact_id: string;
    artifact_type: string;
    artifact_value: string;
    artifact_source?: string;
    created_at: string;
};

type Case = {
    case_id: string;
    case_name: string;
};

const PAGE_SIZE = 12;

/* ================= DETECTORS ================= */

const ipRegex =
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

const emailRegex =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

const hashRegex =
    /\b[a-f0-9]{32}\b|\b[a-f0-9]{40}\b|\b[a-f0-9]{64}\b/i;

/* ================= PAGE ================= */

export default function ArtifactsPage() {

    const [cases, setCases] = useState<Case[]>([]);
    const [caseSearch, setCaseSearch] = useState('');
    const [selectedCase, setSelectedCase] = useState('');

    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [timelineMode, setTimelineMode] = useState(false);

    const [page, setPage] = useState(1);

    /* ================= LOAD ================= */

    useEffect(() => {
        apiFetch('/cases/').then(setCases);
    }, []);

    async function loadArtifacts(case_id: string) {

        if (!case_id) {
            setArtifacts([]);
            return;
        }

        setLoading(true);

        try {
            const data = await apiFetch(`/artifacts/artifacts/${case_id}`);
            setArtifacts(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadArtifacts(selectedCase);
    }, [selectedCase]);

    /* ================= CASE SEARCH ================= */

    const filteredCases = useMemo(() => {

        return cases.filter(c =>
            c.case_name.toLowerCase().includes(caseSearch.toLowerCase())
        );

    }, [cases, caseSearch]);

    /* ================= INDICATOR TYPE ================= */

    function detectType(value: string) {

        if (ipRegex.test(value)) return 'ip';
        if (emailRegex.test(value)) return 'email';
        if (hashRegex.test(value)) return 'hash';

        return 'generic';
    }

    /* ================= CORRELATION ================= */

    const correlationMap = useMemo(() => {

        const map: Record<string, number> = {};

        artifacts.forEach(a => {
            map[a.artifact_value] = (map[a.artifact_value] || 0) + 1;
        });

        return map;

    }, [artifacts]);

    /* ================= FILTER ================= */

    const filtered = useMemo(() => {

        return artifacts.filter(a => {

            const matchesSearch =
                a.artifact_value.toLowerCase().includes(search.toLowerCase());

            const matchesType = typeFilter
                ? detectType(a.artifact_value) === typeFilter
                : true;

            return matchesSearch && matchesType;

        });

    }, [artifacts, search, typeFilter]);

    /* ================= TIMELINE ================= */

    const timeline = useMemo(() => {

        const groups: Record<string, Artifact[]> = {};

        filtered.forEach(a => {

            const date = new Date(a.created_at).toLocaleDateString();

            if (!groups[date]) groups[date] = [];

            groups[date].push(a);

        });

        return groups;

    }, [filtered]);

    /* ================= PAGINATION ================= */

    const paged = useMemo(() => {

        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);

    }, [filtered, page]);

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
                                <h1>Artifacts Intelligence</h1>
                                <p className="text-body text-opacity-75 small">
                                    Timeline reconstruction • Indicator detection • Correlation
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

                        {/* CONTROLS */}

                        {selectedCase && (

                            <div className="card mb-3">
                                <div className="card-body d-flex gap-2 flex-wrap">

                                    <input
                                        className="form-control form-control-sm w-25"
                                        placeholder="Search artifacts..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />

                                    <select
                                        className="form-select form-select-sm w-auto"
                                        value={typeFilter}
                                        onChange={e => setTypeFilter(e.target.value)}
                                    >
                                        <option value="">All Indicators</option>
                                        <option value="ip">IP</option>
                                        <option value="email">Email</option>
                                        <option value="hash">Hash</option>
                                    </select>

                                    <button
                                        className="btn btn-sm btn-outline-theme"
                                        onClick={() => setTimelineMode(!timelineMode)}
                                    >
                                        {timelineMode ? 'Table View' : 'Timeline Mode'}
                                    </button>

                                </div>
                                <HudArrows />
                            </div>

                        )}

                        {/* CONTENT */}

                        <div className="card">
                            <div className="card-body">

                                {!selectedCase && (
                                    <p className="text-center text-body text-opacity-50">
                                        Select a case to begin analysis
                                    </p>
                                )}

                                {loading && (
                                    <p className="text-center">
                                        Processing artifacts…
                                    </p>
                                )}

                                {/* ===== TIMELINE MODE ===== */}

                                {timelineMode && selectedCase && Object.entries(timeline).map(([date, items]) => (

                                    <div key={date} className="mb-4">

                                        <h6 className="text-theme">{date}</h6>

                                        {items.map(a => {

                                            const type = detectType(a.artifact_value);
                                            const count = correlationMap[a.artifact_value];

                                            return (
                                                <div key={a.artifact_id} className="border rounded p-2 mb-2 small">

                                                    <div className="font-monospace">
                                                        {a.artifact_value}
                                                    </div>

                                                    <div className="d-flex gap-2 text-xs mt-1">

                                                        <span className="badge bg-theme">{type}</span>

                                                        {count > 1 && (
                                                            <span className="badge bg-danger">
                                                                {count} occurrences
                                                            </span>
                                                        )}

                                                    </div>

                                                </div>
                                            );
                                        })}

                                    </div>

                                ))}

                                {/* ===== TABLE MODE ===== */}

                                {!timelineMode && selectedCase && (

                                    <div className="table-responsive">

                                        <table className="table table-hover small">

                                            <thead>
                                                <tr>
                                                    <th>Artifact</th>
                                                    <th>Indicator</th>
                                                    <th>Correlation</th>
                                                    <th>Time</th>
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {paged.map(a => {

                                                    const type = detectType(a.artifact_value);
                                                    const count = correlationMap[a.artifact_value];

                                                    return (

                                                        <tr key={a.artifact_id}>

                                                            <td className="font-monospace text-xs">
                                                                {a.artifact_value}
                                                            </td>

                                                            <td>
                                                                <span className="badge bg-theme">
                                                                    {type}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {count > 1 ? (
                                                                    <span className="text-danger">
                                                                        {count}x
                                                                    </span>
                                                                ) : '—'}
                                                            </td>

                                                            <td>
                                                                {new Date(a.created_at).toLocaleString()}
                                                            </td>

                                                        </tr>

                                                    );
                                                })}

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