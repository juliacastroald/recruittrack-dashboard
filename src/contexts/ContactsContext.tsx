import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface Contact {
  name: string;
  role: string;
  company: string;
  track: "blue" | "purple" | "gray";
  trackLabel: string;
  lastTouch: string;
  followUp: { label: string; type: "done" | "overdue" | "pending" };
  status: { label: string; variant: "green" | "amber" | "red" | "gray" };
  avatarColor: string;
  opacity?: number;
  detail?: {
    email: string;
    linkedin: string;
    metAt: string;
    notes: string;
    suggestedAction: string;
  };
}

const STORAGE_KEY = "recruittrack-contacts";

function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialContacts;
    const parsed = JSON.parse(raw) as Contact[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialContacts;
  } catch {
    return initialContacts;
  }
}

const initialContacts: Contact[] = [
  {
    name: "Sarah Kim",
    role: "Senior Associate",
    company: "McKinsey & Company",
    track: "blue",
    trackLabel: "Consulting",
    lastTouch: "Feb 22",
    followUp: { label: "⚠ Overdue", type: "overdue" },
    status: { label: "Warm", variant: "amber" },
    avatarColor: "bg-rt-blue-light",
    detail: {
      email: "skim@mckinsey.com",
      linkedin: "linkedin.com/in/sarahkim",
      metAt: "Met at Sloan Trek · Feb 10",
      notes:
        "Really helpful conversation about the BA role. Said to follow up after submitting application.",
      suggestedAction: "Send thank-you — 7 days since last chat",
    },
  },
  {
    name: "Tom Walsh",
    role: "Recruiting Coordinator",
    company: "McKinsey & Company",
    track: "blue",
    trackLabel: "Consulting",
    lastTouch: "Feb 15",
    followUp: { label: "Due Mar 3", type: "pending" },
    status: { label: "Active", variant: "green" },
    avatarColor: "bg-rt-gray-200",
    detail: {
      email: "twalsh@mckinsey.com",
      linkedin: "linkedin.com/in/tomwalsh",
      metAt: "Direct outreach",
      notes:
        "Confirmed application was received. Mentioned decisions go out mid-March.",
      suggestedAction: "Follow up approaching — due Mar 3",
    },
  },
  {
    name: "James Liu",
    role: "Product Manager",
    company: "Stripe",
    track: "purple",
    trackLabel: "Tech/PM",
    lastTouch: "Feb 28",
    followUp: { label: "✓ Sent", type: "done" },
    status: { label: "Active", variant: "green" },
    avatarColor: "bg-rt-green-light",
    detail: {
      email: "j.liu@stripe.com",
      linkedin: "linkedin.com/in/jamesliu",
      metAt: "Met at tech mixer · Feb 15",
      notes:
        "Met at a tech mixer. Very open to referrals. Suggested reaching out to the recruiting team directly after connecting on LinkedIn.",
      suggestedAction: "No action needed — follow-up already sent",
    },
  },
  {
    name: "Priya Nair",
    role: "Senior Associate",
    company: "Bain & Company",
    track: "blue",
    trackLabel: "Consulting",
    lastTouch: "Feb 20",
    followUp: { label: "Due Mar 3", type: "pending" },
    status: { label: "Warm", variant: "amber" },
    avatarColor: "bg-rt-amber-light",
    detail: {
      email: "p.nair@bain.com",
      linkedin: "linkedin.com/in/priyanair",
      metAt: "Sloan networking event · Feb 18",
      notes:
        "Great conversation at the Sloan networking event. Mentioned Bain is looking for strong generalists. Said to apply early.",
      suggestedAction: "Send follow-up before Mar 3 deadline",
    },
  },
  {
    name: "Michael Torres",
    role: "Partner",
    company: "Sequoia Capital",
    track: "gray",
    trackLabel: "VC/PE",
    lastTouch: "Feb 15",
    followUp: { label: "⚠ Overdue", type: "overdue" },
    status: { label: "Cold", variant: "red" },
    avatarColor: "bg-rt-gray-200",
    detail: {
      email: "m.torres@sequoiacap.com",
      linkedin: "linkedin.com/in/michaeltorres",
      metAt: "Cold outreach via LinkedIn · Feb 5",
      notes:
        "Cold outreach via LinkedIn. Responded quickly. Interested in candidates with operational experience.",
      suggestedAction: "Re-engage — 14 days since last contact",
    },
  },
  {
    name: "Anna Chen",
    role: "Recruiter",
    company: "Google",
    track: "purple",
    trackLabel: "Tech/PM",
    lastTouch: "Mar 1",
    followUp: { label: "✓ Sent", type: "done" },
    status: { label: "Active", variant: "green" },
    avatarColor: "bg-rt-blue-light",
    detail: {
      email: "a.chen@google.com",
      linkedin: "linkedin.com/in/annachen",
      metAt: "Alumni network · Feb 25",
      notes:
        "Reached out via alumni network. Helpful overview of the PM role requirements and interview format.",
      suggestedAction: "No action needed — follow-up already sent",
    },
  },
  {
    name: "Luisa Fernandez",
    role: "Strategy and Operations Manager",
    company: "Google",
    track: "purple",
    trackLabel: "Tech/PM",
    lastTouch: "Mar 2",
    followUp: { label: "Due Mar 12", type: "pending" },
    status: { label: "Warm", variant: "amber" },
    avatarColor: "bg-rt-amber-light",
    detail: {
      email: "lfernandez@google.com",
      linkedin: "linkedin.com/in/luisafernandez",
      metAt: "LinkedIn outreach · Mar 2",
      notes:
        "Reached out via LinkedIn to learn about the Strategy and Operations team. She responded within a few days and was happy to do a 20-minute call. Shared that her team works closely with product and engineering on go-to-market and operational excellence. Mentioned they often hire from consulting and MBA backgrounds. Said to send a follow-up with my resume and to mention her name if I apply to any Strat & Ops roles. Very approachable and gave concrete tips on tailoring the application.",
      suggestedAction: "Send thank-you and share resume before Mar 12",
    },
  },
  {
    name: "David Park",
    role: "Senior Associate",
    company: "BCG",
    track: "blue",
    trackLabel: "Consulting",
    lastTouch: "Jan 30",
    followUp: { label: "✓ Sent", type: "done" },
    status: { label: "Active", variant: "green" },
    avatarColor: "bg-rt-gray-200",
    detail: {
      email: "d.park@bcg.com",
      linkedin: "linkedin.com/in/davidpark",
      metAt: "BCG info session · Jan 20",
      notes:
        "Former Sloan alum. Very generous with time. Offered to refer if application looks strong.",
      suggestedAction: "Consider re-engaging if BCG pipeline opens",
    },
  },
];

type SetContacts = React.Dispatch<React.SetStateAction<Contact[]>>;

const ContactsContext = createContext<{
  contacts: Contact[];
  setContacts: SetContacts;
} | null>(null);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(loadContacts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  return (
    <ContactsContext.Provider value={{ contacts, setContacts }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within ContactsProvider");
  return ctx;
}

/** Get contacts that belong to a company (by company name). */
export function useContactsForCompany(companyName: string): Contact[] {
  const { contacts } = useContacts();
  return contacts.filter((c) => c.company === companyName);
}
