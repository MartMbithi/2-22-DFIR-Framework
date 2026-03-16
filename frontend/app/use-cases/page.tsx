import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export const metadata = {
    title: 'Use Cases | 2:22 DFIR Framework',
};

export default function UseCasesPage() {
    return (
        <>
            <Nav />
            <div className="py-5 bg-body bg-opacity-50" data-bs-theme="dark">
                <div className="container-xxl p-3 p-lg-5">

                    {/* PAGE HEADER */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <h1 className="display-6 fw-bold mb-3">
                                2:22 DFIR Framework Use Cases
                            </h1>

                            <p className="fs-18px text-body text-opacity-75">
                                The <strong>2:22 DFIR Framework</strong> supports
                                real-world digital forensic and cyber incident
                                investigations conducted by security operations teams,
                                government agencies, and regulated organizations.
                                Each use case reflects defensible investigative
                                workflows designed to support analyst-led decision
                                making rather than automated black-box conclusions.
                            </p>
                        </div>
                    </div>

                    {/* PRIMARY USE CASES */}
                    <div className="row justify-content-center g-4 mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <div className="row g-4">

                                <div className="col-lg-4">
                                    <UseCaseCard
                                        title="Incident Response Investigations"
                                        description="Support structured incident response investigations from initial detection and forensic triage through containment, remediation, and post-incident analysis while maintaining evidentiary traceability."
                                        points={[
                                            'Structured investigation lifecycle management',
                                            'Analyst-attributed investigative actions',
                                            'Immutable investigation audit trails',
                                            'Evidence-linked investigative tasks',
                                        ]}
                                    />
                                </div>

                                <div className="col-lg-4">
                                    <UseCaseCard
                                        title="Ransomware & Intrusion Investigations"
                                        description="Reconstruct complex cyber intrusions by identifying initial access vectors, privilege escalation, lateral movement, persistence mechanisms, and operational impact across affected systems."
                                        points={[
                                            'Cyber kill-chain reconstruction',
                                            'Cross-host timeline correlation',
                                            'Artifact-level attribution',
                                            'Evidence-supported executive reporting',
                                        ]}
                                    />
                                </div>

                                <div className="col-lg-4">
                                    <UseCaseCard
                                        title="Insider Threat Investigations"
                                        description="Investigate malicious or negligent insider activity by correlating authentication events, endpoint artifacts, file system activity, and investigative timelines across organizational systems."
                                        points={[
                                            'User-centric activity timelines',
                                            'Cross-system identity correlation',
                                            'Forensic-grade access reconstruction',
                                            'Privacy-aware investigative workflows',
                                        ]}
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* SECONDARY USE CASES */}
                    <div className="row justify-content-center g-4">
                        <div className="col-xl-10 col-lg-11">
                            <div className="row g-4">

                                <div className="col-lg-6">
                                    <SimpleUseCase
                                        title="Compliance & Regulatory Investigations"
                                        description="Support digital investigations required by regulatory and legal frameworks such as ISO 27001, PCI DSS, HIPAA, and internal governance mandates through structured evidence collection, traceability, and defensible reporting."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <SimpleUseCase
                                        title="Threat Hunting & Proactive Investigation"
                                        description="Enable hypothesis-driven threat hunting across logs, endpoint telemetry, and network data sources. AI-assisted analysis accelerates pattern discovery while investigators maintain full analytical control."
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
}

/* ---------- HUD Cards ---------- */

function UseCaseCard({
    title,
    description,
    points,
}: {
    title: string;
    description: string;
    points: string[];
}) {
    return (
        <div className="card h-100">
            <div className="card-body">
                <h5 className="fw-semibold mb-2">{title}</h5>
                <p className="text-body text-opacity-75 small">{description}</p>
                <ul className="small text-body text-opacity-75 mt-3 mb-0">
                    {points.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                </ul>
            </div>

            <div className="card-arrow">
                <div className="card-arrow-top-left"></div>
                <div className="card-arrow-top-right"></div>
                <div className="card-arrow-bottom-left"></div>
                <div className="card-arrow-bottom-right"></div>
            </div>
        </div>
    );
}

function SimpleUseCase({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="card h-100">
            <div className="card-body">
                <h5 className="fw-semibold mb-2">{title}</h5>
                <p className="text-body text-opacity-75 small mb-0">
                    {description}
                </p>
            </div>

            <div className="card-arrow">
                <div className="card-arrow-top-left"></div>
                <div className="card-arrow-top-right"></div>
                <div className="card-arrow-bottom-left"></div>
                <div className="card-arrow-bottom-right"></div>
            </div>
        </div>
    );
}