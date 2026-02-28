import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldAlert } from "lucide-react";

export default function SourcesPage() {
  const sources = [
    {
      name: "Railway Recruitment Board (RRB)",
      url: "https://indianrailways.gov.in/",
      description:
        "Official portal for Indian Railways recruitment and notifications.",
    },

    {
      name: "Staff Selection Commission (SSC)",
      url: "https://ssc.gov.in",
      description:
        "Official portal for Staff Selection Commission exams (CGL, CHSL, etc.).",
    },
    {
      name: "Maharashtra Public Service Commission (MPSC)",
      url: "https://mpsc.gov.in",
      description:
        "Official portal for Maharashtra state civil services exams.",
    },
    {
      name: "Indian Air Force (AFCAT)",
      url: "https://afcat.cdac.in/AFCAT/",
      description:
        "Official portal for Air Force Common Admission Test (AFCAT) notifications and recruitment.",
    },
    {
      name: "Join Indian Army (GD & Others)",
      url: "https://joinindianarmy.nic.in/default.aspx",
      description:
        "Official portal for Indian Army recruitment including General Duty (GD), Technical, and other posts.",
    },
    {
      name: "Indian Air Force (Agniveer & Others)",
      url: "https://indianairforce.nic.in/",
      description:
        "Official portal for Indian Air Force general recruitment and updates.",
    },
    {
      name: "Union Public Service Commission (UPSC)",
      url: "https://upsc.gov.in/",
      description:
        "Official portal for UPSC exams including NDA, CDS, Civil Services, and others.",
    },
    {
      name: "Maharashtra State Police",
      url: "https://mahapolice.gov.in/",
      description:
        "Official portal for Maharashtra State Police recruitment and notifications (Police Bharti).",
    },
    {
      name: "Railway Recruitment Board (RRB) Mumbai",
      url: "https://www.rrbmumbai.gov.in/",
      description:
        "Official portal for Railway Recruitment Board, Mumbai region.",
    },
    {
      name: "MyGov Portal",
      url: "https://www.mygov.in/",
      description: "Government of India's citizen engagement platform.",
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
              sources of the information we provide in our app, along with
              important disclaimers regarding our service.
            </p>
          </div>

          {/* Disclaimer Alert */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg mb-12 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  NOT A GOVERNMENT ENTITY
                </h3>
                <div className="text-red-700 space-y-3 font-medium">
                  <p>
                    <strong>Question Paper – Exam Prep App</strong> is an
                    independent educational platform created to help students
                    prepare for competitive exams.
                  </p>
                  <p>
                    This app is <strong>NOT</strong> affiliated with, endorsed
                    by, authorized by, or in any way officially connected with
                    any government entity, agency, or official organization.
                  </p>
                  <p>
                    We collect publicly available educational resources,
                    previous year question papers, and exam practice content
                    from official government portals (listed below) strictly for
                    educational purposes.
                  </p>
                  <p>
                    Users are strongly advised to always verify exam
                    notifications, results, and recruitment updates directly
                    from the respective official government websites.
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
