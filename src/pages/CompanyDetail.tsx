import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Tag from "@/components/Tag";
import { toast } from "sonner";

const tabs = ["Overview", "Contacts", "Notes", "Documents"];

const timelineItems = [
  {
    title: "1st Round Interview Scheduled", sub: "Mar 8 · Confirmed", filled: true,
    note: { bg: "bg-rt-blue-light", text: "text-rt-blue", content: "Prep note: Review case frameworks, MBB structure" },
  },
  {
    title: "Coffee Chat — Sarah Kim", sub: "Feb 22 · 30 min video call", filled: true,
    note: { bg: "bg-rt-gray-50 border border-border", text: "text-rt-gray-500", content: '"Emphasized fit + why consulting" — follow up sent' },
  },
  { title: "Application Submitted", sub: "Feb 10 · Via company portal", filled: true },
  { title: "Added to tracker", sub: "Feb 1", filled: false, last: true },
];

const CompanyDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [quickNotes, setQuickNotes] = useState("");

  return (
    <>
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-3.5 pb-0 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="text-[10px] text-rt-gray-400 font-mono hover:text-rt-gray-700 transition-colors">
          ← Back to Tracker
        </button>
        <div className="flex items-center gap-3 mt-2.5">
          <div className="w-9 h-9 rounded-lg bg-rt-gray-200 border border-border flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">McKinsey & Company</div>
            <div className="flex gap-1 mt-1">
              <Tag variant="blue">Consulting</Tag>
              <Tag variant="amber">1st Round Interview</Tag>
              <Tag variant="gray">Summer Internship</Tag>
            </div>
          </div>
          <button onClick={() => toast("Update stage")} className="h-[26px] px-2.5 rounded-md bg-rt-blue flex items-center">
            <span className="text-[10px] font-medium font-mono text-primary-foreground">Update Stage</span>
          </button>
        </div>
        <div className="flex mt-3 gap-0">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 text-[10px] font-medium font-mono border-b-2 transition-colors ${
                activeTab === t ? "text-rt-blue border-rt-blue" : "text-rt-gray-400 border-transparent hover:text-rt-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-[1.2fr_1fr] gap-2.5">
          {/* Timeline */}
          <div className="bg-card border border-border rounded-lg p-3.5">
            <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
              Interaction Timeline
            </div>
            {timelineItems.map((item, i) => (
              <div key={i} className="flex gap-2.5 pb-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full border-2 border-rt-blue flex-shrink-0 mt-0.5 ${item.filled ? "bg-rt-blue" : "bg-card"}`} />
                  {!item.last && <div className="w-0.5 flex-1 bg-rt-gray-200 mt-0.5 min-h-[24px]" />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="text-[11px] font-medium text-rt-gray-700">{item.title}</div>
                  <div className="text-[10px] text-rt-gray-400">{item.sub}</div>
                  {item.note && (
                    <div className={`mt-1 p-1.5 rounded-[5px] ${item.note.bg}`}>
                      <div className={`text-[10px] ${item.note.text}`}>{item.note.content}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-2.5">
            {/* Key Contacts */}
            <div className="bg-card border border-border rounded-lg p-3.5">
              <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">Key Contacts</div>
              {/* Sarah Kim */}
              <div className="py-1.5 border-b border-rt-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rt-blue-light flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-[11px] font-medium text-rt-gray-700">Sarah Kim</div>
                    <div className="text-[10px] text-rt-gray-400">Senior Associate</div>
                  </div>
                  <Tag variant="amber">Follow up</Tag>
                </div>
                <div className="ml-8 mt-1.5 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rt-blue flex-shrink-0" />
                    <span className="text-[10px] text-rt-gray-700">Referral via <span className="text-rt-blue font-medium">David Park (BCG)</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rt-gray-400 flex-shrink-0" />
                    <span className="text-[10px] text-rt-gray-400">Intro made Feb 10 · Sloan Trek</span>
                  </div>
                </div>
              </div>
              {/* Tom Walsh */}
              <div className="py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rt-gray-200 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-[11px] font-medium text-rt-gray-700">Tom Walsh</div>
                    <div className="text-[10px] text-rt-gray-400">Recruiting Coordinator</div>
                  </div>
                  <Tag variant="green">Contacted</Tag>
                </div>
                <div className="ml-8 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rt-gray-400 flex-shrink-0" />
                    <span className="text-[10px] text-rt-gray-400">Direct outreach · No referral</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Details */}
            <div className="bg-card border border-border rounded-lg p-3.5">
              <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">Role Details</div>
              {[
                { label: "Role", value: "Business Analyst Intern" },
                { label: "Deadline", value: "Mar 5 (closed)", color: "text-rt-amber" },
                { label: "Interview", value: "Mar 8, 2:00 PM" },
              ].map((r, i, arr) => (
                <div key={i} className={`flex justify-between items-center py-1.5 ${i < arr.length - 1 ? "border-b border-rt-gray-100" : ""}`}>
                  <span className="text-[10px] text-rt-gray-500 font-mono">{r.label}</span>
                  <span className={`text-[10px] font-mono ${r.color ?? "text-rt-gray-700"}`}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Quick Notes */}
            <div className="bg-card border border-border rounded-lg p-3.5 flex-1">
              <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">Quick Notes</div>
              <textarea
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                placeholder="Add your notes here..."
                className="w-full h-[70px] bg-rt-gray-50 border border-border rounded-md p-2 text-[10px] text-rt-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-rt-blue"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyDetail;
