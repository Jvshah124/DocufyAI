// pages/index.tsx
import Link from "next/link";
import { useTheme } from "next-themes";
import { Typewriter } from "react-simple-typewriter";
import { useEffect, useState } from "react";
import {
  FaFileAlt,
  FaFileInvoiceDollar,
  FaEnvelopeOpenText,
} from "react-icons/fa";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-r from-purple-900 via-blue-900 to-black text-center">
      {/* Gradient animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-blue-900 to-black animate-gradient-x opacity-80" />

      {/* Dark mode toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-4 right-4 px-4 py-2 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-black shadow"
      >
        {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
      </button>

      {/* Hero Section */}
      <div className="relative z-10 px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
          Your AI Document Workspace
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-200 mb-10">
          Create stunning{" "}
          <span className="font-bold text-blue-400">
            <Typewriter
              words={["Resumes", "Invoices", "Cover Letters"]}
              loop={true}
              cursor
              cursorStyle="_"
              typeSpeed={90}
              deleteSpeed={50}
              delaySpeed={1500}
            />
          </span>
        </h2>

        {/* Card Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Resume Card */}
          <Link href="/resume-template">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 cursor-pointer transform hover:-translate-y-2 transition-all">
              <FaFileAlt className="text-5xl text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Build Resume
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Craft AI-powered resumes tailored to your profession in minutes.
              </p>
            </div>
          </Link>

          {/* Invoice Card */}
          <Link href="/invoice-template">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 cursor-pointer transform hover:-translate-y-2 transition-all">
              <FaFileInvoiceDollar className="text-5xl text-green-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Create Invoice
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Generate structured invoices instantly and professionally.
              </p>
            </div>
          </Link>

          {/* Cover Letter Card */}
          <Link href="/cover-letter">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 cursor-pointer transform hover:-translate-y-2 transition-all">
              <FaEnvelopeOpenText className="text-5xl text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Write Cover Letter
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Generate personalized cover letters tailored to each job.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Keyframes for gradient animation */}
      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 10s ease infinite;
        }
      `}</style>
    </div>
  );
}
