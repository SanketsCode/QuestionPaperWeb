import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldAlert } from "lucide-react";

export default function SourcesPage() {
  const sources = [
    {
      name: "Staff Selection Commission (SSC)",
      url: "https://ssc.gov.in",
      description:
        "Official portal for SSC exams including CGL, CHSL, MTS, and others.",
    },
    {
      name: "Railway Recruitment Board (RRB)",
      url: "https://indianrailways.gov.in",
      description:
        "Centralized portal for Indian Railways recruitment notifications.",
    },
    {
      name: "RRB Mumbai",
      url: "https://www.rrbmumbai.gov.in",
      description:
        "Official portal for Railway Recruitment Board, Mumbai region updates.",
    },
    {
      name: "Maharashtra Public Service Commission (MPSC)",
      url: "https://mpsc.gov.in",
      description:
        "Official portal for Maharashtra state civil services recruitment and exams.",
    },
    {
      name: "Maharashtra State Police (Police Bharti)",
      url: "https://mahapolice.gov.in",
      description:
        "Official recruitment portal for Maharashtra State Police constables and other ranks.",
    },
    {
      name: "Join Indian Army (Agniveer & Army GD)",
      url: "https://joinindianarmy.nic.in",
      description:
        "Official portal for Indian Army recruitment including Agniveer and regular commissions.",
    },
    {
      name: "Indian Air Force (AFCAT)",
      url: "https://afcat.cdac.in/AFCAT/",
      description:
        "Official portal for Air Force Common Admission Test and recruitment.",
    },
    {
      name: "Central Reserve Police Force (CRPF)",
      url: "https://crpf.gov.in",
      description: "Official portal for CRPF recruitment and notifications.",
    },
    {
      name: "National Career Service (NCS)",
      url: "https://www.ncs.gov.in",
      description:
        "A primary portal for various government job notifications and career services.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 font-[family-name:var(--font-sora)]">
              Information Sources & Disclaimer
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transparency is our priority. Below you will find the official
              sources of the exam information we track, along with important
              disclaimers regarding our service as an independent educational
              platform.
            </p>
          </div>

          {/* Disclaimer Alert */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg mb-12 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <ShieldAlert className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-800 mb-2">
                  OFFICIAL DISCLAIMER: NOT A GOVERNMENT ENTITY
                </h3>
                <div className="text-orange-700 space-y-3 font-medium">
                  <p>
                    <strong>Question Paper (Exam App)</strong> is an INDEPENDENT
                    educational platform created by a private entity.
                  </p>
                  <p>
                    <strong>IMPORTANT:</strong> This app is <strong>NOT</strong>{" "}
                    affiliated with, endorsed by, authorized by, or in any way
                    officially connected with any government entity, agency, or
                    department. We do not represent any government organization.
                  </p>
                  <p>
                    The exam dates, syllabus, and notifications referenced in
                    the app are collected from the publicly available official
                    government websites listed below strictly for students'
                    convenience.
                  </p>
                  <p>
                    <strong>
                      All mock tests, question banks, and practice materials are
                      independently created by our team for educational and
                      practice purposes only.
                    </strong>{" "}
                    Users are strongly advised to always verify exam
                    notifications and recruitment updates directly from the
                    respective official government websites.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sources List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-900 font-[family-name:var(--font-sora)]">
                Official Sources of Information
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                We track the following official government portals for syllabus
                and exam updates:
              </p>
            </div>

            <ul className="divide-y divide-gray-100">
              {sources.map((source, index) => (
                <li
                  key={index}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {source.name}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {source.description}
                      </p>
                      <code className="text-[10px] text-gray-400 block mt-1">
                        Source: {source.url}
                      </code>
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors sm:w-auto w-full justify-center"
                    >
                      Visit Official Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center mt-auto">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Question Paper App. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
