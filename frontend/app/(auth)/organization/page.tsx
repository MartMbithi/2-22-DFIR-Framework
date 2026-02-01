'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard-layout';
import { apiFetch } from '@/lib/api';

/* ================= PAGE ================= */

export default function OrganizationPage() {
    const router = useRouter();

    const [orgId, setOrgId] = useState('');
    const [orgName, setOrgName] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    /* ================= LOAD ================= */

    useEffect(() => {
        async function load() {
            try {
                const org = await apiFetch('/organizations/me');
                setOrgId(org.organization_id);
                setOrgName(org.organization_name);
                setCreatedAt(org.organization_created_at);
            } catch {
                router.replace('/onboarding/organization');
            }
        }

        load();
    }, []);

    /* ================= SAVE ================= */

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            await apiFetch('/organizations/me', {
                method: 'PUT',
                body: JSON.stringify({
                    organization_name: orgName,
                }),
            });

            setMessage('Organization updated successfully.');
        } catch {
            setMessage('Failed to update organization.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <DashboardLayout>

            {/* ================= HEADER ================= */}
            <div className="row mb-4">
                <div className="col">
                    <h1 className="mb-1">Organization</h1>
                    <p className="text-body text-opacity-75">
                        Organization-level configuration and operational ownership
                    </p>
                </div>
            </div>

            {/* ================= OVERVIEW ================= */}
            <div className="row mb-4">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="mb-3">Overview</h5>

                            <div className="row small">
                                <div className="col-md-6 mb-3">
                                    <div className="text-body text-opacity-50 mb-1">
                                        Organization ID
                                    </div>
                                    <div className="font-monospace text-break">
                                        {orgId}
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div className="text-body text-opacity-50 mb-1">
                                        Created At
                                    </div>
                                    <div>
                                        {new Date(createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <HudArrows />
                    </div>
                </div>
            </div>

            {/* ================= SETTINGS ================= */}
            <div className="row mb-4">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="mb-3">Settings</h5>

                            <form onSubmit={save} className="row g-3 align-items-end">

                                <div className="col-md-8">
                                    <label className="form-label">
                                        Organization Name
                                    </label>
                                    <input
                                        className="form-control"
                                        value={orgName}
                                        onChange={e => setOrgName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn btn-outline-theme w-100"
                                    >
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </div>

                            </form>

                            {message && (
                                <div className="mt-3 small text-body text-opacity-75">
                                    {message}
                                </div>
                            )}
                        </div>

                        <HudArrows />
                    </div>
                </div>
            </div>

            {/* ================= OPERATIONAL CONTEXT ================= */}
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="mb-3">Operational Context</h5>

                            <p className="small text-body text-opacity-75">
                                This organization boundary defines ownership and isolation
                                for all cases, artifacts, jobs, and forensic reports.
                            </p>

                            <p className="small text-body text-opacity-75 mb-0">
                                All access controls, auditability, and data separation
                                are enforced at the organization scope.
                            </p>
                        </div>

                        <HudArrows />
                    </div>
                </div>
            </div>

        </DashboardLayout>
    );
}

/* ================= HUD ARROWS ================= */

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
