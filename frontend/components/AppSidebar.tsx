/*
 *   Crafted On Fri Jan 30 2026
 *   Devlan Solutions LTD — DFIR-AI
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) =>
        pathname === path || pathname.startsWith(path + '/');

    return (
        <>
            {/* ================= SIDEBAR ================= */}
            <div id="sidebar" className="app-sidebar">
                <div
                    className="app-sidebar-content"
                    data-scrollbar="true"
                    data-height="100%"
                >
                    <div className="menu">

                        {/* ================= CORE ================= */}
                        <div className="menu-header">DFIR Operations</div>

                        <div className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`}>
                            <Link href="/dashboard" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-speedometer2"></i>
                                </span>
                                <span className="menu-text">Dashboard</span>
                            </Link>
                        </div>

                        <div className={`menu-item ${isActive('/cases') ? 'active' : ''}`}>
                            <Link href="/cases" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-folder2-open"></i>
                                </span>
                                <span className="menu-text">Cases</span>
                            </Link>
                        </div>

                        <div className={`menu-item ${isActive('/artifacts') ? 'active' : ''}`}>
                            <Link href="/artifacts" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-hdd-stack"></i>
                                </span>
                                <span className="menu-text">Artifacts</span>
                            </Link>
                        </div>

                        <div className={`menu-item ${isActive('/jobs') ? 'active' : ''}`}>
                            <Link href="/jobs" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-cpu-fill"></i>
                                </span>
                                <span className="menu-text">Jobs</span>
                            </Link>
                        </div>

                        <div className={`menu-item ${isActive('/reports') ? 'active' : ''}`}>
                            <Link href="/reports" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-file-earmark-text"></i>
                                </span>
                                <span className="menu-text">Reports</span>
                            </Link>
                        </div>

                        <div className="menu-divider"></div>

                        {/* ================= PLATFORM ================= */}
                        <div className="menu-header">Platform</div>

                        <div className={`menu-item ${isActive('/organization') ? 'active' : ''}`}>
                            <Link href="/organization" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-building"></i>
                                </span>
                                <span className="menu-text">Organization</span>
                            </Link>
                        </div>

                        <div className={`menu-item ${isActive('/users') ? 'active' : ''}`}>
                            <Link href="/users" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-people"></i>
                                </span>
                                <span className="menu-text">Users</span>
                            </Link>
                        </div>

                        <div className={`menu-item ${isActive('/settings') ? 'active' : ''}`}>
                            <Link href="/settings" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-gear"></i>
                                </span>
                                <span className="menu-text">Settings</span>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

            {/* ================= MOBILE BACKDROP ================= */}
            <button
                className="app-sidebar-mobile-backdrop"
                data-toggle-target=".app"
                data-toggle-class="app-sidebar-mobile-toggled"
            ></button>
        </>
    );
}
