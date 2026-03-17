'use client';

/*
 * 2:22 DFIR — Evidence Intake Registry
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppSidebar from '@/components/AppSidebar';
import AppTopBar from '@/components/AppTopBar';
import { apiFetch } from '@/lib/api';

/* ================= TYPES ================= */

type Case = {
    case_id: string;
    case_name: string;
    case_description?: string;
    case_status: string;
    case_created_at: string;
};

type UploadMap = Record<string, number>;

const PAGE_SIZE = 8;

export default function CasesPage() {

    const [cases, setCases] = useState<Case[]>([]);
    const [uploadsCount, setUploadsCount] = useState<UploadMap>({});
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    /* ================= LOAD ================= */

    async function loadCases() {

        setLoading(true);

        const casesData = await apiFetch('/cases/');
        setCases(casesData);

        /* ===== LOAD UPLOAD COUNTS ===== */

        const map: UploadMap = {};

        await Promise.all(
            casesData.map(async (c: Case) => {
                try {
                    const uploads = await apiFetch(`/cases/${c.case_id}/uploads`);
                    map[c.case_id] = uploads.length;
                } catch {
                    map[c.case_id] = 0;
                }
            })
        );

        setUploadsCount(map);
        setLoading(false);
    }

    useEffect(() => {
        loadCases();
    }, []);

    /* ================= FILTER ================= */

    const filtered = useMemo(() => {

        const q = search.toLowerCase();

        return cases.filter(c =>
            c.case_name.toLowerCase().includes(q) ||
            (c.case_description || '').toLowerCase().includes(q)
        );

    }, [cases, search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    const pagedCases = useMemo(() => {

        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);

    }, [filtered, page]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    /* ================= UI ================= */

    return (

        <AuthGuard>

            <div id="app" className="app app-sidebar-fixed">

                <AppSidebar />
                <AppTopBar />

                <div id="content" className="app-content">

                    <div className="container-fluid">

                        {/* ===== HEADER ===== */}

                        <div className="row mb-3">

                            <div className="col">

                                <h1 className="mb-1">
                                    Evidence Intake Registry
                                </h1>

                                <p className="text-body text-opacity-75 small">
                                    {filtered.length} of {cases.length} cases
                                </p>

                            </div>

                        </div>

                        {/* ===== TABLE ===== */}

                        <div className="card">

                            <div className="card-body p-0">

                                <div className="table-responsive">

                                    <table className="table table-hover table-borderless mb-0 small align-middle">

                                        <thead className="text-body text-opacity-50">

                                            <tr>
                                                <th>Case</th>
                                                <th>Evidence Files</th>
                                                <th>Created</th>
                                                <th className="text-end">Actions</th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {loading && (

                                                <tr>
                                                    <td colSpan={4} className="text-center py-4">
                                                        Loading evidence registry…
                                                    </td>
                                                </tr>

                                            )}

                                            {!loading && pagedCases.length === 0 && (

                                                <tr>
                                                    <td colSpan={4} className="text-center py-4">
                                                        No cases found
                                                    </td>
                                                </tr>

                                            )}

                                            {pagedCases.map(c => (

                                                <tr key={c.case_id}>

                                                    <td>

                                                        <div className="fw-semibold">
                                                            {c.case_name}
                                                        </div>

                                                        <div
                                                            className="text-body text-opacity-50 text-truncate"
                                                            style={{ maxWidth: 420 }}
                                                        >
                                                            {c.case_description || 'No description'}
                                                        </div>

                                                    </td>

                                                    <td>

                                                        <span className="badge bg-theme">

                                                            {uploadsCount[c.case_id] ?? 0}

                                                        </span>

                                                    </td>

                                                    <td>
                                                        {new Date(c.case_created_at).toLocaleString()}
                                                    </td>

                                                    <td className="text-end">

                                                        <Link
                                                            href={`/uploads/${c.case_id}`}
                                                            className="btn btn-sm btn-outline-theme"
                                                        >
                                                            Manage Evidence
                                                        </Link>

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