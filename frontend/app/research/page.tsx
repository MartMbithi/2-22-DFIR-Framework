import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Research | 2:22 AI',
    description:
        'Technical research, methodologies, and insights on digital forensics and incident response.',
};

export default function Research() {
    return (
        <>
            {/* BEGIN #app */}
            {/* HUD HEADER */}
            <Nav />

            {/* BEGIN #content */}
            <div className="py-5 bg-body bg-opacity-50" data-bs-theme="dark">
                <div className="container-xxl p-3 p-lg-5">

                    {/* PAGE HEADER */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <h1 className="display-6 fw-bold mb-3">
                                Research & Technical Insights
                            </h1>

                            <p className="fs-18px text-body text-opacity-75">
                                2:22 AI research focuses on advancing digital forensics and
                                incident response through applied machine learning, structured
                                investigative methodologies, and evidence-centric system design.
                                The research emphasizes defensibility, transparency, and
                                analyst-controlled automation.
                            </p>
                        </div>
                    </div>

                    {/* RESEARCH AREAS */}
                    <div className="row justify-content-center g-4 mb-5">
                        <div className="col-xl-10 col-lg-11">
                            <div className="row g-4">

                                <div className="col-lg-6">
                                    <ResearchCard
                                        title="AI-Assisted Timeline Reconstruction"
                                        desc="Techniques for correlating logs, endpoint telemetry, file system activity, memory artifacts, and network events into defensible investigation timelines. Research emphasizes explainability, analyst validation, and evidentiary traceability."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ResearchCard
                                        title="Forensic Integrity in Automated Systems"
                                        desc="Design patterns and architectural controls that preserve chain-of-custody, evidentiary integrity, and repeatability while introducing automation and AI-assisted workflows into forensic investigations."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ResearchCard
                                        title="Incident Response in Regulated Environments"
                                        desc="Balancing speed, rigor, and compliance when conducting investigations under frameworks such as ISO 27001, PCI DSS, HIPAA, and sector-specific regulatory obligations."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ResearchCard
                                        title="Operationalizing DFIR at Scale"
                                        desc="Lessons learned from large-scale investigations, multi-case environments, and distributed forensic operations. Focus areas include access control, evidence isolation, analyst accountability, and performance under load."
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* RESEARCH PHILOSOPHY */}
                    <div className="row justify-content-center">
                        <div className="col-xl-10 col-lg-11">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="fw-semibold mb-2">
                                        Research Philosophy
                                    </h5>

                                    <p className="text-body text-opacity-75 small mb-0">
                                        2:22 AI research avoids opaque or autonomous decision-making
                                        systems. All analytical capabilities are designed to augment
                                        — not replace — investigator reasoning. Research outputs
                                        prioritize transparency, reproducibility, and alignment with
                                        legal and regulatory expectations.
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
                {/* END container */}

            </div>
            {/* END #content */}

            {/* HUD FOOTER */}
            <Footer />
        </>
    );
}

/* ================== HUD CARD ================== */

function ResearchCard({
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
