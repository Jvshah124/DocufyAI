// pages/dashboard.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaFileAlt,
  FaFileInvoiceDollar,
  FaEnvelopeOpenText,
  FaUserCircle,
  FaPlus,
} from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();
  const [docs] = useState([
    { title: "Jane Doe", date: "Sep 20, 11:49 AM", type: "resume" },
    { title: "INVOICE", date: "Sep 18, 04:06 PM", type: "invoice" },
    { title: "Jordan Miller", date: "Aug 18, 02:50 PM", type: "resume" },
    {
      title: "Software Engineer Cover Letter",
      date: "Aug 18, 02:34 PM",
      type: "cover_letter",
    },
  ]);

  const [openMenu, setOpenMenu] = useState(false);
  const [input, setInput] = useState("");

  const routeForType = (type: string) => {
    if (type === "resume") return "/resume-template";
    if (type === "invoice") return "/invoice-template";
    if (type === "cover_letter") return "/cover-letter";
    return "/";
  };

  // 🟢 Smart navigation based on input
  const handleCreate = () => {
    if (!input.trim()) return;

    const text = input.toLowerCase();
    let path = "/";
    if (text.includes("resume")) path = "/resume-template";
    else if (text.includes("invoice")) path = "/invoice-template";
    else if (text.includes("cover")) path = "/cover-letter";

    router.push({
      pathname: path,
      query: { prompt: input },
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 text-xl font-bold text-blue-600">DocufyAI</div>

        {/* New Document with dropdown */}
        <div className="relative mx-4 mb-4">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md"
          >
            <FaPlus /> New Document
          </button>
          {openMenu && (
            <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
              <Link
                href="/resume-template"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpenMenu(false)}
              >
                Resume
              </Link>
              <Link
                href="/invoice-template"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpenMenu(false)}
              >
                Invoice
              </Link>
              <Link
                href="/cover-letter"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpenMenu(false)}
              >
                Cover Letter
              </Link>
            </div>
          )}
        </div>

        {/* Recent docs (clickable) */}
        <div className="flex-1 overflow-y-auto">
          {docs.map((doc, i) => (
            <Link
              key={i}
              href={routeForType(doc.type)}
              className="block px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="text-sm font-medium">{doc.title}</div>
              <div className="text-xs text-gray-500">{doc.date}</div>
            </Link>
          ))}
        </div>

        {/* User profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <FaUserCircle className="text-3xl text-gray-500" />
          <div>
            <div className="text-sm font-medium">you@example.com</div>
            <div className="text-xs text-gray-500">Free Plan</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Input box */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <textarea
            placeholder="Ask anything, create anything... (e.g. 'create a resume for a software engineer')"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-transparent outline-none resize-none text-gray-800 dark:text-gray-200"
          />
          <div className="mt-2 text-right">
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Create Document
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/resume-template">
            <Card
              icon={<FaFileAlt className="text-green-500 text-2xl" />}
              title="Modern Resume"
              desc="Design a modern, ATS-friendly resume"
            />
          </Link>
          <Link href="/invoice-template">
            <Card
              icon={<FaFileInvoiceDollar className="text-blue-500 text-2xl" />}
              title="Professional Invoice"
              desc="Generate professional invoices for clients"
            />
          </Link>
          <Link href="/cover-letter">
            <Card
              icon={<FaEnvelopeOpenText className="text-purple-500 text-2xl" />}
              title="Cover Letter"
              desc="Write a compelling cover letter instantly"
            />
          </Link>
        </div>

        {/* Testimonials */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">What our users say</h3>
          <p className="text-gray-600 dark:text-gray-400">
            ⭐⭐⭐⭐⭐ “This tool saved me hours! The AI-generated resume landed
            me interviews immediately.”
          </p>
        </div>
      </main>
    </div>
  );
}

function Card({
  icon,
  title,
  desc,
}: {
  icon: JSX.Element;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
      <div className="mb-3">{icon}</div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );
}
