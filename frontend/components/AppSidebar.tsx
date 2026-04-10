'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { href: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { href: '/cases', icon: 'bi-folder2-open', label: 'Cases' },
    { href: '/jobs', icon: 'bi-cpu', label: 'Jobs' },
    { href: '/reports', icon: 'bi-file-earmark-text', label: 'Reports' },
    { href: '/artifacts', icon: 'bi-search', label: 'Artifacts' },
    { href: '/pricing', icon: 'bi-credit-card', label: 'Subscription' },
    { href: '/profile', icon: 'bi-person', label: 'Profile' },
];

export default function AppSidebar({ show, onClose }: { show?: boolean; onClose?: () => void }) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            {show && (
                <div
                    className="app-sidebar-bg show"
                    onClick={onClose}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1040 }}
                />
            )}

            <div
                id="sidebar"
                className={`app-sidebar ${show ? 'show' : ''}`}
                style={show ? { transform: 'translateX(0)', zIndex: 1050, position: 'fixed', top: 0, bottom: 0 } : {}}
            >
                <div className="app-sidebar-content" data-scrollbar="true" data-height="100%">
                    {/* Logo */}
                    <div className="menu-header p-3">
                        <Link href="/dashboard" className="text-decoration-none d-flex align-items-center gap-2" onClick={onClose}>
                            <i className="bi bi-shield-lock-fill text-theme fs-4" />
                            <span className="fw-bold text-body small">2:22 DFIR</span>
                        </Link>
                    </div>

                    {/* Nav */}
                    <div className="menu p-2">
                        {NAV_ITEMS.map(item => {
                            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
                            return (
                                <div className="menu-item" key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`menu-link d-flex align-items-center gap-2 p-2 rounded small ${active ? 'text-theme fw-semibold' : 'text-body text-opacity-75'}`}
                                        style={{ textDecoration: 'none' }}
                                        onClick={onClose}
                                    >
                                        <i className={`bi ${item.icon} fs-6`} />
                                        <span>{item.label}</span>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
