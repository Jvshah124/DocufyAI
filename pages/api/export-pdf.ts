// pages/api/export-pdf.ts
import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { docType, data, theme } = req.body || {};
    const themes: any = {
      blue: { primary: "#1d4ed8", secondary: "#3b82f6", light: "#e0f2fe" },
      green: { primary: "#059669", secondary: "#10b981", light: "#d1fae5" },
      purple: { primary: "#7c3aed", secondary: "#8b5cf6", light: "#ede9fe" },
      orange: { primary: "#d97706", secondary: "#f59e0b", light: "#fef3c7" },
    };
    const t = themes[theme || "blue"];
    const safe = (v: any) => (v === undefined || v === null ? "" : v);

    const renderItems = (items: any[] = []) =>
      (items || [])
        .map((it) =>
          typeof it === "string"
            ? `<li>${it}</li>`
            : it.degree
            ? `<li>${safe(it.degree)}${
                it.institution ? `, ${safe(it.institution)}` : ""
              }${it.year ? ` (${safe(it.year)})` : ""}</li>`
            : it.role
            ? `<li><strong>${safe(it.role)}</strong>${
                it.company ? ` at ${safe(it.company)}` : ""
              }${
                it.period || it.location
                  ? ` (${[safe(it.period), safe(it.location)]
                      .filter(Boolean)
                      .join(" • ")})`
                  : ""
              }${
                it.achievements && it.achievements.length
                  ? `<ul>${(it.achievements || [])
                      .map((a: any) => `<li>${safe(a)}</li>`)
                      .join("")}</ul>`
                  : ""
              }</li>`
            : `<li>${safe(it.text || it)}</li>`
        )
        .join("");

    const renderSection = (section: any) => {
      if (!section) return "";
      if (section.type === "summary") {
        return `
          <div class="section">
            <h2 style="color:${t.primary}">${safe(section.title)}</h2>
            <p>${safe(section.content)}</p>
          </div>
        `;
      }
      if (section.type === "skills") {
        return `
          <div class="section">
            <h2 style="color:${t.primary}">${safe(section.title)}</h2>
            <div class="skills">
              ${(section.items || [])
                .map((s: any) => `<span class="skill">${safe(s)}</span>`)
                .join("")}
            </div>
          </div>
        `;
      }
      if (section.type === "experience") {
        return `
          <div class="section">
            <h2 style="color:${t.primary}">${safe(section.title)}</h2>
            ${(section.items || [])
              .map(
                (job: any) => `
                <div class="job">
                  <h3>${safe(job.role || job.text || "")}${
                  job.company ? ` — ${safe(job.company)}` : ""
                }</h3>
                  <p class="meta">${[safe(job.period), safe(job.location)]
                    .filter(Boolean)
                    .join(" • ")}</p>
                  ${
                    job.achievements && job.achievements.length
                      ? `<ul>${(job.achievements || [])
                          .map((a: any) => `<li>${safe(a)}</li>`)
                          .join("")}</ul>`
                      : ""
                  }
                </div>
              `
              )
              .join("")}
          </div>
        `;
      }
      if (
        [
          "education",
          "certifications",
          "projects",
          "languages",
          "hobbies",
        ].includes(section.type)
      ) {
        return `
          <div class="section">
            <h2 style="color:${t.primary}">${safe(section.title)}</h2>
            <ul>${renderItems(section.items || [])}</ul>
          </div>
        `;
      }
      return "";
    };

    const buildClassic = () => `
  <div class="page classic">
    <aside class="sidebar" style="background:${
      t.light
    }; padding:20px; box-sizing:border-box;">
      <h1 style="margin:0 0 6px 0;">${safe(data?.name)}</h1>
      <p class="subtitle" style="margin:0 0 10px 0;">${safe(data?.title)}</p>

      <h2 style="color:${
        t.primary
      }; margin-top:8px; margin-bottom:6px;">Contact</h2>
      <p style="margin:2px 0;">${safe(data?.contact?.email)}</p>
      <p style="margin:2px 0;">${safe(data?.contact?.phone)}</p>
      <p style="margin:2px 0;">${safe(data?.contact?.location)}</p>
      <p style="margin:2px 0;">${safe(data?.contact?.linkedin)}</p>
      <p style="margin:2px 0 12px 0;">${safe(data?.contact?.portfolio)}</p>

      <!-- Skills moved here as pills, with slight contrast so they are always visible -->
      ${(data?.sections || [])
        .filter((s: any) => s.type === "skills")
        .map(
          (s: any) => `
        <div style="margin-top:12px;">
          <h2 style="color:${t.primary}; margin:0 0 8px 0;">${safe(
            s.title
          )}</h2>
          <div class="skills" style="margin-top:6px; line-height:1;">
            ${(s.items || [])
              .map(
                (skill: any) => `
              <span class="skill" style="
                display:inline-block;
                margin:4px 6px 4px 0;
                padding:6px 10px;
                border-radius:12px;
                background: ${t.light};
                color: ${t.primary};
                font-size:12px;
                box-shadow: 0 0 0 1px ${t.primary}22 inset;
                ">
                ${safe(skill)}
              </span>`
              )
              .join("")}
          </div>
        </div>`
        )
        .join("")}

    </aside>

    <main class="content" style="padding:20px; box-sizing:border-box;">
      ${(data?.sections || [])
        .filter((s: any) => s.type !== "skills")
        .map(renderSection)
        .join("")}
    </main>
  </div>
`;
    const buildModern = () => `
      <div class="page modern">
        <header class="header" style="background:linear-gradient(135deg, ${
          t.secondary
        }, ${t.primary});color:white;">
          <div>
            <h1>${safe(data?.name)}</h1>
            <p class="subtitle" style="color:white;">${safe(data?.title)}</p>
          </div>
          <div class="contact" style="color:white;">
            <p style="color:white;">📧 ${safe(data?.contact?.email)}</p>
            <p style="color:white;">🕿 ${safe(data?.contact?.phone)}</p>
            <p style="color:white;">⚲ ${safe(data?.contact?.location)}</p>
            <p style="color:white;">${safe(data?.contact?.linkedin)}</p>
            <p style="color:white;">${safe(data?.contact?.portfolio)}</p>
          </div>
        </header>
        <main class="content">
          ${(data?.sections || []).map(renderSection).join("")}
        </main>
      </div>
    `;
    const buildMinimal = () => `
      <div class="page minimal">
        <h1>${safe(data?.name)}</h1>
        <p class="subtitle">${safe(data?.title)}</p>
        <p class="meta">
          ${safe(data?.contact?.email)} | ${safe(
      data?.contact?.phone
    )} | ${safe(data?.contact?.location)} | ${safe(
      data?.contact?.linkedin
    )} | ${safe(data?.contact?.portfolio)}
        </p>
        ${(data?.sections || []).map(renderSection).join("")}
      </div>
    `;

    const buildCoverLetter = (letter: any) => `
      <div class="page cover-letter" style="padding:40px;font-family:Arial,sans-serif;line-height:1.6;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <div>
            <h1 style="margin:0;font-size:26px;font-weight:bold;color:${
              t.primary
            };">${letter?.sender?.name || ""}</h1>
            <p style="margin:0;font-size:14px;color:#666;">${
              letter?.title || ""
            }</p>
          </div>
          <div style="text-align:right;font-size:12px;color:#444;">
            <div>📧${letter?.sender?.email || ""}</div>
            <div>📞${letter?.sender?.phone || ""}</div>
            <div>📍${letter?.sender?.location || ""}</div>
          </div>
        </div>

        <h2 style="margin:0 0 6px 0;font-size:16px;font-weight:bold;border-bottom:2px solid ${
          t.primary
        };padding-bottom:4px;">
          COVER LETTER
        </h2>

        <div style="margin:20px 0;font-size:13px;">
          <div>${letter?.date || ""}</div>
          <div>${letter?.recipient?.name || ""}</div>
          <div>${letter?.recipient?.company || ""}</div>
          <div>${letter?.recipient?.address || ""}</div>
        </div>

        <div style="margin:20px 0;font-size:13px;white-space:pre-line;">
          ${letter?.body || ""}
        </div>

        <div style="margin-top:40px;font-size:13px;">
          <div>${letter?.closing || ""},</div>
          <div style="margin-top:40px;font-weight:bold;">${
            letter?.signature || ""
          }</div>
        </div>
      </div>
    `;

    const buildInvoice = (invoice: any) => {
      const inv = invoice || {};
      const formatMoney = (v: any) => {
        const n = Number(v || 0);
        return n.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };
      const itemsHtml = (inv.items || [])
        .map(
          (it: any, idx: number) => `
          <tr>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;">${
              idx + 1
            }</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;">${safe(
              it.description
            )}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${safe(
              it.quantity
            )}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${formatMoney(
              it.unit_price
            )}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${formatMoney(
              it.total
            )}</td>
          </tr>
        `
        )
        .join("");
      return `
        <div class="page invoice">
          <header style="display:flex;justify-content:space-between;align-items:center;padding:20px 0;">
            <div>
              <h1 style="margin:0;font-size:24px;color:${
                t.primary
              };">Invoice</h1>
              <p style="margin:6px 0 0 0;">Invoice #: ${safe(
                inv.invoice_number
              )}</p>
              <p style="margin:0;">Date: ${safe(inv.date)} • Due: ${safe(
        inv.due_date
      )}</p>
            </div>
            <div style="text-align:right;">
              <h3 style="margin:0;">${safe((inv.from || {}).company)}</h3>
              <p style="margin:6px 0 0 0;">${safe((inv.from || {}).address)}</p>
              <p style="margin:0;">${safe((inv.from || {}).email)} • ${safe(
        (inv.from || {}).phone
      )}</p>
            </div>
          </header>
          <section style="margin-top:20px;display:flex;justify-content:space-between;padding-bottom:10px;">
            <div>
              <h4 style="margin:0 0 6px 0;">Bill To</h4>
              <p style="margin:0;">${
                safe((inv.to || {}).name) || safe((inv.to || {}).company)
              }</p>
              <p style="margin:0;">${safe((inv.to || {}).address)}</p>
              <p style="margin:0;">${safe((inv.to || {}).email)} ${
        safe((inv.to || {}).phone) ? " • " + safe((inv.to || {}).phone) : ""
      }</p>
            </div>
          </section>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;border:1px solid #eee;">
            <thead>
              <tr style="background:#fafafa;">
                <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">#</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Description</th>
                <th style="text-align:center;padding:8px;border-bottom:1px solid #eee;">Qty</th>
                <th style="text-align:right;padding:8px;border-bottom:1px solid #eee;">Unit Price</th>
                <th style="text-align:right;padding:8px;border-bottom:1px solid #eee;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <table style="width:320px;">
              <tr><td style="padding:6px 8px;">Sub Total</td><td style="padding:6px 8px;text-align:right;">${formatMoney(
                inv.sub_total || 0
              )}</td></tr>
              <tr><td style="padding:6px 8px;">Tax</td><td style="padding:6px 8px;text-align:right;">${formatMoney(
                inv.tax || 0
              )}</td></tr>
              <tr><td style="padding:6px 8px;">Discount</td><td style="padding:6px 8px;text-align:right;">${formatMoney(
                inv.discount || 0
              )}</td></tr>
              <tr style="font-weight:bold;"><td style="padding:8px 8px;border-top:1px solid #eee;">Total</td><td style="padding:8px 8px;border-top:1px solid #eee;text-align:right;">${formatMoney(
                inv.total || 0
              )}</td></tr>
            </table>
          </div>
          <footer style="margin-top:20px;"><p style="color:#666;">${safe(
            inv.notes
          )}</p></footer>
        </div>
      `;
    };

    let content = "";
    if (docType === "classic") content = buildClassic();
    else if (docType === "modern") content = buildModern();
    else if (docType === "minimal") content = buildMinimal();
    else if (docType === "invoice") content = buildInvoice(data || {});
    else if (docType === "cover_letter") content = buildCoverLetter(data || {});
    else content = buildModern();

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            h1 { font-size: 26px; margin: 0 0 6px; }
            h2 { font-size: 18px; margin: 10px 0; }
            h3 { font-size: 14px; margin: 8px 0; }
            p, li { font-size: 13px; margin: 4px 0; color: #222; }
            ul { margin: 6px 0 12px 20px; padding: 0; }
            .section { margin-bottom: 14px; }
            .skills .skill { display:inline-block;margin:4px;padding:4px 8px;border-radius:12px;background:${t.light};color:${t.primary};font-size:12px; }
            .classic { display:flex; }
            .classic .sidebar { width:30%; padding:20px; box-sizing:border-box; }
            .classic .content { width:70%; padding:20px; box-sizing:border-box; }
            .modern .header { display:flex; justify-content:space-between; align-items:center; padding:20px 20px; color:white; }
            .modern .content { padding:20px; }
            .minimal { padding:20px; }
            .invoice { padding: 10px 0; }
            .cover-letter { padding:40px; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    // --- LAUNCH CHROMIUM on Vercel using sparticuz ---
    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
      // 👇 Cast to any so TS won’t complain on Vercel
    } as any);

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${docType || "document"}.pdf`
    );
    res.setHeader("Content-Length", String(pdfBuffer.length));
    res.end(pdfBuffer);
  } catch (error: any) {
    console.error("PDF export error:", error);
    res
      .status(500)
      .json({ error: "PDF generation failed", detail: String(error) });
  }
}
