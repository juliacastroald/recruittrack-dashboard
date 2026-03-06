import { useState } from "react";
import TopBar from "@/components/TopBar";
import Tag from "@/components/Tag";
import FollowUpEmailModal from "@/components/FollowUpEmailModal";
import AddContactModal from "@/components/AddContactModal";
import type { NewContactData } from "@/components/AddContactModal";
import { FOLLOW_UP_EMAIL_CONTACTS } from "@/data/followUpEmailContacts";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Contact {
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

const initialContacts: Contact[] = [
  {
    name: "Sarah Kim", role: "Senior Associate", company: "McKinsey & Company",
    track: "blue", trackLabel: "Consulting", lastTouch: "Feb 22",
    followUp: { label: "⚠ Overdue", type: "overdue" },
    status: { label: "Warm", variant: "amber" }, avatarColor: "bg-rt-blue-light",
    detail: {
      email: "skim@mckinsey.com", linkedin: "linkedin.com/in/sarahkim",
      metAt: "Met at Sloan Trek · Feb 10",
      notes: "Really helpful conversation about the BA role. Said to follow up after submitting application.",
      suggestedAction: "Send thank-you — 7 days since last chat",
    },
  },
  {
    name: "Tom Walsh", role: "Recruiting Coordinator", company: "McKinsey & Company",
    track: "blue", trackLabel: "Consulting", lastTouch: "Feb 15",
    followUp: { label: "Due Mar 3", type: "pending" },
    status: { label: "Active", variant: "green" }, avatarColor: "bg-rt-gray-200",
    detail: {
      email: "twalsh@mckinsey.com", linkedin: "linkedin.com/in/tomwalsh",
      metAt: "Direct outreach",
      notes: "Confirmed application was received. Mentioned decisions go out mid-March.",
      suggestedAction: "Follow up approaching — due Mar 3",
    },
  },
  {
    name: "James Liu", role: "Product Manager", company: "Stripe",
    track: "purple", trackLabel: "Tech/PM", lastTouch: "Feb 28",
    followUp: { label: "✓ Sent", type: "done" },
    status: { label: "Active", variant: "green" }, avatarColor: "bg-rt-green-light",
    detail: {
      email: "j.liu@stripe.com", linkedin: "linkedin.com/in/jamesliu",
      metAt: "Met at tech mixer · Feb 15",
      notes: "Met at a tech mixer. Very open to referrals. Suggested reaching out to the recruiting team directly after connecting on LinkedIn.",
      suggestedAction: "No action needed — follow-up already sent",
    },
  },
  {
    name: "Priya Nair", role: "Senior Associate", company: "Bain & Company",
    track: "blue", trackLabel: "Consulting", lastTouch: "Feb 20",
    followUp: { label: "Due Mar 3", type: "pending" },
    status: { label: "Warm", variant: "amber" }, avatarColor: "bg-rt-amber-light",
    detail: {
      email: "p.nair@bain.com", linkedin: "linkedin.com/in/priyanair",
      metAt: "Sloan networking event · Feb 18",
      notes: "Great conversation at the Sloan networking event. Mentioned Bain is looking for strong generalists. Said to apply early.",
      suggestedAction: "Send follow-up before Mar 3 deadline",
    },
  },
  {
    name: "Michael Torres", role: "Partner", company: "Sequoia Capital",
    track: "gray", trackLabel: "VC/PE", lastTouch: "Feb 15",
    followUp: { label: "⚠ Overdue", type: "overdue" },
    status: { label: "Cold", variant: "red" }, avatarColor: "bg-rt-gray-200",
    detail: {
      email: "m.torres@sequoiacap.com", linkedin: "linkedin.com/in/michaeltorres",
      metAt: "Cold outreach via LinkedIn · Feb 5",
      notes: "Cold outreach via LinkedIn. Responded quickly. Interested in candidates with operational experience.",
      suggestedAction: "Re-engage — 14 days since last contact",
    },
  },
  {
    name: "Anna Chen", role: "Recruiter", company: "Google",
    track: "purple", trackLabel: "Tech/PM", lastTouch: "Mar 1",
    followUp: { label: "✓ Sent", type: "done" },
    status: { label: "Active", variant: "green" }, avatarColor: "bg-rt-blue-light",
    detail: {
      email: "a.chen@google.com", linkedin: "linkedin.com/in/annachen",
      metAt: "Alumni network · Feb 25",
      notes: "Reached out via alumni network. Helpful overview of the PM role requirements and interview format.",
      suggestedAction: "No action needed — follow-up already sent",
    },
  },
  {
    name: "David Park", role: "Senior Associate", company: "BCG",
    track: "blue", trackLabel: "Consulting", lastTouch: "Jan 30",
    followUp: { label: "✓ Sent", type: "done" },
    status: { label: "Active", variant: "green" }, avatarColor: "bg-rt-gray-200",
    detail: {
      email: "d.park@bcg.com", linkedin: "linkedin.com/in/davidpark",
      metAt: "BCG info session · Jan 20",
      notes: "Former Sloan alum. Very generous with time. Offered to refer if application looks strong.",
      suggestedAction: "Consider re-engaging if BCG pipeline opens",
    },
  },
];

const followUpClass = {
  done: "bg-rt-green-light text-rt-green",
  overdue: "bg-rt-red-light text-rt-red-dark",
  pending: "bg-rt-amber-light text-rt-amber-dark",
};

const Networking = () => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [followUpEmailModalOpen, setFollowUpEmailModalOpen] = useState(false);
  const [selectedContactName, setSelectedContactName] = useState<string | null>(null);
  const [addContactModalOpen, setAddContactModalOpen] = useState(false);

  const handleAddContact = (data: NewContactData) => {
    setContacts((prev) => [{ ...data }, ...prev]);
    setExpandedIdx(null);
  };

  const filtered = contacts.filter((c) => {
    if (followUpFilter !== "all" && c.followUp.type !== followUpFilter) return false;
    if (trackFilter !== "all" && c.track !== trackFilter) return false;
    return true;
  });

  return (
    <>
      <FollowUpEmailModal
        open={followUpEmailModalOpen}
        onClose={() => setFollowUpEmailModalOpen(false)}
        contact={selectedContactName ? FOLLOW_UP_EMAIL_CONTACTS[selectedContactName] : undefined}
      />

      <AddContactModal
        open={addContactModalOpen}
        onClose={() => setAddContactModalOpen(false)}
        onSubmit={handleAddContact}
      />

      <TopBar
        title="People"
        actionLabel="+ Add Contact"
        onAction={() => setAddContactModalOpen(true)}
      >
        <div className="flex gap-1.5 items-center">
          <Select value={followUpFilter} onValueChange={setFollowUpFilter}>
            <SelectTrigger className="h-6 w-[100px] text-[9px] font-mono border-border bg-rt-gray-100 px-2 rounded-md">
              <SelectValue placeholder="Follow-Up" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px]">All Follow-Ups</SelectItem>
              <SelectItem value="done" className="text-[10px]">Sent</SelectItem>
              <SelectItem value="pending" className="text-[10px]">Due</SelectItem>
              <SelectItem value="overdue" className="text-[10px]">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={trackFilter} onValueChange={setTrackFilter}>
            <SelectTrigger className="h-6 w-[100px] text-[9px] font-mono border-border bg-rt-gray-100 px-2 rounded-md">
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px]">All Tracks</SelectItem>
              <SelectItem value="blue" className="text-[10px]">Consulting</SelectItem>
              <SelectItem value="purple" className="text-[10px]">Tech/PM</SelectItem>
              <SelectItem value="gray" className="text-[10px]">VC/PE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TopBar>
      <div className="flex-1 overflow-auto p-3">
        {/* Table header */}
        <div className="grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-2 px-3 mb-1.5">
          {["Contact", "Company", "Track", "Last Touch", "Follow-Up", "Status"].map((h) => (
            <div key={h} className="text-[9px] font-semibold uppercase tracking-wider text-rt-gray-400 font-mono">{h}</div>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((c, i) => {
          const isExpanded = expandedIdx === i;
          return (
            <div
              key={i}
              className={`bg-card rounded-[7px] mb-1.5 border transition-colors cursor-pointer ${
                isExpanded ? "border-rt-blue" : "border-border"
              }`}
              style={{ opacity: c.opacity ?? 1 }}
              onClick={() => setExpandedIdx(isExpanded ? null : i)}
            >
              {/* Summary row */}
              <div className={`grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-2 items-center px-3 py-2 ${isExpanded ? "border-b border-rt-blue-light" : ""}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 ${c.avatarColor}`} />
                  <div>
                    <div className="text-[11px] font-medium text-rt-gray-700">{c.name}</div>
                    <div className="text-[10px] text-rt-gray-400">{c.role}</div>
                  </div>
                </div>
                <div className="text-[11px] font-medium text-rt-gray-700">{c.company}</div>
                <div><Tag variant={c.track}>{c.trackLabel}</Tag></div>
                <div className="text-[10px] text-rt-gray-400 font-mono">{c.lastTouch}</div>
                <div>
                  <span className={`inline-flex items-center gap-1 h-5 px-2 rounded-[5px] text-[9px] font-medium font-mono ${followUpClass[c.followUp.type]}`}>
                    {c.followUp.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag variant={c.status.variant}>{c.status.label}</Tag>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-rt-blue" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-rt-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && c.detail && (
                <div className="p-3 bg-rt-blue-pale flex gap-2.5">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500">Contact Info</div>
                    <div className="text-[10px] text-rt-gray-700">✉ {c.detail.email}</div>
                    <div className="text-[10px] text-rt-gray-700">🔗 {c.detail.linkedin}</div>
                    <div className="text-[10px] text-rt-gray-700">📅 {c.detail.metAt}</div>
                  </div>
                  <div className="flex-[1.4] flex flex-col gap-1">
                    <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500">Notes</div>
                    <div className="bg-card border border-border rounded-[5px] p-1.5">
                      <div className="text-[10px] text-rt-gray-500 leading-relaxed">{c.detail.notes}</div>
                    </div>
                  </div>
                  <div className="flex-[1.4] flex flex-col gap-1">
                    <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500">Suggested Action</div>
                    <div className="bg-rt-amber-light rounded-[5px] p-1.5 border border-rt-amber">
                      <div className="text-[10px] text-rt-amber-dark font-medium">{c.detail.suggestedAction}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (c.detail && FOLLOW_UP_EMAIL_CONTACTS[c.name]) {
                          setSelectedContactName(c.name);
                          setFollowUpEmailModalOpen(true);
                        }
                      }}
                      className="mt-1 h-[22px] bg-rt-blue rounded-[5px] flex items-center justify-center"
                    >
                      <span className="text-[9px] font-mono text-primary-foreground">Draft follow-up email →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Networking;
