import TopBar from "@/components/TopBar";
import StatCard from "@/components/StatCard";

const outreachData = [
  { label: "Referral", pct: 78, ratio: "7/9", color: "bg-rt-blue" },
  { label: "Warm Intro", pct: 55, ratio: "6/11", color: "bg-rt-blue-mid" },
  { label: "Alumni Outreach", pct: 40, ratio: "4/10", color: "bg-[hsl(213,94%,78%)]" },
  { label: "Cold Email", pct: 18, ratio: "2/11", color: "bg-rt-blue-light" },
];

const weeklyBars = [
  { h: 40, highlight: false },
  { h: 55, highlight: false },
  { h: 70, highlight: true },
  { h: 50, highlight: false },
  { h: 80, highlight: true },
  { h: 45, highlight: false },
  { h: 60, highlight: false },
];

const tracks = [
  { label: "Consulting", color: "bg-rt-blue", stats: "3 co. · 1 interview · 0 offers" },
  { label: "Tech/PM", color: "bg-rt-purple", stats: "2 co. · 0 interviews · 0 offers" },
  { label: "VC/PE", color: "bg-rt-green", stats: "1 co. · 0 interviews · 0 offers" },
];

const Analytics = () => (
  <>
    <TopBar title="Analytics" />
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard value="46%" label="Response Rate" delta="↑ vs avg 31%" />
          <StatCard value="6" label="Interviews" />
          <StatCard value="38" label="Touchpoints" />
          <StatCard value="2.4" label="Days / Resp." delta="avg response time" />
        </div>

        {/* Two column */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Response Rate by Outreach Type */}
          <div className="bg-card border border-border rounded-lg p-3.5">
            <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
              Response Rate by Outreach Type
            </div>
            {outreachData.map((d, i) => (
              <div key={i} className="mb-2.5">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-sm ${d.color} flex-shrink-0`} />
                    <span className="text-[10px] text-rt-gray-700">{d.label}</span>
                  </div>
                  <span className="text-[10px] font-semibold font-mono text-rt-blue">
                    {d.pct}% <span className="text-rt-gray-400 font-normal">({d.ratio})</span>
                  </span>
                </div>
                <div className="h-2 rounded bg-rt-gray-200">
                  <div className={`h-full rounded ${d.color}`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
            {/* Insight */}
            <div className="mt-2.5 p-2 bg-rt-blue-pale rounded-md border-l-[3px] border-l-rt-blue">
              <div className="text-[10px] text-rt-blue font-medium">
                💡 Referrals convert 4× better than cold email — prioritize warm intros
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-card border border-border rounded-lg p-3.5">
            <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
              Weekly Activity
            </div>
            <div className="flex items-end gap-1 h-12 pt-1">
              {weeklyBars.map((bar, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm ${bar.highlight ? "bg-rt-blue" : "bg-rt-blue-light"}`}
                  style={{ height: `${bar.h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {weeklyBars.map((_, i) => (
                <span key={i} className="text-[8px] font-mono text-rt-gray-400 flex-1 text-center">W{i + 1}</span>
              ))}
            </div>
            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-1.5 mt-3">
              {[
                { val: "18", label: "Emails" },
                { val: "12", label: "Chats" },
                { val: "8", label: "Follow-ups" },
              ].map((s) => (
                <div key={s.label} className="bg-rt-gray-100 rounded-md p-2 text-center">
                  <div className="text-base font-semibold font-mono text-foreground leading-none">{s.val}</div>
                  <div className="text-[8px] font-mono uppercase tracking-wider text-rt-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion by Track */}
        <div className="bg-card border border-border rounded-lg p-3.5">
          <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
            Conversion by Track
          </div>
          <div className="grid grid-cols-3 gap-2">
            {tracks.map((t) => (
              <div key={t.label} className={`${t.color} rounded-lg p-3 text-primary-foreground`}>
                <div className="text-[11px] font-semibold">{t.label}</div>
                <div className="text-[10px] opacity-90 mt-0.5">{t.stats}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
);

export default Analytics;
