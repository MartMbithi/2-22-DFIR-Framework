import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export const metadata = {
    title: 'Self-Hosted Deployment | 2:22 AI',
    description:
        'Self-hosted deployment guide for 2:22 AI Community Edition. Installation, configuration, and operational setup.',
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
                                Self-Hosted 2:22 AI (Community Edition)
                            </h1>

                            <p className="fs-18px text-body text-opacity-75">
                                2:22 AI Community Edition is a fully self-hosted, open-source
                                Digital Forensics and Incident Response platform. It is designed
                                for researchers, security teams, and organizations that require
                                full control over investigative data, infrastructure, and
                                operational workflows.
                            </p>

                            <p className="text-body text-opacity-75">
                                The platform runs entirely within your environment. There is no
                                telemetry, no external data transmission, and no vendor
                                dependency. AI-assisted analysis requires only user-supplied
                                OpenAI API keys and operates under analyst supervision.
                            </p>
                        </div>
                    </div>

                    {/* DEPLOYMENT OVERVIEW */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="fw-semibold mb-2">
                                        Deployment Overview
                                    </h5>

                                    <p className="text-body text-opacity-75 small mb-0">
                                        2:22 AI is composed of a FastAPI-based backend, a Next.js
                                        frontend, and supporting services such as databases and
                                        object storage. Components can be deployed on a single host
                                        for research use or distributed across infrastructure for
                                        operational environments.
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
                                        title="Clone the Repository"
                                        code={`git clone https://github.com/MartMbithi/DFIR_AI.git
cd DFIR_AI`}
                                    />
                                </div>

                                <div className="col-lg-12">
                                    <StepCard
                                        number="02"
                                        title="Backend Setup (FastAPI)"
                                        code={`cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn backend.main:app`}
                                    />
                                </div>

                                <div className="col-lg-12">
                                    <StepCard
                                        number="03"
                                        title="Frontend Setup (Next.js)"
                                        code={`cd frontend
npm install
npm run dev`}
                                    />
                                </div>

                                <div className="col-lg-12">
                                    <StepCard
                                        number="04"
                                        title="Environment Configuration"
                                        desc="Configure environment variables for database connections, storage backends, secrets, and API endpoints according to your infrastructure. Ensure OpenAI API keys are supplied explicitly by the user if AI-assisted analysis is enabled."
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
                                        2:22 AI does not enforce infrastructure choices. Operators
                                        are responsible for hardening hosts, securing credentials,
                                        managing backups, and validating compliance with internal
                                        policies and regulatory requirements. The platform is
                                        designed to support — not replace — established DFIR
                                        governance practices.
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
