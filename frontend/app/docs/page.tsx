import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Documentation | 2:22 DFIR Framework',
    description:
        'Technical documentation for the 2:22 DFIR Framework covering architecture, investigation workflows, forensic integrity, and deployment.',
};

export default function Docs() {
    return (
        <>
            <Nav />

            <div
                className="py-5 bg-body bg-opacity-50"
                data-bs-theme="dark"
            >
                <div className="container-xxl p-3 p-lg-5">

                    {/* PAGE HEADER */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <h1 className="display-6 fw-bold mb-3">
                                2:22 DFIR Framework Documentation
                            </h1>

                            <p className="fs-18px text-body text-opacity-75">
                                This documentation provides a technical overview of the
                                <strong> 2:22 Digital Forensic and Incident Response Framework</strong>.
                                The framework is an open-source, self-hosted investigation
                                platform designed to support evidence-driven cyber incident
                                analysis within enterprise, government, and regulated environments.
                            </p>
                        </div>
                    </div>

                    {/* SYSTEM OVERVIEW */}
                    <DocSection
                        title="1. Framework Overview"
                        content={
                            <>
                                <p>
                                    The 2:22 DFIR Framework provides a unified environment
                                    for conducting digital forensic investigations. The system
                                    integrates artifact ingestion, forensic normalization,
                                    hybrid triage analysis, intelligence correlation, and
                                    structured report generation.
                                </p>

                                <p>
                                    The framework prioritizes investigator control and
                                    evidentiary defensibility. Analytical automation assists
                                    investigators but never replaces human judgement.
                                </p>
                            </>
                        }
                    />

                    {/* ARCHITECTURE */}
                    <DocSection
                        title="2. System Architecture"
                        content={
                            <>
                                <p>
                                    The framework follows a layered architecture separating
                                    the investigation engine from the orchestration layer
                                    responsible for user interaction and case management.
                                </p>

                                <ul>
                                    <li>Frontend: Next.js investigation console</li>
                                    <li>Backend: FastAPI SaaS orchestration layer</li>
                                    <li>DFIR Engine: forensic ingestion, normalization, triage</li>
                                    <li>Database: investigation artifacts and case records</li>
                                    <li>Reporting: automated forensic intelligence reports</li>
                                </ul>

                                <p>
                                    This separation ensures that forensic processing remains
                                    deterministic and reproducible regardless of the user
                                    interface or orchestration components.
                                </p>
                            </>
                        }
                    />

                    {/* INVESTIGATION WORKFLOW */}
                    <DocSection
                        title="3. Investigation Lifecycle"
                        content={
                            <>
                                <p>
                                    Investigations conducted within the framework follow a
                                    structured lifecycle designed to preserve forensic integrity.
                                </p>

                                <ol>
                                    <li>Case creation and investigation scope definition</li>
                                    <li>Artifact ingestion and cryptographic hashing</li>
                                    <li>Indicator normalization and enrichment</li>
                                    <li>Hybrid triage scoring and artifact prioritization</li>
                                    <li>Investigator review and annotation</li>
                                    <li>Automated forensic intelligence report generation</li>
                                </ol>

                                <p>
                                    All investigative actions are attributable and auditable,
                                    supporting internal review, compliance oversight, and
                                    legal defensibility.
                                </p>
                            </>
                        }
                    />

                    {/* EVIDENCE HANDLING */}
                    <DocSection
                        title="4. Evidence Integrity & Chain of Custody"
                        content={
                            <>
                                <p>
                                    Digital artifacts are cryptographically hashed at
                                    ingestion to preserve evidentiary integrity. Metadata
                                    associated with artifacts includes timestamps, origin
                                    information, analyst actions, and processing history.
                                </p>

                                <p>
                                    Derived artifacts remain traceable to their original
                                    evidence source, ensuring transparency and auditability
                                    throughout the investigation lifecycle.
                                </p>
                            </>
                        }
                    />

                    {/* TRIAGE ENGINE */}
                    <DocSection
                        title="5. Hybrid Forensic Analysis Engine"
                        content={
                            <>
                                <p>
                                    The 2:22 DFIR Framework utilizes a hybrid analysis model
                                    combining deterministic forensic rules with semantic
                                    reasoning techniques.
                                </p>

                                <ul>
                                    <li>Deterministic rule-based artifact detection</li>
                                    <li>Semantic correlation using embedding similarity</li>
                                    <li>Hybrid triage scoring model</li>
                                    <li>Investigator-controlled prioritization</li>
                                </ul>

                                <p>
                                    This approach improves analytical efficiency while
                                    preserving forensic defensibility and investigative
                                    transparency.
                                </p>
                            </>
                        }
                    />

                    {/* AI MODEL */}
                    <DocSection
                        title="6. AI-Assisted Narrative Generation"
                        content={
                            <>
                                <p>
                                    Optional AI-assisted capabilities are used exclusively
                                    for generating investigative narratives and summarizing
                                    forensic findings.
                                </p>

                                <p>
                                    AI systems do not influence artifact scoring or evidence
                                    prioritization. All analytical outputs remain subject to
                                    investigator validation before inclusion in reports.
                                </p>
                            </>
                        }
                    />

                    {/* DEPLOYMENT */}
                    <DocSection
                        title="7. Deployment & Command Center Trigger"
                        content={
                            <>
                                <p>
                                    The framework is deployed using the 2:22 Command Center
                                    Trigger which prepares runtime environments, verifies
                                    dependencies, performs system diagnostics, and launches
                                    backend and frontend services.
                                </p>

                                <p>
                                    The trigger performs automated checks including:
                                </p>

                                <ul>
                                    <li>Python and Node environment validation</li>
                                    <li>Dependency installation</li>
                                    <li>Database connectivity verification</li>
                                    <li>DFIR engine self-tests</li>
                                    <li>Ingestion pipeline diagnostics</li>
                                    <li>Backend and frontend startup</li>
                                </ul>
                            </>
                        }
                    />

                    {/* SECURITY MODEL */}
                    <DocSection
                        title="8. Security & Trust Model"
                        content={
                            <>
                                <p>
                                    The 2:22 DFIR Framework operates as a fully self-hosted
                                    investigation environment. There is no vendor telemetry
                                    and no external transmission of investigative data.
                                </p>

                                <p>
                                    Organizations retain full control over forensic artifacts,
                                    infrastructure, and analytical workflows.
                                </p>
                            </>
                        }
                    />

                    {/* SUMMARY */}
                    <DocSection
                        title="9. Summary"
                        content={
                            <>
                                <p>
                                    The 2:22 DFIR Framework provides a transparent,
                                    investigator-controlled platform for conducting
                                    defensible digital forensic investigations.
                                </p>

                                <p>
                                    By combining deterministic forensic analysis,
                                    semantic reasoning techniques, and automated
                                    reporting capabilities, the framework enables
                                    organizations to investigate cyber incidents
                                    efficiently while maintaining evidentiary integrity.
                                </p>
                            </>
                        }
                    />

                </div>
            </div>

            <Footer />
        </>
    );
}

/* DOCUMENTATION SECTION */

function DocSection({
    title,
    content,
}: {
    title: string;
    content: React.ReactNode;
}) {
    return (
        <div className="row justify-content-center mb-4">
            <div className="col-xl-10 col-lg-11">
                <div className="card">
                    <div className="card-body">
                        <h5 className="fw-semibold mb-2">{title}</h5>
                        <div className="text-body text-opacity-75 small">
                            {content}
                        </div>
                    </div>

                    <div className="card-arrow">
                        <div className="card-arrow-top-left"></div>
                        <div className="card-arrow-top-right"></div>
                        <div className="card-arrow-bottom-left"></div>
                        <div className="card-arrow-bottom-right"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}