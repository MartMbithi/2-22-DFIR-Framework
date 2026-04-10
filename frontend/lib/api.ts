// 2:22 DFIR Framework — API Client

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

export function setToken(token: string) {
    localStorage.setItem('token', token);
}

export function clearToken() {
    localStorage.removeItem('token');
}

export function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = getToken();

    if (token && isTokenExpired(token)) {
        clearToken();
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error('Session expired');
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
        clearToken();
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    if (res.status === 204) return null;
    return res.json();
}

// File upload variant (no Content-Type header — browser sets multipart boundary)
export async function apiUpload(path: string, formData: FormData) {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (res.status === 401) {
        clearToken();
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
