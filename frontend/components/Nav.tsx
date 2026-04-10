'use client';
import Link from 'next/link';

export function HudArrows() {
    return (
        <div className="card-arrow">
            <div className="card-arrow-top-left" />
            <div className="card-arrow-top-right" />
            <div className="card-arrow-bottom-left" />
            <div className="card-arrow-bottom-right" />
        </div>
    );
}

export function Nav() {
    return (
        <nav className="navbar navbar-expand-lg py-3 px-3 px-lg-5">
            <Link href="/" className="navbar-brand fw-bold text-body">
                <i className="bi bi-shield-lock-fill text-theme me-2" />
                2:22 DFIR
            </Link>
            <div className="ms-auto d-flex gap-2">
                <Link href="/login" className="btn btn-sm btn-outline-theme">Sign In</Link>
                <Link href="/register" className="btn btn-sm btn-theme">Get Started</Link>
            </div>
        </nav>
    );
}

export function Footer() {
    return (
        <footer className="py-4 text-center small text-body text-opacity-50">
            <p className="mb-1">2:22 DFIR Framework v2.22.0</p>
            <p className="mb-0">Government of Makueni County — ICT &amp; Digital Governance</p>
        </footer>
    );
}
