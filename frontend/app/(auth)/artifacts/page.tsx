'use client';

/*
 * 2:22 DFIR — Forensic Artifacts Explorer
 */

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppSidebar from '@/components/AppSidebar';
import AppTopBar from '@/components/AppTopBar';
import { apiFetch } from '@/lib/api';

/* ================= TYPES ================= */

type Artifact = {
    artifact_id: string;
    case_id: string;
    artifact_type: string;
    artifact_value: string;
    artifact_source?: string;
    created_at: string;
};

type Case = {
    case_id: string;
    case_name: string;
};

/* ================= CONFIG ================= */

const PAGE_SIZE = 10;

/* ================= PAGE ================= */

export default function ArtifactsPage() {

    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [caseFilter, setCaseFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);

    /* ================= LOAD ================= */

    async function load() {

        setLoading(true);

        const [artifactsData, casesData] = await Promise.all([
            apiFetch('/artifacts/'),
            apiFetch('/cases/')
        ]);

        setArtifacts(artifactsData);
        setCases(casesData);

        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    /* ================= FILTER ================= */

    const filtered = useMemo(() => {

        return artifacts.filter(a => {

            const matchesSearch =
                a.artifact_value.toLowerCase().includes(search.toLowerCase()) ||
                a.artifact_type.toLowerCase().includes(search.toLowerCase());

            const matchesCase = caseFilter ? a.case_id === caseFilter : true;

            const matchesType = typeFilter
                ? a.artifact_type === typeFilter
                : true;

            return matchesSearch && matchesCase && matchesType;

        });

    }, [artifacts, search, caseFilter, typeFilter]);

    /* ================= TYPES ================= */

    const artifactTypes = useMemo(() => {
        return Array.from(new Set(artifacts.map(a => a.artifact_type)));
    }, [artifacts]);

    /* ================= PAGINATION ================= */

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    const paged = useMemo(() => {

        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);

    }, [filtered, page]);

    useEffect(() => setPage(1), [search, caseFilter, typeFilter]);

    /* ================= HELPERS ================= */

    function getCaseName(case_id: string) {
        return cases.find(c => c.case_id === case_id)?.case_name || case_id;
    }

    /* ================= UI ================= */

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

                                <h1 className="mb-1">
                                    Forensic Artifacts Explorer
                                </h1>

                                <p className="text-body text-opacity-75 small">
                                    Post-ingestion forensic intelligence across all investigations
                                </p>

                            </div>

                        </div>

                        {/* ===== FILTER BAR ===== */}

                        <div className="card mb-3">

                            <div className="card-body d-flex flex-wrap gap-2">

                                <input
                                    className="form-control form-control-sm w-25"
                                    placeholder="Search artifacts..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />

                                <select
                                    className="form-select form-select-sm w-auto"
                                    value={caseFilter}
                                    onChange={e => setCaseFilter(e.target.value)}
                                >
                                    <option value="">All Cases</option>
                                    {cases.map(c => (
                                        <option key={c.case_id} value={c.case_id}>
                                            {c.case_name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="form-select form-select-sm w-auto"
                                    value={typeFilter}
                                    onChange={e => setTypeFilter(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    {artifactTypes.map(t => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            <HudArrows />

                        </div>

                        {/* ===== TABLE ===== */}

                        <div className="card">

                            <div className="card-body p-0">

                                <div className="table-responsive">

                                    <table className="table table-hover table-borderless small align-middle mb-0">

                                        <thead className="text-body text-opacity-50">
                                            <tr>
                                                <th>Artifact</th>
                                                <th>Type</th>
                                                <th>Case</th>
                                                <th>Source</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {loading && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-4">
                                                        Loading forensic artifacts…
                                                    </td>
                                                </tr>
                                            )}

                                            {!loading && paged.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-4">
                                                        No artifacts found
                                                    </td>
                                                </tr>
                                            )}

                                            {paged.map(a => (

                                                <tr key={a.artifact_id}>

                                                    <td className="font-monospace text-xs break-all">
                                                        {a.artifact_value}
                                                    </td>

                                                    <td>
                                                        <span className="badge bg-theme">
                                                            {a.artifact_type}
                                                        </span>
                                                    </td>

                                                    <td className="text-body text-opacity-75">
                                                        {getCaseName(a.case_id)}
                                                    </td>

                                                    <td className="text-body text-opacity-50 small">
                                                        {a.artifact_source || 'system'}
                                                    </td>

                                                    <td>
                                                        {new Date(a.created_at).toLocaleString()}
                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                            <HudArrows />

                        </div>

                        {/* ===== PAGINATION ===== */}

                        {totalPages > 1 && (

                            <div className="d-flex justify-content-end align-items-center gap-2 mt-3 small">

                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    Prev
                                </button>

                                <span className="text-body text-opacity-50">
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next
                                </button>

                            </div>

                        )}

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