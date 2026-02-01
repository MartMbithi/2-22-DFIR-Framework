'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppSidebar from '@/components/AppSidebar';
import AppTopBar from '@/components/AppTopBar';
import { apiFetch } from '@/lib/api';
import { checkPassword, passwordStrength } from '@/lib/passwordPolicy';
import { logout } from '@/lib/auth';

/* ================= TYPES ================= */

type User = {
    user_id: string;
    email: string;
};

/* ================= PAGE ================= */

export default function ProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);

    /* ---------- EMAIL ---------- */
    const [email, setEmail] = useState('');
    const [emailSaving, setEmailSaving] = useState(false);
    const [emailMessage, setEmailMessage] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);

    /* ---------- PASSWORD ---------- */
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    /* ================= LOAD ================= */

    useEffect(() => {
        async function load() {
            const me = await apiFetch('/users/me');
            setUser(me);
            setEmail(me.email);
        }
        load();
    }, []);

    /* ================= UPDATE EMAIL ================= */

    async function updateEmail(e: React.FormEvent) {
        e.preventDefault();
        setEmailMessage(null);
        setEmailError(null);
        setEmailSaving(true);

        try {
            await apiFetch('/users/me/email', {
                method: 'PUT',
                body: JSON.stringify({ email })
            });

            setEmailMessage('Email updated successfully.');
        } catch {
            setEmailError('Failed to update email.');
        } finally {
            setEmailSaving(false);
        }
    }

    /* ================= UPDATE PASSWORD ================= */

    const policy = checkPassword(newPassword);
    const strength = passwordStrength(newPassword);
    const passwordsMatch = newPassword === confirmPassword;

    async function updatePassword(e: React.FormEvent) {
        e.preventDefault();
        setPasswordError(null);

        if (!currentPassword) {
            setPasswordError('Current password is required.');
            return;
        }

        if (!passwordsMatch) {
            setPasswordError('Passwords do not match.');
            return;
        }

        if (!policy.valid) {
            setPasswordError('Password does not meet security requirements.');
            return;
        }

        setPasswordSaving(true);

        try {
            const res = await apiFetch('/users/me/password', {
                method: 'PUT',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            if (res?.detail === 'Password updated successfully') {
                logout();
                router.replace('/login');
            } else {
                setPasswordError('Unexpected response from server.');
            }
        } catch {
            setPasswordError('Current password is incorrect.');
        } finally {
            setPasswordSaving(false);
        }
    }

    if (!user) {
        return <div className="p-6">Loading profile context…</div>;
    }

    return (
        <AuthGuard>
            <div id="app" className="app app-sidebar-fixed">

                <AppSidebar />
                <AppTopBar />

                <div id="content" className="app-content">
                    <div className="container-fluid">

                        {/* ================= HEADER ================= */}
                        <div className="row mb-4">
                            <div className="col">
                                <h1 className="mb-1">Profile</h1>
                                <p className="text-body text-opacity-75 small">
                                    Analyst account credentials & security controls
                                </p>
                            </div>
                        </div>

                        <div className="row g-4">

                            {/* ================= EMAIL ================= */}
                            <div className="col-lg-6">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5>Email Address</h5>

                                        <form onSubmit={updateEmail} className="mt-3">
                                            <div className="mb-3">
                                                <label className="form-label small">
                                                    Account Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    required
                                                    className="form-control"
                                                />
                                            </div>

                                            {emailMessage && (
                                                <div className="alert alert-success small">
                                                    {emailMessage}
                                                </div>
                                            )}

                                            {emailError && (
                                                <div className="alert alert-danger small">
                                                    {emailError}
                                                </div>
                                            )}

                                            <button
                                                disabled={emailSaving}
                                                className="btn btn-outline-theme btn-sm"
                                            >
                                                {emailSaving ? 'Saving…' : 'Update Email'}
                                            </button>
                                        </form>
                                    </div>
                                    <HudArrows />
                                </div>
                            </div>

                            {/* ================= PASSWORD ================= */}
                            <div className="col-lg-6">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5>Change Password</h5>

                                        <form onSubmit={updatePassword} className="mt-3">

                                            <div className="mb-3">
                                                <label className="form-label small">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={e => setCurrentPassword(e.target.value)}
                                                    className="form-control"
                                                    required
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label small">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    className="form-control"
                                                    required
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label small">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    className="form-control"
                                                    required
                                                />
                                            </div>

                                            {/* STRENGTH BAR */}
                                            <div className="mb-3">
                                                <div className="d-flex gap-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <div
                                                            key={i}
                                                            className={`flex-fill h-5px rounded ${strength >= i
                                                                    ? strength <= 2
                                                                        ? 'bg-danger'
                                                                        : strength <= 4
                                                                            ? 'bg-warning'
                                                                            : 'bg-success'
                                                                    : 'bg-secondary bg-opacity-25'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>

                                                <ul className="list-unstyled small mb-0">
                                                    <Rule ok={policy.checks.length} text="Minimum length" />
                                                    <Rule ok={policy.checks.upper} text="Uppercase letter" />
                                                    <Rule ok={policy.checks.lower} text="Lowercase letter" />
                                                    <Rule ok={policy.checks.number} text="Number" />
                                                    <Rule ok={policy.checks.symbol} text="Symbol" />
                                                </ul>
                                            </div>

                                            {passwordError && (
                                                <div className="alert alert-danger small">
                                                    {passwordError}
                                                </div>
                                            )}

                                            <button
                                                disabled={!policy.valid || !passwordsMatch || passwordSaving}
                                                className="btn btn-outline-theme btn-sm"
                                            >
                                                {passwordSaving ? 'Saving…' : 'Update Password'}
                                            </button>
                                        </form>
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

function Rule({ ok, text }: { ok: boolean; text: string }) {
    return (
        <li className={ok ? 'text-success' : 'text-body text-opacity-50'}>
            {ok ? '✓' : '•'} {text}
        </li>
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
