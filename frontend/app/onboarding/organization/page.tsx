'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HudArrows } from '@/components/Nav';
import { apiFetch } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function OnboardingOrganization() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await apiFetch('/organizations/', {
                method: 'POST',
                body: JSON.stringify({ organization_name: name }),
            });
            router.push('/dashboard');
        } catch {
            setError('Failed to create organization.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthGuard>
            <div className="py-5 min-vh-100 d-flex align-items-center">
                <div className="container-xxl p-3">
                    <div className="row justify-content-center">
                        <div className="col-xl-5 col-lg-6 col-md-8 col-sm-10">
                            <div className="card">
                                <div className="card-body p-4">
                                    <div className="text-center mb-4">
                                        <i className="bi bi-building text-theme fs-1 d-block mb-2" />
                                        <h2 className="h4 fw-bold">Create Your Organization</h2>
                                        <p className="text-body text-opacity-50 small">
                                            Set up your forensic investigation workspace.
                                        </p>
                                    </div>
                                    <form onSubmit={submit}>
                                        <div className="mb-4">
                                            <label className="form-label small">Organization Name</label>
                                            <input type="text" className="form-control form-control-lg"
                                                placeholder="e.g. Government of Makueni County"
                                                value={name} onChange={e => setName(e.target.value)}
                                                required minLength={2} />
                                        </div>
                                        <button type="submit" className="btn btn-theme btn-lg w-100" disabled={loading}>
                                            {loading ? 'Creating…' : 'Create Organization'}
                                        </button>
                                        {error && <div className="alert alert-danger mt-3 py-2 text-center small">{error}</div>}
                                    </form>
                                </div>
                                <HudArrows />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
