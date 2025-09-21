// pages/resume-template.tsx
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// helper to avoid "undefined" text
const safe = (val: any) => (val === undefined || val === null ? "" : val);

export default function ResumeTemplate() {
  const [name, setName] = useState("Your Name");
  const [title, setTitle] = useState("Your Job Title");
  const [contact, setContact] = useState<any>({
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
  });
  const [sections, setSections] = useState<any[]>([
    { type: "summary", title: "Summary", content: "", items: [] },
    {
      type: "skills",
      title: "Skills",
      items: ["JavaScript", "React", "Node.js"],
    },
    {
      type: "experience",
      title: "Work Experience",
      items: [
        {
          role: "Software Engineer at ACME",
          company: "ACME",
          period: "Jan 2021 - Present",
          location: "Remote",
          achievements: ["Built feature X", "Improved performance by 25%"],
        },
      ],
    },
  ]);

  const [template, setTemplate] = useState("classic");
  const [theme, setTheme] = useState("blue");
  const [isPreview, setIsPreview] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(""); // <-- new state for AI context

  const themes: any = {
    blue: { primary: "#1d4ed8", secondary: "#3b82f6", light: "#e0f2fe" },
    green: { primary: "#059669", secondary: "#10b981", light: "#d1fae5" },
    purple: { primary: "#7c3aed", secondary: "#8b5cf6", light: "#ede9fe" },
    orange: { primary: "#d97706", secondary: "#f59e0b", light: "#fef3c7" },
  };

  // 🟢 AI Generate Resume (with prompt support)
  const generateWithAI = async () => {
    try {
      setLoadingAI(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: "resume", prompt: aiPrompt }),
      });

      if (!response.ok) throw new Error("AI generation failed");
      const data = await response.json();

      setName(safe(data.name));
      setTitle(safe(data.title));
      setContact(data.contact || {});
      setSections(data.sections || []);
    } catch (err) {
      console.error(err);
      alert("Error generating resume with AI");
    } finally {
      setLoadingAI(false);
    }
  };

  // 🟢 PDF Download
  const downloadPDF = async () => {
    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: template,
          theme,
          data: { name, title, contact, sections },
        }),
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
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    }
  };

  // 🟢 Add Section
  const addSection = (type: string) => {
    const newSection = {
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      content: "",
      items: [],
    };
    setSections([...sections, newSection]);
  };

  // 🟢 Remove Section
  const removeSection = (index: number) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  // 🟢 Handle Drag
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const updated = Array.from(sections);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setSections(updated);
  };

  // ---------- EDITOR ----------
  const renderEditorSection = (section: any, idx: number, t: any) => {
    const updatedSection = (u: any) => {
      const newS = [...sections];
      newS[idx] = { ...newS[idx], ...u };
      setSections(newS);
    };

    const updateItem = (i: number, value: any) => {
      const newS = [...sections];
      newS[idx].items = newS[idx].items || [];
      newS[idx].items[i] = value;
      setSections(newS);
    };

    const removeItem = (i: number) => {
      const newS = [...sections];
      newS[idx].items = newS[idx].items || [];
      newS[idx].items.splice(i, 1);
      setSections(newS);
    };

    const addNewItem = (templateItem: any = "") => {
      const newS = [...sections];
      newS[idx].items = newS[idx].items || [];
      newS[idx].items.push(templateItem);
      setSections(newS);
    };

    return (
      <div key={idx} className="mb-4 border rounded bg-white p-3">
        <div className="flex justify-between items-center mb-2">
          <input
            value={safe(section.title)}
            onChange={(e) => updatedSection({ title: e.target.value })}
            className="font-semibold text-lg w-full mr-3 border rounded px-2 py-1"
            style={{ color: t.primary }}
          />
          <button
            onClick={() => removeSection(idx)}
            className="text-red-500 ml-2"
            title="Remove section"
          >
            ✕
          </button>
        </div>

        {/* Summary */}
        {section.type === "summary" && (
          <textarea
            value={safe(section.content)}
            onChange={(e) => updatedSection({ content: e.target.value })}
            className="w-full border rounded p-2 mb-2"
            rows={4}
          />
        )}

        {/* Skills */}
        {section.type === "skills" && (
          <div>
            {(section.items || []).map((s: string, i: number) => (
              <div key={i} className="flex items-center mb-2">
                <input
                  value={safe(s)}
                  onChange={(e) => updateItem(i, e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
                <button
                  onClick={() => removeItem(i)}
                  className="text-red-500 ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addNewItem("New Skill")}
              className="text-blue-500 text-sm"
            >
              + Add Skill
            </button>
          </div>
        )}

        {/* Other sections */}
        {[
          "experience",
          "education",
          "projects",
          "certifications",
          "languages",
          "hobbies",
        ].includes(section.type) && (
          <div>
            {(section.items || []).map((item: any, i: number) => {
              const isString = typeof item === "string" || item === undefined;
              const obj = isString ? {} : item;
              return (
                <div key={i} className="mb-3 border rounded p-2 bg-gray-50">
                  {section.type === "experience" && (
                    <>
                      <input
                        value={safe(item.role)}
                        onChange={(e) =>
                          updateItem(i, {
                            ...(obj || {}),
                            role: e.target.value,
                          })
                        }
                        placeholder="Role / Title"
                        className="w-full mb-2 border rounded px-2 py-1"
                      />
                      <input
                        value={safe(item.company)}
                        onChange={(e) =>
                          updateItem(i, {
                            ...(obj || {}),
                            company: e.target.value,
                          })
                        }
                        placeholder="Company"
                        className="w-full mb-2 border rounded px-2 py-1"
                      />
                      <div className="flex gap-2">
                        <input
                          value={safe(item.period)}
                          onChange={(e) =>
                            updateItem(i, {
                              ...(obj || {}),
                              period: e.target.value,
                            })
                          }
                          placeholder="Period"
                          className="w-1/2 mb-2 border rounded px-2 py-1"
                        />
                        <input
                          value={safe(item.location)}
                          onChange={(e) =>
                            updateItem(i, {
                              ...(obj || {}),
                              location: e.target.value,
                            })
                          }
                          placeholder="Location"
                          className="w-1/2 mb-2 border rounded px-2 py-1"
                        />
                      </div>
                      <textarea
                        value={(item.achievements || []).join("\n")}
                        onChange={(e) =>
                          updateItem(i, {
                            ...(obj || {}),
                            achievements: e.target.value.split("\n"),
                          })
                        }
                        placeholder="Achievements"
                        className="w-full border rounded px-2 py-1"
                        rows={3}
                      />
                    </>
                  )}

                  {(section.type === "education" ||
                    section.type === "certifications" ||
                    section.type === "projects") && (
                    <input
                      value={
                        isString
                          ? safe(item)
                          : safe(item.degree || item.text || "")
                      }
                      onChange={(e) =>
                        updateItem(
                          i,
                          isString
                            ? e.target.value
                            : { ...(obj || {}), degree: e.target.value }
                        )
                      }
                      placeholder="Item text"
                      className="w-full mb-2 border rounded px-2 py-1"
                    />
                  )}

                  {(section.type === "languages" ||
                    section.type === "hobbies") && (
                    <input
                      value={safe(item)}
                      onChange={(e) => updateItem(i, e.target.value)}
                      placeholder="Entry"
                      className="w-full mb-2 border rounded px-2 py-1"
                    />
                  )}

                  <button
                    onClick={() => removeItem(i)}
                    className="text-red-500 text-sm"
                  >
                    ✕ Remove Item
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => addNewItem("New Entry")}
              className="text-blue-500 text-sm"
            >
              + Add Item
            </button>
          </div>
        )}
      </div>
    );
  };

  // ---------- PREVIEW ----------
  const renderPreviewSection = (section: any, t: any) => {
    if (section.type === "summary") {
      return (
        <div key={section.title} className="mb-4">
          <h2 style={{ color: t.primary }} className="font-bold text-lg mb-1">
            {safe(section.title)}
          </h2>
          <p>{safe(section.content)}</p>
        </div>
      );
    }
    if (section.type === "skills") {
      return (
        <div key={section.title} className="mb-4">
          <h2 style={{ color: t.primary }} className="font-bold text-lg mb-1">
            {safe(section.title)}
          </h2>
          <div className="flex flex-wrap gap-2">
            {(section.items || []).map((s: string, i: number) => (
              <span
                key={i}
                style={{
                  background: t.light,
                  color: t.primary,
                  padding: "4px 8px",
                  borderRadius: "12px",
                }}
                className="text-sm"
              >
                {safe(s)}
              </span>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div key={section.title} className="mb-4">
        <h2 style={{ color: t.primary }} className="font-bold text-lg mb-1">
          {safe(section.title)}
        </h2>
        <ul className="list-disc ml-5">
          {(section.items || []).map((it: any, i: number) => (
            <li key={i}>{safe(it.role || it.degree || it.text || it)}</li>
          ))}
        </ul>
      </div>
    );
  };

  // ---------- FULL PREVIEW ----------
  const renderFullPreview = () => {
    const t = themes[theme];
    if (template === "classic") {
      return (
        <div className="flex border rounded overflow-hidden">
          <aside className="w-1/3 p-6" style={{ background: t.light }}>
            <h1 className="text-2xl font-bold mb-1">{safe(name)}</h1>
            <p className="text-sm mb-4">{safe(title)}</p>
            <h3 style={{ color: t.primary }} className="font-semibold mb-2">
              Contact
            </h3>
            <p>{safe(contact.email)}</p>
            <p>{safe(contact.phone)}</p>
            <p>{safe(contact.location)}</p>
            <p>{safe(contact.linkedin)}</p>
            <p>{safe(contact.portfolio)}</p>
          </aside>
          <main className="w-2/3 p-6">
            {sections.map((s) => renderPreviewSection(s, t))}
          </main>
        </div>
      );
    }
    if (template === "modern") {
      return (
        <div className="border rounded overflow-hidden">
          <header
            className="p-6 text-white flex justify-between"
            style={{
              background: `linear-gradient(135deg, ${t.secondary}, ${t.primary})`,
            }}
          >
            <div>
              <h1 className="text-2xl font-bold mb-1">{safe(name)}</h1>
              <p className="text-sm text-white opacity-90">{safe(title)}</p>
            </div>
            <div className="text-right text-sm text-white opacity-90">
              <p>{safe(contact.email)}</p>
              <p>{safe(contact.phone)}</p>
              <p>{safe(contact.location)}</p>
              <p>{safe(contact.linkedin)}</p>
              <p>{safe(contact.portfolio)}</p>
            </div>
          </header>
          <main className="p-6">
            {sections.map((s) => renderPreviewSection(s, t))}
          </main>
        </div>
      );
    }
    return (
      <div className="p-6 border rounded">
        <h1 className="text-xl font-bold mb-1">{safe(name)}</h1>
        <p className="text-sm mb-4">{safe(title)}</p>
        <p className="text-xs mb-4 text-gray-600">
          {[safe(contact.email), safe(contact.phone), safe(contact.location)]
            .filter(Boolean)
            .join(" | ")}
        </p>
        {sections.map((s) => renderPreviewSection(s, themes[theme]))}
      </div>
    );
  };

  // ---------- RENDER ----------
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Resume Builder</h1>
        <div className="flex space-x-2 items-center">
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </select>
          {template !== "minimal" && (
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="orange">Orange</option>
            </select>
          )}
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="AI context (e.g. Resume for software engineer with 5 years experience)"
            className="border rounded px-2 py-1 w-64 text-sm"
            rows={2}
          />
          <button
            onClick={generateWithAI}
            disabled={loadingAI}
            className={`px-4 py-2 rounded text-white flex items-center gap-2 ${
              loadingAI
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loadingAI && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loadingAI ? "Generating…" : "Generate with AI"}
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Download PDF
          </button>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            {isPreview ? "Back to Edit" : "Preview Resume"}
          </button>
        </div>
      </div>
      {!isPreview ? (
        <>
          {/* Editable Header */}
          <div className="mb-6 border p-4 rounded bg-white">
            <input
              value={safe(name)}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-bold w-full mb-2 border rounded px-2 py-1"
            />
            <input
              value={safe(title)}
              onChange={(e) => setTitle(e.target.value)}
              className="text-gray-600 w-full mb-2 border rounded px-2 py-1"
            />
            <input
              value={safe(contact.email)}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
              placeholder="Email"
              className="border rounded px-2 py-1 w-full mb-1"
            />
            <input
              value={safe(contact.phone)}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
              placeholder="Phone"
              className="border rounded px-2 py-1 w-full mb-1"
            />
            <input
              value={safe(contact.location)}
              onChange={(e) =>
                setContact({ ...contact, location: e.target.value })
              }
              placeholder="Location"
              className="border rounded px-2 py-1 w-full mb-1"
            />
            <input
              value={safe(contact.linkedin)}
              onChange={(e) =>
                setContact({ ...contact, linkedin: e.target.value })
              }
              placeholder="LinkedIn"
              className="border rounded px-2 py-1 w-full mb-1"
            />
            <input
              value={safe(contact.portfolio)}
              onChange={(e) =>
                setContact({ ...contact, portfolio: e.target.value })
              }
              placeholder="Portfolio"
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          {/* Sections */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {sections.map((section, i) => (
                    <Draggable
                      key={i.toString()}
                      draggableId={i.toString()}
                      index={i}
                    >
                      {(prov) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                        >
                          {renderEditorSection(section, i, themes[theme])}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {/* Add Section */}
          <div className="mt-4">
            <label className="mr-2 font-semibold">+ Add Section:</label>
            <button
              onClick={() => addSection("summary")}
              className="px-2 py-1 bg-gray-500 rounded mr-2"
            >
              Summary
            </button>
            <button
              onClick={() => addSection("skills")}
              className="px-2 py-1 bg-gray-500 rounded mr-2"
            >
              Skills
            </button>
            <button
              onClick={() => addSection("experience")}
              className="px-2 py-1 bg-gray-500 rounded mr-2"
            >
              Work Experience
            </button>
            <button
              onClick={() => addSection("education")}
              className="px-2 py-1 bg-gray-500 rounded mr-2"
            >
              Education
            </button>
            <button
              onClick={() => addSection("certifications")}
              className="px-2 py-1 bg-gray-500 rounded mr-2"
            >
              Certifications
            </button>
            <button
              onClick={() => addSection("projects")}
              className="px-2 py-1 bg-gray-500 rounded mr-2"
            >
              Projects
            </button>
            <button
              onClick={() => addSection("languages")}
              className="px-2 py-1 bg-gray-500 rounded mr-2"
            >
              Languages
            </button>
            <button
              onClick={() => addSection("hobbies")}
              className="px-2 py-1 bg-gray-500 rounded"
            >
              Hobbies
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4">{renderFullPreview()}</div>
      )}
    </div>
  );
}
