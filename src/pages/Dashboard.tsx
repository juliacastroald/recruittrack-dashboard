import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { parse, isToday, startOfDay, addDays, isBefore, isAfter, subDays } from "date-fns";
import TopBar from "@/components/TopBar";
import StatCard from "@/components/StatCard";
import Tag from "@/components/Tag";
import FollowUpEmailModal from "@/components/FollowUpEmailModal";
import { useCompanies } from "@/contexts/CompaniesContext";
import { useContacts } from "@/contexts/ContactsContext";

function parseDeadline(deadline: string): Date | null {
  if (!deadline || deadline === "Rolling") return null;
  const year = new Date().getFullYear();
  try {
    const d = parse(`${deadline} ${year}`, "MMM d yyyy", new Date());
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function parseInterviewDate(interviewValue: string): Date | null {
  const match = interviewValue.match(/([A-Za-z]{3}\s+\d+)/);
  if (!match) return null;
  const year = new Date().getFullYear();
  try {
    const d = parse(`${match[1]} ${year}`, "MMM d yyyy", new Date());
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/** True if date falls within the next 7 days (today inclusive). */
function isWithinNext7Days(d: Date): boolean {
  const today = startOfDay(new Date());
  const end = addDays(today, 6);
  const dDay = startOfDay(d);
  return !isBefore(dDay, today) && !isAfter(dDay, end);
}

/** True if date is within the last 7 days (today inclusive). */
function isWithinLast7Days(d: Date): boolean {
  const today = startOfDay(new Date());
  const start = subDays(today, 6);
  const dDay = startOfDay(d);
  return !isBefore(dDay, start) && !isAfter(dDay, today);
}

function parseSubDate(sub: string): Date | null {
  const match = sub.match(/([A-Za-z]{3}\s+\d+)/);
  if (!match) return null;
  const year = new Date().getFullYear();
  try {
    const d = parse(`${match[1]} ${year}`, "MMM d yyyy", new Date());
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

const activityItems = [
  { color: "bg-rt-blue", text: "Coffee chat logged — McKinsey", time: "2 hours ago" },
  { color: "bg-rt-green", text: "Application submitted — Stripe", time: "Yesterday" },
  { color: "bg-rt-amber", text: "Interview scheduled — Bain", time: "Yesterday" },
  { color: "bg-rt-blue", text: "Follow-up sent — BCG contact", time: "2 days ago" },
  { color: "bg-rt-gray-400", text: "Added contact — HBS alumna", time: "3 days ago" },
];

const followUps = [
  { name: "Sarah Kim", company: "McKinsey & Company", note: "Coffee chat Feb 22", tag: "7d overdue", variant: "red" as const, avatarColor: "bg-rt-blue-light" },
  { name: "Michael Torres", company: "Sequoia Capital", note: "No reply Feb 15", tag: "14d overdue", variant: "red" as const, avatarColor: "bg-rt-gray-200" },
  { name: "Priya Nair", company: "Bain & Company", note: "Promised to reconnect", tag: "Due Mar 3", variant: "amber" as const, avatarColor: "bg-rt-amber-light" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const { companies } = useCompanies();
  const { contacts } = useContacts();

  const companiesWithContacts = useMemo(() => {
    const withContacts = companies.filter((c) => contacts.some((cc) => cc.company === c.name)).length;
    const withNoContacts = companies.length - withContacts;
    return { withContacts, withNoContacts };
  }, [companies, contacts]);

  const dashboardStats = useMemo(() => {
    const applicationsSubmitted = companies.filter(
      (c) =>
        c.stage.label === "Applied" ||
        c.detail?.timelineItems?.some((t) => t.title === "Application Submitted")
    ).length;
    let applicationsInLast7Days = 0;
    companies.forEach((c) => {
      c.detail?.timelineItems?.forEach((t) => {
        if (t.title !== "Application Submitted") return;
        const d = parseSubDate(t.sub);
        if (d && isWithinLast7Days(d)) applicationsInLast7Days += 1;
      });
    });

    const interviewStageLabels = ["Phone Screen", "1st Round Interview", "2nd Round Interview", "Final Round"];
    const interviewsCount = companies.filter((c) =>
      interviewStageLabels.includes(c.stage.label)
    ).length;
    const interviewsPending = companies.filter((c) => {
      if (!interviewStageLabels.includes(c.stage.label)) return false;
      const interviewEntry = c.detail?.roleDetails?.find((r) => r.label === "Interview");
      if (!interviewEntry?.value) return false;
      const d = parseInterviewDate(interviewEntry.value);
      return d && (isToday(d) || isAfter(startOfDay(d), startOfDay(new Date())));
    }).length;

    return {
      applicationsSubmitted,
      applicationsInLast7Days,
      interviewsCount,
      interviewsPending,
      contactsCount: contacts.length,
    };
  }, [companies, contacts]);

  const attentionItems = useMemo(() => {
    const companyByName = (name: string) => companies.find((c) => c.name === name);

    const overdueList = contacts
      .filter((c) => c.followUp.type === "overdue")
      .map((contact) => {
        const company = companyByName(contact.company);
        return company
          ? {
              companyId: company.id,
              companyName: company.name,
              title: `Follow up with ${contact.name}`,
              sub: `${company.name} · ${contact.detail?.metAt ?? contact.lastTouch}`,
            }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const dueTodayList = companies
      .filter((c) => {
        const d = parseDeadline(c.deadline);
        return d && isToday(d);
      })
      .map((c) => ({
        companyId: c.id,
        companyName: c.name,
        title: `${c.name} application closes`,
        sub: `Final deadline · ${c.deadline}`,
      }));

    const interviewStageLabels = ["Phone Screen", "1st Round Interview", "2nd Round Interview", "Final Round"];
    const thisWeekList = companies
      .filter((c) => {
        if (!interviewStageLabels.includes(c.stage.label)) return false;
        const interviewEntry = c.detail?.roleDetails?.find((r) => r.label === "Interview");
        if (!interviewEntry?.value) return false;
        const d = parseInterviewDate(interviewEntry.value);
        return d && isWithinNext7Days(d);
      })
      .map((c) => {
        const interviewEntry = c.detail?.roleDetails?.find((r) => r.label === "Interview");
        return {
          companyId: c.id,
          companyName: c.name,
          title: `${c.stage.label} — ${c.name}`,
          sub: interviewEntry?.value ?? c.lastActivity,
        };
      });

    return {
      overdue: overdueList,
      dueToday: dueTodayList,
      thisWeek: thisWeekList,
    };
  }, [companies, contacts]);

  return (
  <>
    <FollowUpEmailModal open={followUpModalOpen} onClose={() => setFollowUpModalOpen(false)} />

    <TopBar title="Dashboard" />
    <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard
          value={String(dashboardStats.applicationsSubmitted)}
          label="Applications Submitted"
          subtexts={
            dashboardStats.applicationsInLast7Days > 0
              ? [`${dashboardStats.applicationsInLast7Days} in the last 7 days`]
              : undefined
          }
        />
        <StatCard
          value={String(companies.length)}
          label="Companies Applied To"
          subtexts={[
            `${companiesWithContacts.withContacts} companies with contacts`,
            `${companiesWithContacts.withNoContacts} companies with no contacts`,
          ]}
        />
        <StatCard
          value={String(dashboardStats.interviewsCount)}
          label="Interviews"
          delta={
            dashboardStats.interviewsPending > 0
              ? `${dashboardStats.interviewsPending} pending`
              : undefined
          }
          deltaColor="amber"
        />
        <StatCard value={String(dashboardStats.contactsCount)} label="Contacts" />
      </div>

      {/* Needs Attention */}
      <div className="bg-gradient-to-r from-rt-blue-pale to-card border border-border rounded-lg p-3.5 border-l-[3px] border-l-rt-blue">
        <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-blue mb-2.5">
          ⚡ Needs Your Attention Today
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Overdue */}
          <div className="bg-card border border-rt-red-light rounded-[7px] p-2.5 flex flex-col min-h-[100px]">
            <Tag variant="red" className="mb-1.5">Overdue</Tag>
            {attentionItems.overdue.length === 0 ? (
              <>
                <div className="text-[11px] font-medium text-rt-gray-700">No overdue follow-ups</div>
                <div className="text-[10px] text-rt-gray-400 mt-0.5">All caught up</div>
              </>
            ) : (
              <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto max-h-[180px]">
                {attentionItems.overdue.map((item, i) => (
                  <div key={i}>
                    <div className="text-[11px] font-medium text-rt-gray-700">{item.title}</div>
                    <div className="text-[10px] text-rt-gray-400 mt-0.5">{item.sub}</div>
                    <button
                      onClick={() => navigate(`/company/${item.companyId}`)}
                      className="mt-1.5 w-full h-5 bg-rt-blue rounded-[5px] flex items-center justify-center"
                    >
                      <span className="text-[9px] font-mono text-primary-foreground">View company →</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Due Today */}
          <div className="bg-card border border-rt-amber-light rounded-[7px] p-2.5 flex flex-col min-h-[100px]">
            <Tag variant="amber" className="mb-1.5">Due Today</Tag>
            {attentionItems.dueToday.length === 0 ? (
              <>
                <div className="text-[11px] font-medium text-rt-gray-700">No deadlines today</div>
                <div className="text-[10px] text-rt-gray-400 mt-0.5">Next deadline when set</div>
              </>
            ) : (
              <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto max-h-[180px]">
                {attentionItems.dueToday.map((item, i) => (
                  <div key={i}>
                    <div className="text-[11px] font-medium text-rt-gray-700">{item.title}</div>
                    <div className="text-[10px] text-rt-gray-400 mt-0.5">{item.sub}</div>
                    <button
                      onClick={() => navigate(`/company/${item.companyId}`)}
                      className="mt-1.5 w-full h-5 bg-rt-blue rounded-[5px] flex items-center justify-center"
                    >
                      <span className="text-[9px] font-mono text-primary-foreground">View company →</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* This Week */}
          <div className="bg-card border border-border rounded-[7px] p-2.5 flex flex-col min-h-[100px]">
            <Tag variant="blue" className="mb-1.5">This Week</Tag>
            {attentionItems.thisWeek.length === 0 ? (
              <>
                <div className="text-[11px] font-medium text-rt-gray-700">No interviews this week</div>
                <div className="text-[10px] text-rt-gray-400 mt-0.5">Upcoming when scheduled</div>
              </>
            ) : (
              <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto max-h-[180px]">
                {attentionItems.thisWeek.map((item, i) => (
                  <div key={i}>
                    <div className="text-[11px] font-medium text-rt-gray-700">{item.title}</div>
                    <div className="text-[10px] text-rt-gray-400 mt-0.5">{item.sub}</div>
                    <button
                      onClick={() => navigate(`/company/${item.companyId}`, { state: { tab: "Notes" } })}
                      className="mt-1.5 w-full h-5 bg-rt-blue rounded-[5px] flex items-center justify-center"
                    >
                      <span className="text-[9px] font-mono text-primary-foreground">View prep notes →</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
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
};

export default Dashboard;
