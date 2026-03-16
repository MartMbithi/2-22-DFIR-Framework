import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export const metadata = {
    title: 'Platform | 2:22 DFIR Framework',
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
                            2:22 DFIR Framework Architecture
                        </h1>
                        <p className="fs-18px text-body text-opacity-75">
                            The <strong>2:22 DFIR Framework</strong> is a modular,
                            self-hosted digital forensic and incident response platform
                            designed to unify cyber investigation workflows, enforce
                            evidentiary integrity, and support investigators through
                            AI-assisted analytical capabilities while maintaining full
                            analyst control and organizational data ownership.
                        </p>
                    </div>

                    <hr className="my-4 opacity-25" />

                    {/* ================== CORE PRINCIPLES ================== */}
                    <div className="row g-4 mb-5">

                        <div className="col-lg-4">
                            <h4>Forensic Integrity by Design</h4>
                            <p>
                                Every subsystem within the framework preserves evidentiary
                                integrity throughout the investigation lifecycle. Artifacts
                                are cryptographically hashed at ingestion, timestamps are
                                normalized across heterogeneous data sources, and all
                                investigative transformations remain fully traceable to
                                support repeatability and evidentiary admissibility.
                            </p>
                        </div>

                        <div className="col-lg-4">
                            <h4>Analyst-Controlled Intelligence</h4>
                            <p>
                                AI capabilities operate strictly as analytical assistance.
                                The framework supports correlation, summarization, and
                                investigative reasoning while ensuring that interpretation
                                and investigative judgement remain under the control of the
                                investigator.
                            </p>
                        </div>

                        <div className="col-lg-4">
                            <h4>Self-Hosted & Auditable</h4>
                            <p>
                                The 2:22 DFIR Framework operates entirely within the
                                organization’s infrastructure. There is no vendor telemetry,
                                no external data transmission, and no hidden dependencies.
                                The platform remains open, transparent, and fully auditable.
                            </p>
                        </div>

                    </div>

                    {/* ================== PLATFORM MODULES ================== */}
                    <div className="text-center mb-5">
                        <h2 className="mb-3">Core Framework Components</h2>
                        <p className="fs-16px text-body text-opacity-50">
                            The framework integrates multiple investigative modules
                            designed to support the complete digital forensic and
                            cyber incident investigation lifecycle.
                        </p>
                    </div>

                    <div className="row g-4">

                        {/* CASE MANAGEMENT */}
                        <div className="col-lg-6">
                            <div className="card h-100">
                                <div className="card-body p-4">
                                    <h5>Investigation Management Engine</h5>
                                    <p className="text-body text-opacity-75">
                                        Structured investigation workflows allow analysts
                                        to manage incidents from initial detection through
                                        investigation closure. Each investigation maintains
                                        scoped evidence, analyst notes, investigative tasks,
                                        and timelines supported by immutable audit logs.
                                    </p>
                                    <ul className="text-body text-opacity-75">
                                        <li>Investigation-level access control</li>
                                        <li>Analyst activity auditing</li>
                                        <li>Investigation task coordination</li>
                                        <li>Evidence-to-investigation linkage</li>
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
                                    <h5>Digital Evidence Repository</h5>
                                    <p className="text-body text-opacity-75">
                                        The evidence repository maintains cryptographic
                                        integrity verification and custody tracking across
                                        all ingested artifacts including disk images, memory
                                        captures, system logs, and extracted metadata.
                                    </p>
                                    <ul className="text-body text-opacity-75">
                                        <li>SHA-256 hashing at ingestion</li>
                                        <li>Artifact custody timeline</li>
                                        <li>Immutable evidence records</li>
                                        <li>Integrity validation on access and export</li>
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
                                        The framework reconstructs unified investigative
                                        timelines across heterogeneous data sources,
                                        correlating file system activity, authentication
                                        logs, process execution, and network events.
                                    </p>
                                    <ul className="text-body text-opacity-75">
                                        <li>Multi-source timestamp normalization</li>
                                        <li>Kill-chain aligned investigation views</li>
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
                                    <h5>AI-Assisted Investigation Layer</h5>
                                    <p className="text-body text-opacity-75">
                                        AI capabilities assist investigators by accelerating
                                        analytical tasks such as log summarization, artifact
                                        correlation, and forensic narrative drafting while
                                        operating entirely under analyst supervision.
                                    </p>
                                    <ul className="text-body text-opacity-75">
                                        <li>User-supplied OpenAI API keys</li>
                                        <li>No telemetry or external data retention</li>
                                        <li>Explainable analytical outputs</li>
                                        <li>Analyst validation for all conclusions</li>
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
                                    <h5>Forensic Intelligence Reporting</h5>
                                    <p className="text-body text-opacity-75">
                                        The framework generates investigation reports directly
                                        from validated artifacts and reconstructed timelines.
                                        Reports support technical, executive, and legal
                                        audiences while preserving full evidentiary references.
                                    </p>
                                    <ul className="text-body text-opacity-75">
                                        <li>Court-ready evidence references</li>
                                        <li>Compliance-aligned report templates</li>
                                        <li>Integrated chain-of-custody documentation</li>
                                        <li>Export to PDF and structured investigation formats</li>
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