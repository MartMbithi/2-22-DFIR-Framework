'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import AppSidebar from '@/components/AppSidebar'
import AppTopBar from '@/components/AppTopBar'
import { apiFetch } from '@/lib/api'


/* ================= TYPES ================= */

type Organization = {
    organization_id: string
    organization_name: string
}

type User = {
    user_id: string
    email: string
}

/* ================= PAGE ================= */

export default function UsersPage() {

    const [organization, setOrganization] = useState<Organization | null>(null)
    const [me, setMe] = useState<User | null>(null)

    const [open, setOpen] = useState(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [saving, setSaving] = useState(false)

    /* ================= LOAD ================= */

    async function load() {

        const [org, current] = await Promise.all([
            apiFetch('/organizations/me'),
            apiFetch('/users/me')
        ])

        setOrganization(org)
        setMe(current)
    }

    useEffect(() => {
        load()
    }, [])

    /* ================= CREATE USER ================= */

    async function createUser(e: React.FormEvent) {

        e.preventDefault()

        if (!organization) return

        setSaving(true)

        try {

            await apiFetch('/users/', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    organization_id: organization.organization_id
                })
            })

            setEmail('')
            setPassword('')
            setOpen(false)

            alert('User created successfully')

        } catch (err) {

            console.error(err)
            alert('Failed to create user')

        } finally {

            setSaving(false)

        }
    }

    return (

        <AuthGuard>

            <div id="app" className="app app-sidebar-fixed">

                <AppSidebar />
                <AppTopBar />

                <div id="content" className="app-content">

                    <div className="container-fluid">

                        {/* HEADER */}

                        <div className="row mb-3">

                            <div className="col">

                                <h1>Users</h1>

                                <p className="text-body text-opacity-75 small">

                                    Manage users belonging to your organization

                                </p>

                            </div>

                            <div className="col-auto">

                                <button
                                    className="btn btn-outline-theme btn-sm"
                                    onClick={() => setOpen(true)}
                                >
                                    Add User
                                </button>

                            </div>

                        </div>

                        {/* ORGANIZATION */}

                        {organization && (

                            <div className="card mb-4">

                                <div className="card-body">

                                    <h5>Organization</h5>

                                    <p className="mb-0 small">

                                        {organization.organization_name}

                                    </p>

                                </div>

                                <HudArrows />

                            </div>

                        )}

                        {/* CURRENT USER */}

                        {me && (

                            <div className="card">

                                <div className="card-body">

                                    <h5>Current User</h5>

                                    <div className="small">

                                        <div>User ID: {me.user_id}</div>
                                        <div>Email: {me.email}</div>

                                    </div>

                                </div>

                                <HudArrows />

                            </div>

                        )}

                    </div>

                </div>

            </div>

            {/* ================= CREATE USER MODAL ================= */}

            {open && (

                <div className="modal fade show d-block">

                    <div className="modal-dialog modal-dialog-centered">

                        <div className="modal-content">

                            <form onSubmit={createUser}>

                                <div className="modal-header">

                                    <h5 className="modal-title">
                                        Create User
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setOpen(false)}
                                    />

                                </div>

                                <div className="modal-body">

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />

                                    </div>

                                    <div>

                                        <label className="form-label">
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            className="form-control"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />

                                    </div>

                                </div>

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="btn btn-outline-theme"
                                        disabled={saving}
                                    >
                                        {saving ? 'Creating…' : 'Create User'}
                                    </button>

                                </div>

                            </form>

                            <HudArrows />

                        </div>

                    </div>

                </div>

            )}

        </AuthGuard>
    )
}

/* ================= HUD ================= */

function HudArrows() {

    return (

        <div className="card-arrow">

            <div className="card-arrow-top-left"></div>
            <div className="card-arrow-top-right"></div>
            <div className="card-arrow-bottom-left"></div>
            <div className="card-arrow-bottom-right"></div>

        </div>

    )

}