'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function CreateOrganization() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await apiFetch('/organizations/', {
                method: 'POST',
                body: JSON.stringify({ organization_name: name }),
            });
            sessionStorage.setItem('org_created', 'true');
            router.push('/dashboard');
        } catch {
            setError('Failed to create organization.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>

            {/* BEGIN CONTENT */}
            <div
                className="py-5 bg-opacity-50 min-vh-100 d-flex align-items-center"
            >
                <div className="container-xxl p-3 p-lg-5">

                    <div className="row justify-content-center">
                        <div className="col-xl-5 col-lg-6 col-md-8">

                            <div className="card">
                                <div className="card-body p-4">

                                    <h1 className="h3 fw-bold mb-2">
                                        Create Your Organization
                                    </h1>

                                    <p className="text-body text-opacity-75 mb-4">
                                        2:22 AI is designed around organization-scoped investigations.
                                        Creating an organization establishes a secure boundary for
                                        cases, evidence, users, and audit trails.
                                    </p>

                                    <div className="mb-4 small text-body text-opacity-75">
                                        <ul className="mb-0 ps-3">
                                            <li>Isolates investigations and evidence by entity</li>
                                            <li>Enforces access control and analyst accountability</li>
                                            <li>Maintains chain-of-custody across all cases</li>
                                            <li>Supports compliance and defensible reporting</li>
                                        </ul>
                                    </div>

                                    <form onSubmit={submit}>

                                        <div className="mb-4">
                                            <label className="form-label">
                                                Organization name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                placeholder="e.g. ACME Security Operations"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                            <div className="form-text">
                                                This name will appear in reports, audit logs, and case metadata.
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-theme btn-lg w-100"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating organization…' : 'Create Organization'}
                                        </button>

                                        {error && (
                                            <div className="alert alert-danger mt-3 mb-0 py-2 text-center small">
                                                {error}
                                            </div>
                                        )}
                                    </form>

                                </div>

                                {/* HUD CARD CHROME */}
                                <div className="card-arrow">
                                    <div className="card-arrow-top-left"></div>
                                    <div className="card-arrow-top-right"></div>
                                    <div className="card-arrow-bottom-left"></div>
                                    <div className="card-arrow-bottom-right"></div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
            {/* END CONTENT */}

        </>
    );
}
