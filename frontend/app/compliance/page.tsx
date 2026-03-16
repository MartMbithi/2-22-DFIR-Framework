import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Compliance & Trust | 2:22 DFIR Framework',
    description:
        'Compliance principles, governance alignment, and forensic integrity controls supported by the 2:22 DFIR Framework.',
};

export default function Compliance() {
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
                                Compliance & Trust
                            </h1>

                            <p className="fs-18px text-body text-opacity-75">
                                The <strong>2:22 DFIR Framework</strong> is designed to
                                support cyber investigations conducted within regulated
                                and high-assurance environments. Security governance,
                                auditability, and evidentiary integrity are integrated
                                directly into the framework architecture to ensure that
                                investigative workflows remain defensible, transparent,
                                and aligned with modern compliance expectations.
                            </p>
                        </div>
                    </div>

                    {/* COMPLIANCE AREAS */}
                    <div className="row justify-content-center g-4 mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <div className="row g-4">

                                <div className="col-lg-6">
                                    <ComplianceCard
                                        title="ISO/IEC 27001 Alignment"
                                        desc="The framework supports investigative environments aligned with ISO/IEC 27001 information security management principles, including controlled access to investigative data, operational logging, traceability, and secure evidence handling."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ComplianceCard
                                        title="SOC 2 Governance Principles"
                                        desc="The platform architecture supports SOC 2 Trust Service Criteria by implementing role-based access controls, operational transparency, audit logging, and controlled access to sensitive investigative artifacts."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ComplianceCard
                                        title="Government & Law Enforcement Controls"
                                        desc="The framework incorporates access restriction, activity auditing, and evidence governance patterns commonly expected in government and law enforcement investigative environments."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ComplianceCard
                                        title="Forensic Chain of Custody"
                                        desc="Evidence handling workflows preserve integrity, traceability, and accountability from artifact ingestion through analysis and reporting, ensuring investigations remain court-admissible and regulator-ready."
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* TRUST STATEMENT */}
                    <div className="row justify-content-center">
                        <div className="col-xl-10 col-lg-11">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="fw-semibold mb-2">
                                        Trust & Transparency Model
                                    </h5>

                                    <p className="text-body text-opacity-75 small mb-0">
                                        The 2:22 DFIR Framework operates as a fully
                                        self-hosted and transparent investigation
                                        environment. There is no vendor telemetry,
                                        no external transmission of investigative data,
                                        and no opaque analytical processes. Organizations
                                        retain full control over investigative evidence,
                                        infrastructure, and analytical workflows at all
                                        stages of the investigation lifecycle.
                                    </p>
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
            {/* END CONTENT */}

            {/* HUD FOOTER */}
            <Footer />
        </>
    );
}

/* ================== HUD CARD ================== */

function ComplianceCard({
    title,
    desc,
}: {
    title: string;
    desc: string;
}) {
    return (
        <div className="card h-100">
            <div className="card-body">
                <h5 className="fw-semibold mb-2">{title}</h5>
                <p className="text-body text-opacity-75 small mb-0">
                    {desc}
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