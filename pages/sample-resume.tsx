import { useRef } from "react";

export default function SampleResume() {
  const resumeRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!resumeRef.current) return;

    // Get the HTML of the resume
    const html = resumeRef.current.innerHTML;

    // Call API route
    const response = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) {
      alert("Failed to generate PDF");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <button
        onClick={downloadPDF}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download as PDF (Puppeteer)
      </button>

      {/* Resume Content */}
      <div
        ref={resumeRef}
        className="max-w-4xl mx-auto bg-white shadow-lg p-8 border"
      >
        <h1 className="text-3xl font-bold">MARTHA CHEN</h1>
        <p className="text-gray-600 mb-6">
          Results-driven Marketing Professional
        </p>

        <h2 className="text-xl font-semibold text-blue-700 mb-2">
          Professional Summary
        </h2>
        <p className="mb-6">
          Experienced marketing professional with proven success in driving
          growth and brand visibility...
        </p>

        <h2 className="text-xl font-semibold text-blue-700 mb-2">
          Work Experience
        </h2>
        <ul className="list-disc pl-5 mb-6">
          <li>
            Senior Marketing Specialist at Innovate Marketing Solutions —
            increased lead generation by 25%.
          </li>
          <li>
            Marketing Coordinator at Growth Dynamics — boosted engagement by
            30%.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-blue-700 mb-2">Skills</h2>
        <ul className="list-disc pl-5 mb-6">
          <li>SEO & SEM</li>
          <li>Social Media Marketing</li>
          <li>Google Analytics</li>
          <li>Email Campaigns</li>
        </ul>

        <h2 className="text-xl font-semibold text-blue-700 mb-2">Education</h2>
        <p className="mb-2">
          Master’s in Marketing — New York University (2019)
        </p>
        <p>Bachelor’s in Communications — UCLA (2017)</p>
      </div>
    </div>
  );
}
