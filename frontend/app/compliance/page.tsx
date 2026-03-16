import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Compliance & Trust | 2:22 AI',
    description:
        'Compliance, security controls, and forensic integrity principles supported by 2:22 AI.',
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
                                2:22 AI is designed to support investigations conducted in
                                regulated and high-assurance environments. Security controls,
                                auditability, and evidentiary integrity are built into the
                                platform architecture rather than added as afterthoughts.
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
                                        desc="2:22 AI aligns with information security management principles reflected in ISO/IEC 27001, including risk-based controls, access management, auditability, and secure handling of investigative data."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ComplianceCard
                                        title="SOC 2 Readiness"
                                        desc="The platform architecture supports SOC 2 Trust Service Criteria, particularly security, availability, and confidentiality, through role-based access controls, logging, and operational transparency."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ComplianceCard
                                        title="CJIS-Style Security Controls"
                                        desc="2:22 AI implements access restriction, activity auditing, and evidence handling patterns consistent with CJIS-style security expectations, supporting sensitive law enforcement and government investigations."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ComplianceCard
                                        title="Forensic Chain of Custody"
                                        desc="Evidence handling workflows are designed to preserve integrity, traceability, and accountability from ingestion through analysis and reporting, supporting court-admissible and regulator-ready investigations."
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
                                        2:22 AI is fully self-hosted and open-source. There is no
                                        vendor telemetry, no external data transmission, and no
                                        opaque processing logic. Organizations retain full control
                                        over investigative data, infrastructure, and analytical
                                        workflows at all times.
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
