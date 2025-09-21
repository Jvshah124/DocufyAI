export type ResumeData = {
  name: string;
  title: string;
  contact: {
    phone: string;
    email: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: {
    role: string;
    company: string;
    location: string;
    period: string;
    achievements: string[];
  }[];
  skills: string[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
};
