'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div id="header" className="app-header navbar navbar-expand-lg p-0">
      <div className="container-xxl px-3 px-lg-5">

        {/* Hamburger */}
        <button
          className="navbar-toggler border-0 p-0 me-3 fs-24px shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="h-2px w-25px bg-gray-500 d-block mb-1"></span>
          <span className="h-2px w-25px bg-gray-500 d-block"></span>
        </button>

        {/* Brand */}
        <Link
          href="/"
          className="navbar-brand d-flex align-items-center position-relative me-auto brand px-0 w-auto"
        >
          <span className="brand-logo d-flex">
            <span className="brand-img">
              <span className="brand-img-text text-theme">D</span>
            </span>
            <span className="brand-text">2:22 AI</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="navbar-nav ms-auto mb-2 mb-lg-0 text-uppercase small fw-semibold">

            <div className="nav-item me-2">
              <Link
                href="/"
                className={`nav-link link-body-emphasis ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
            </div>

            <div className="nav-item me-2">
              <Link
                href="/platform"
                className={`nav-link link-body-emphasis ${isActive('/platform') ? 'active' : ''}`}
              >
                Platform
              </Link>
            </div>

            <div className="nav-item me-2">
              <Link
                href="/use-cases"
                className={`nav-link link-body-emphasis ${isActive('/use-cases') ? 'active' : ''}`}
              >
                Use Cases
              </Link>
            </div>

            <div className="nav-item me-2">
              <Link
                href="/research"
                className={`nav-link link-body-emphasis ${isActive('/research') ? 'active' : ''}`}
              >
                Research
              </Link>
            </div>

            <div className="nav-item me-2">
              <Link
                href="/compliance"
                className={`nav-link link-body-emphasis ${isActive('/compliance') ? 'active' : ''}`}
              >
                Compliance
              </Link>
            </div>

            <div className="nav-item me-2">
              <Link
                href="/self-hosted"
                className={`nav-link link-body-emphasis ${isActive('/self-hosted') ? 'active' : ''}`}
              >
                Self-Hosted
              </Link>
            </div>

            <div className="nav-item me-2">
              <Link
                href="/docs"
                className={`nav-link link-body-emphasis ${isActive('/docs') ? 'active' : ''}`}
              >
                Docs
              </Link>
            </div>

            <div className="nav-item me-2">
              <Link
                href="/login"
                className={`nav-link link-body-emphasis ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
