import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Tag from "@/components/Tag";
import { ChevronDown, ChevronUp, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format, parse } from "date-fns";
import { useContacts } from "@/contexts/ContactsContext";
import { useQuickNotes } from "@/contexts/QuickNotesContext";
import { useCompanies } from "@/contexts/CompaniesContext";
import type { Company } from "@/data/companies";

const trackOptions = [
  { value: "all", label: "All Tracks" },
  { value: "Consulting", label: "Consulting" },
  { value: "Tech/PM", label: "Tech/PM" },
  { value: "VC/PE", label: "VC/PE" },
];

const stageOptions = [
  { value: "all", label: "All Stages" },
  { value: "1st Round Interview", label: "1st Round Interview" },
  { value: "Applied", label: "Applied" },
  { value: "Phone Screen", label: "Phone Screen" },
  { value: "Networking", label: "Networking" },
];

const trackFormOptions = [
  { value: "Consulting", label: "Consulting" },
  { value: "Tech/PM", label: "Tech/PM" },
  { value: "VC/PE", label: "VC/PE" },
  { value: "Other", label: "Other" },
];

const applicationTypeOptions = ["Internship", "Full-Time", "Other"];

const applicationStageOptions = [
  "Networking",
  "Applied",
  "Phone Screen",
  "1st Round Interview",
  "2nd Round Interview",
  "Final Round",
  "Offer",
  "Rejected",
  "Withdrawn",
];

const interviewFormatOptions = ["On-site", "Virtual", "Phone", "Case", "Behavioral", "Other"];

const trackToVariant: Record<string, "blue" | "purple" | "gray" | "green" | "amber" | "red"> = {
  Consulting: "blue",
  "Tech/PM": "purple",
  "VC/PE": "gray",
  Other: "gray",
};

const trackToLabel: Record<string, string> = {
  Consulting: "Consulting",
  "Tech/PM": "Tech/PM",
  "VC/PE": "VC/PE",
  Other: "Other",
};

const CUSTOM_TRACKS_STORAGE_KEY = "recruittrack-custom-tracks";
const CUSTOM_TRACK_VARIANTS_KEY = "recruittrack-custom-track-variants";

const TRACK_VARIANT_PALETTE: Array<"blue" | "purple" | "gray" | "green" | "amber" | "red"> = [
  "green",
  "amber",
  "red",
  "blue",
  "purple",
  "gray",
];

type TrackVariant = "blue" | "purple" | "gray" | "green" | "amber" | "red";

function loadCustomTracks(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TRACKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.every((x) => typeof x === "string") ? parsed : [];
  } catch {
    return [];
  }
}

function loadCustomTrackVariants(): Record<string, TrackVariant> {
  try {
    const raw = localStorage.getItem(CUSTOM_TRACK_VARIANTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const result: Record<string, TrackVariant> = {};
    const valid: Set<TrackVariant> = new Set(TRACK_VARIANT_PALETTE);
    valid.add("blue");
    valid.add("purple");
    valid.add("gray");
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k === "string" && valid.has(v as TrackVariant)) result[k] = v as TrackVariant;
    }
    return result;
  } catch {
    return {};
  }
}

const stageToVariant: Record<string, "blue" | "amber" | "gray" | "green" | "red"> = {
  Networking: "gray",
  Applied: "blue",
  "Phone Screen": "amber",
  "1st Round Interview": "amber",
  "2nd Round Interview": "amber",
  "Final Round": "amber",
  Offer: "green",
  Rejected: "red",
  Withdrawn: "gray",
};

const inputBase =
  "w-full h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] text-[13px] placeholder:text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#2563EB]";
const labelBase = "text-[10px] font-mono uppercase tracking-wider text-[#6B7280]";

const emptyForm = {
  companyName: "",
  track: "",
  trackOther: "",
  website: "",
  logo: null as File | null,
  role: "",
  applicationType: "",
  stage: "",
  applicationDeadline: "",
  dateApplied: "",
  applicationLink: "",
  city: "",
  interviewDate: "",
  interviewFormat: "",
  interviewNotes: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  generalNotes: "",
};

