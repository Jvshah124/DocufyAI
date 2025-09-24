// pages/index.tsx
import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Typewriter } from "react-simple-typewriter";
import { useEffect, useState } from "react";
import { FaMagic, FaFilePdf, FaCloud } from "react-icons/fa";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden bg-gradient-to-r from-purple-900 via-blue-900 to-black text-center">
      {/* Gradient animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-blue-900 to-black animate-gradient-x opacity-80" />

      {/* Branding */}
      <div className="absolute top-4 left-6 text-2xl font-extrabold text-white">
        <span className="text-purple-400">Docufy</span>
        <span className="text-blue-400">AI</span>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-4 right-4 px-4 py-2 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-black shadow"
      >
        {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
      </button>

      {/* Hero Section */}
      <div className="relative z-10 px-6 mt-20 md:mt-28">
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

        {/* CTA */}
        <Link
          href="/auth"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          ✨ Get Started
        </Link>

        {/* Example Showcase */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <ExampleCard
            image="/examples/resume1.png"
            title="Modern Resume"
            desc="A sleek, ATS-friendly resume template"
          />
          <ExampleCard
            image="/examples/invoice1.png"
            title="Professional Invoice"
            desc="Clean and structured invoices for businesses"
          />
          <ExampleCard
            image="/examples/cover1.png"
            title="Creative Cover Letter"
            desc="Polished letters tailored to job applications"
          />
        </div>

        {/* Feature Highlights */}
        <section className="mt-24 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<FaMagic className="text-purple-400 text-3xl" />}
            title="AI Tailored"
            desc="Smart, job-specific resumes and letters."
          />
          <FeatureCard
            icon={<FaFilePdf className="text-blue-400 text-3xl" />}
            title="1-Click Export"
            desc="Download professional PDFs instantly."
          />
          <FeatureCard
            icon={<FaCloud className="text-green-400 text-3xl" />}
            title="Cloud Saved"
            desc="Access documents securely from anywhere."
          />
        </section>

        {/* Testimonials */}
        <section className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            What our users say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              avatar="https://randomuser.me/api/portraits/women/44.jpg"
              name="Sophie L."
              feedback="DocufyAI helped me land 3 interviews in a week. The resumes look amazing!"
            />
            <TestimonialCard
              avatar="https://randomuser.me/api/portraits/men/32.jpg"
              name="James K."
              feedback="Invoices are super professional now, and clients love the clarity. Huge time saver!"
            />
            <TestimonialCard
              avatar="https://randomuser.me/api/portraits/women/68.jpg"
              name="Emily R."
              feedback="I used to struggle writing cover letters. With DocufyAI, it's stress-free!"
            />
          </div>
        </section>

        {/* Pricing */}
        <section className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PricingCard
              title="Free"
              price="$0"
              features={[
                "Basic Resume Templates",
                "Simple Invoice Layouts",
                "Standard Cover Letters",
              ]}
              highlight={false}
            />
            <PricingCard
              title="Pro"
              price="$6.99/mo"
              features={[
                "AI-Tailored Documents",
                "Premium Templates",
                "50 PDF Exports",
                "Priority Support",
              ]}
              highlight={true}
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-24 max-w-4xl mx-auto text-left">
          <h2 className="text-2xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h2>
          <FAQItem
            q="Is there a free plan?"
            a="Yes! You can start for free with basic templates. Upgrade anytime to unlock AI-powered features."
          />
          <FAQItem
            q="Can I cancel anytime?"
            a="Of course. You can cancel your subscription anytime with no hidden fees."
          />
          <FAQItem
            q="Do I own my documents?"
            a="Yes, all documents you generate and export are 100% yours."
          />
        </section>

        {/* CTA Footer */}
        <div className="mt-24">
          <Link
            href="/auth"
            className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition text-lg"
          >
            🚀 Start Creating with DocufyAI
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

function ExampleCard({
  image,
  title,
  desc,
}: {
  image: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all cursor-default">
      <img src={image} alt={title} className="w-full h-56 object-cover" />
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{desc}</p>
    </div>
  );
}

function TestimonialCard({
  avatar,
  name,
  feedback,
}: {
  avatar: string;
  name: string;
  feedback: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center text-center hover:shadow-lg transition">
      <img
        src={avatar}
        alt={name}
        className="w-16 h-16 rounded-full mb-4 object-cover"
      />
      <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
      <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
        {feedback}
      </p>
    </div>
  );
}

function PricingCard({
  title,
  price,
  features,
  highlight,
}: {
  title: string;
  price: string;
  features: string[];
  highlight: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-2xl shadow-lg ${
        highlight
          ? "bg-purple-600 text-white transform scale-105"
          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      }`}
    >
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-3xl font-extrabold mb-6">{price}</p>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i}>✅ {f}</li>
        ))}
      </ul>
      <Link
        href="/auth"
        className={`inline-block px-6 py-2 rounded-lg font-semibold shadow-md ${
          highlight
            ? "bg-white text-purple-600 hover:bg-gray-200"
            : "bg-purple-600 text-white hover:bg-purple-700"
        }`}
      >
        {highlight ? "Go Pro" : "Get Started"}
      </Link>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="mb-6">
      <h4 className="font-semibold text-white">{q}</h4>
      <p className="text-gray-300 mt-2">{a}</p>
    </div>
  );
}
