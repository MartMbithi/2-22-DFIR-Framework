'use client';
import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppSidebar from '@/components/AppSidebar';
import AppTopBar from '@/components/AppTopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AuthGuard>
            <div id="app" className="app app-sidebar-fixed">
                <AppTopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <AppSidebar show={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div id="content" className="app-content fade-in">
                    <div className="container-fluid p-3 p-lg-4">
                        {children}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