const Companies = () => {
  const navigate = useNavigate();
  const { contacts } = useContacts();
  const { quickNotesByCompany, setQuickNotesByCompany } = useQuickNotes();
  const { companies, setCompanies } = useCompanies();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [trackFilter, setTrackFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingQuickNotesCompanyId, setEditingQuickNotesCompanyId] = useState<string | null>(null);
  const quickNotesTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [customTracks, setCustomTracks] = useState<string[]>(loadCustomTracks);
  const [customTrackVariants, setCustomTrackVariants] = useState<Record<string, TrackVariant>>(loadCustomTrackVariants);

  useEffect(() => {
    localStorage.setItem(CUSTOM_TRACKS_STORAGE_KEY, JSON.stringify(customTracks));
  }, [customTracks]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_TRACK_VARIANTS_KEY, JSON.stringify(customTrackVariants));
  }, [customTrackVariants]);

  useEffect(() => {
    const used = new Set<TrackVariant>(Object.values(trackToVariant));
    const assigned = new Set<TrackVariant>(Object.values(customTrackVariants));
    used.forEach((v) => assigned.add(v));
    let changed = false;
    const next: Record<string, TrackVariant> = { ...customTrackVariants };
    for (const t of customTracks) {
      if (!next[t]) {
        const v = TRACK_VARIANT_PALETTE.find((x) => !assigned.has(x)) ?? TRACK_VARIANT_PALETTE[0];
        next[t] = v;
        assigned.add(v);
        changed = true;
      }
    }
    if (changed) setCustomTrackVariants(next);
  }, [customTracks]);

  const getVariantForTrackLabel = (label: string): TrackVariant =>
    trackToVariant[label] ?? customTrackVariants[label] ?? "gray";

  const getNextUnusedVariant = (): TrackVariant => {
    const used = new Set<TrackVariant>(["blue", "purple", "gray"] as const);
    Object.values(customTrackVariants).forEach((v) => used.add(v));
    return TRACK_VARIANT_PALETTE.find((v) => !used.has(v)) ?? TRACK_VARIANT_PALETTE[0];
  };

  const filtered = companies.filter((c) => {
    if (trackFilter !== "all" && c.trackLabel !== trackFilter) return false;
    if (stageFilter !== "all" && c.stage.label !== stageFilter) return false;
    return true;
  });

  const trackFilterOptions = useMemo(
    () => [...trackOptions, ...customTracks.map((t) => ({ value: t, label: t }))],
    [customTracks]
  );

  const handleViewFullProfile = (e: React.MouseEvent, companyId: string) => {
    e.stopPropagation();
    navigate(`/company/${companyId}`);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
  };

  const handleAddCompany = () => {
    const newErrors: Record<string, string> = {};
    if (!form.companyName.trim()) newErrors.companyName = "This field is required";
    if (!form.track) newErrors.track = "This field is required";
    if (form.track === "Other" && !form.trackOther.trim()) newErrors.trackOther = "Please specify the industry/track";
    if (!form.stage) newErrors.stage = "This field is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const trackLabel =
      form.track === "Other" ? form.trackOther.trim() : (trackToLabel[form.track] ?? form.track);
    const trackValue = form.track === "Other" ? trackLabel : form.track;
    if (form.track === "Other" && trackLabel && !customTracks.includes(trackLabel)) {
      const standardValues = trackFormOptions.map((o) => o.value);
      if (!standardValues.includes(trackLabel)) {
        setCustomTracks((prev) => [...prev, trackLabel].sort());
      }
    }

    let trackVariant: TrackVariant = trackToVariant[trackValue] ?? customTrackVariants[trackValue] ?? "gray";
    if (form.track === "Other" && trackLabel && !(trackLabel in trackToVariant)) {
      if (!(trackLabel in customTrackVariants)) {
        const nextV = getNextUnusedVariant();
        trackVariant = nextV;
        setCustomTrackVariants((prev) => ({ ...prev, [trackLabel]: nextV }));
      } else {
        trackVariant = customTrackVariants[trackLabel];
      }
    }

    const id = `new-${Date.now()}`;
    const stageVariant = stageToVariant[form.stage] ?? "gray";
    const lastActivity = form.dateApplied ? format(new Date(form.dateApplied), "MMM d") : format(new Date(), "MMM d");
    const deadline = form.applicationDeadline ? format(new Date(form.applicationDeadline), "MMM d") : "Rolling";
    const contactCount = form.contactName.trim() ? 1 : 0;

    const roleDetails: Array<{ label: string; value: string; color?: string }> = [];
    if (form.role.trim()) roleDetails.push({ label: "Role", value: form.role.trim() });
    if (form.applicationType) {
      const appTypeLabel = form.applicationType === "Internship" ? "Summer Internship" : form.applicationType === "Full-Time" ? "Full-Time" : form.applicationType;
      roleDetails.push({ label: "Application Type", value: appTypeLabel });
    }
    if (form.applicationDeadline) {
      const deadlineStr = format(new Date(form.applicationDeadline), "MMM d");
      roleDetails.push({ label: "Deadline", value: deadlineStr });
    }
    if (form.dateApplied) {
      roleDetails.push({ label: "Date applied", value: format(new Date(form.dateApplied), "MMM d") });
    }
    if (form.applicationLink.trim()) roleDetails.push({ label: "Application link", value: form.applicationLink.trim() });
    if (form.city.trim()) roleDetails.push({ label: "City", value: form.city.trim() });
    if (form.interviewDate) {
      const d = format(new Date(form.interviewDate), "MMM d");
      const withFormat = form.interviewFormat ? `${d} · ${form.interviewFormat}` : d;
      roleDetails.push({ label: "Interview", value: withFormat });
    }

    const timelineItems: Array<{ title: string; sub: string; filled: boolean; last?: boolean; note?: { bg: string; text: string; content: string } }> = [];
    if (form.interviewDate) {
      const sub = form.interviewFormat
        ? `${format(new Date(form.interviewDate), "MMM d")} · ${form.interviewFormat}`
        : format(new Date(form.interviewDate), "MMM d");
      const title = form.stage && form.stage !== "Applied" && form.stage !== "Networking" ? `${form.stage} Scheduled` : "Interview Scheduled";
      timelineItems.push({
        title,
        sub,
        filled: true,
        note: form.interviewNotes.trim()
          ? { bg: "bg-rt-blue-light", text: "text-rt-blue", content: form.interviewNotes.trim() }
          : undefined,
      });
    }
    if (form.dateApplied) {
      const sub = form.applicationLink.trim() ? `${format(new Date(form.dateApplied), "MMM d")} · Via link` : `${format(new Date(form.dateApplied), "MMM d")} · Via company portal`;
      timelineItems.push({ title: "Application Submitted", sub, filled: true });
    }
    timelineItems.sort((a, b) => {
      const getDate = (s: string) => {
        const match = s.match(/([A-Za-z]{3}\s+\d+)/);
        if (!match) return 0;
        try {
          return new Date(`${match[1]} ${new Date().getFullYear()}`).getTime();
        } catch {
          return 0;
        }
      };
      return getDate(b.sub) - getDate(a.sub);
    });
    if (timelineItems.length > 0) timelineItems[timelineItems.length - 1].last = true;

    const detailContacts: Array<{ name: string; role: string; tag: { label: string; variant: "amber" | "green" }; referral?: string; note?: string }> = [];
    if (form.contactName.trim()) {
      detailContacts.push({
        name: form.contactName.trim(),
        role: form.contactRole.trim() || "—",
        tag: { label: "Key contact", variant: "amber" },
        note: form.contactEmail.trim() ? form.contactEmail.trim() : undefined,
      });
    }

    const newCompany: Company = {
      id,
      name: form.companyName.trim(),
      track: trackVariant,
      trackLabel,
      stage: { label: form.stage, variant: stageVariant },
      deadline,
      lastActivity,
      contacts: `${contactCount} contact${contactCount !== 1 ? "s" : ""}`,
      ...((roleDetails.length > 0 || timelineItems.length > 0 || detailContacts.length > 0) && {
        detail: {
          timelineItems,
          contacts: detailContacts,
          roleDetails,
        },
      }),
    };

    setCompanies((prev) => [newCompany, ...prev]);
    setExpandedIdx(null);
    setAddModalOpen(false);
    resetForm();
    toast.success("Company added successfully!");
  };

  return (
    <>
      {/* Add Company Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setAddModalOpen(false);
            resetForm();
          }}
        >
          <div
            className="absolute inset-0 bg-[#111827]/50"
            aria-hidden
          />
          <div
            className="relative bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex-shrink-0">
              <h2 className="text-[16px] font-semibold text-[#111827]">Add New Company</h2>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  resetForm();
                }}
                className="p-1 rounded hover:bg-rt-gray-100 text-rt-gray-500 hover:text-rt-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              id="add-company-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCompany();
              }}
              className="flex flex-col flex-1 min-h-0"
            >
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <div className="flex flex-col gap-6">
                {/* Section 1 — Company Info */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">Company Info</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={`${labelBase} block mb-1`}>Company Name <span className="text-red-500">*</span></label>
                      <Input
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        className={inputBase}
                        placeholder="Company name"
                      />
                      {errors.companyName && <p className="text-[11px] text-red-500 mt-1">{errors.companyName}</p>}
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Industry / Track <span className="text-red-500">*</span></label>
                      <Select value={form.track} onValueChange={(v) => setForm({ ...form, track: v })}>
                        <SelectTrigger className={`${inputBase} h-9`}>
                          <SelectValue placeholder="Select track" />
                        </SelectTrigger>
                        <SelectContent>
                          {trackFormOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                          {customTracks.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.track === "Other" && (
                        <Input
                          value={form.trackOther}
                          onChange={(e) => setForm({ ...form, trackOther: e.target.value })}
                          className={`${inputBase} mt-2`}
                          placeholder="Type industry or track (e.g. Healthcare, Finance)"
                        />
                      )}
                      {errors.track && <p className="text-[11px] text-red-500 mt-1">{errors.track}</p>}
                      {errors.trackOther && <p className="text-[11px] text-red-500 mt-1">{errors.trackOther}</p>}
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Company Website</label>
                      <Input
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        className={inputBase}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Logo</label>
                      <div className="flex gap-3 items-center">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 rounded-lg border border-[#E5E7EB] bg-rt-gray-100 flex items-center justify-center cursor-pointer hover:bg-rt-gray-200"
                        >
                          {form.logo ? (
                            <span className="text-[10px] text-rt-gray-500 truncate px-1">{form.logo.name}</span>
                          ) : (
                            <span className="text-[10px] text-rt-gray-400 font-mono">Upload</span>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => setForm({ ...form, logo: e.target.files?.[0] ?? null })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 — Application Details */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">Application Details</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={`${labelBase} block mb-1`}>Role / Position</label>
                      <Input
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className={inputBase}
                        placeholder="e.g. Business Analyst Intern"
                      />
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Application Type</label>
                      <Select value={form.applicationType} onValueChange={(v) => setForm({ ...form, applicationType: v })}>
                        <SelectTrigger className={`${inputBase} h-9`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {applicationTypeOptions.map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Application Status / Stage <span className="text-red-500">*</span></label>
                      <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                        <SelectTrigger className={`${inputBase} h-9`}>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {applicationStageOptions.map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.stage && <p className="text-[11px] text-red-500 mt-1">{errors.stage}</p>}
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Application Deadline</label>
                      <Input
                        type="date"
                        value={form.applicationDeadline}
                        onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Date Applied</label>
                      <Input
                        type="date"
                        value={form.dateApplied}
                        onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Application Link</label>
                      <Input
                        value={form.applicationLink}
                        onChange={(e) => setForm({ ...form, applicationLink: e.target.value })}
                        className={inputBase}
                        placeholder="Job posting URL..."
                      />
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>City</label>
                      <Input
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className={inputBase}
                        placeholder="e.g. New York, Boston"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3 — Interview & Timeline */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">Interview & Timeline</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={`${labelBase} block mb-1`}>Interview Date</label>
                      <Input
                        type="date"
                        value={form.interviewDate}
                        onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Interview Format</label>
                      <Select value={form.interviewFormat} onValueChange={(v) => setForm({ ...form, interviewFormat: v })}>
                        <SelectTrigger className={`${inputBase} h-9`}>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {interviewFormatOptions.map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Interview Notes</label>
                      <Textarea
                        value={form.interviewNotes}
                        onChange={(e) => setForm({ ...form, interviewNotes: e.target.value })}
                        className={`${inputBase} min-h-[80px] py-2`}
                        placeholder="Add any prep notes or details..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4 — Contacts */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">Contacts</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={`${labelBase} block mb-1`}>Primary Contact Name</label>
                      <Input
                        value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Primary Contact Role</label>
                      <Input
                        value={form.contactRole}
                        onChange={(e) => setForm({ ...form, contactRole: e.target.value })}
                        className={inputBase}
                        placeholder="e.g. Recruiting Coordinator"
                      />
                    </div>
                    <div>
                      <label className={`${labelBase} block mb-1`}>Primary Contact Email</label>
                      <Input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        className={inputBase}
                      />
                    </div>
                    <p className="text-[10px] text-rt-gray-500 font-mono">+ You can add more contacts in the Contacts tab after saving</p>
                  </div>
                </div>

                {/* Section 5 — Notes */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">Notes</h3>
                  <div>
                    <label className={`${labelBase} block mb-1`}>General Notes</label>
                    <Textarea
                      value={form.generalNotes}
                      onChange={(e) => setForm({ ...form, generalNotes: e.target.value })}
                      className={`${inputBase} min-h-[80px] py-2`}
                      placeholder="Add any general notes about this company, culture, fit, etc..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAddModalOpen(false);
                  resetForm();
                }}
                className="h-9 px-4 rounded-lg bg-rt-gray-100 text-rt-gray-700 border border-[#E5E7EB] text-[12px] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-company-form"
                className="h-9 px-4 rounded-lg bg-[#2563EB] text-white text-[12px] font-medium"
              >
                Add Company
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      <TopBar title="Companies" actionLabel="+ Add Company" onAction={() => setAddModalOpen(true)}>
        <div className="flex gap-2 items-center">
          <Select value={trackFilter} onValueChange={setTrackFilter}>
            <SelectTrigger className="h-8 w-[130px] bg-white border border-[#E5E7EB] rounded-lg text-[11px] text-[#111827] font-sans px-3">
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              {trackFilterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[11px] text-[#111827] font-sans">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="h-8 w-[160px] bg-white border border-[#E5E7EB] rounded-lg text-[11px] text-[#111827] font-sans px-3">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              {stageOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[11px] text-[#111827] font-sans">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TopBar>
      <div className="flex-1 overflow-auto p-3 bg-[#F3F4F6]">
        {/* Table header */}
        <div className="grid grid-cols-[1.5fr_0.8fr_1fr_0.8fr_0.9fr_0.7fr] gap-2 px-3 mb-1.5">
          {["Company", "Track", "Stage", "Deadline", "Last Activity", "Contacts"].map((h) => (
            <div key={h} className="text-[9px] font-semibold uppercase tracking-wider text-rt-gray-400 font-mono">
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((c, i) => {
          const isExpanded = expandedIdx === i;
          const companyContacts = contacts.filter((cc) => cc.company === c.name);
          const staticTimelineItems = (c.detail?.timelineItems ?? []).filter(
            (item) => !/^(Coffee Chat|Conversation) — /.test(item.title) && item.title !== "Added to tracker"
          );
          const contactTimelineItems = companyContacts.map((contact) => ({
            title: `Coffee Chat — ${contact.name}`,
            sub: contact.detail?.metAt
              ? `${contact.lastTouch} · ${contact.detail.metAt}`
              : contact.lastTouch,
            filled: true,
            note: undefined,
          }));
          const sortKeyFromSub = (sub: string) => {
            const dateStr = sub.split(" · ")[0]?.trim() ?? "";
            try {
              const d = parse(`${dateStr} ${new Date().getFullYear()}`, "MMM d yyyy", new Date());
              return isNaN(d.getTime()) ? 999999999999 : d.getTime();
            } catch {
              return 999999999999;
            }
          };
          const mergedTimeline = [...staticTimelineItems, ...contactTimelineItems]
            .sort((a, b) => sortKeyFromSub(b.sub) - sortKeyFromSub(a.sub))
            .map((item, idx, arr) => ({ ...item, last: idx === arr.length - 1 }));
          const followUpToTag = (f: { label: string; type: "done" | "overdue" | "pending" }) =>
            f.type === "done"
              ? { label: "Sent" as const, variant: "green" as const }
              : f.type === "overdue"
                ? { label: "Overdue" as const, variant: "amber" as const }
                : { label: f.label, variant: "amber" as const };
          const mergedKeyContacts = companyContacts.map((contact) => ({
            name: contact.name,
            role: contact.role,
            tag: followUpToTag(contact.followUp),
            note: contact.detail?.metAt ?? contact.detail?.notes,
          }));
          return (
            <div
              key={c.id}
              className={`mb-1.5 rounded-lg border transition-colors cursor-pointer overflow-hidden ${
                isExpanded ? "border-l-[3px] border-l-[#2563EB] border-y border-r border-[#E5E7EB]" : "border border-[#E5E7EB]"
              } bg-card`}
              style={{ opacity: c.opacity ?? 1 }}
              onClick={() => setExpandedIdx(isExpanded ? null : i)}
            >
              {/* Summary row */}
              <div
                className={`grid grid-cols-[1.5fr_0.8fr_1fr_0.8fr_0.9fr_0.7fr] gap-2 items-center px-3 py-2 ${
                  isExpanded ? "border-b border-rt-blue-light" : ""
                }`}
              >
                <div className="text-[11px] font-medium text-rt-gray-700">{c.name}</div>
                <div>
                  <Tag variant={getVariantForTrackLabel(c.trackLabel)}>{c.trackLabel}</Tag>
                </div>
                <div>
                  <Tag variant={c.stage.variant}>{c.stage.label}</Tag>
                </div>
                <div className="text-[10px] font-mono text-rt-gray-700">
                  {c.deadline}
                  {c.deadlineClosed && <span className="text-rt-amber ml-0.5">(Closed)</span>}
                </div>
                <div className="text-[10px] text-rt-gray-400 font-mono">{c.lastActivity}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-rt-gray-500">
                    {companyContacts.length} contact{companyContacts.length !== 1 ? "s" : ""}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-rt-blue flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-rt-gray-400 flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="p-3 bg-[#EFF6FF] flex flex-col gap-2.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleViewFullProfile(e, c.id)}
                      className="h-[26px] px-2.5 rounded-lg bg-[#2563EB] flex items-center"
                    >
                      <span className="text-[10px] font-medium font-mono text-white">View Full Profile →</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2.5">
                    {/* Left: Interaction Timeline */}
                    <div className="bg-card border border-[#E5E7EB] rounded-lg p-3.5">
                      <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
                        Interaction Timeline
                      </div>
                      {mergedTimeline.length > 0 ? (
                        mergedTimeline.map((item, j) => (
                          <div key={j} className="flex gap-2.5 pb-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-2.5 h-2.5 rounded-full border-2 border-rt-blue flex-shrink-0 mt-0.5 ${
                                  item.filled ? "bg-rt-blue" : "bg-card"
                                }`}
                              />
                              {!item.last && <div className="w-0.5 flex-1 bg-rt-gray-200 mt-0.5 min-h-[24px]" />}
                            </div>
                            <div className="flex-1 pb-2">
                              <div className="text-[11px] font-medium text-rt-gray-700">{item.title}</div>
                              <div className="text-[10px] text-rt-gray-400">{item.sub}</div>
                              {item.note && (
                                <div className={`mt-1 p-1.5 rounded-lg ${item.note.bg}`}>
                                  <div className={`text-[10px] ${item.note.text}`}>{item.note.content}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[10px] text-rt-gray-400 py-2">No timeline events</div>
                      )}
                    </div>

                    {/* Middle: Key Contacts */}
                    <div className="bg-card border border-[#E5E7EB] rounded-lg p-3.5">
                      <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
                        Key Contacts
                      </div>
                      {mergedKeyContacts.length > 0 ? (
                        mergedKeyContacts.map((contact, j) => (
                          <div
                            key={j}
                            className={j < mergedKeyContacts.length - 1 ? "py-1.5 border-b border-rt-gray-100" : "py-1.5"}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex-shrink-0 ${
                                  j === 0 ? "bg-rt-blue-light" : "bg-rt-gray-200"
                                }`}
                              />
                              <div className="flex-1">
                                <div className="text-[11px] font-medium text-rt-gray-700">{contact.name}</div>
                                <div className="text-[10px] text-rt-gray-400">{contact.role}</div>
                              </div>
                              <Tag variant={contact.tag.variant}>{contact.tag.label}</Tag>
                            </div>
                            <div className="ml-8 mt-1.5 flex flex-col gap-1">
                              {contact.referral && (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rt-blue flex-shrink-0" />
                                  <span className="text-[10px] text-rt-gray-700">
                                    Referral via <span className="text-rt-blue font-medium">{contact.referral}</span>
                                  </span>
                                </div>
                              )}
                              {contact.note && (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rt-gray-400 flex-shrink-0" />
                                  <span className="text-[10px] text-rt-gray-400">{contact.note}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[10px] text-rt-gray-400 py-2">No contacts</div>
                      )}
                    </div>

                    {/* Right: Role Details + Quick Notes */}
                    <div className="flex flex-col gap-2.5">
                      <div className="bg-card border border-[#E5E7EB] rounded-lg p-3.5">
                        <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
                          Role Details
                        </div>
                        {c.detail?.roleDetails ? (
                          c.detail.roleDetails.map((r, j, arr) => (
                            <div
                              key={j}
                              className={`flex justify-between items-center py-1.5 ${
                                j < arr.length - 1 ? "border-b border-rt-gray-100" : ""
                              }`}
                            >
                              <span className="text-[10px] text-rt-gray-500 font-mono">{r.label}</span>
                              <span className={`text-[10px] font-mono ${r.color ?? "text-rt-gray-700"}`}>{r.value}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-rt-gray-400 py-2">No role details</div>
                        )}
                      </div>
                      <div className="bg-card border border-[#E5E7EB] rounded-lg p-3.5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500">
                            Quick Notes
                          </div>
                        </div>
                        {editingQuickNotesCompanyId === c.id ? (
                          <textarea
                            ref={quickNotesTextareaRef}
                            value={quickNotesByCompany[c.id] ?? ""}
                            onChange={(e) => setQuickNotesByCompany({ ...quickNotesByCompany, [c.id]: e.target.value })}
                            onBlur={() => setEditingQuickNotesCompanyId(null)}
                            placeholder="Add notes..."
                            className="w-full h-[70px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[10px] text-rt-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        ) : (
                          <div
                            className="w-full min-h-[70px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 text-[10px] text-rt-gray-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(quickNotesByCompany[c.id] ?? "").trim() ? (
                              <span className="text-rt-gray-700 whitespace-pre-wrap">
                                {quickNotesByCompany[c.id]}
                              </span>
                            ) : (
                              <span className="text-rt-gray-400">Add notes...</span>
                            )}
                          </div>
                        )}
                        <div className="flex justify-end mt-1.5">
                          <button
                            type="button"
                            aria-label="Edit quick notes"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingQuickNotesCompanyId(c.id);
                              setTimeout(() => quickNotesTextareaRef.current?.focus(), 0);
                            }}
                            className="p-1 rounded hover:bg-rt-gray-100 text-rt-gray-500 hover:text-rt-gray-700"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
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

export default Companies;
