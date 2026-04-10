import Script from 'next/script';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: {
        default: '2:22 DFIR Framework | Makueni County Digital Forensics',
        template: '%s | 2:22 DFIR'
    },
    description: 'Automated Digital Forensic and Incident Response Platform for County Government Information Systems — Government of Makueni County, Kenya',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" data-bs-theme="dark">
            <head>
                <meta name="theme-color" content="#0f1a2e" />
                <link rel="stylesheet" href="/assets/css/vendor.min.css" />
                <link rel="stylesheet" href="/assets/css/app.min.css" />
            </head>
            <body>
                <div id="app" className="app">{children}</div>
                <Script src="/assets/js/vendor.min.js" strategy="afterInteractive" />
                <Script src="/assets/js/app.min.js" strategy="afterInteractive" />
            </body>
        </html>
    );
}
