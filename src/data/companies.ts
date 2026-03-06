export interface Company {
  id: string;
  name: string;
  track: "blue" | "purple" | "gray" | "green" | "amber" | "red";
  trackLabel: string;
  stage: { label: string; variant: "blue" | "amber" | "gray" | "green" | "red" };
  deadline: string;
  deadlineClosed?: boolean;
  lastActivity: string;
  contacts: string;
  opacity?: number;
  detail?: {
    timelineItems: Array<{
      title: string;
      sub: string;
      filled: boolean;
      last?: boolean;
      note?: { bg: string; text: string; content: string };
    }>;
    contacts: Array<{
      name: string;
      role: string;
      tag: { label: string; variant: "amber" | "green" };
      referral?: string;
      note?: string;
    }>;
    roleDetails: Array<{ label: string; value: string; color?: string }>;
  };
}

export const initialCompanies: Company[] = [
  {
    id: "mckinsey",
    name: "McKinsey & Company",
    track: "blue",
    trackLabel: "Consulting",
    stage: { label: "1st Round Interview", variant: "amber" },
    deadline: "Mar 5",
    deadlineClosed: true,
    lastActivity: "Mar 2",
    contacts: "2 contacts",
    detail: {
      timelineItems: [
        {
          title: "1st Round Interview Scheduled",
          sub: "Mar 8 · Confirmed",
          filled: true,
          note: { bg: "bg-rt-blue-light", text: "text-rt-blue", content: "Prep note: Review case frameworks, MBB structure" },
        },
        {
          title: "Coffee Chat — Sarah Kim",
          sub: "Feb 22 · 30 min video call",
          filled: true,
          note: { bg: "bg-rt-gray-50 border border-border", text: "text-rt-gray-500", content: "Really helpful conversation about the BA role. Said to follow up after submitting application." },
        },
        { title: "Application Submitted", sub: "Feb 10 · Via company portal", filled: true, last: true },
      ],
      contacts: [
        { name: "Sarah Kim", role: "Senior Associate", tag: { label: "Follow up", variant: "amber" }, referral: "David Park (BCG)", note: "Intro made Feb 10 · Sloan Trek" },
        { name: "Tom Walsh", role: "Recruiting Coordinator", tag: { label: "Due Mar 3", variant: "amber" }, note: "Direct outreach · No referral" },
      ],
      roleDetails: [
        { label: "Role", value: "Business Analyst Intern" },
        { label: "Deadline", value: "Mar 5 (closed)", color: "text-rt-amber" },
        { label: "Interview", value: "Mar 8 2:00 PM" },
      ],
    },
  },
  {
    id: "bain",
    name: "Bain & Company",
    track: "blue",
    trackLabel: "Consulting",
    stage: { label: "Applied", variant: "blue" },
    deadline: "Mar 8",
    lastActivity: "Mar 1",
    contacts: "1 contact",
    detail: {
      timelineItems: [
        { title: "Application Submitted", sub: "Mar 1 · Via company portal", filled: true, last: true },
      ],
      contacts: [],
      roleDetails: [
        { label: "Role", value: "Associate Consultant Intern" },
        { label: "Application Type", value: "Summer Internship" },
        { label: "Deadline", value: "Mar 8" },
        { label: "Date applied", value: "Mar 1" },
      ],
    },
  },
  {
    id: "bcg",
    name: "BCG",
    track: "blue",
    trackLabel: "Consulting",
    stage: { label: "Phone Screen", variant: "amber" },
    deadline: "Mar 12",
    lastActivity: "Feb 28",
    contacts: "1 contact",
    detail: {
      timelineItems: [
        { title: "Application Submitted", sub: "Feb 15 · Via company portal", filled: true },
        { title: "Phone Screen Scheduled", sub: "Mar 5 · 10:00 AM · Virtual", filled: true, last: true },
      ],
      contacts: [],
      roleDetails: [
        { label: "Role", value: "Associate Intern" },
        { label: "Deadline", value: "Mar 12" },
        { label: "Application submitted", value: "Feb 15" },
        { label: "Phone Screen", value: "Mar 5, 10:00 AM" },
      ],
    },
  },
  {
    id: "stripe",
    name: "Stripe",
    track: "purple",
    trackLabel: "Tech/PM",
    stage: { label: "Applied", variant: "blue" },
    deadline: "Mar 15",
    lastActivity: "Feb 28",
    contacts: "1 contact",
    detail: {
      timelineItems: [
        { title: "Application Submitted", sub: "Feb 28 · Via company portal", filled: true, last: true },
      ],
      contacts: [],
      roleDetails: [
        { label: "Role", value: "Product Manager Intern" },
        { label: "Application Type", value: "Summer Internship" },
        { label: "Deadline", value: "Mar 15" },
        { label: "Date applied", value: "Feb 28" },
      ],
    },
  },
  {
    id: "google",
    name: "Google",
    track: "purple",
    trackLabel: "Tech/PM",
    stage: { label: "Networking", variant: "gray" },
    deadline: "Rolling",
    lastActivity: "Mar 1",
    contacts: "1 contact",
  },
  {
    id: "sequoia",
    name: "Sequoia Capital",
    track: "gray",
    trackLabel: "VC/PE",
    stage: { label: "Networking", variant: "gray" },
    deadline: "Rolling",
    lastActivity: "Feb 15",
    contacts: "1 contact",
  },
];
