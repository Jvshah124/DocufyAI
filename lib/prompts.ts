// lib/prompts.ts
export type PromptVariant = {
  id: string;
  title: string;
  prompt: string;
  description?: string;
};

export const prompts: Record<string, PromptVariant[]> = {
  resume: [
    {
      id: "resume_ats_marketing",
      title: "ATS-Friendly Resume — Marketing",
      prompt:
        "Design a modern, ATS-friendly resume for a marketing professional with 5 years of experience. " +
        "Include: contact info, summary, 3–4 achievements with measurable results (% growth, leads, conversions), skills (hard + soft), and education. " +
        "Use action verbs and bullet points. Replace placeholders: [NAME], [ROLE], [COMPANY].",
    },
    {
      id: "resume_software_engineer",
      title: "Senior Software Engineer Resume",
      prompt:
        "Generate a resume for a Senior Software Engineer with 8+ years of experience. " +
        "Include summary, 3–5 work experiences with quantifiable results (latency reduction, cost savings), key projects with tech stack, skills, and education.",
    },
    {
      id: "resume_entry_level",
      title: "Entry-Level Resume — Recent Graduate",
      prompt:
        "Create a resume for a recent graduate with internships and academic projects. " +
        "Include summary, 2–3 internships or projects with bullet points, skills, and education with GPA. " +
        "Keep it concise and professional.",
    },
    {
      id: "resume_creative",
      title: "Creative Resume — Designer",
      prompt:
        "Generate a creative resume for a Graphic Designer. Include a bold summary, 4–5 project highlights with visuals in mind, skills (software + creativity), and education. Keep it stylish but professional.",
    },
    {
      id: "resume_executive",
      title: "Executive Resume — Leadership Focus",
      prompt:
        "Create a resume for an executive-level professional (Director/VP). " +
        "Highlight leadership achievements, revenue growth, team management, and strategic vision. " +
        "Sections: summary, executive experience, achievements, skills, education.",
    },
  ],

  cover_letter: [
    {
      id: "cover_marketing",
      title: "Marketing Professional Cover Letter",
      prompt:
        "Write a formal cover letter for a Marketing Professional applying to [COMPANY]. " +
        "Include: intro, 2–3 specific achievements with metrics, why you admire the company, and a strong closing.",
    },
    {
      id: "cover_engineer",
      title: "Software Engineer Cover Letter",
      prompt:
        "Write a cover letter for a Software Engineer applying to a tech company. " +
        "Mention programming skills, problem-solving achievements, and enthusiasm for innovation. Keep it concise and 3–4 paragraphs.",
    },
    {
      id: "cover_entry_level",
      title: "Entry-Level Cover Letter",
      prompt:
        "Write a cover letter for an entry-level candidate with limited work experience. " +
        "Focus on academic achievements, projects, eagerness to learn, and cultural fit for the company.",
    },
    {
      id: "cover_creative",
      title: "Creative Role Cover Letter",
      prompt:
        "Draft a cover letter for a Graphic Designer. Use a slightly informal tone, highlight portfolio projects, design tools expertise, and creative achievements.",
    },
    {
      id: "cover_executive",
      title: "Executive Cover Letter",
      prompt:
        "Write a cover letter for a Director-level role. Emphasize leadership, strategic planning, and achievements such as revenue growth, scaling teams, or expanding into new markets.",
    },
  ],

  invoice: [
    {
      id: "invoice_business",
      title: "Standard Business Invoice",
      prompt:
        "Generate a professional invoice for [YOUR_COMPANY] billing [CLIENT]. " +
        "Include invoice number, date, due date, bill-to and from info, itemized list (description, qty, price), subtotal, taxes, and total.",
    },
    {
      id: "invoice_freelancer",
      title: "Freelancer Invoice",
      prompt:
        "Create a freelancer invoice with project description, hourly rate, total hours, subtotal, tax, total, and payment details (bank or PayPal).",
    },
    {
      id: "invoice_creative",
      title: "Creative Services Invoice",
      prompt:
        "Draft an invoice for a Graphic Designer. Include project name, design services, revisions, subtotal, total, and a short friendly thank-you note.",
    },
    {
      id: "invoice_consulting",
      title: "Consulting Services Invoice",
      prompt:
        "Generate a consulting invoice with retainer fees, consulting hours, detailed breakdown of tasks, subtotal, taxes, total, and professional payment instructions.",
    },
    {
      id: "invoice_subscription",
      title: "Subscription Billing Invoice",
      prompt:
        "Create a recurring subscription invoice for SaaS services. Include subscription plan name, billing period, subtotal, taxes, total, and payment instructions.",
    },
  ],
};
