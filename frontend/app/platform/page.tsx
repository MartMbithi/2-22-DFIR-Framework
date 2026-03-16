import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export const metadata = {
    title: 'Platform | 2:22 AI',
};

export default function Platform() {
    return (
        <>
            {/* ================== NAVIGATION ================== */}
            <Nav />

            {/* ================== PLATFORM OVERVIEW ================== */}
            <div className="py-5 bg-body bg-opacity-50" data-bs-theme="dark">
                <div className="container-xxl p-3 p-lg-5">

                    {/* HEADER */}
                    <div className="mb-5">
                        <h1 className="display-6 fw-600 mb-3">
                            2:22 AI Platform Architecture
                        </h1>
                        <p className="fs-18px text-body text-opacity-75">
                            2:22 AI is a modular, self-hosted Digital Forensics and Incident
                            Response platform designed to unify investigation workflows,
                            enforce evidentiary integrity, and accelerate analytical tasks
                            using AI — without compromising analyst control or data ownership.
                        </p>
                    </div>

                    <hr className="my-4 opacity-25" />

                    {/* ================== CORE PRINCIPLES ================== */}
                    <div className="row g-4 mb-5">

                        <div className="col-lg-4">
                            <h4>Forensic Soundness by Design</h4>
                            <p>
                                Every subsystem within 2:22 AI is built to preserve evidentiary
                                integrity. Artifacts are cryptographically hashed at ingestion,
                                timestamps are normalized, and all transformations are recorded
                                to ensure repeatability and admissibility.
                            </p>
                        </div>

                        <div className="col-lg-4">
                            <h4>Analyst-Controlled Intelligence</h4>
                            <p>
                                AI within 2:22 AI operates strictly as an analytical assistant.
                                It performs correlation, summarization, and hypothesis support,
                                but never replaces analyst judgement or performs autonomous
                                decision-making.
                            </p>
                        </div>

                        <div className="col-lg-4">
                            <h4>Self-Hosted & Auditable</h4>
                            <p>
                                2:22 AI runs entirely within the organization’s infrastructure.
                                There is no vendor telemetry, no data exfiltration, and no hidden
                                dependencies. The platform is open-source and fully auditable.
                            </p>
                        </div>

                    </div>

                    {/* ================== PLATFORM MODULES ================== */}
                    <div className="text-center mb-5">
                        <h2 className="mb-3">Core Platform Components</h2>
                        <p className="fs-16px text-body text-opacity-50">
                            2:22 AI is composed of tightly integrated modules that support the
                            complete incident response and forensic investigation lifecycle.
                        </p>
                    </div>

                    <div className="row g-4">

                        {/* CASE MANAGEMENT */}
                        <div className="col-lg-6">
                            <div className="card h-100">
                                <div className="card-body p-4">
                                    <h5>Case Management Engine</h5>
                                    <p className="text-body text-opacity-75">
                                        Structured case workflows allow investigators to manage
                                        incidents from initial detection through closure. Each case
                                        maintains scoped evidence, analyst notes, tasks, and
                                        timelines with immutable audit logs.
                                    </p>
                                    <ul className="text-body text-opacity-75">
                                        <li>Case-level access control</li>
                                        <li>Analyst activity auditing</li>
                                        <li>Investigation task tracking</li>
                                        <li>Evidence-to-case binding</li>
                                    </ul>
                                </div>

                                <div className="card-arrow">
                                    <div className="card-arrow-top-left"></div>
                                    <div className="card-arrow-top-right"></div>
                                    <div className="card-arrow-bottom-left"></div>
                                    <div className="card-arrow-bottom-right"></div>
                                </div>
                            </div>
                        </div>

                        {/* EVIDENCE VAULT */}
                        <div className="col-lg-6">
                            <div className="card h-100">
                                <div className="card-body p-4">
                                    <h5>Evidence Vault & Chain of Custody</h5>
                                    <p className="text-body text-opacity-75">
                                        The Evidence Vault enforces cryptographic integrity and
                                        custody tracking across all ingested artifacts, including
                                        disk images, memory captures, logs, and extracted metadata.
                                    </p>
                                    <ul className="text-body text-opacity-75">
                                        <li>SHA-256 hashing at ingestion</li>
                                        <li>Custody timeline per artifact</li>
                                        <li>Immutable evidence records</li>
                                        <li>Validation on access and export</li>
                                    </ul>
                                </div>

                                <div className="card-arrow">
                                    <div className="card-arrow-top-left"></div>
                                    <div className="card-arrow-top-right"></div>
                                    <div className="card-arrow-bottom-left"></div>
                                    <div className="card-arrow-bottom-right"></div>
                                </div>
                            </div>
                        </div>

                        {/* TIMELINE ENGINE */}
                        <div className="col-lg-6">
                            <div className="card h-100">
                                <div className="card-body p-4">
                                    <h5>Timeline Reconstruction Engine</h5>
                                    <p className="text-body text-opacity-75">
                                        2:22 AI reconstructs unified timelines across heterogeneous
                                        data sources, correlating file system activity, logs,
                                        process execution, and network events.
                                    </p>
                                    <ul className="text-body text-opacity-75">
                                        <li>Multi-source timestamp normalization</li>
                                        <li>Kill-chain aligned views</li>
                                        <li>Event correlation and clustering</li>
                                        <li>Analyst-annotated timelines</li>
                                    </ul>
                                </div>

                                <div className="card-arrow">
                                    <div className="card-arrow-top-left"></div>
                                    <div className="card-arrow-top-right"></div>
                                    <div className="card-arrow-bottom-left"></div>
                                    <div className="card-arrow-bottom-right"></div>
                                </div>
                            </div>
                        </div>

                        {/* AI ANALYSIS */}
                        <div className="col-lg-6">
                            <div className="card h-100">
                                <div className="card-body p-4">
                                    <h5>AI-Assisted Analysis Layer</h5>
                                    <p className="text-body text-opacity-75">
                                        AI capabilities accelerate investigative tasks such as log
                                        summarization, artifact correlation, and report drafting,
                                        while operating entirely under analyst supervision.
                                    </p>
                                    <ul className="text-body text-opacity-75">
                                        <li>User-supplied OpenAI API keys</li>
                                        <li>No data retention or telemetry</li>
                                        <li>Explainable analytical outputs</li>
                                        <li>Analyst validation required</li>
                                    </ul>
                                </div>

                                <div className="card-arrow">
                                    <div className="card-arrow-top-left"></div>
                                    <div className="card-arrow-top-right"></div>
                                    <div className="card-arrow-bottom-left"></div>
                                    <div className="card-arrow-bottom-right"></div>
                                </div>
                            </div>
                        </div>

                        {/* REPORTING */}
                        <div className="col-lg-12">
                            <div className="card h-100">
                                <div className="card-body p-4">
                                    <h5>Reporting & Compliance Outputs</h5>
                                    <p className="text-body text-opacity-75">
                                        2:22 AI generates investigation reports directly from
                                        validated evidence and timelines. Reports are structured to
                                        support technical, executive, and legal audiences.
                                    </p>
                                    <ul className="text-body text-opacity-75">
                                        <li>Court-ready evidence references</li>
                                        <li>Compliance-aligned report templates</li>
                                        <li>Chain-of-custody inclusion</li>
                                        <li>Export to PDF and structured formats</li>
                                    </ul>
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
                </div>
            </div>

            {/* ================== FOOTER ================== */}
            <Footer />
        </>
    );
}
