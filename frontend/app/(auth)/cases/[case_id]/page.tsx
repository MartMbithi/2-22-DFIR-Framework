/*
 *   Crafted On Fri Jan 30 2026
 *   Devlan Solutions LTD — 2:22 AI
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import AppSidebar from '@/components/AppSidebar'
import AppTopBar from '@/components/AppTopBar'
import { apiFetch } from '@/lib/api'

/* ================= TYPES ================= */

type Case = {
    case_id: string
    case_name: string
    case_description?: string
}

type Upload = {
    upload_id: string
    upload_filename: string
    upload_size: number
    uploaded_at: string
}

type Artifact = {
    artifact_id: string
    artifact_type?: string
    ingested_at: string
}

type Report = {
    report_id: string
    report_type: string
    report_generated_at: string
}

type Job = {
    job_id: string
    case_id: string
    job_type: string
    job_status: 'queued' | 'running' | 'completed' | 'failed'
    job_progress?: string | null
    created_at: string
    started_at?: string | null
    completed_at?: string | null
}

type JobProgress = {
    percent?: number
    message?: string
}

type JobStage = {
    stage: string
    status: 'pending' | 'running' | 'completed'
}

/* ================= CONFIG ================= */

const PAGE_SIZE = 6
const POLL_INTERVAL = 4000

/* ================= PAGE ================= */

