'use client';

import Nav from '@/components/Nav';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      {/* ================== NAVIGATION ================== */}
      <Nav />

      {/* ================== BEGIN #home ================== */}
      <div
        id="home"
        className="py-5 position-relative bg-body bg-opacity-50"
        data-bs-theme="dark"
      >
        <div className="container-xxl p-3 p-lg-5">
          <div className="row align-items-center">

            {/* LEFT: CORE STATEMENT */}
            <div className="col-lg-6">
              <h1 className="display-6 fw-600 mb-3 mt-4">
                The 2:22 DFIR Framework<br />
                Digital Forensic Investigation<br />
                <span className="text-theme">Signal → Evidence → Truth</span>
              </h1>

              <p className="fs-18px text-body text-opacity-75 mb-4">
                The <strong>2:22 DFIR Framework</strong> is an autonomous digital
                forensic and incident response platform designed to support
                evidence-driven cyber investigations within modern information
                systems. The framework enables investigators to collect,
                correlate, and analyse digital artifacts while maintaining
                strict forensic integrity and evidentiary traceability.
              </p>

              <p className="text-body text-opacity-75">
                The platform integrates deterministic forensic analysis with
                AI-assisted investigative support. This hybrid approach improves
                the efficiency of cyber incident analysis while preserving
                analyst authority, evidentiary reliability, and investigative
                transparency throughout the investigation lifecycle.
              </p>

              <div className="mt-4 mb-4">
                <a href="/docs" className="btn btn-lg btn-outline-theme me-2">
                  Framework Documentation <i className="fa fa-arrow-right ms-2 opacity-5"></i>
                </a>

                <a href="/self-hosted" className="btn btn-lg btn-outline-white">
                  Self-Hosted Deployment
                </a>
              </div>
            </div>

            {/* RIGHT: VISUAL CONTEXT */}
            <div className="col-lg-6 d-none d-lg-block">
              <img
                src="/assets/img/landing/app_mockup.png"
                alt="2:22 DFIR Investigation Console"
                className="w-100 shadow-lg"
              />
            </div>

          </div>
        </div>
      </div>
      {/* ================== END #home ================== */}

      {/* ================== BEGIN #about ================== */}
      <div id="about" className="py-5 bg-component">
        <div className="container-xxl p-3 p-lg-5">

          <div className="text-center mb-5">
            <h1 className="mb-3">Framework Philosophy</h1>
            <p className="fs-16px text-body text-opacity-50">
              The 2:22 DFIR Framework addresses key challenges in cyber incident
              investigation by reducing investigative complexity, strengthening
              artifact correlation, and preserving forensic defensibility across
              the entire investigation lifecycle.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <h4>Forensic Integrity</h4>
              <p>
                All artifacts processed within the framework remain preserved
                in their original state, cryptographically verified, and fully
                traceable throughout the investigative workflow. This approach
                supports evidentiary reliability and enables regulator-ready and
                court-admissible investigations.
              </p>
            </div>

            <div className="col-lg-4">
              <h4>Analyst-Driven Intelligence</h4>
              <p>
                AI capabilities operate strictly as investigative assistance.
                The system accelerates correlation, summarization, and analytical
                reasoning while ensuring that interpretation and investigative
                judgement remain under the control of the analyst.
              </p>
            </div>

            <div className="col-lg-4">
              <h4>Open Investigation Architecture</h4>
              <p>
                The framework operates as a fully self-hosted investigation
                platform. Organizations retain complete control over their
                forensic evidence, investigative processes, and infrastructure
                without reliance on external vendor telemetry.
              </p>
            </div>
          </div>

        </div>
      </div>
      {/* ================== END #about ================== */}

      {/* ================== BEGIN #features ================== */}
      <div id="features" className="py-5">
        <div className="container-xxl p-3 p-lg-5">

          <div className="text-center mb-5">
            <h1 className="mb-3">Investigative Capabilities</h1>
            <p className="fs-16px text-body text-opacity-50">
              The framework provides an integrated environment supporting the
              full digital forensic investigation lifecycle.
            </p>
          </div>

          <div className="row g-4">

            {/* CASE MANAGEMENT */}
            <div className="col-lg-3">
              <div className="card p-4 h-100">
                <h5>Investigation Management</h5>
                <p>
                  Structured investigation workflows support case tracking,
                  analyst collaboration, evidence referencing, and immutable
                  audit logs for coordinated forensic investigations.
                </p>

                <div className="card-arrow">
                  <div className="card-arrow-top-left"></div>
                  <div className="card-arrow-top-right"></div>
                  <div className="card-arrow-bottom-left"></div>
                  <div className="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>

            {/* TIMELINE */}
            <div className="col-lg-3">
              <div className="card p-4 h-100">
                <h5>Event Timeline Reconstruction</h5>
                <p>
                  Automated reconstruction of multi-source forensic timelines
                  correlates system logs, endpoint artifacts, and network
                  activity into a unified investigative sequence.
                </p>

                <div className="card-arrow">
                  <div className="card-arrow-top-left"></div>
                  <div className="card-arrow-top-right"></div>
                  <div className="card-arrow-bottom-left"></div>
                  <div className="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>

            {/* EVIDENCE */}
            <div className="col-lg-3">
              <div className="card p-4 h-100">
                <h5>Digital Evidence Repository</h5>
                <p>
                  A centralized evidence repository provides cryptographic
                  integrity verification, artifact indexing, and
                  chain-of-custody preservation throughout investigations.
                </p>

                <div className="card-arrow">
                  <div className="card-arrow-top-left"></div>
                  <div className="card-arrow-top-right"></div>
                  <div className="card-arrow-bottom-left"></div>
                  <div className="card-arrow-bottom-right"></div>
                </div>
              </div>
            </div>

            {/* REPORTING */}
            <div className="col-lg-3">
              <div className="card p-4 h-100">
                <h5>Forensic Intelligence Reporting</h5>
                <p>
                  Automated reporting generates structured investigation
                  outputs including technical findings, chronological
                  timelines, and evidence-supported conclusions for
                  operational, executive, and legal audiences.
                </p>

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
      {/* ================== END #features ================== */}

      {/* ================== FOOTER ================== */}
      <Footer />
    </>
  );
}