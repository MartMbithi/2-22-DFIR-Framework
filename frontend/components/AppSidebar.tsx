/*
 *   Crafted On Fri Jan 30 2026
 *   Devlan Solutions LTD — 2:22 DFIR
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

                        <div className="menu-header">
                            2:22 DFIR Console
                        </div>

                        <div className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`}>
                            <Link href="/dashboard" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-speedometer2"></i>
                                </span>
                                <span className="menu-text">
                                    Dashboard
                                </span>
                            </Link>
                        </div>

                        <div className="menu-divider"></div>

                        {/* ================= INVESTIGATIONS ================= */}

                        <div className="menu-header">
                            Investigations
                        </div>

                        <div className={`menu-item ${isActive('/cases') ? 'active' : ''}`}>
                            <Link href="/cases" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-folder2-open"></i>
                                </span>
                                <span className="menu-text">
                                    Cases
                                </span>
                            </Link>
                        </div>

                        <div className={`menu-item ${isActive('/uploads') ? 'active' : ''}`}>
                            <Link href="/uploads" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-cloud-upload"></i>
                                </span>
                                <span className="menu-text">
                                    Evidence Uploads
                                </span>
                            </Link>
                        </div>

                        <div className={`menu-item ${isActive('/artifacts') ? 'active' : ''}`}>
                            <Link href="/artifacts" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-hdd-stack"></i>
                                </span>
                                <span className="menu-text">
                                    Artifacts
                                </span>
                            </Link>
                        </div>

                        <div className="menu-divider"></div>

                        {/* ================= PROCESSING ================= */}

                        <div className="menu-header">
                            Analysis Engine
                        </div>

                        <div className={`menu-item ${isActive('/jobs') ? 'active' : ''}`}>
                            <Link href="/jobs" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-cpu"></i>
                                </span>
                                <span className="menu-text">
                                    Analysis Jobs
                                </span>
                            </Link>
                        </div>

                        <div className={`menu-item ${isActive('/reports') ? 'active' : ''}`}>
                            <Link href="/reports" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-file-earmark-text"></i>
                                </span>
                                <span className="menu-text">
                                    Investigation Reports
                                </span>
                            </Link>
                        </div>

                        <div className="menu-divider"></div>

                        {/* ================= PLATFORM ================= */}

                        <div className="menu-header">
                            Platform
                        </div>

                        <div className={`menu-item ${isActive('/organization') ? 'active' : ''}`}>
                            <Link href="/organization" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-building"></i>
                                </span>
                                <span className="menu-text">
                                    Organization
                                </span>
                            </Link>
                        </div>

                        <div className={`menu-item ${isActive('/users') ? 'active' : ''}`}>
                            <Link href="/users" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-people"></i>
                                </span>
                                <span className="menu-text">
                                    Users
                                </span>
                            </Link>
                        </div>

                        <div className="menu-divider"></div>

                        {/* ================= ACCOUNT ================= */}

                        <div className="menu-header">
                            Account
                        </div>

                        <div className={`menu-item ${isActive('/profile') ? 'active' : ''}`}>
                            <Link href="/profile" className="menu-link">
                                <span className="menu-icon">
                                    <i className="bi bi-person-circle"></i>
                                </span>
                                <span className="menu-text">
                                    Profile
                                </span>
                            </Link>
                        </div>

                    </div>

                </div>

            </div>

            {/* ================= MOBILE SIDEBAR BACKDROP ================= */}

            <button
                className="app-sidebar-mobile-backdrop"
                data-toggle-target=".app"
                data-toggle-class="app-sidebar-mobile-toggled"
            ></button>
        </>
    );
}