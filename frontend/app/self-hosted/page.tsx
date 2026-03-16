import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export const metadata = {
    title: 'Self-Hosted Deployment | 2:22 DFIR Framework',
    description:
        'Self-hosted deployment guide for the 2:22 DFIR Framework Community Edition.',
};

export default function SelfHosted() {
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
                                Self-Hosted 2:22 DFIR Framework
                            </h1>

                            <p className="fs-18px text-body text-opacity-75">
                                The <strong>2:22 DFIR Framework Community Edition</strong>
                                is a fully self-hosted, open-source digital forensic and
                                incident response platform. It enables organizations,
                                research institutions, and security teams to operate
                                forensic investigation infrastructure entirely within
                                their own environment.
                            </p>

                            <p className="text-body text-opacity-75">
                                The framework runs locally using the <strong>2:22 Command
                                    Center Trigger</strong>, which orchestrates backend
                                services, frontend applications, environment validation,
                                and system diagnostics. There is no telemetry, no external
                                data transmission, and no vendor dependency.
                            </p>
                        </div>
                    </div>

                    {/* DEPLOYMENT OVERVIEW */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="fw-semibold mb-2">
                                        Deployment Architecture
                                    </h5>

                                    <p className="text-body text-opacity-75 small mb-0">
                                        The framework consists of a FastAPI backend,
                                        a Next.js investigation interface, and the DFIR
                                        core analysis engine. The system is orchestrated
                                        through the 2:22 Command Center Trigger which
                                        prepares runtime environments, verifies
                                        dependencies, performs diagnostics, and launches
                                        platform services.
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

                    {/* INSTALLATION STEPS */}
                    <div className="row justify-content-center g-4 mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <div className="row g-4">

                                <div className="col-lg-12">
                                    <StepCard
                                        number="01"
                                        title="Clone the Framework Repository"
                                        code={`git clone https://github.com/MartMbithi/2-22-DFIR-Framework.git && cd 2-22-DFIR-Framework`}
                                    />
                                </div>

                                <div className="col-lg-12">
                                    <StepCard
                                        number="02"
                                        title="Configure Environment Variables"
                                        desc="Create a .env configuration file defining database credentials, API endpoints, and optional AI configuration. The Command Center Trigger automatically loads these variables during startup."
                                    />
                                </div>

                                <div className="col-lg-12">
                                    <StepCard
                                        number="03"
                                        title="Launch the 2:22 Command Center"
                                        code={`python trigger_222_command_center.py`}
                                    />
                                </div>

                                <div className="col-lg-12">
                                    <StepCard
                                        number="04"
                                        title="Platform Initialization"
                                        desc="The Command Center performs automated system checks including Python and Node verification, dependency installation, environment validation, database connectivity, ingestion diagnostics, and backend/frontend startup."
                                    />
                                </div>

                                <div className="col-lg-12">
                                    <StepCard
                                        number="05"
                                        title="Access the Investigation Console"
                                        code={`Frontend: http://localhost:3000
Backend API: http://localhost:8000/docs`}
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* OPERATIONAL NOTES */}
                    <div className="row justify-content-center">
                        <div className="col-xl-10 col-lg-11">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="fw-semibold mb-2">
                                        Operational Considerations
                                    </h5>

                                    <p className="text-body text-opacity-75 small mb-0">
                                        The 2:22 DFIR Framework does not impose
                                        infrastructure constraints. Operators remain
                                        responsible for host hardening, credential
                                        management, system backups, and compliance with
                                        organizational security policies. The framework
                                        is designed to augment existing DFIR governance
                                        practices rather than replace them.
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

/* ================== HUD STEP CARD ================== */

function StepCard({
    number,
    title,
    code,
    desc,
}: {
    number: string;
    title: string;
    code?: string;
    desc?: string;
}) {
    return (
        <div className="card h-100">
            <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                    <span className="fw-bold text-theme me-3">{number}</span>
                    <h5 className="fw-semibold mb-0">{title}</h5>
                </div>

                {code && (
                    <pre className="bg-body bg-opacity-50 rounded p-3 small overflow-x-auto mb-0">
                        <code>{code}</code>
                    </pre>
                )}

                {desc && (
                    <p className="text-body text-opacity-75 small mb-0">
                        {desc}
                    </p>
                )}
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