'use client';
import Link from 'next/link';
import { Nav, Footer, HudArrows } from '@/components/Nav';

export default function LandingPage() {
    return (
        <>
            <Nav />
            <div className="py-5 min-vh-100 d-flex align-items-center" data-bs-theme="dark">
                <div className="container-xxl p-3 p-lg-5 text-center">
                    <h1 className="display-5 fw-bold mb-3">
                        2:22 DFIR Framework
                    </h1>
                    <p className="lead text-body text-opacity-75 mb-4 mx-auto" style={{ maxWidth: 700 }}>
                        Automated Digital Forensic and Incident Response Platform for
                        Log-Based Cyber Incident Investigation in County Government
                        Information Systems.
                    </p>
                    <p className="text-body text-opacity-50 small mb-4">
                        Case Study: Government of Makueni County, Kenya
                    </p>
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        <Link href="/register" className="btn btn-theme btn-lg px-4">
                            Start Investigation
                        </Link>
                        <Link href="/login" className="btn btn-outline-theme btn-lg px-4">
                            Sign In
                        </Link>
                    </div>

                    <div className="row g-3 mt-5 text-start">
                        {[
                            { icon: 'bi-shield-check', title: 'Evidence Integrity', desc: 'SHA-256 hashing and forensic chain of custody compliance.' },
                            { icon: 'bi-cpu', title: 'Hybrid Analysis', desc: 'Deterministic rules + semantic AI for contextual triage.' },
                            { icon: 'bi-diagram-3', title: 'MITRE ATT&CK', desc: '47 techniques mapped across the full Cyber Kill Chain.' },
                            { icon: 'bi-file-earmark-pdf', title: 'NIST Reports', desc: 'SP 800-86 and ISO 27037 compliant forensic reports.' },
                        ].map(f => (
                            <div className="col-lg-3 col-md-6" key={f.title}>
                                <div className="card h-100">
                                    <div className="card-body">
                                        <i className={`bi ${f.icon} fs-2 text-theme mb-2 d-block`} />
                                        <h6 className="fw-bold">{f.title}</h6>
                                        <p className="small text-body text-opacity-50 mb-0">{f.desc}</p>
                                    </div>
                                    <HudArrows />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
