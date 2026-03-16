import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Research | 2:22 DFIR Framework',
    description:
        'Technical research, methodologies, and investigative insights supporting the 2:22 DFIR Framework.',
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
                                Research & Technical Foundations
                            </h1>

                            <p className="fs-18px text-body text-opacity-75">
                                Research supporting the <strong>2:22 DFIR Framework </strong>
                                focuses on advancing digital forensic and incident response
                                methodologies through applied machine learning, structured
                                investigative models, and evidence-centric system design.
                                The research emphasizes forensic defensibility, transparency,
                                and analyst-controlled automation within modern cyber
                                investigation environments.
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
                                        desc="Research focuses on techniques for correlating logs, endpoint telemetry, file system artifacts, memory evidence, and network events into defensible investigative timelines. Emphasis is placed on explainability, analyst validation, and evidentiary traceability."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ResearchCard
                                        title="Forensic Integrity in Automated Systems"
                                        desc="This research area explores architectural design patterns that preserve chain-of-custody, evidentiary integrity, and repeatability while introducing automation and AI-assisted analytical workflows into digital forensic investigations."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ResearchCard
                                        title="Incident Response in Regulated Environments"
                                        desc="Research examines the balance between investigative speed, procedural rigor, and regulatory compliance when conducting digital investigations within frameworks such as ISO 27001, PCI DSS, HIPAA, and sector-specific governance requirements."
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <ResearchCard
                                        title="Operationalizing DFIR at Scale"
                                        desc="This area investigates the operational challenges of conducting large-scale digital forensic investigations across multiple cases, distributed infrastructure, and cross-organizational investigative teams."
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
                                        Research associated with the 2:22 DFIR Framework
                                        avoids opaque or autonomous decision-making
                                        systems. Analytical capabilities are designed to
                                        augment investigator reasoning rather than replace
                                        it. Research outputs prioritize transparency,
                                        reproducibility, and alignment with legal,
                                        evidentiary, and regulatory expectations that
                                        govern modern digital investigations.
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