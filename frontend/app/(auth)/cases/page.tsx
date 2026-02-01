'use client';

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

const PAGE_SIZE = 8;

export default function CasesPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);

    // table UI
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // create/edit modal
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Case | null>(null);

    // delete modal
    const [deleteTarget, setDeleteTarget] = useState<Case | null>(null);
    const [deleting, setDeleting] = useState(false);

    // form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    /* ================= LOAD ================= */

    async function loadCases() {
        setLoading(true);
        const data = await apiFetch('/cases/');
        setCases(data);
        setLoading(false);
    }

    useEffect(() => {
        loadCases();
    }, []);

    /* ================= FILTER + PAGINATION ================= */

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

    /* ================= CRUD ================= */

    function openCreate() {
        setEditing(null);
        setName('');
        setDescription('');
        setOpen(true);
    }

    function openEdit(c: Case) {
        setEditing(c);
        setName(c.case_name);
        setDescription(c.case_description || '');
        setOpen(true);
    }

    async function saveCase(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            if (editing) {
                await apiFetch(`/cases/${editing.case_id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        case_name: name,
                        case_description: description
                    })
                });
            } else {
                await apiFetch('/cases/', {
                    method: 'POST',
                    body: JSON.stringify({
                        case_name: name,
                        case_description: description
                    })
                });
            }

            setOpen(false);
            loadCases();
        } finally {
            setSaving(false);
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            await apiFetch(`/cases/${deleteTarget.case_id}`, {
                method: 'DELETE'
            });
            setDeleteTarget(null);
            loadCases();
        } finally {
            setDeleting(false);
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

                        {/* ===== HEADER ===== */}
                        <div className="row mb-3">
                            <div className="col">
                                <h1 className="mb-1">Cases</h1>
                                <p className="text-body text-opacity-75 small">
                                    {filtered.length} of {cases.length} cases
                                </p>
                            </div>

                            <div className="col-auto d-flex align-items-center gap-3">
                                <input
                                    className="form-control form-control-sm"
                                    placeholder="Search cases…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <button
                                    className="btn btn-outline-theme btn-sm"
                                    onClick={openCreate}
                                >
                                    Add
                                </button>
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
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loading && (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-4">
                                                        Loading cases…
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
                                                            {c.case_description || '—'}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <StatusBadge status={c.case_status} />
                                                    </td>

                                                    <td>
                                                        {new Date(c.case_created_at).toLocaleString()}
                                                    </td>

                                                    <td className="text-end">
                                                        <Link
                                                            href={`/cases/${c.case_id}`}
                                                            className="btn btn-sm btn-outline-theme me-2"
                                                        >
                                                            View
                                                        </Link>

                                                        <button
                                                            className="btn btn-sm btn-outline-secondary me-2"
                                                            onClick={() => openEdit(c)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => setDeleteTarget(c)}
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

                            <div className="card-arrow">
                                <div className="card-arrow-top-left"></div>
                                <div className="card-arrow-top-right"></div>
                                <div className="card-arrow-bottom-left"></div>
                                <div className="card-arrow-bottom-right"></div>
                            </div>
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

            {/* ===== CREATE / EDIT MODAL ===== */}
            {open && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <form onSubmit={saveCase}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editing ? 'Edit Case' : 'Create Case'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setOpen(false)}
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Case name</label>
                                        <input
                                            className="form-control"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-outline-theme"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving…' : 'Save'}
                                    </button>
                                </div>
                            </form>

                            <HudArrows />
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            {deleteTarget && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title text-danger">
                                    Confirm Case Deletion
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setDeleteTarget(null)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <p className="mb-2">
                                    You are about to permanently delete the case:
                                </p>
                                <p className="fw-semibold">
                                    {deleteTarget.case_name}
                                </p>
                                <p className="text-body text-opacity-75 small mb-0">
                                    This action will remove all associated metadata, analysis
                                    references, and audit history. This operation cannot be undone.
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
                                    onClick={confirmDelete}
                                >
                                    {deleting ? 'Deleting…' : 'Delete Case'}
                                </button>
                            </div>

                            <HudArrows />
                        </div>
                    </div>
                </div>
            )}
        </AuthGuard>
    );
}

/* ================= STATUS ================= */

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        open: 'bg-primary',
        running: 'bg-warning',
        closed: 'bg-success'
    };

    return (
        <span className={`badge ${map[status] || 'bg-secondary'}`}>
            {status}
        </span>
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
