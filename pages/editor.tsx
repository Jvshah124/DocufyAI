import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { prompts } from "../lib/prompts";

export default function Editor() {
  const [title, setTitle] = useState("Untitled Document");
  const [content, setContent] = useState("");
  const [docId, setDocId] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // NEW: Prompt state
  const [docType, setDocType] = useState("resume");
  const [variantIndex, setVariantIndex] = useState(0);
  const [prompt, setPrompt] = useState(prompts["resume"][0].prompt);

  const router = useRouter();

  // Load document if editing
  useEffect(() => {
    const { id } = router.query;
    if (id && typeof id === "string") {
      setDocId(id);

      const fetchDoc = async () => {
        const { data, error } = await supabase
          .from("documents")
          .select("title, content")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error loading doc:", error);
        } else if (data) {
          setTitle(data.title || "Untitled Document");
          setContent(data.content || "");
        }
      };

      fetchDoc();
    }
  }, [router.query]);

  // Save draft
  const saveDraft = async () => {
    if (docId) {
      const { error } = await supabase
        .from("documents")
        .update({ title, content })
        .eq("id", docId);

      if (error) {
        console.error("Error updating doc:", error);
        alert("Error updating draft!");
      } else {
        alert("Draft updated!");
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("documents")
        .insert([{ title, content, user_id: user?.id }])
        .select()
        .single();

      if (error) {
        console.error("Error saving doc:", error);
        alert("Error saving draft!");
      } else {
        setDocId(data.id);
        alert("Draft saved to Supabase!");
      }
    }
  };

  // Generate with AI
  const generateAI = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.content) {
        setContent(data.content);
      } else {
        alert("AI failed to generate content");
      }
    } catch (err) {
      console.error(err);
      alert("Error calling AI");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-8">
      {/* Left: Editor */}
      <div className="w-1/2 pr-4">
        <h1 className="text-2xl font-bold mb-4">Editor</h1>

        {/* Title Input */}
        <input
          type="text"
          className="w-full mb-4 p-2 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter document title..."
        />

        {/* Document Type Selector */}
        <label className="block mb-2 font-semibold">Choose Document Type</label>
        <select
          className="w-full mb-4 p-2 border rounded-lg shadow"
          value={docType}
          onChange={(e) => {
            setDocType(e.target.value);
            setVariantIndex(0);
            setPrompt(prompts[e.target.value][0].prompt);
          }}
        >
          {Object.keys(prompts).map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        {/* Prompt Variant Selector */}
        <label className="block mb-2 font-semibold">Choose Prompt Style</label>
        <select
          className="w-full mb-4 p-2 border rounded-lg shadow"
          value={variantIndex}
          onChange={(e) => {
            const index = parseInt(e.target.value);
            setVariantIndex(index);
            setPrompt(prompts[docType][index].prompt);
          }}
        >
          {prompts[docType].map((variant, i) => (
            <option key={variant.id} value={i}>
              {variant.title}
            </option>
          ))}
        </select>

        {/* Editable Prompt Box */}
        <textarea
          className="w-full mb-4 p-2 border rounded-lg shadow h-24"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={saveDraft}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {docId ? "Update Draft" : "Save Draft"}
          </button>

          <button
            onClick={generateAI}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loadingAI}
          >
            {loadingAI ? "Generating..." : "Generate with AI"}
          </button>
        </div>

        {/* Main Editor Box */}
        <textarea
          id="editor"
          className="w-full h-[400px] p-4 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your document content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Right: Preview */}
      <div className="w-1/2 pl-4">
        <h1 className="text-2xl font-bold mb-4">Preview</h1>
        <div className="w-full p-4 border rounded-lg shadow bg-white overflow-auto">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          {content ? (
            <p className="whitespace-pre-line text-gray-800">{content}</p>
          ) : (
            <p className="text-gray-400">Your preview will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
}
