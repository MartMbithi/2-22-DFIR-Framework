'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { apiFetch } from '@/lib/api';

export default function Register() {
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
            await apiFetch('/users/', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // After successful signup → login
            router.push('/login');
        } catch {
            setError('Account creation failed. Email may already exist.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* HUD HEADER */}
            <Nav />

            {/* BEGIN CONTENT */}
            <div
                className="py-5 bg-body bg-opacity-50 min-vh-100 d-flex align-items-center"
                data-bs-theme="dark"
            >
                <div className="container-xxl p-3 p-lg-5">

                    <div className="row justify-content-center">
                        <div className="col-xl-4 col-lg-5 col-md-7">

                            <div className="card">
                                <div className="card-body p-4">

                                    <h1 className="h3 fw-bold mb-1">
                                        Create Your Account
                                    </h1>

                                    <p className="text-body text-opacity-75 small mb-4">
                                        Register to access the 2:22 AI investigation platform.
                                    </p>

                                    <form onSubmit={submit}>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Email address
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg"
                                                placeholder="analyst@example.org"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control form-control-lg"
                                                placeholder="Create a strong password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-theme btn-lg w-100"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating account…' : 'Create Account'}
                                        </button>

                                        {error && (
                                            <div className="alert alert-danger mt-3 mb-0 py-2 text-center small">
                                                {error}
                                            </div>
                                        )}
                                    </form>

                                    <div className="text-center mt-4 small">
                                        <span className="text-body text-opacity-75">
                                            Already have an account?
                                        </span>{' '}
                                        <a href="/login" className="text-theme fw-semibold">
                                            Sign in
                                        </a>
                                    </div>

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

            {/* HUD FOOTER */}
            <Footer />
        </>
    );
}
