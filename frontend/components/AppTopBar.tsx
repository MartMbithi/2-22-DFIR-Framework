'use client';
import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';

export default function AppTopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
    const router = useRouter();

    function logout() {
        clearToken();
        router.push('/login');
    }

    return (
        <div id="header" className="app-header">
            <nav className="navbar navbar-expand px-3 py-2">
                {/* Mobile hamburger */}
                <button
                    className="btn btn-sm btn-outline-theme d-lg-none me-2"
                    onClick={onToggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <i className="bi bi-list fs-5" />
                </button>

                <div className="navbar-brand d-none d-md-block small fw-bold text-body text-opacity-75">
                    2:22 DFIR Framework — Makueni County
                </div>

                <div className="ms-auto d-flex align-items-center gap-2">
                    <span className="badge bg-theme d-none d-sm-inline small">v2.22</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={logout}>
                        <i className="bi bi-box-arrow-right" />
                        <span className="d-none d-md-inline ms-1">Logout</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
