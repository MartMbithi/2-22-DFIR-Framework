'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { HudArrows } from '@/components/Nav';

type Plan = {
    plan_id: string; plan_name: string; plan_max_cases: number;
    plan_max_artifacts: number; plan_max_users: number;
    plan_llm_enabled: boolean; plan_price: number;
    plan_currency: string; plan_interval: string;
};
type Sub = {
    subscription_id: string; plan_id: string;
    subscription_status: string; subscription_expires_at: string;
};

export default function PricingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentSub, setCurrentSub] = useState<Sub | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [p, s] = await Promise.all([
                    apiFetch('/subscriptions/plans'),
                    apiFetch('/subscriptions/current').catch(() => null),
                ]);
                setPlans(p);
                setCurrentSub(s);
            } catch { }
            setLoading(false);
        })();
    }, []);

    // Check for Paystack callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('reference') || params.get('trxref');
        if (ref) {
            apiFetch(`/subscriptions/verify/${ref}`)
                .then(res => {
                    if (res.status === 'success') {
                        alert('Payment successful! Your subscription is now active.');
                        window.location.href = '/pricing';
                    }
                })
                .catch(() => alert('Payment verification failed. Please contact support.'));
        }
    }, []);

    async function subscribe(planId: string) {
        setPaying(planId);
        try {
            const res = await apiFetch('/subscriptions/pay', {
                method: 'POST',
                body: JSON.stringify({
                    plan_id: planId,
                    callback_url: window.location.origin + '/pricing',
                }),
            });
            // Redirect to Paystack checkout
            window.location.href = res.authorization_url;
        } catch (err: any) {
            alert('Payment initiation failed. Please try again.');
        } finally {
            setPaying(null);
        }
    }

    const fmt = (n: number) => n >= 999999 ? 'Unlimited' : n.toLocaleString();

    return (
        <DashboardLayout>
            <h1 className="h4 mb-1">Subscription Plans</h1>
            <p className="text-body text-opacity-50 small mb-4">Choose a plan for your forensic investigation needs.</p>

            {currentSub && (
                <div className="alert alert-info py-2 small mb-4">
                    <i className="bi bi-check-circle me-1" />
                    Active subscription expires {new Date(currentSub.subscription_expires_at).toLocaleDateString()}
                </div>
            )}

            {loading && <div className="text-center py-5"><div className="spinner-border text-theme" /></div>}

            <div className="row g-3">
                {plans.map(p => {
                    const isCurrent = currentSub?.plan_id === p.plan_id;
                    const isFree = p.plan_price === 0;

                    return (
                        <div className="col-xl-3 col-lg-6 col-md-6" key={p.plan_id}>
                            <div className={`card h-100 ${isCurrent ? 'border border-theme' : ''}`}>
                                <div className="card-body d-flex flex-column">
                                    <div className="text-center mb-3">
                                        <h5 className="fw-bold mb-1">{p.plan_name}</h5>
                                        <div className="fs-3 fw-bold text-theme">
                                            {isFree ? 'Free' : `KES ${p.plan_price.toLocaleString()}`}
                                        </div>
                                        {!isFree && (
                                            <span className="small text-body text-opacity-50">/{p.plan_interval}</span>
                                        )}
                                    </div>

                                    <ul className="list-unstyled small flex-grow-1">
                                        <li className="mb-2"><i className="bi bi-check-lg text-theme me-1" />{fmt(p.plan_max_cases)} cases</li>
                                        <li className="mb-2"><i className="bi bi-check-lg text-theme me-1" />{fmt(p.plan_max_artifacts)} artifacts</li>
                                        <li className="mb-2"><i className="bi bi-check-lg text-theme me-1" />{fmt(p.plan_max_users)} users</li>
                                        <li className="mb-2">
                                            <i className={`bi ${p.plan_llm_enabled ? 'bi-check-lg text-theme' : 'bi-x-lg text-danger'} me-1`} />
                                            AI narrative {p.plan_llm_enabled ? 'enabled' : 'disabled'}
                                        </li>
                                        <li className="mb-2"><i className="bi bi-check-lg text-theme me-1" />NIST/ISO reports</li>
                                        <li className="mb-2"><i className="bi bi-check-lg text-theme me-1" />MITRE ATT&CK mapping</li>
                                    </ul>

                                    {isCurrent ? (
                                        <button className="btn btn-outline-theme w-100" disabled>
                                            <i className="bi bi-check-circle me-1" />Current Plan
                                        </button>
                                    ) : isFree ? (
                                        <button className="btn btn-outline-secondary w-100" disabled>Free Tier</button>
                                    ) : (
                                        <button
                                            className="btn btn-theme w-100"
                                            onClick={() => subscribe(p.plan_id)}
                                            disabled={paying === p.plan_id}
                                        >
                                            {paying === p.plan_id ? (
                                                <><span className="spinner-border spinner-border-sm me-1" />Processing…</>
                                            ) : (
                                                <>Subscribe via M-Pesa/Card</>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <HudArrows />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 text-center small text-body text-opacity-50">
                <i className="bi bi-shield-lock me-1" />
                Payments are processed securely via Paystack. We support M-Pesa, Visa, Mastercard, and bank transfers.
            </div>
        </DashboardLayout>
    );
}
