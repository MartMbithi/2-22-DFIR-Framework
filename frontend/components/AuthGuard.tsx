'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, clearToken } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    useEffect(() => {
        const token = getToken();
        if (!token || isTokenExpired(token)) {
            clearToken();
            router.replace('/login');
        }
    }, [router]);
    return <>{children}</>;
}
