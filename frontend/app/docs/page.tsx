import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Documentation | 2:22 AI',
    description:
        'Comprehensive technical documentation for 2:22 AI covering architecture, workflows, security, AI usage, and self-hosted deployment.',
};

export default function Docs() {
    return (
        <>
            {/* HUD HEADER */}
            <Nav />

            {/* BEGIN CONTENT */}
            <div
                className="py-5 bg-body bg-opacity-50"
                data-bs-theme="dark"
            >
                <div className="container-xxl p-3 p-lg-5">

                    {/* PAGE HEADER */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <h1 className="display-6 fw-bold mb-3">
                                2:22 AI Documentation
                            </h1>

                            <p className="fs-18px text-body text-opacity-75">
                                This document provides a complete technical overview of 2:22 AI,
                                an open-source, self-hosted Digital Forensics and Incident Response
                                platform. It is intended for security analysts, forensic
                                practitioners, engineers, auditors, and reviewers who require
                                a clear understanding of the system’s design, operation, and
                                trust model.
                            </p>
                        </div>
                    </div>

                    {/* SECTION: SYSTEM OVERVIEW */}
                    <DocSection
                        title="1. System Overview"
                        content={
                            <>
                                <p>
                                    2:22 AI is designed to support evidence-driven digital
                                    investigations conducted in enterprise, government, and
                                    regulated environments. The platform unifies case management,
                                    evidence handling, timeline reconstruction, and report
                                    generation into a single investigation environment.
                                </p>

                                <p>
                                    Unlike opaque or autonomous security platforms, 2:22 AI
                                    explicitly preserves analyst control. All analytical outputs
                                    are explainable, traceable to source artifacts, and subject to
                                    investigator validation.
                                </p>
                            </>
                        }
                    />

                    {/* SECTION: ARCHITECTURE */}
                    <DocSection
                        title="2. Platform Architecture"
                        content={
                            <>
                                <p>
                                    2:22 AI follows a modular architecture consisting of a
                                    FastAPI-based backend, a Next.js frontend, and supporting
                                    services such as databases and object storage.
                                </p>

                                <ul>
                                    <li>Frontend: Investigation console and analyst interface</li>
                                    <li>Backend: Case logic, evidence processing, audit logging</li>
                                    <li>Storage: Evidence artifacts, metadata, and reports</li>
                                    <li>AI Layer: Optional, analyst-triggered analytical assistance</li>
                                </ul>

                                <p>
                                    Components may be deployed on a single host for research or
                                    distributed across infrastructure for operational use.
                                </p>
                            </>
                        }
                    />

                    {/* SECTION: INVESTIGATION WORKFLOW */}
                    <DocSection
                        title="3. Investigation Workflow"
                        content={
                            <>
                                <p>
                                    Investigations in 2:22 AI follow a structured lifecycle
                                    designed to preserve forensic integrity:
                                </p>

                                <ol>
                                    <li>Case creation and scope definition</li>
                                    <li>Evidence ingestion and cryptographic hashing</li>
                                    <li>Timeline reconstruction and correlation</li>
                                    <li>Analyst annotation and validation</li>
                                    <li>Report generation and export</li>
                                </ol>

                                <p>
                                    Every analyst action is attributable and auditable, supporting
                                    internal review, regulatory oversight, and legal scrutiny.
                                </p>
                            </>
                        }
                    />

                    {/* SECTION: EVIDENCE & CHAIN OF CUSTODY */}
                    <DocSection
                        title="4. Evidence Handling & Chain of Custody"
                        content={
                            <>
                                <p>
                                    Evidence is cryptographically hashed at ingestion and tracked
                                    throughout its lifecycle. 2:22 AI maintains custody metadata
                                    including timestamps, analyst actions, and access history.
                                </p>

                                <p>
                                    Evidence records are immutable by design. Any transformation
                                    or derived artifact is traceable back to its original source.
                                </p>
                            </>
                        }
                    />

                    {/* SECTION: AI USAGE */}
                    <DocSection
                        title="5. AI-Assisted Analysis Model"
                        content={
                            <>
                                <p>
                                    2:22 AI integrates AI strictly as an analytical assistant.
                                    Capabilities include summarization, correlation support, and
                                    draft report generation.
                                </p>

                                <p>
                                    AI is never autonomous. Outputs require explicit analyst
                                    initiation and validation. The platform does not retain data
                                    externally and requires user-supplied OpenAI API keys.
                                </p>
                            </>
                        }
                    />

                    {/* SECTION: SECURITY & TRUST */}
                    <DocSection
                        title="6. Security, Compliance, and Trust Model"
                        content={
                            <>
                                <p>
                                    2:22 AI is fully self-hosted and open-source. There is no
                                    telemetry, vendor data collection, or hidden processing.
                                </p>

                                <p>
                                    The platform supports compliance-aligned investigations under
                                    frameworks such as ISO/IEC 27001, SOC 2, and CJIS-style security
                                    expectations through access control, audit logging, and
                                    evidentiary rigor.
                                </p>
                            </>
                        }
                    />

                    {/* SECTION: DEPLOYMENT */}
                    <DocSection
                        title="7. Deployment & Operations"
                        content={
                            <>
                                <p>
                                    2:22 AI Community Edition is deployed by cloning the source
                                    repository and running the backend and frontend services.
                                    Operators are responsible for infrastructure hardening,
                                    credential management, and backups.
                                </p>

                                <p>
                                    The platform is designed to integrate into existing DFIR
                                    governance models rather than replace them.
                                </p>
                            </>
                        }
                    />

                    {/* SECTION: LIMITATIONS */}
                    <DocSection
                        title="8. Scope & Limitations"
                        content={
                            <>
                                <p>
                                    2:22 AI does not perform automated incident response actions,
                                    autonomous threat blocking, or unsupervised decision-making.
                                </p>

                                <p>
                                    The platform is a decision-support system for investigators,
                                    not a replacement for professional judgement or established
                                    forensic procedures.
                                </p>
                            </>
                        }
                    />

                    {/* SECTION: CONCLUSION */}
                    <DocSection
                        title="9. Summary"
                        content={
                            <>
                                <p>
                                    2:22 AI provides a transparent, analyst-controlled platform for
                                    conducting defensible digital forensic and incident response
                                    investigations. Its design prioritizes integrity, auditability,
                                    and operational trust over automation hype.
                                </p>
                            </>
                        }
                    />

                </div>
            </div>
            {/* END CONTENT */}

            {/* HUD FOOTER */}
            <Footer />
        </>
    );
}

/* ================== DOCUMENTATION SECTION ================== */

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
