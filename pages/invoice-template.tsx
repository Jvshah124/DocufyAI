// pages/invoice-template.tsx
import React, { useState } from "react";

const uid = () => Math.random().toString(36).slice(2, 9);
const safe = (v: any) => (v === undefined || v === null ? "" : v);

export default function InvoiceTemplate() {
  const [invoice, setInvoice] = useState<any>({
    invoice_number: "INV-2025-001",
    date: new Date().toISOString().slice(0, 10),
    due_date: "",
    from: {
      company: "Your Company LLC",
      address: "123 Your St, City",
      email: "billing@yourco.com",
      phone: "+1 555 000 0000",
    },
    to: {
      company: "Client Co",
      name: "Client Name",
      address: "456 Client Ave",
      email: "client@example.com",
      phone: "",
    },
    items: [
      {
        id: uid(),
        description: "Consulting",
        quantity: 1,
        unit_price: 1500.0,
        total: 1500.0,
      },
    ],
    sub_total: 1500.0,
    tax: 0.0,
    discount: 0.0,
    total: 1500.0,
    notes: "Thank you for your business.",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [theme, setTheme] = useState("blue");

  const recalcTotals = (curr: any) => {
    const items = curr.items || [];
    const sub = items.reduce(
      (s: number, it: any) => s + (Number(it.total) || 0),
      0
    );
    const tax = Number(curr.tax) || 0;
    const discount = Number(curr.discount) || 0;
    const total = sub + tax - discount;
    return { ...curr, sub_total: sub, total };
  };

  const updateInvoice = (patch: any) => {
    const merged = { ...invoice, ...patch };
    setInvoice(recalcTotals(merged));
  };

  const updateItem = (id: string, patch: any) => {
    const items = (invoice.items || []).map((it: any) =>
      it.id === id
        ? {
            ...it,
            ...patch,
            total:
              (Number(patch.quantity ?? it.quantity) || it.quantity) *
              (Number(patch.unit_price ?? it.unit_price) || it.unit_price),
          }
        : it
    );
    const next = { ...invoice, items };
    setInvoice(recalcTotals(next));
  };

  const addItem = () => {
    const item = {
      id: uid(),
      description: "New item",
      quantity: 1,
      unit_price: 0,
      total: 0,
    };
    setInvoice(
      recalcTotals({ ...invoice, items: [...(invoice.items || []), item] })
    );
  };

  const removeItem = (id: string) => {
    const items = (invoice.items || []).filter((it: any) => it.id !== id);
    setInvoice(recalcTotals({ ...invoice, items }));
  };

  // Generate via AI
  const generateWithAI = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: "invoice" }),
      });
      if (!res.ok) throw new Error("AI generation failed");
      const data = await res.json();
      // normalize and apply
      const mapped = {
        invoice_number: data.invoice_number || invoice.invoice_number,
        date: data.date || invoice.date,
        due_date: data.due_date || invoice.due_date,
        from: data.from || invoice.from,
        to: data.to || invoice.to,
        items: (data.items || []).map((it: any, i: number) => ({
          id: uid(),
          description: it.description || "",
          quantity: it.quantity || 1,
          unit_price: it.unit_price || 0,
          total:
            it.total || Number(it.quantity || 1) * Number(it.unit_price || 0),
        })),
        sub_total: data.sub_total || 0,
        tax: data.tax || 0,
        discount: data.discount || 0,
        total: data.total || 0,
        notes: data.notes || "",
      };
      setInvoice(recalcTotals(mapped));
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: "invoice",
          theme,
          data: invoice,
        }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoice_number || "invoice"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Invoice Builder</h1>
        <div className="flex items-center gap-2">
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

          <button
            onClick={generateWithAI}
            disabled={isGenerating}
            className={`px-4 py-2 rounded text-white ${
              isGenerating ? "bg-green-300 cursor-not-allowed" : "bg-green-600"
            }`}
          >
            {isGenerating ? "Generating…" : "Generate with AI"}
          </button>

          <button
            onClick={downloadPDF}
            disabled={isDownloading}
            className={`px-4 py-2 rounded text-white ${
              isDownloading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600"
            }`}
          >
            {isDownloading ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="mb-6 border rounded p-4 bg-black">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold">Invoice #</label>
            <input
              value={safe(invoice.invoice_number)}
              onChange={(e) =>
                updateInvoice({ invoice_number: e.target.value })
              }
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold">Date</label>
            <input
              type="date"
              value={safe(invoice.date)}
              onChange={(e) => updateInvoice({ date: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">Due Date</label>
            <input
              type="date"
              value={safe(invoice.due_date)}
              onChange={(e) => updateInvoice({ due_date: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">Notes</label>
            <input
              value={safe(invoice.notes)}
              onChange={(e) => updateInvoice({ notes: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">From</h3>
            <input
              value={safe(invoice.from.company)}
              onChange={(e) =>
                updateInvoice({
                  from: { ...invoice.from, company: e.target.value },
                })
              }
              className="w-full border rounded px-2 py-1 mt-1"
              placeholder="Company"
            />
            <input
              value={safe(invoice.from.address)}
              onChange={(e) =>
                updateInvoice({
                  from: { ...invoice.from, address: e.target.value },
                })
              }
              className="w-full border rounded px-2 py-1 mt-1"
              placeholder="Address"
            />
            <input
              value={safe(invoice.from.email)}
              onChange={(e) =>
                updateInvoice({
                  from: { ...invoice.from, email: e.target.value },
                })
              }
              className="w-full border rounded px-2 py-1 mt-1"
              placeholder="Email"
            />
            <input
              value={safe(invoice.from.phone)}
              onChange={(e) =>
                updateInvoice({
                  from: { ...invoice.from, phone: e.target.value },
                })
              }
              className="w-full border rounded px-2 py-1 mt-1"
              placeholder="Phone"
            />
          </div>

          <div>
            <h3 className="font-semibold">Bill To</h3>
            <input
              value={safe(invoice.to.name)}
              onChange={(e) =>
                updateInvoice({ to: { ...invoice.to, name: e.target.value } })
              }
              className="w-full border rounded px-2 py-1 mt-1"
              placeholder="Name / Company"
            />
            <input
              value={safe(invoice.to.address)}
              onChange={(e) =>
                updateInvoice({
                  to: { ...invoice.to, address: e.target.value },
                })
              }
              className="w-full border rounded px-2 py-1 mt-1"
              placeholder="Address"
            />
            <input
              value={safe(invoice.to.email)}
              onChange={(e) =>
                updateInvoice({ to: { ...invoice.to, email: e.target.value } })
              }
              className="w-full border rounded px-2 py-1 mt-1"
              placeholder="Email"
            />
            <input
              value={safe(invoice.to.phone)}
              onChange={(e) =>
                updateInvoice({ to: { ...invoice.to, phone: e.target.value } })
              }
              className="w-full border rounded px-2 py-1 mt-1"
              placeholder="Phone"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 bg-black p-4 rounded border">
        <h3 className="font-semibold mb-2">Items</h3>
        <div className="space-y-3">
          {(invoice.items || []).map((it: any) => (
            <div key={it.id} className="grid grid-cols-6 gap-2 items-center">
              <input
                className="col-span-3 border rounded px-2 py-1"
                value={safe(it.description)}
                onChange={(e) =>
                  updateItem(it.id, { description: e.target.value })
                }
              />
              <input
                type="number"
                className="col-span-1 border rounded px-2 py-1"
                value={it.quantity}
                onChange={(e) =>
                  updateItem(it.id, { quantity: Number(e.target.value) })
                }
              />
              <input
                type="number"
                className="col-span-1 border rounded px-2 py-1"
                value={it.unit_price}
                onChange={(e) =>
                  updateItem(it.id, { unit_price: Number(e.target.value) })
                }
              />
              <div className="col-span-1 text-right">
                <div className="text-sm">
                  {(Number(it.total) || 0).toFixed(2)}
                </div>
                <button
                  className="text-red-500 text-xs mt-1"
                  onClick={() => removeItem(it.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <button
            onClick={addItem}
            className="px-3 py-1 text-sm bg-gray-500 rounded"
          >
            + Add Item
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div />
          <div className="bg-gray-500 p-3 rounded">
            <div className="flex justify-between">
              <div>Subtotal</div>
              <div>{(Number(invoice.sub_total) || 0).toFixed(2)}</div>
            </div>
            <div className="flex justify-between mt-1">
              <div>Tax</div>
              <div>
                <input
                  type="number"
                  value={invoice.tax}
                  onChange={(e) =>
                    updateInvoice({ tax: Number(e.target.value) })
                  }
                  className="w-28 border rounded px-2 py-1"
                />
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <div>Discount</div>
              <div>
                <input
                  type="number"
                  value={invoice.discount}
                  onChange={(e) =>
                    updateInvoice({ discount: Number(e.target.value) })
                  }
                  className="w-28 border rounded px-2 py-1"
                />
              </div>
            </div>
            <div className="flex justify-between mt-2 font-bold">
              <div>Total</div>
              <div>{(Number(invoice.total) || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold">Preview</h3>
        <div className="border rounded p-4 bg-black">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#111" }}>
                {safe(invoice.from.company)}
              </h2>
              <div>{safe(invoice.from.address)}</div>
              <div>
                {safe(invoice.from.email)}{" "}
                {invoice.from.phone ? ` • ${invoice.from.phone}` : ""}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <h3 style={{ color: "#eee" }}>
                Invoice #{safe(invoice.invoice_number)}
              </h3>
              <div>Date: {safe(invoice.date)}</div>
              <div>Due: {safe(invoice.due_date)}</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <strong>Bill To:</strong>
            <div>{safe(invoice.to.name)}</div>
            <div>{safe(invoice.to.address)}</div>
            <div>
              {safe(invoice.to.email)}{" "}
              {invoice.to.phone ? ` • ${invoice.to.phone}` : ""}
            </div>
          </div>

          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}
          >
            <thead>
              <tr style={{ background: "#f7f7" }}>
                <th style={{ textAlign: "left", padding: 8 }}>Description</th>
                <th style={{ textAlign: "center", padding: 8 }}>Qty</th>
                <th style={{ textAlign: "right", padding: 8 }}>Unit</th>
                <th style={{ textAlign: "right", padding: 8 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((it: any) => (
                <tr key={it.id}>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                    {safe(it.description)}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "center",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {safe(it.quantity)}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {Number(it.unit_price || 0).toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {Number(it.total || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 12,
            }}
          >
            <div style={{ width: 240 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>Subtotal</div>
                <div>{(Number(invoice.sub_total) || 0).toFixed(2)}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>Tax</div>
                <div>{(Number(invoice.tax) || 0).toFixed(2)}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>Discount</div>
                <div>{(Number(invoice.discount) || 0).toFixed(2)}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  marginTop: 6,
                }}
              >
                <div>Total</div>
                <div>{(Number(invoice.total) || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, color: "#eee" }}>
            {safe(invoice.notes)}
          </div>
        </div>
      </div>
    </div>
  );
}
