'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/lib/useLogout';
import { useEffect } from 'react';
import Link from 'next/link';


export default function AppTopBar() {
    const router = useRouter();
    const logout = useLogout();

    const openLogoutModal = useCallback(() => {
        const modal = document.getElementById('logoutModal');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'block';
            modal.setAttribute('aria-modal', 'true');
        }
    }, []);

    const closeLogoutModal = useCallback(() => {
        const modal = document.getElementById('logoutModal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.removeAttribute('aria-modal');
        }
    }, []);

    useEffect(() => {
        const togglers = document.querySelectorAll('[data-toggle-class]');

        togglers.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                const targetSelector = btn.getAttribute('data-toggle-target');
                const toggleClass = btn.getAttribute('data-toggle-class');
                const dismissClass = btn.getAttribute('data-dismiss-class');

                if (!targetSelector || !toggleClass) return;

                const target = document.querySelector(targetSelector);
                if (!target) return;

                if (dismissClass) {
                    target.classList.remove(dismissClass);
                }

                target.classList.toggle(toggleClass);
            });
        });

        return () => {
            togglers.forEach((btn) => {
                btn.replaceWith(btn.cloneNode(true));
            });
        };
    }, []);


    const handleLogout = useCallback(() => {
        closeLogoutModal();
        logout();
        router.replace('/login');
    }, []);

    return (
        <>
            {/* ================== HUD HEADER (FIXED) ================== */}
            <div id="header" className="app-header">

                {/* Desktop Sidebar Toggle */}
                <div className="desktop-toggler">
                    <button
                        type="button"
                        className="menu-toggler"
                        data-toggle-class="app-sidebar-collapsed"
                        data-dismiss-class="app-sidebar-toggled"
                        data-toggle-target=".app"
                    >
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>
                </div>

                {/* Mobile Sidebar Toggle */}
                <div className="mobile-toggler">
                    <button
                        type="button"
                        className="menu-toggler"
                        data-toggle-class="app-sidebar-mobile-toggled"
                        data-toggle-target=".app"
                    >
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>
                </div>

                {/* Brand */}
                <div className="brand">
                    <a href="/dashboard" className="brand-logo">
                        <span className="brand-img">
                            <span className="brand-img-text text-theme">2</span>
                        </span>
                        <span className="brand-text">2:22</span>
                    </a>
                </div>

                {/* Right Menu */}
                <div className="menu">

                    {/* Notifications */}
                    <div className="menu-item dropdown dropdown-mobile-full">
                        <a
                            href="#"
                            className="menu-link"
                            data-bs-toggle="dropdown"
                            data-bs-display="static"
                        >
                            <div className="menu-icon">
                                <i className="bi bi-bell nav-icon"></i>
                            </div>
                            <div className="menu-badge bg-theme"></div>
                        </a>

                        <div className="dropdown-menu dropdown-menu-end mt-1 w-300px fs-11px">
                            <h6 className="dropdown-header fs-10px">
                                SYSTEM EVENTS
                            </h6>
                            <div className="dropdown-divider"></div>
                            <div className="px-3 py-2 small text-body text-opacity-75">
                                DFIR system events will appear here.
                            </div>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="menu-item dropdown dropdown-mobile-full">
                        <a
                            href="#"
                            className="menu-link"
                            data-bs-toggle="dropdown"
                            data-bs-display="static"
                        >
                            <div className="menu-img online">
                                <img
                                    src="/assets/img/profile/no-profile.png"
                                    alt="Profile"
                                    height="60"
                                />
                            </div>
                        </a>

                        <div className="dropdown-menu dropdown-menu-end me-lg-3 fs-11px">
                            <Link href="/profile" className="menu-link">
                                Profile
                                <i className="bi bi-gear ms-auto text-theme fs-16px"></i>
                            </Link>
                            <button
                                className="dropdown-item d-flex align-items-center"
                                onClick={openLogoutModal}
                            >
                                Logout
                                <i className="bi bi-box-arrow-right ms-auto text-theme fs-16px"></i>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            {/* ================== END HEADER ================== */}

            {/* ================== LOGOUT MODAL ================== */}
            <div className="modal fade" id="logoutModal" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">
                                End Session
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={closeLogoutModal}
                            ></button>
                        </div>

                        <div className="modal-body">
                            <p className="text-body text-opacity-75 mb-0">
                                You are about to terminate your authenticated 2:22 session.
                                Active background jobs will continue to run, but you will need
                                to re-authenticate to view results.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={closeLogoutModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-outline-theme"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>

                        {/* HUD Card Arrows */}
                        <div className="card-arrow">
                            <div className="card-arrow-top-left"></div>
                            <div className="card-arrow-top-right"></div>
                            <div className="card-arrow-bottom-left"></div>
                            <div className="card-arrow-bottom-right"></div>
                        </div>

                    </div>
                </div>
            </div>
            {/* ================== END MODAL ================== */}
        </>
    );
}
