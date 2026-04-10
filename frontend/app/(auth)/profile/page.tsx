'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { HudArrows } from '@/components/Nav';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [org, setOrg] = useState<any>(null);
    const [sub, setSub] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            apiFetch('/users/me').catch(() => null),
            apiFetch('/organizations/me').catch(() => null),
            apiFetch('/subscriptions/current').catch(() => null),
            apiFetch('/subscriptions/payments').catch(() => []),
        ]).then(([u, o, s, p]) => {
            setUser(u); setOrg(o); setSub(s); setPayments(p);
        });
    }, []);

    return (
        <DashboardLayout>
            <h1 className="h4 mb-4">Profile & Account</h1>

            <div className="row g-3">
                {/* User Info */}
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3"><i className="bi bi-person-circle text-theme me-2" />User Information</h6>
                            {user ? (
                                <div className="small">
                                    <div className="mb-2"><strong>Email:</strong> {user.user_email}</div>
                                    <div className="mb-2"><strong>Role:</strong> <span className="badge bg-theme">{user.user_role}</span></div>
                                    <div className="mb-2"><strong>User ID:</strong> <code className="small">{user.user_id}</code></div>
                                    <div><strong>Joined:</strong> {user.user_created_at ? new Date(user.user_created_at).toLocaleDateString() : '—'}</div>
                                </div>
                            ) : <p className="small text-body text-opacity-50">Loading…</p>}
                        </div>
                        <HudArrows />
                    </div>
                </div>

                {/* Organization */}
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3"><i className="bi bi-building text-theme me-2" />Organization</h6>
                            {org ? (
                                <div className="small">
                                    <div className="mb-2"><strong>Name:</strong> {org.organization_name}</div>
                                    <div className="mb-2"><strong>Org ID:</strong> <code className="small">{org.organization_id}</code></div>
                                    <div><strong>Created:</strong> {new Date(org.organization_created_at).toLocaleDateString()}</div>
                                </div>
                            ) : <p className="small text-body text-opacity-50">No organization</p>}
                        </div>
                        <HudArrows />
                    </div>
                </div>

                {/* Subscription */}
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3"><i className="bi bi-credit-card text-theme me-2" />Subscription</h6>
                            {sub ? (
                                <div className="small">
                                    <div className="mb-2"><strong>Status:</strong>{' '}
                                        <span className={`badge ${sub.subscription_status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                                            {sub.subscription_status}
                                        </span>
                                    </div>
                                    <div className="mb-2"><strong>Expires:</strong> {new Date(sub.subscription_expires_at).toLocaleDateString()}</div>
                                    <div><strong>Plan ID:</strong> <code className="small">{sub.plan_id}</code></div>
                                </div>
                            ) : (
                                <div className="small">
                                    <p className="text-body text-opacity-50">No active subscription.</p>
                                    <a href="/pricing" className="btn btn-sm btn-outline-theme">View Plans</a>
                                </div>
                            )}
                        </div>
                        <HudArrows />
                    </div>
                </div>

                {/* Payment History */}
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3"><i className="bi bi-receipt text-theme me-2" />Payment History</h6>
                            {payments.length === 0 ? (
                                <p className="small text-body text-opacity-50">No payment history.</p>
                            ) : (
                                <div className="small">
                                    {payments.slice(0, 5).map((p: any) => (
                                        <div key={p.payment_id} className="mb-2 d-flex justify-content-between">
                                            <span>
                                                <span className={`badge ${p.payment_status === 'success' ? 'bg-success' : 'bg-warning'} me-1`}>
                                                    {p.payment_status}
                                                </span>
                                                KES {p.payment_amount}
                                            </span>
                                            <span className="text-body text-opacity-50">
                                                {new Date(p.payment_created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <HudArrows />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
