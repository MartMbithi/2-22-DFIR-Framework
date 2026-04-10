'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { HudArrows } from '@/components/Nav';

type Case = { case_id: string; case_name: string };
type Artifact = { artifact_id: string; case_id: string; artifact_type: string; source_tool: string; content_summary: string; artifact_timestamp: string };

export default function ArtifactsPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [selectedCase, setSelectedCase] = useState<string>('');
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [summary, setSummary] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => { apiFetch('/cases/').then(setCases).catch(() => { }); }, []);

    useEffect(() => {
        if (!selectedCase) { setArtifacts([]); setSummary({}); return; }
        setLoading(true);
        Promise.all([
            apiFetch(`/artifacts/case/${selectedCase}?limit=200`),
            apiFetch(`/artifacts/case/${selectedCase}/summary`),
        ]).then(([arts, sum]) => {
            setArtifacts(arts);
            setSummary(sum.distribution || {});
        }).catch(() => { }).finally(() => setLoading(false));
    }, [selectedCase]);

    const sevColor = (type: string) => {
        if (type?.includes('web')) return 'badge-critical';
        if (type?.includes('auth')) return 'badge-high';
        if (type?.includes('process')) return 'badge-medium';
        return 'badge-low';
    };

    return (
        <DashboardLayout>
            <h1 className="h4 mb-3">Forensic Artifacts</h1>

            <div className="row mb-3">
                <div className="col-md-6">
                    <select className="form-select" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
                        <option value="">Select a case…</option>
                        {cases.map(c => <option key={c.case_id} value={c.case_id}>{c.case_name}</option>)}
                    </select>
                </div>
            </div>

            {selectedCase && Object.keys(summary).length > 0 && (
                <div className="row g-2 mb-3">
                    {Object.entries(summary).map(([type, count]) => (
                        <div className="col-auto" key={type}>
                            <span className={`badge ${sevColor(type)} fs-6`}>{type}: {count}</span>
                        </div>
                    ))}
                </div>
            )}

            {loading && <div className="text-center py-5"><div className="spinner-border text-theme" /></div>}

            {!loading && selectedCase && artifacts.length === 0 && (
                <p className="text-body text-opacity-50 small">No artifacts found for this case. Run an investigation first.</p>
            )}

            {artifacts.length > 0 && (
                <div className="card">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover table-borderless mb-0 small">
                                <thead className="text-body text-opacity-50">
                                    <tr>
                                        <th>Type</th>
                                        <th className="d-none d-md-table-cell">Source</th>
                                        <th>Summary</th>
                                        <th className="d-none d-lg-table-cell">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {artifacts.map(a => (
                                        <tr key={a.artifact_id}>
                                            <td><span className={`badge ${sevColor(a.artifact_type)}`}>{a.artifact_type}</span></td>
                                            <td className="d-none d-md-table-cell text-body text-opacity-50">{a.source_tool}</td>
                                            <td className="text-truncate" style={{ maxWidth: 400 }}>{a.content_summary}</td>
                                            <td className="d-none d-lg-table-cell text-body text-opacity-50 text-nowrap">
                                                {a.artifact_timestamp ? new Date(a.artifact_timestamp).toLocaleString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <HudArrows />
                </div>
            )}
        </DashboardLayout>
    );
}