export default function CaseDetailPage() {

    const { case_id } = useParams<{ case_id: string }>()

    const [caseData, setCaseData] = useState<Case | null>(null)
    const [uploads, setUploads] = useState<Upload[]>([])
    const [artifacts, setArtifacts] = useState<Artifact[]>([])
    const [jobs, setJobs] = useState<Job[]>([])

    const [jobProgress, setJobProgress] = useState<Record<string, JobProgress>>({})
    const [jobStages, setJobStages] = useState<Record<string, JobStage[]>>({})

    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const [uploadOpen, setUploadOpen] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<Upload | null>(null)
    const [deleting, setDeleting] = useState(false)

    /* ================= LOAD ================= */

    async function loadBase() {

        const [c, u, j, r, a] = await Promise.all([
            apiFetch(`/cases/${case_id}`),
            apiFetch(`/cases/${case_id}/uploads`),
            apiFetch(`/jobs?case_id=${case_id}`),
            apiFetch(`/reports/case/${case_id}`),
            apiFetch(`/artifacts/artifacts?case_id=${case_id}`)
        ])

        const enriched = j.map((job: Job) => ({
            ...job,
            reports: r.filter(
                (rep: Report) =>
                    new Date(rep.report_generated_at) >= new Date(job.created_at)
            )
        }))

        setCaseData(c)
        setUploads(u)
        setJobs(enriched)
        setArtifacts(a)
    }

    useEffect(() => {
        loadBase()
    }, [])

    /* ================= POLLING ================= */

    useEffect(() => {

        const interval = setInterval(async () => {

            try {

                const refreshed = await apiFetch(`/jobs?case_id=${case_id}`)
                setJobs(refreshed)

                for (const job of refreshed) {

                    try {

                        const progress = await apiFetch(`/jobs/${job.job_id}/progress`)
                        const stages = await apiFetch(`/jobs/${job.job_id}/stages`)

                        setJobProgress(prev => ({
                            ...prev,
                            [job.job_id]: progress
                        }))

                        setJobStages(prev => ({
                            ...prev,
                            [job.job_id]: stages
                        }))

                    } catch { }

                }

            } catch { }

        }, POLL_INTERVAL)

        return () => clearInterval(interval)

    }, [case_id])

    /* ================= FILTER ================= */

    const filteredUploads = useMemo(() => {

        const q = search.toLowerCase()

        return uploads.filter(u =>
            u.upload_filename.toLowerCase().includes(q)
        )

    }, [uploads, search])

    const pageUploads = filteredUploads.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    )

    /* ================= REPORT DOWNLOAD ================= */

    async function downloadReport(reportId: string) {

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/${reportId}/download`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        )

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = `dfir-report-${reportId}.pdf`
        a.click()

        window.URL.revokeObjectURL(url)
    }

    /* ================= UPLOAD ================= */

    async function uploadFiles(e: React.FormEvent) {

        e.preventDefault()

        if (!files.length) return

        setUploading(true)

        try {

            for (const file of files) {

                const form = new FormData()
                form.append('file', file)

                await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/cases/${case_id}/artifacts/upload`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        },
                        body: form
                    }
                )
            }

            setFiles([])
            setUploadOpen(false)
            loadBase()

        } finally {
            setUploading(false)
        }
    }

    /* ================= DELETE ================= */

    async function confirmDeleteUpload() {

        if (!deleteTarget) return

        setDeleting(true)

        try {

            await apiFetch(`/cases/uploads/${deleteTarget.upload_id}`, {
                method: 'DELETE'
            })

            setUploads(prev =>
                prev.filter(u => u.upload_id !== deleteTarget.upload_id)
            )

            setDeleteTarget(null)

        } finally {
            setDeleting(false)
        }
    }

    /* ================= QUEUE JOB ================= */

    async function queueJob() {

        await apiFetch('/jobs/', {
            method: 'POST',
            body: JSON.stringify({
                case_id,
                job_type: 'dfir_run'
            })
        })

        loadBase()
    }

    if (!caseData) return <div className="p-5">Loading case context…</div>

    return (

        <AuthGuard>

            <div id="app" className="app app-sidebar-fixed">

                <AppSidebar />
                <AppTopBar />

                <div id="content" className="app-content">

                    <div className="container-fluid">

                        {/* HEADER */}

                        <div className="row mb-4">

                            <div className="col">

                                <h1>{caseData.case_name}</h1>

                                <p className="text-body text-opacity-75 small">
                                    {caseData.case_description || 'No description provided'}
                                </p>

                            </div>

                        </div>

                        <div className="row g-4">

                            {/* UPLOADS */}

                            <div className="col-lg-8">

                                <div className="card h-100">

                                    <div className="card-body">

                                        <div className="d-flex justify-content-between mb-3">

                                            <input
                                                className="form-control form-control-sm w-50"
                                                placeholder="Search uploads"
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                            />

                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={queueJob}
                                            >
                                                Run DFIR
                                            </button>

                                        </div>

                                        <table className="table table-hover small">

                                            <thead>
                                                <tr>
                                                    <th>File</th>
                                                    <th>Size</th>
                                                    <th>Uploaded</th>
                                                    <th></th>
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {pageUploads.map(u => (

                                                    <tr key={u.upload_id}>

                                                        <td>{u.upload_filename}</td>

                                                        <td>
                                                            {(u.upload_size / 1024).toFixed(1)} KB
                                                        </td>

                                                        <td>
                                                            {new Date(u.uploaded_at).toLocaleString()}
                                                        </td>

                                                        <td>

                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => setDeleteTarget(u)}
                                                            >
                                                                Delete
                                                            </button>

                                                        </td>

                                                    </tr>

                                                ))}

                                            </tbody>

                                        </table>

                                    </div>

                                    <HudArrows />

                                </div>

                            </div>

                            {/* JOBS */}

                            <div className="col-lg-4">

                                <div className="card h-100">

                                    <div className="card-body">

                                        <h5>DFIR Jobs</h5>

                                        {jobs.map(job => (

                                            <div key={job.job_id} className="border rounded p-3 mb-3">

                                                <div className="font-monospace small mb-1">
                                                    {job.job_id}
                                                </div>

                                                <div className="small mb-2">
                                                    Status: {job.job_status}
                                                </div>

                                                {jobProgress[job.job_id]?.percent && (

                                                    <div className="progress mb-2">

                                                        <div
                                                            className="progress-bar"
                                                            style={{
                                                                width: `${jobProgress[job.job_id].percent}%`
                                                            }}
                                                        />

                                                    </div>

                                                )}

                                                {jobStages[job.job_id] && (

                                                    <div className="small">

                                                        {jobStages[job.job_id].map(stage => (

                                                            <div
                                                                key={stage.stage}
                                                                className="d-flex justify-content-between"
                                                            >

                                                                <span>{stage.stage}</span>

                                                                <span>{stage.status}</span>

                                                            </div>

                                                        ))}

                                                    </div>

                                                )}

                                            </div>

                                        ))}

                                    </div>

                                    <HudArrows />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

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