// pages/cover-letter.tsx
import { canDownloadAndIncrement } from "../lib/profile";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function CoverLetter() {
  const [letter, setLetter] = useState<any>({
    sender: { name: "", email: "", phone: "", location: "" },
    recipient: { name: "", company: "", address: "" },
    date: "",
    body: "",
    closing: "",
    signature: "",
  });

  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(""); // 🟢 new field for custom AI prompt
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const router = useRouter();

  // 🟢 Fetch user + subscription status
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();

      setIsPro(profile?.subscription_status === "pro");
    };
    fetchUser();
  }, [router]);

  // 🟢 Generate with AI (with prompt)
  const generateWithAI = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: "cover_letter",
          prompt, // pass custom prompt
        }),
      });
      if (!response.ok) throw new Error("AI generation failed");
      const data = await response.json();
      setLetter(data); // Replace with AI JSON
    } catch (err) {
      console.error(err);
      alert("Error generating cover letter with AI");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Download PDF (with free + pro limits)
  const downloadPDF = async () => {
    if (!user) {
      alert("Please log in first.");
      return;
    }

    // Use the new helper
    const allowed = await canDownloadAndIncrement(user.id);
    if (!allowed) {
      alert("❌ You’ve reached your download limit. Please upgrade your plan.");
      return;
    }

    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: "cover_letter",
          data: letter,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cover-letter.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Cover Letter Builder</h1>

      {/* AI Prompt Input */}
      <div className="mb-4">
        <label className="font-semibold block mb-1">
          Tailor AI to this job/company:
        </label>
        <input
          type="text"
          className="border rounded w-full px-2 py-1 bg-white text-black"
          value={prompt}
          placeholder="e.g. Software Engineer at Google"
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={generateWithAI}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Generating..." : "Generate with AI"}
        </button>
        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download PDF
        </button>
      </div>

      {/* Sender Info */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Sender</h2>
        <input
          className="border rounded w-full px-2 py-1 mb-1 bg-white text-black"
          value={letter.sender.name || ""}
          placeholder="Your Name"
          onChange={(e) =>
            setLetter({
              ...letter,
              sender: { ...letter.sender, name: e.target.value },
            })
          }
        />
        <input
          className="border rounded w-full px-2 py-1 mb-1 bg-white text-black"
          value={letter.sender.email || ""}
          placeholder="Your Email"
          onChange={(e) =>
            setLetter({
              ...letter,
              sender: { ...letter.sender, email: e.target.value },
            })
          }
        />
        <input
          className="border rounded w-full px-2 py-1 mb-1 bg-white text-black"
          value={letter.sender.phone || ""}
          placeholder="Your Phone"
          onChange={(e) =>
            setLetter({
              ...letter,
              sender: { ...letter.sender, phone: e.target.value },
            })
          }
        />
        <input
          className="border rounded w-full px-2 py-1 bg-white text-black"
          value={letter.sender.location || ""}
          placeholder="Your Location"
          onChange={(e) =>
            setLetter({
              ...letter,
              sender: { ...letter.sender, location: e.target.value },
            })
          }
        />
      </div>

      {/* Recipient Info */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Recipient</h2>
        <input
          className="border rounded w-full px-2 py-1 mb-1 bg-white text-black"
          value={letter.recipient.name || ""}
          placeholder="Recipient Name"
          onChange={(e) =>
            setLetter({
              ...letter,
              recipient: { ...letter.recipient, name: e.target.value },
            })
          }
        />
        <input
          className="border rounded w-full px-2 py-1 mb-1 bg-white text-black"
          value={letter.recipient.company || ""}
          placeholder="Company"
          onChange={(e) =>
            setLetter({
              ...letter,
              recipient: { ...letter.recipient, company: e.target.value },
            })
          }
        />
        <input
          className="border rounded w-full px-2 py-1 bg-white text-black"
          value={letter.recipient.address || ""}
          placeholder="Address"
          onChange={(e) =>
            setLetter({
              ...letter,
              recipient: { ...letter.recipient, address: e.target.value },
            })
          }
        />
      </div>

      {/* Date */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Date</h2>
        <input
          type="date"
          className="border rounded w-full px-2 py-1 bg-white text-black"
          value={letter.date || ""}
          onChange={(e) => setLetter({ ...letter, date: e.target.value })}
        />
      </div>

      {/* Body */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Body</h2>
        <textarea
          className="border rounded w-full px-2 py-2 bg-white text-black"
          rows={8}
          value={letter.body || ""}
          onChange={(e) => setLetter({ ...letter, body: e.target.value })}
        />
      </div>

      {/* Closing */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Closing</h2>
        <input
          className="border rounded w-full px-2 py-1 bg-white text-black"
          value={letter.closing || ""}
          onChange={(e) => setLetter({ ...letter, closing: e.target.value })}
        />
      </div>

      {/* Signature */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Signature</h2>
        <input
          className="border rounded w-full px-2 py-1 bg-white text-black"
          value={letter.signature || ""}
          onChange={(e) => setLetter({ ...letter, signature: e.target.value })}
        />
      </div>

      {/* Preview */}
      <div className="border rounded p-4 bg-gray-700">
        <h2 className="font-semibold mb-2">Preview</h2>
        <p>{letter.sender.name}</p>
        <p>
          {letter.sender.email} | {letter.sender.phone}
        </p>
        <p>{letter.sender.location}</p>
        <br />
        <p>{letter.date}</p>
        <p>{letter.recipient.name}</p>
        <p>{letter.recipient.company}</p>
        <p>{letter.recipient.address}</p>
        <br />
        <p>{letter.body}</p>
        <br />
        <p>{letter.closing},</p>
        <p>{letter.signature}</p>
      </div>
    </div>
  );
}
