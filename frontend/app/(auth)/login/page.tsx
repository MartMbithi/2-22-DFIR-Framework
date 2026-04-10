'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav, Footer, HudArrows } from '@/components/Nav';
import { apiFetch, setToken } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            setToken(data.access_token);
            try {
                await apiFetch('/organizations/me');
                router.push('/dashboard');
            } catch {
                router.push('/onboarding/organization');
            }
        } catch {
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Nav />
            <div className="py-5 min-vh-100 d-flex align-items-center">
                <div className="container-xxl p-3">
                    <div className="row justify-content-center">
                        <div className="col-xl-4 col-lg-5 col-md-7 col-sm-10">
                            <div className="card">
                                <div className="card-body p-4">
                                    <h1 className="h3 fw-bold mb-1">Sign In</h1>
                                    <p className="text-body text-opacity-75 small mb-4">
                                        Access your forensic investigation workspace.
                                    </p>
                                    <form onSubmit={submit}>
                                        <div className="mb-3">
                                            <label className="form-label small">Email</label>
                                            <input type="email" className="form-control" placeholder="analyst@makueni.go.ke"
                                                value={email} onChange={e => setEmail(e.target.value)} required />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small">Password</label>
                                            <input type="password" className="form-control" placeholder="••••••••"
                                                value={password} onChange={e => setPassword(e.target.value)} required />
                                        </div>
                                        <button type="submit" className="btn btn-theme w-100" disabled={loading}>
                                            {loading ? 'Signing in…' : 'Sign In'}
                                        </button>
                                        {error && <div className="alert alert-danger mt-3 py-2 text-center small">{error}</div>}
                                    </form>
                                    <div className="text-center mt-4 small">
                                        <span className="text-body text-opacity-75">New?</span>{' '}
                                        <a href="/register" className="text-theme fw-semibold">Create account</a>
                                    </div>
                                </div>
                                <HudArrows />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
