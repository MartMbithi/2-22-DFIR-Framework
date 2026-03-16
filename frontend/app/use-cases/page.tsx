import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export const metadata = {
    title: 'Use Cases | 2:22 AI',
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
                                2:22 AI Use Cases
                            </h1>

                            <p className="fs-18px text-body text-opacity-75">
                                2:22 AI supports real-world digital forensic and incident
                                response investigations conducted by security operations
                                teams, government agencies, and regulated organizations.
                                Each use case reflects defensible investigative workflows,
                                not automated black-box decisions.
                            </p>
                        </div>
                    </div>

                    {/* PRIMARY USE CASES */}
                    <div className="row justify-content-center g-4 mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <div className="row g-4">

                                <div className="col-lg-4">
                                    <UseCaseCard
                                        title="Incident Response Operations"
                                        description="Manage end-to-end incident response activities from detection and triage through containment, eradication, and recovery while maintaining forensic defensibility."
                                        points={[
                                            'Structured case lifecycle management',
                                            'Analyst-attributed actions and decisions',
                                            'Immutable audit trails',
                                            'Evidence-aware task tracking',
                                        ]}
                                    />
                                </div>

                                <div className="col-lg-4">
                                    <UseCaseCard
                                        title="Ransomware & Intrusion Analysis"
                                        description="Reconstruct ransomware intrusions by identifying initial access, privilege escalation, lateral movement, persistence mechanisms, and impact across hosts."
                                        points={[
                                            'Kill-chain reconstruction',
                                            'Multi-host timeline correlation',
                                            'Artifact-level attribution',
                                            'Support for legal and executive reporting',
                                        ]}
                                    />
                                </div>

                                <div className="col-lg-4">
                                    <UseCaseCard
                                        title="Insider Threat Investigations"
                                        description="Investigate malicious or negligent insider activity by correlating authentication events, file access, endpoint artifacts, and timeline evidence."
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
                                        description="Support investigations required by regulatory and legal frameworks such as ISO 27001, PCI DSS, HIPAA, and internal audit mandates with full evidentiary transparency."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <SimpleUseCase
                                        title="Threat Hunting & Proactive Analysis"
                                        description="Conduct hypothesis-driven threat hunting across logs, endpoints, and telemetry sources. AI accelerates pattern discovery while analysts retain full control."
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
