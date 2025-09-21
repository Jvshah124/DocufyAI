// pages/custom-resume.tsx
import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

const uid = () => Math.random().toString(36).slice(2, 9);

function Editable({
  value,
  onChange,
  className = "",
  multiline = false,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  if (disabled) {
    return <span className={`${className}`}>{value || ""}</span>;
  }

  return editing ? (
    multiline ? (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(draft);
        }}
        className={`border bg-yellow-50 p-1 w-full ${className}`}
        rows={3}
      />
    ) : (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(draft);
        }}
        className={`border-b bg-yellow-50 p-1 w-full ${className}`}
      />
    )
  ) : (
    <span
      onClick={() => setEditing(true)}
      className={`${className} cursor-pointer hover:bg-yellow-100`}
    >
      {value || "Click to edit..."}
    </span>
  );
}

export default function CustomResume() {
  const [name, setName] = useState("Your Name");
  const [title, setTitle] = useState("Your Job Title");
  const [sidebarSections, setSidebarSections] = useState<any[]>([]);
  const [mainSections, setMainSections] = useState<any[]>([]);
  const [reorderMode, setReorderMode] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // 🟢 NEW: Generate resume with AI
  const generateWithAI = async () => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: "resume", // reuse resume schema
          prompt: "Generate a flexible resume with rich content.",
        }),
      });

      if (!response.ok) throw new Error("AI generation failed");

      const data = await response.json();

      // ✅ Map AI JSON into sections
      setName(data.name || "");
      setTitle(data.title || "");
      setSidebarSections([
        { id: uid(), title: "Skills", items: data.skills || [] },
      ]);
      setMainSections([
        { id: uid(), title: "Summary", items: [{ text: data.summary }] },
        {
          id: uid(),
          title: "Work Experience",
          items: (data.experience || []).map((job: any) => ({
            id: uid(),
            text: `${job.role} at ${job.company} (${job.period}) - ${job.location}`,
          })),
        },
      ]);
    } catch (err) {
      alert("Error generating with AI");
    }
  };

  const addSection = (where: "sidebar" | "main") => {
    const newSection = {
      id: uid(),
      title: "New Section",
      items: [{ id: uid(), text: "New Item" }],
    };
    if (where === "sidebar") {
      setSidebarSections([...sidebarSections, newSection]);
    } else {
      setMainSections([...mainSections, newSection]);
    }
    setShowAddMenu(false);
  };

  const reorder = (list: any[], start: number, end: number) => {
    const result = Array.from(list);
    const [moved] = result.splice(start, 1);
    result.splice(end, 0, moved);
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const [scope, type, secId] = result.source.droppableId.split("-");
    if (type === "sections") {
      if (scope === "sidebar") {
        setSidebarSections(
          reorder(
            sidebarSections,
            result.source.index,
            result.destination.index
          )
        );
      } else {
        setMainSections(
          reorder(mainSections, result.source.index, result.destination.index)
        );
      }
    } else if (type === "items") {
      if (scope === "sidebar") {
        const sections = [...sidebarSections];
        const sec = sections.find((s) => s.id === secId);
        if (!sec) return;
        sec.items = reorder(
          sec.items,
          result.source.index,
          result.destination.index
        );
        setSidebarSections(sections);
      } else {
        const sections = [...mainSections];
        const sec = sections.find((s) => s.id === secId);
        if (!sec) return;
        sec.items = reorder(
          sec.items,
          result.source.index,
          result.destination.index
        );
        setMainSections(sections);
      }
    }
  };

  const downloadPDF = async () => {
    const response = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        docType: "custom_resume",
        data: { name, title, sidebarSections, mainSections },
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
    a.download = "custom-resume.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg border min-h-screen text-gray-800">
      {/* Controls */}
      <div className="p-4 bg-gray-100 flex flex-wrap gap-2 justify-between items-center">
        <div className="text-lg font-bold">Custom Resume Builder</div>
        <div className="flex gap-2 items-center">
          <button
            onClick={generateWithAI}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Generate with AI
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download PDF
          </button>
          <button
            onClick={() => setReorderMode(!reorderMode)}
            className={`px-4 py-2 rounded ${
              reorderMode ? "bg-yellow-600 text-white" : "bg-gray-200"
            }`}
          >
            {reorderMode ? "Done Reordering" : "Reorder Mode"}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              + Add Section
            </button>
            {showAddMenu && (
              <div className="absolute right-0 mt-2 bg-white border shadow rounded w-40 z-10">
                <button
                  onClick={() => addSection("sidebar")}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  Add to Sidebar
                </button>
                <button
                  onClick={() => addSection("main")}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  Add to Main Content
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Layout */}
      <div className="p-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex">
            {/* Sidebar */}
            <aside className="w-1/3 bg-gray-50 p-6 text-sm">
              <h1 className="text-2xl font-bold mb-2">{name}</h1>
              <p className="text-gray-600 mb-6">{title}</p>
              <Droppable droppableId="sidebar-sections" type="sections">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-6"
                  >
                    {sidebarSections.map((sec, i) => (
                      <Draggable key={sec.id} draggableId={sec.id} index={i}>
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            className="bg-white p-2 rounded border"
                          >
                            <div className="flex justify-between items-center">
                              {reorderMode && (
                                <span
                                  {...prov.dragHandleProps}
                                  className="cursor-grab text-gray-500"
                                >
                                  ≡
                                </span>
                              )}
                              <Editable
                                value={sec.title}
                                onChange={(v) => {
                                  const updated = [...sidebarSections];
                                  updated[i].title = v;
                                  setSidebarSections(updated);
                                }}
                                disabled={reorderMode}
                                className="font-bold text-blue-700 flex-1 ml-2"
                              />
                              <button
                                onClick={() =>
                                  setSidebarSections(
                                    sidebarSections.filter(
                                      (s) => s.id !== sec.id
                                    )
                                  )
                                }
                                className="text-red-500 text-xs ml-2"
                              >
                                ✕
                              </button>
                            </div>
                            <Droppable
                              droppableId={`sidebar-items-${sec.id}`}
                              type="items"
                            >
                              {(prov2) => (
                                <ul
                                  ref={prov2.innerRef}
                                  {...prov2.droppableProps}
                                  className="mt-2 space-y-1"
                                >
                                  {sec.items.map((item: any, j: number) => (
                                    <Draggable
                                      key={item.id}
                                      draggableId={item.id}
                                      index={j}
                                    >
                                      {(prov3) => (
                                        <li
                                          ref={prov3.innerRef}
                                          {...prov3.draggableProps}
                                          className="flex items-center gap-2 bg-gray-100 p-1 rounded"
                                        >
                                          {reorderMode && (
                                            <span
                                              {...prov3.dragHandleProps}
                                              className="cursor-grab text-gray-500"
                                            >
                                              ≡
                                            </span>
                                          )}
                                          <Editable
                                            value={item.text}
                                            onChange={(v) => {
                                              const updated = [
                                                ...sidebarSections,
                                              ];
                                              updated[i].items[j].text = v;
                                              setSidebarSections(updated);
                                            }}
                                            disabled={reorderMode}
                                          />
                                          <button
                                            onClick={() => {
                                              const updated = [
                                                ...sidebarSections,
                                              ];
                                              updated[i].items = updated[
                                                i
                                              ].items.filter(
                                                (it: any) => it.id !== item.id
                                              );
                                              setSidebarSections(updated);
                                            }}
                                            className="text-red-500 text-xs"
                                          >
                                            ✕
                                          </button>
                                        </li>
                                      )}
                                    </Draggable>
                                  ))}
                                  {prov2.placeholder}
                                </ul>
                              )}
                            </Droppable>
                            <button
                              onClick={() => {
                                const updated = [...sidebarSections];
                                updated[i].items.push({
                                  id: uid(),
                                  text: "New Item",
                                });
                                setSidebarSections(updated);
                              }}
                              className="mt-1 text-xs text-blue-600"
                            >
                              + Add Item
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </aside>

            {/* Main Content */}
            <main className="w-2/3 p-8 text-sm">
              <Droppable droppableId="main-sections" type="sections">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-6"
                  >
                    {mainSections.map((sec, i) => (
                      <Draggable key={sec.id} draggableId={sec.id} index={i}>
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            className="border-b pb-2"
                          >
                            <div className="flex justify-between items-center">
                              {reorderMode && (
                                <span
                                  {...prov.dragHandleProps}
                                  className="cursor-grab text-gray-500"
                                >
                                  ≡
                                </span>
                              )}
                              <Editable
                                value={sec.title}
                                onChange={(v) => {
                                  const updated = [...mainSections];
                                  updated[i].title = v;
                                  setMainSections(updated);
                                }}
                                disabled={reorderMode}
                                className="font-bold text-blue-700 flex-1 ml-2"
                              />
                              <button
                                onClick={() =>
                                  setMainSections(
                                    mainSections.filter((s) => s.id !== sec.id)
                                  )
                                }
                                className="text-red-500 text-xs ml-2"
                              >
                                ✕
                              </button>
                            </div>
                            <Droppable
                              droppableId={`main-items-${sec.id}`}
                              type="items"
                            >
                              {(prov2) => (
                                <ul
                                  ref={prov2.innerRef}
                                  {...prov2.droppableProps}
                                  className="mt-2 space-y-1"
                                >
                                  {sec.items.map((item: any, j: number) => (
                                    <Draggable
                                      key={item.id}
                                      draggableId={item.id}
                                      index={j}
                                    >
                                      {(prov3) => (
                                        <li
                                          ref={prov3.innerRef}
                                          {...prov3.draggableProps}
                                          className="flex items-center gap-2 bg-gray-100 p-1 rounded"
                                        >
                                          {reorderMode && (
                                            <span
                                              {...prov3.dragHandleProps}
                                              className="cursor-grab text-gray-500"
                                            >
                                              ≡
                                            </span>
                                          )}
                                          <Editable
                                            value={item.text}
                                            onChange={(v) => {
                                              const updated = [...mainSections];
                                              updated[i].items[j].text = v;
                                              setMainSections(updated);
                                            }}
                                            disabled={reorderMode}
                                          />
                                          <button
                                            onClick={() => {
                                              const updated = [...mainSections];
                                              updated[i].items = updated[
                                                i
                                              ].items.filter(
                                                (it: any) => it.id !== item.id
                                              );
                                              setMainSections(updated);
                                            }}
                                            className="text-red-500 text-xs"
                                          >
                                            ✕
                                          </button>
                                        </li>
                                      )}
                                    </Draggable>
                                  ))}
                                  {prov2.placeholder}
                                </ul>
                              )}
                            </Droppable>
                            <button
                              onClick={() => {
                                const updated = [...mainSections];
                                updated[i].items.push({
                                  id: uid(),
                                  text: "New Item",
                                });
                                setMainSections(updated);
                              }}
                              className="mt-1 text-xs text-blue-600"
                            >
                              + Add Item
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </main>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
