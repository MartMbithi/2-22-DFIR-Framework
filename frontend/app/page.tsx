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
                Digital Forensics &<br />
                Incident Response<br />
                <span className="text-theme">Powered by AI</span>
              </h1>

              <p className="fs-18px text-body text-opacity-75 mb-4">
                2:22 AI is a self-hosted, open-source Digital Forensics and Incident
                Response platform built to support security analysts, incident
                responders, and investigators conducting evidence-driven
                investigations in enterprise and regulated environments.
              </p>

              <p className="text-body text-opacity-75">
                The platform augments established DFIR methodologies with
                AI-assisted correlation, timeline reconstruction, and report
                generation while preserving forensic integrity, analyst control,
                and evidentiary admissibility. 2:22 AI does not transmit data
                externally and operates entirely within the user’s infrastructure,
                requiring only user-supplied OpenAI API keys.
              </p>

              <div className="mt-4 mb-4">
                <a href="/docs" className="btn btn-lg btn-outline-theme me-2">
                  Documentation <i className="fa fa-arrow-right ms-2 opacity-5"></i>
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
                alt="2:22 AI Investigation Console"
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
            <h1 className="mb-3">Purpose & Design Philosophy</h1>
            <p className="fs-16px text-body text-opacity-50">
              2:22 AI was designed to address limitations in modern incident
              response tooling: fragmented workflows, excessive manual effort,
              and opaque vendor-controlled platforms.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <h4>Forensic Soundness</h4>
              <p>
                Every artifact processed by 2:22 AI is cryptographically hashed,
                time-aligned, and traceable throughout its lifecycle. The system
                enforces handling practices consistent with court-admissible and
                regulator-ready investigations.
              </p>
            </div>

            <div className="col-lg-4">
              <h4>Analyst-Centric AI</h4>
              <p>
                AI within 2:22 AI operates strictly as an analytical assistant.
                It accelerates correlation, summarization, and hypothesis
                generation while leaving interpretation and final judgement
                entirely to the investigator.
              </p>
            </div>

            <div className="col-lg-4">
              <h4>Open & Self-Hosted</h4>
              <p>
                2:22 AI is fully self-hosted and open-source. There is no telemetry,
                no data exfiltration, and no vendor lock-in. Organizations retain
                full visibility and control over their investigative workflows.
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
            <h1 className="mb-3">Core Capabilities</h1>
            <p className="fs-16px text-body text-opacity-50">
              2:22 AI provides an integrated environment supporting the full
              digital investigation lifecycle.
            </p>
          </div>

          <div className="row g-4">

            {/* CASE MANAGEMENT */}
            <div className="col-lg-3">
              <div className="card p-4 h-100">
                <h5>Case Management</h5>
                <p>
                  Structured case workflows with analyst notes, task tracking,
                  evidence references, and immutable audit logs.
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
                <h5>Timeline Reconstruction</h5>
                <p>
                  Multi-source forensic timelines across endpoints, logs,
                  memory artifacts, and network activity.
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
                <h5>Evidence Vault</h5>
                <p>
                  Centralized evidence storage with cryptographic integrity
                  verification and chain-of-custody tracking.
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
                <h5>Automated Reporting</h5>
                <p>
                  Generation of technical, executive, and legal-ready reports
                  directly from validated investigation data.
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
