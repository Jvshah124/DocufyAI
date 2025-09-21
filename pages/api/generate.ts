// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { docType, prompt } = req.body; // 🟢 added prompt

    if (!docType) {
      return res.status(400).json({ error: "docType required" });
    }

    // Resume prompt
    const resumePrompt = `
      Generate a professional resume in JSON format only.
      Tailor it to: ${prompt || "a generic professional"}.

      {
        "name": "Jane Doe",
        "title": "Marketing Specialist",
        "contact": {
          "email": "...",
          "phone": "...",
          "location": "...",
          "linkedin": "...",
          "portfolio": "..."
        },
        "sections": [
          { "type":"summary", "title":"Summary", "content":"..." },
          { "type":"skills", "title":"Skills", "items":["..."] },
          { "type":"experience", "title":"Work Experience", "items":[
            { "role":"...", "company":"...", "period":"...", "location":"...", "achievements":["..."] }
          ]},
          { "type":"education", "title":"Education", "items":[
            { "degree":"...", "institution":"...", "year":"..." }
          ]},
          { "type":"certifications", "title":"Certifications", "items":["..."] },
          { "type":"projects", "title":"Projects", "items":["..."] },
          { "type":"languages", "title":"Languages", "items":["..."] },
          { "type":"hobbies", "title":"Hobbies", "items":["..."] }
        ]
      }

      Important:
      - Always return valid JSON only.
      - Always include at least: summary, skills, experience, education, certifications, projects.
      - Do not add commentary or markdown.
    `;

    // Invoice prompt
    const invoicePrompt = `
      Generate a structured invoice in JSON format only.
      Context: ${prompt || "standard client invoice"}.

      {
        "invoice_number": "INV-2025-001",
        "date": "2025-01-15",
        "due_date": "2025-02-15",
        "from": {
          "company": "Acme Co",
          "address": "123 Main St, City, Country",
          "email": "billing@acme.com",
          "phone": "+1 555 111 2222"
        },
        "to": {
          "company": "Client Co",
          "name": "Client Name",
          "address": "456 Client Ave, City, Country",
          "email": "client@example.com",
          "phone": "+1 555 333 4444"
        },
        "items": [
          { "description": "Service / Product name", "quantity": 1, "unit_price": 100.00, "total": 100.00 }
        ],
        "sub_total": 100.00,
        "tax": 0.00,
        "discount": 0.00,
        "total": 100.00,
        "notes": "Optional notes here"
      }

      Important:
      - Always return valid JSON only.
      - Dates must be real valid dates in YYYY-MM-DD format.
      - Do not include commentary or markdown.
    `;

    // Cover Letter prompt
    const coverLetterPrompt = `
      Generate a professional cover letter in JSON format only.
      Tailor it to: ${prompt || "a generic job application"}.

      {
        "sender": { "name": "Jane Doe", "email": "jane@example.com", "phone": "(123) 456-7890", "location": "NYC" },
        "recipient": { "name": "Hiring Manager", "company": "TechCorp", "address": "123 Main St, New York, NY" },
        "date": "2025-01-20",
        "body": "Dear Hiring Manager,\\n\\nParagraph 1...\\n\\nParagraph 2...\\n\\nParagraph 3...",
        "closing": "Sincerely",
        "signature": "Jane Doe"
      }

      Important:
      - Always return valid JSON only.
      - Do not include commentary or markdown.
    `;

    // pick the right prompt
    let aiPrompt = "";
    if (docType === "resume") aiPrompt = resumePrompt;
    else if (docType === "invoice") aiPrompt = invoicePrompt;
    else if (docType === "cover_letter") aiPrompt = coverLetterPrompt;

    if (!aiPrompt) {
      return res.status(400).json({ error: "Unsupported docType" });
    }

    // send to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.2,
    });

    const raw = response.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse AI output:", raw);
      return res.status(500).json({ error: "Invalid AI response", raw });
    }

    res.status(200).json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating content" });
  }
}
