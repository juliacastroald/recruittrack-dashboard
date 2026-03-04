import TopBar from "@/components/TopBar";
import StatCard from "@/components/StatCard";
import Tag from "@/components/Tag";
import { toast } from "sonner";

const activityItems = [
  { color: "bg-rt-blue", text: "Coffee chat logged — McKinsey", time: "2 hours ago" },
  { color: "bg-rt-green", text: "Application submitted — Stripe", time: "Yesterday" },
  { color: "bg-rt-amber", text: "Interview scheduled — Bain", time: "Yesterday" },
  { color: "bg-rt-blue", text: "Follow-up sent — BCG contact", time: "2 days ago" },
  { color: "bg-rt-gray-400", text: "Added contact — HBS alumna", time: "3 days ago" },
];

const followUps = [
  { name: "Sarah Kim", company: "McKinsey", note: "Coffee chat Feb 22", tag: "7d overdue", variant: "red" as const, avatarColor: "bg-rt-blue-light" },
  { name: "Michael Torres", company: "Sequoia", note: "No reply Feb 15", tag: "14d overdue", variant: "red" as const, avatarColor: "bg-rt-gray-200" },
  { name: "Priya Nair", company: "Bain", note: "Promised to reconnect", tag: "Due today", variant: "amber" as const, avatarColor: "bg-rt-amber-light" },
];

const Dashboard = () => (
  <>
    <TopBar title="Dashboard" actionLabel="+ Add Application" showSearch />
    <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard value="24" label="Companies" delta="↑ 3 this week" />
        <StatCard value="11" label="Applied" />
        <StatCard value="6" label="Interviews" delta="2 pending" deltaColor="amber" />
        <StatCard value="38" label="Contacts" />
      </div>

      {/* Needs Attention */}
      <div className="bg-gradient-to-r from-rt-blue-pale to-card border border-border rounded-lg p-3.5 border-l-[3px] border-l-rt-blue">
        <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-blue mb-2.5">
          ⚡ Needs Your Attention Today
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Overdue */}
          <div className="bg-card border border-rt-red-light rounded-[7px] p-2.5">
            <Tag variant="red" className="mb-1.5">Overdue</Tag>
            <div className="text-[11px] font-medium text-rt-gray-700">Follow up with Sarah Kim</div>
            <div className="text-[10px] text-rt-gray-400 mt-0.5">McKinsey · Coffee chat Feb 22</div>
            <button onClick={() => toast("Follow-up action")} className="mt-2 w-full h-5 bg-rt-blue rounded-[5px] flex items-center justify-center">
              <span className="text-[9px] font-mono text-primary-foreground">Send follow-up →</span>
            </button>
          </div>
          {/* Due Today */}
          <div className="bg-card border border-rt-amber-light rounded-[7px] p-2.5">
            <Tag variant="amber" className="mb-1.5">Due Today</Tag>
            <div className="text-[11px] font-medium text-rt-gray-700">Bain application closes</div>
            <div className="text-[10px] text-rt-gray-400 mt-0.5">Final deadline · Mar 1</div>
            <button onClick={() => toast("View company")} className="mt-2 w-full h-5 bg-rt-blue rounded-[5px] flex items-center justify-center">
              <span className="text-[9px] font-mono text-primary-foreground">View company →</span>
            </button>
          </div>
          {/* This Week */}
          <div className="bg-card border border-border rounded-[7px] p-2.5">
            <Tag variant="blue" className="mb-1.5">This Week</Tag>
            <div className="text-[11px] font-medium text-rt-gray-700">1st Round Interview — BCG</div>
            <div className="text-[10px] text-rt-gray-400 mt-0.5">Mar 3 · 2:00 PM</div>
            <button onClick={() => toast("View prep notes")} className="mt-2 w-full h-5 bg-rt-gray-100 rounded-[5px] flex items-center justify-center">
              <span className="text-[9px] font-mono text-rt-gray-500">View prep notes →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two column: Activity + Right stack */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-2.5 flex-1 min-h-0">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-3.5">
          <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
            Recent Activity
          </div>
          {activityItems.map((item, i) => (
            <div key={i} className={`flex items-start gap-2 py-[7px] ${i < activityItems.length - 1 ? "border-b border-rt-gray-100" : ""}`}>
              <div className={`w-[7px] h-[7px] rounded-full mt-[3px] flex-shrink-0 ${item.color}`} />
              <div className="flex-1">
                <div className="text-[11px] font-medium text-rt-gray-700">{item.text}</div>
                <div className="text-[10px] text-rt-gray-400">{item.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-2.5">
          {/* Top Contacts */}
          <div className="bg-card border border-border rounded-lg p-3.5">
            <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
              Top Contacts to Follow Up
            </div>
            {followUps.map((c, i) => (
              <div key={i} className={`flex items-center gap-2 py-[7px] ${i < followUps.length - 1 ? "border-b border-rt-gray-100" : ""}`}>
                <div className={`w-6 h-6 rounded-full flex-shrink-0 ${c.avatarColor}`} />
                <div className="flex-1">
                  <div className="text-[11px] font-medium text-rt-gray-700">{c.name} · {c.company}</div>
                  <div className="text-[10px] text-rt-gray-400">{c.note}</div>
                </div>
                <Tag variant={c.variant}>{c.tag}</Tag>
              </div>
            ))}
          </div>

          {/* Pipeline Health */}
          <div className="bg-card border border-border rounded-lg p-3.5">
            <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
              Pipeline Health
            </div>
            {[
              { label: "Networking", count: "13 active", pct: 72 },
              { label: "Interview stage", count: "6 active", pct: 40 },
            ].map((bar, i) => (
              <div key={i} className={i === 0 ? "mb-1.5" : ""}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-[10px] text-rt-gray-400">{bar.label}</span>
                  <span className="text-[10px] font-mono text-rt-blue">{bar.count}</span>
                </div>
                <div className="h-2 rounded bg-rt-gray-200">
                  <div className="h-full rounded bg-rt-blue" style={{ width: `${bar.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

export default Dashboard;
