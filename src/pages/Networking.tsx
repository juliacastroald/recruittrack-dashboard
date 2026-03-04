import { useState } from "react";
import TopBar from "@/components/TopBar";
import Tag from "@/components/Tag";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

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

const contacts: Contact[] = [
  {
    name: "Sarah Kim", role: "Senior Associate", company: "McKinsey",
    track: "blue", trackLabel: "Consulting", lastTouch: "Feb 22",
    followUp: { label: "⚠ Overdue", type: "overdue" },
    status: { label: "Warm", variant: "amber" }, avatarColor: "bg-rt-blue-light",
    detail: {
      email: "s.kim@mckinsey.com", linkedin: "linkedin.com/in/sarahkim",
      metAt: "Met at Sloan Trek · Feb 10",
      notes: '"Emphasized fit + why consulting. Said to reach out after apps close. Very helpful."',
      suggestedAction: "Send thank-you — 7 days since last chat",
    },
  },
  {
    name: "James Liu", role: "PM, Growth", company: "Stripe",
    track: "purple", trackLabel: "Tech", lastTouch: "Feb 28",
    followUp: { label: "✓ Sent", type: "done" },
    status: { label: "Active", variant: "green" }, avatarColor: "bg-rt-green-light",
    detail: {
      email: "j.liu@stripe.com", linkedin: "linkedin.com/in/jamesliu",
      metAt: "Met at MIT FinTech Conference · Feb 15",
      notes: '"Really interested in growth PM roles. Gave great advice on Stripe culture and interview process."',
      suggestedAction: "No action needed — follow-up already sent",
    },
  },
  {
    name: "Priya Nair", role: "Associate", company: "Bain & Co.",
    track: "blue", trackLabel: "Consulting", lastTouch: "Feb 20",
    followUp: { label: "↻ Due Mar 3", type: "pending" },
    status: { label: "Warm", variant: "amber" }, avatarColor: "bg-rt-amber-light",
    detail: {
      email: "p.nair@bain.com", linkedin: "linkedin.com/in/priyanair",
      metAt: "Intro via Sarah Kim · Feb 18",
      notes: '"Discussed Bain\'s healthcare practice. Offered to review my resume before application deadline."',
      suggestedAction: "Send follow-up before Mar 3 deadline",
    },
  },
  {
    name: "Michael Torres", role: "VP Strategy", company: "Sequoia",
    track: "gray", trackLabel: "VC/PE", lastTouch: "Feb 15",
    followUp: { label: "⚠ Overdue", type: "overdue" },
    status: { label: "Cold", variant: "red" }, avatarColor: "bg-rt-gray-200",
    detail: {
      email: "m.torres@sequoiacap.com", linkedin: "linkedin.com/in/michaeltorres",
      metAt: "HBS VC Trek · Feb 5",
      notes: '"Brief conversation at networking event. Mentioned openness to coffee chats with MBA students."',
      suggestedAction: "Re-engage — 14 days since last contact",
    },
  },
  {
    name: "Anna Chen", role: "Associate PM", company: "Google",
    track: "purple", trackLabel: "Tech", lastTouch: "Mar 1",
    followUp: { label: "✓ Sent", type: "done" },
    status: { label: "Active", variant: "green" }, avatarColor: "bg-rt-blue-light",
    detail: {
      email: "a.chen@google.com", linkedin: "linkedin.com/in/annachen",
      metAt: "Google campus visit · Feb 25",
      notes: '"Shared insights on APM program. Recommended focusing on product sense cases for interviews."',
      suggestedAction: "No action needed — follow-up already sent",
    },
  },
  {
    name: "David Park", role: "Principal", company: "BCG",
    track: "blue", trackLabel: "Consulting", lastTouch: "Jan 30",
    followUp: { label: "✓ Sent", type: "done" },
    status: { label: "Inactive", variant: "gray" }, avatarColor: "bg-rt-gray-200", opacity: 0.6,
    detail: {
      email: "d.park@bcg.com", linkedin: "linkedin.com/in/davidpark",
      metAt: "BCG info session · Jan 20",
      notes: '"Provided referral for Sarah Kim at McKinsey. Mentioned BCG is hiring for summer."',
      suggestedAction: "Consider re-engaging if BCG pipeline opens",
    },
  },
];

const followUpClass = {
  done: "bg-rt-green-light text-rt-green",
  overdue: "bg-rt-red-light text-rt-red-dark",
  pending: "bg-rt-amber-light text-rt-amber-dark",
};

const filterOptions = ["All", "Pending Follow-Up", "Consulting"];

const Networking = () => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <>
      <TopBar title="People" actionLabel="+ Add Contact">
        <div className="flex gap-1.5 items-center">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`h-6 px-2.5 rounded-md text-[9px] font-medium font-mono transition-colors ${
                activeFilter === f ? "bg-rt-blue-light text-rt-blue" : "bg-rt-gray-100 text-rt-gray-500"
              }`}
            >
              {f}
            </button>
          ))}
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
        {contacts.map((c, i) => {
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
                      onClick={(e) => { e.stopPropagation(); toast("Drafting follow-up email…"); }}
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
