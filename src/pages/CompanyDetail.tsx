import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Tag from "@/components/Tag";
import { ChevronDown, ChevronUp, FileText, Presentation, Download, Trash2, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuickNotes } from "@/contexts/QuickNotesContext";
import { useCompanies } from "@/contexts/CompaniesContext";
import { useContacts } from "@/contexts/ContactsContext";
import { parse, format } from "date-fns";

const tabs = ["Overview", "Contacts", "Notes", "Documents"];

interface McKinseyContact {
  name: string;
  role: string;
  lastTouch: string;
  followUp: { label: string; type: "overdue" | "pending" };
  status: { label: string; variant: "green" | "amber" | "red" };
  avatarColor: string;
  detail: {
    email: string;
    linkedin: string;
    metAt: string;
    notes: string;
    suggestedAction: string;
  };
}

const followUpClass = {
  done: "bg-rt-green-light text-rt-green",
  overdue: "bg-rt-red-light text-rt-red-dark",
  pending: "bg-rt-amber-light text-rt-amber-dark",
};

type DocumentType = "Resume" | "Cover Letter" | "Presentation" | "Other";

interface DocumentItem {
  id: string;
  name: string;
  type: DocumentType;
  uploaded: string;
  lastModified: string;
  fileExt: "pdf" | "pptx";
}

const initialDocuments: DocumentItem[] = [
  { id: "1", name: "McKinsey_Resume_2025.pdf", type: "Resume", uploaded: "Feb 10", lastModified: "Feb 28", fileExt: "pdf" },
  { id: "2", name: "McKinsey_CoverLetter.pdf", type: "Cover Letter", uploaded: "Feb 10", lastModified: "Feb 10", fileExt: "pdf" },
  { id: "3", name: "McKinsey_CompanyPresentation.pptx", type: "Presentation", uploaded: "Jan 30", lastModified: "Jan 30", fileExt: "pptx" },
  { id: "4", name: "McKinsey_CasePrep_Notes.pdf", type: "Other", uploaded: "Mar 1", lastModified: "Mar 1", fileExt: "pdf" },
];

const bcgInitialDocuments: DocumentItem[] = [
  { id: "bcg-1", name: "BCG_CompanyPresentation.pptx", type: "Presentation", uploaded: "Feb 15", lastModified: "Feb 15", fileExt: "pptx" },
];

const documentTypeVariant: Record<DocumentType, "blue" | "green" | "amber" | "gray"> = {
  "Resume": "blue",
  "Cover Letter": "green",
  "Presentation": "amber",
  "Other": "gray",
};

const typeFilterOptions = ["All Types", "Resume", "Cover Letter", "Presentation", "Other"];

const formatToday = () => {
  const d = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

const trackFormOptions = [
  { value: "Consulting", label: "Consulting" },
  { value: "Tech/PM", label: "Tech/PM" },
  { value: "VC/PE", label: "VC/PE" },
  { value: "Other", label: "Other" },
];

const CUSTOM_TRACKS_STORAGE_KEY = "recruittrack-custom-tracks";
const CUSTOM_TRACK_VARIANTS_KEY = "recruittrack-custom-track-variants";

function getCustomTracks(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TRACKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.every((x) => typeof x === "string") ? parsed : [];
  } catch {
    return [];
  }
}

type TrackVariant = "blue" | "purple" | "gray" | "green" | "amber" | "red";

function getCustomTrackVariants(): Record<string, TrackVariant> {
  try {
    const raw = localStorage.getItem(CUSTOM_TRACK_VARIANTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const result: Record<string, TrackVariant> = {};
    const valid: Set<TrackVariant> = new Set(["blue", "purple", "gray", "green", "amber", "red"]);
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k === "string" && valid.has(v as TrackVariant)) result[k] = v as TrackVariant;
    }
    return result;
  } catch {
    return {};
  }
}

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

const trackToVariant: Record<string, TrackVariant> = {
  Consulting: "blue",
  "Tech/PM": "purple",
  "VC/PE": "gray",
  Other: "gray",
};

function getTrackVariantForLabel(label: string): TrackVariant {
  return trackToVariant[label] ?? getCustomTrackVariants()[label] ?? "gray";
}

const applicationTypeToTag: Record<string, string> = {
  Internship: "Summer Internship",
  "Full-Time": "Full-Time",
  Other: "Other",
};

const mckinseyUpdateForm = {
  companyName: "McKinsey & Company",
  track: "Consulting",
  website: "https://www.mckinsey.com",
  logo: null as File | null,
  role: "Business Analyst Intern",
  applicationType: "Internship",
  stage: "1st Round Interview",
  applicationDeadline: "2025-03-05",
  dateApplied: "2025-02-10",
  applicationLink: "https://www.mckinsey.com/careers",
  city: "",
  interviewDate: "2025-03-08",
  interviewTime: "14:00",
  interviewFormat: "Case",
  interviewNotes: "Review case frameworks. Sarah mentioned the first round is a behavioral + one business case.",
  generalNotes: "Strong culture fit. Sarah was very helpful during Sloan Trek. Focus on operations and strategy cases for prep.",
};

const inputBase =
  "w-full h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] text-[13px] placeholder:text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#2563EB]";
const labelBase = "text-[10px] font-mono uppercase tracking-wider text-[#6B7280]";

const CompanyDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: companyId } = useParams<{ id: string }>();
  const { companies, setCompanies } = useCompanies();
  const { contacts, setContacts } = useContacts();
  const company = companyId ? companies.find((c) => c.id === companyId) : null;

  const { quickNotesByCompany, setQuickNotesByCompany } = useQuickNotes();
  const quickNotes = companyId ? (quickNotesByCompany[companyId] ?? "") : "";
  const setQuickNotes = (value: string) => {
    if (companyId) setQuickNotesByCompany((prev) => ({ ...prev, [companyId]: value }));
  };

  const companyContacts = useMemo(
    () => (company ? contacts.filter((cc) => cc.company === company.name) : []),
    [company, contacts]
  );
  const mergedTimeline = useMemo(() => {
    if (!company) return [];
    const staticItems = (company.detail?.timelineItems ?? []).filter(
      (item) => !/^(Coffee Chat|Conversation) — /.test(item.title) && item.title !== "Added to tracker"
    );
    const contactItems = companyContacts.map((contact) => ({
      title: `Coffee Chat — ${contact.name}`,
      sub: contact.detail?.metAt ? `${contact.lastTouch} · ${contact.detail.metAt}` : contact.lastTouch,
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
    return [...staticItems, ...contactItems]
      .sort((a, b) => sortKeyFromSub(b.sub) - sortKeyFromSub(a.sub))
      .map((item, idx, arr) => ({ ...item, last: idx === arr.length - 1 }));
  }, [company, companyContacts]);

  const notesFromInteractions = useMemo(
    () =>
      companyContacts.map((contact) => ({
        date: contact.lastTouch,
        sourceTags: [
          { label: contact.name, variant: "blue" as const },
          { label: "Contact", variant: "gray" as const },
        ],
        noteText: contact.detail?.notes ?? contact.detail?.metAt ?? "No notes",
      })),
    [companyContacts]
  );

  const initialTab = (location.state as { tab?: string } | null)?.tab === "Notes" ? "Notes" : "Overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [myNotes, setMyNotes] = useState("");
  const [contactsExpandedIdx, setContactsExpandedIdx] = useState<number | null>(0);
  const [documents, setDocuments] = useState<DocumentItem[]>(() =>
    companyId === "mckinsey" ? initialDocuments : companyId === "bcg" ? bcgInitialDocuments : []
  );
  const [documentTypeFilter, setDocumentTypeFilter] = useState("All Types");
  const [removingDocId, setRemovingDocId] = useState<string | null>(null);
  const [deleteConfirmDocId, setDeleteConfirmDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickNotesTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [editingQuickNotes, setEditingQuickNotes] = useState(false);

  useEffect(() => {
    setDocuments(companyId === "mckinsey" ? initialDocuments : companyId === "bcg" ? bcgInitialDocuments : []);
  }, [companyId]);

  const [companyProfile, setCompanyProfile] = useState({
    companyName: "",
    track: "",
    stage: "",
    applicationType: "Internship",
  });
  useEffect(() => {
    if (company) {
      setCompanyProfile({
        companyName: company.name,
        track: company.trackLabel,
        stage: company.stage.label,
        applicationType: "Internship",
      });
    }
  }, [company]);

  const defaultUpdateForm = useMemo(
    () =>
      company
        ? {
            companyName: company.name,
            track: company.trackLabel,
            website: "https://www.example.com",
            logo: null as File | null,
            role: company.detail?.roleDetails?.find((r) => r.label === "Role")?.value ?? "",
            applicationType: "Internship",
            stage: company.stage.label,
            applicationDeadline: company.deadline !== "Rolling" ? `2025-${company.deadline.replace(" ", "-")}` : "",
            dateApplied: "",
            applicationLink: company.detail?.roleDetails?.find((r) => r.label === "Application link")?.value ?? "",
            city: company.detail?.roleDetails?.find((r) => r.label === "City")?.value ?? "",
            interviewDate: "",
            interviewTime: "",
            interviewFormat: "Case",
            interviewNotes: "",
            generalNotes: "",
          }
        : null,
    [company]
  );

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState(mckinseyUpdateForm);
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});
  const updateLogoRef = useRef<HTMLInputElement>(null);

  const resetUpdateForm = () => {
    if (defaultUpdateForm) setUpdateForm(defaultUpdateForm);
    setUpdateErrors({});
  };

  useEffect(() => {
    if (defaultUpdateForm) setUpdateForm(defaultUpdateForm);
  }, [defaultUpdateForm]);

  const handleSaveCompany = () => {
    if (!companyId) return;
    const newErrors: Record<string, string> = {};
    if (!updateForm.companyName.trim()) newErrors.companyName = "This field is required";
    if (!updateForm.track) newErrors.track = "This field is required";
    if (!updateForm.stage) newErrors.stage = "This field is required";
    setUpdateErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const trackVariant = getTrackVariantForLabel(updateForm.track);
    const roleDetails: Array<{ label: string; value: string; color?: string }> = [];
    if (updateForm.role.trim()) roleDetails.push({ label: "Role", value: updateForm.role.trim() });
    if (updateForm.applicationType) {
      const appTypeLabel = updateForm.applicationType === "Internship" ? "Summer Internship" : updateForm.applicationType === "Full-Time" ? "Full-Time" : updateForm.applicationType;
      roleDetails.push({ label: "Application Type", value: appTypeLabel });
    }
    if (updateForm.applicationDeadline) {
      try {
        const d = new Date(updateForm.applicationDeadline);
        if (!isNaN(d.getTime())) roleDetails.push({ label: "Deadline", value: format(d, "MMM d") });
      } catch {
        roleDetails.push({ label: "Deadline", value: updateForm.applicationDeadline });
      }
    }
    if (updateForm.dateApplied) {
      try {
        const d = new Date(updateForm.dateApplied);
        if (!isNaN(d.getTime())) roleDetails.push({ label: "Date applied", value: format(d, "MMM d") });
      } catch {
        roleDetails.push({ label: "Date applied", value: updateForm.dateApplied });
      }
    }
    if (updateForm.applicationLink.trim()) roleDetails.push({ label: "Application link", value: updateForm.applicationLink.trim() });
    if (updateForm.city.trim()) roleDetails.push({ label: "City", value: updateForm.city.trim() });
    if (updateForm.interviewDate) {
      try {
        const d = new Date(updateForm.interviewDate);
        const dStr = !isNaN(d.getTime()) ? format(d, "MMM d") : updateForm.interviewDate;
        const withFormat = updateForm.interviewFormat ? `${dStr} · ${updateForm.interviewFormat}` : dStr;
        if (updateForm.interviewTime) {
          const timeStr = updateForm.interviewTime;
          roleDetails.push({ label: "Interview", value: `${withFormat} ${timeStr}` });
        } else {
          roleDetails.push({ label: "Interview", value: withFormat });
        }
      } catch {
        roleDetails.push({ label: "Interview", value: updateForm.interviewDate });
      }
    }

    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId
          ? {
              ...c,
              name: updateForm.companyName.trim(),
              trackLabel: updateForm.track,
              track: trackVariant,
              stage: { ...c.stage, label: updateForm.stage },
              detail: {
                timelineItems: c.detail?.timelineItems ?? [],
                contacts: c.detail?.contacts ?? [],
                roleDetails,
              },
            }
          : c
      )
    );

    const newName = updateForm.companyName.trim();
    if (company && newName !== company.name) {
      setContacts((prev) =>
        prev.map((contact) =>
          contact.company === company.name ? { ...contact, company: newName } : contact
        )
      );
    }
    setCompanyProfile({
      companyName: updateForm.companyName.trim(),
      track: updateForm.track,
      stage: updateForm.stage,
      applicationType: updateForm.applicationType,
    });
    setUpdateModalOpen(false);
    resetUpdateForm();
    toast.success("Company updated successfully!");
  };

  if (!company) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-[14px] text-rt-gray-700">Company not found.</p>
        <button
          onClick={() => navigate("/companies")}
          className="h-9 px-4 rounded-lg bg-rt-blue text-white text-[12px] font-medium"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Update Company Modal */}
      {updateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setUpdateModalOpen(false);
            resetUpdateForm();
          }}
        >
          <div className="absolute inset-0 bg-[#111827]/50" aria-hidden />
          <div
            className="relative bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-2 flex-shrink-0">
              <div>
                <h2 className="text-[16px] font-semibold text-[#111827]">Update Company</h2>
                <p className="text-[11px] text-rt-gray-500 font-mono mt-1">{companyProfile.companyName}</p>
              </div>
              <button
                onClick={() => {
                  setUpdateModalOpen(false);
                  resetUpdateForm();
                }}
                className="p-1 rounded hover:bg-rt-gray-100 text-rt-gray-500 hover:text-rt-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              id="update-company-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCompany();
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
                          value={updateForm.companyName}
                          onChange={(e) => setUpdateForm({ ...updateForm, companyName: e.target.value })}
                          className={inputBase}
                        />
                        {updateErrors.companyName && <p className="text-[11px] text-red-500 mt-1">{updateErrors.companyName}</p>}
                      </div>
                      <div>
                        <label className={`${labelBase} block mb-1`}>Industry / Track <span className="text-red-500">*</span></label>
                        <Select value={updateForm.track} onValueChange={(v) => setUpdateForm({ ...updateForm, track: v })}>
                          <SelectTrigger className={`${inputBase} h-9`}>
                            <SelectValue placeholder="Select track" />
                          </SelectTrigger>
                          <SelectContent>
                            {trackFormOptions.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                            {getCustomTracks().map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {updateErrors.track && <p className="text-[11px] text-red-500 mt-1">{updateErrors.track}</p>}
                      </div>
                      <div>
                        <label className={`${labelBase} block mb-1`}>Company Website</label>
                        <Input
                          value={updateForm.website}
                          onChange={(e) => setUpdateForm({ ...updateForm, website: e.target.value })}
                          className={inputBase}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className={`${labelBase} block mb-1`}>Logo</label>
                        <div
                          onClick={() => updateLogoRef.current?.click()}
                          className="w-16 h-16 rounded-lg border border-[#E5E7EB] bg-rt-gray-100 flex items-center justify-center cursor-pointer hover:bg-rt-gray-200"
                        >
                          <span className="text-[10px] text-rt-gray-400 font-mono">Replace current logo</span>
                        </div>
                        <input
                          ref={updateLogoRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => setUpdateForm({ ...updateForm, logo: e.target.files?.[0] ?? null })}
                        />
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
                          value={updateForm.role}
                          onChange={(e) => setUpdateForm({ ...updateForm, role: e.target.value })}
                          className={inputBase}
                          placeholder="e.g. Business Analyst Intern"
                        />
                      </div>
                      <div>
                        <label className={`${labelBase} block mb-1`}>Application Type</label>
                        <Select value={updateForm.applicationType} onValueChange={(v) => setUpdateForm({ ...updateForm, applicationType: v })}>
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
                        <Select value={updateForm.stage} onValueChange={(v) => setUpdateForm({ ...updateForm, stage: v })}>
                          <SelectTrigger className={`${inputBase} h-9`}>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {applicationStageOptions.map((o) => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {updateErrors.stage && <p className="text-[11px] text-red-500 mt-1">{updateErrors.stage}</p>}
                      </div>
                      <div>
                        <label className={`${labelBase} block mb-1`}>Application Deadline</label>
                        <Input
                          type="date"
                          value={updateForm.applicationDeadline}
                          onChange={(e) => setUpdateForm({ ...updateForm, applicationDeadline: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className={`${labelBase} block mb-1`}>Date Applied</label>
                        <Input
                          type="date"
                          value={updateForm.dateApplied}
                          onChange={(e) => setUpdateForm({ ...updateForm, dateApplied: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className={`${labelBase} block mb-1`}>Application Link</label>
                        <Input
                          value={updateForm.applicationLink}
                          onChange={(e) => setUpdateForm({ ...updateForm, applicationLink: e.target.value })}
                          className={inputBase}
                          placeholder="Job posting URL..."
                        />
                      </div>
                      <div>
                        <label className={`${labelBase} block mb-1`}>City</label>
                        <Input
                          value={updateForm.city}
                          onChange={(e) => setUpdateForm({ ...updateForm, city: e.target.value })}
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
                          value={updateForm.interviewDate}
                          onChange={(e) => setUpdateForm({ ...updateForm, interviewDate: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className={`${labelBase} block mb-1`}>Interview Time</label>
                        <Input
                          type="time"
                          value={updateForm.interviewTime}
                          onChange={(e) => setUpdateForm({ ...updateForm, interviewTime: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className={`${labelBase} block mb-1`}>Interview Format</label>
                        <Select value={updateForm.interviewFormat} onValueChange={(v) => setUpdateForm({ ...updateForm, interviewFormat: v })}>
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
                          value={updateForm.interviewNotes}
                          onChange={(e) => setUpdateForm({ ...updateForm, interviewNotes: e.target.value })}
                          className={`${inputBase} min-h-[80px] py-2`}
                          placeholder="Add any prep notes or details..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4 — Key Contacts (read-only) */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[13px] font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">Key Contacts</h3>
                    <div className="flex flex-col gap-2">
                      {companyContacts.map((contact, j) => (
                        <div key={j} className="flex items-center gap-2 py-2 px-3 bg-rt-gray-50 rounded-lg border border-[#E5E7EB]">
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 ${j === 0 ? "bg-rt-blue-light" : "bg-rt-gray-200"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-[#111827]">{contact.name}</div>
                            <div className="text-[10px] text-rt-gray-500">{contact.role} · {contact.detail?.email ?? "—"}</div>
                          </div>
                          <Tag variant={contact.status.variant}>{contact.status.label}</Tag>
                        </div>
                      ))}
                      {companyContacts.length === 0 && (
                        <p className="text-[11px] text-rt-gray-500 py-2">No contacts yet. Add contacts in the People tab.</p>
                      )}
                    </div>
                    <p className="text-[10px] text-rt-gray-500 font-mono">Manage contacts in the Contacts tab</p>
                  </div>

                  {/* Section 5 — Notes */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[13px] font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">Notes</h3>
                    <div>
                      <label className={`${labelBase} block mb-1`}>General Notes</label>
                      <Textarea
                        value={updateForm.generalNotes}
                        onChange={(e) => setUpdateForm({ ...updateForm, generalNotes: e.target.value })}
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
                    setUpdateModalOpen(false);
                    resetUpdateForm();
                  }}
                  className="h-9 px-4 rounded-lg bg-rt-gray-100 text-rt-gray-700 border border-[#E5E7EB] text-[12px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="update-company-form"
                  className="h-9 px-4 rounded-lg bg-[#2563EB] text-white text-[12px] font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-3.5 pb-0 flex-shrink-0">
        <button onClick={() => navigate("/companies")} className="text-[10px] text-rt-gray-400 font-mono hover:text-rt-gray-700 transition-colors">
          ← Back to Companies
        </button>
        <div className="flex items-center gap-3 mt-2.5">
          <div className="w-9 h-9 rounded-lg bg-rt-gray-200 border border-border flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">{companyProfile.companyName}</div>
            <div className="flex gap-1 mt-1">
              <Tag variant={getTrackVariantForLabel(companyProfile.track)}>{companyProfile.track}</Tag>
              <Tag variant={stageToVariant[companyProfile.stage] ?? "amber"}>{companyProfile.stage}</Tag>
              <Tag variant="gray">{applicationTypeToTag[companyProfile.applicationType] ?? companyProfile.applicationType}</Tag>
            </div>
          </div>
          <button
            onClick={() => {
              if (defaultUpdateForm) setUpdateForm(defaultUpdateForm);
              setUpdateModalOpen(true);
            }}
            className="h-[26px] px-2.5 rounded-md bg-rt-blue flex items-center"
          >
            <span className="text-[10px] font-medium font-mono text-primary-foreground">Update Company</span>
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
        {activeTab === "Notes" ? (
          <div className="flex flex-col gap-4">
            {/* TOP SECTION — My Notes */}
            <div className="bg-card border border-[#E5E7EB] rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-[#111827] mb-3">My Notes</h3>
              <textarea
                value={myNotes}
                onChange={(e) => setMyNotes(e.target.value)}
                placeholder={`Write your notes about ${company?.name ?? "this company"} here...`}
                className="w-full min-h-[200px] p-3 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#111827] resize-y focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => toast("Notes saved")}
                  className="h-[26px] px-3 rounded-lg bg-[#2563EB] flex items-center"
                >
                  <span className="text-[10px] font-medium font-mono text-white">Save Notes</span>
                </button>
              </div>
            </div>

            {/* BOTTOM SECTION — Notes from Contacts & Interactions */}
            <div className="bg-card border border-[#E5E7EB] rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-[#111827] mb-1">Notes from Contacts & Interactions</h3>
              <p className="text-[11px] text-rt-gray-500 mb-4">Pulled from logged interactions and contact notes</p>
              <div className="flex flex-col gap-3">
                {notesFromInteractions.map((entry, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#E5E7EB] rounded-lg p-3"
                  >
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {entry.sourceTags.map((tag, j) => (
                        <Tag key={j} variant={tag.variant}>
                          {tag.label}
                        </Tag>
                      ))}
                      <span className="text-[10px] text-rt-gray-400 font-mono ml-auto">{entry.date}</span>
                    </div>
                    <p className="text-[11px] text-[#111827] leading-relaxed">{entry.noteText}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === "Documents" ? (
          <>
            {/* Documents tab top bar */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[13px] font-semibold text-[#111827]">Documents</h3>
                <p className="text-[11px] text-rt-gray-500 mt-0.5">Showing {documents.filter((d) => documentTypeFilter === "All Types" || d.type === documentTypeFilter).length} documents</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                  <SelectTrigger className="h-8 w-[130px] bg-white border border-[#E5E7EB] rounded-lg text-[11px] text-[#111827] px-3">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeFilterOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-[11px] text-[#111827]">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[26px] px-2.5 rounded-lg bg-[#2563EB] flex items-center"
                >
                  <span className="text-[10px] font-medium font-mono text-white">+ Upload Document</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.pptx,.ppt,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const ext = file.name.toLowerCase().endsWith(".pptx") || file.name.toLowerCase().endsWith(".ppt") ? "pptx" : "pdf";
                      setDocuments((prev) => [
                        ...prev,
                        {
                          id: `upload-${Date.now()}`,
                          name: file.name,
                          type: "Other",
                          uploaded: formatToday(),
                          lastModified: formatToday(),
                          fileExt: ext as "pdf" | "pptx",
                        },
                      ]);
                      toast("Document uploaded");
                    }
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            {/* Documents grid */}
            <div className="grid grid-cols-2 gap-3">
              {documents
                .filter((d) => documentTypeFilter === "All Types" || d.type === documentTypeFilter)
                .map((doc) => (
                  <div
                    key={doc.id}
                    className={`bg-card border border-[#E5E7EB] rounded-lg p-4 relative transition-all duration-300 hover:shadow-md ${
                      removingDocId === doc.id ? "opacity-0 scale-95" : "opacity-100"
                    }`}
                    onTransitionEnd={() => {
                      if (removingDocId === doc.id) {
                        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                        setRemovingDocId(null);
                      }
                    }}
                  >
                    <div className="flex absolute top-3 right-3 gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast(`Downloading ${doc.name}...`);
                        }}
                        className="p-1.5 rounded hover:bg-rt-gray-100 text-rt-gray-500 hover:text-rt-gray-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmDocId(deleteConfirmDocId === doc.id ? null : doc.id);
                          }}
                          className="p-1.5 rounded hover:bg-rt-red-light text-rt-gray-500 hover:text-rt-red transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirmDocId === doc.id && (
                          <div className="absolute right-0 top-full mt-1 z-10 min-w-[160px] bg-card border border-border rounded-lg shadow-lg p-2">
                            <p className="text-[11px] font-medium text-rt-gray-700 mb-2">Delete document?</p>
                            <div className="flex gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmDocId(null);
                                }}
                                className="h-7 px-2.5 rounded text-[10px] font-medium bg-rt-gray-100 text-rt-gray-700 hover:bg-rt-gray-200"
                              >
                                No
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmDocId(null);
                                  setRemovingDocId(doc.id);
                                }}
                                className="h-7 px-2.5 rounded text-[10px] font-medium bg-rt-red text-white hover:opacity-90"
                              >
                                Yes
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 pr-16">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          doc.fileExt === "pdf" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {doc.fileExt === "pdf" ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <Presentation className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-semibold text-[#111827] truncate">{doc.name}</div>
                        <div className="mt-1">
                          <Tag variant={documentTypeVariant[doc.type]}>{doc.type}</Tag>
                        </div>
                        <div className="text-[10px] text-rt-gray-400 font-mono mt-2">Uploaded: {doc.uploaded}</div>
                        <div className="text-[10px] text-rt-gray-500 mt-0.5">Last modified: {doc.lastModified}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : activeTab === "Contacts" ? (
          <>
            {/* Contacts tab header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-rt-gray-500">Showing {companyContacts.length} contacts at {company.name}</span>
              <button
                onClick={() => toast("Add contact")}
                className="h-[26px] px-2.5 rounded-md bg-rt-blue flex items-center"
              >
                <span className="text-[10px] font-medium font-mono text-primary-foreground">+ Add Contact</span>
              </button>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1.5fr_1.2fr_0.8fr_0.9fr_0.7fr_0.5fr] gap-2 px-3 mb-1.5">
              {["Contact", "Role", "Last Touch", "Follow-Up", "Status", ""].map((h) => (
                <div key={h} className="text-[9px] font-semibold uppercase tracking-wider text-rt-gray-400 font-mono">
                  {h}
                </div>
              ))}
            </div>

            {/* Contact rows */}
            {companyContacts.map((c, i) => {
              const isExpanded = contactsExpandedIdx === i;
              return (
                <div
                  key={i}
                  className={`bg-card rounded-[7px] mb-1.5 border transition-colors cursor-pointer ${
                    isExpanded ? "border-l-[3px] border-l-rt-blue border-y border-r border-border" : "border-border"
                  }`}
                  onClick={() => setContactsExpandedIdx(isExpanded ? null : i)}
                >
                  {/* Summary row */}
                  <div
                    className={`grid grid-cols-[1.5fr_1.2fr_0.8fr_0.9fr_0.7fr_0.5fr] gap-2 items-center px-3 py-2 ${
                      isExpanded ? "border-b border-rt-blue-light" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 ${c.avatarColor}`} />
                      <div className="text-[11px] font-medium text-rt-gray-700">{c.name}</div>
                    </div>
                    <div className="text-[11px] text-rt-gray-700">{c.role}</div>
                    <div className="text-[10px] text-rt-gray-400 font-mono">{c.lastTouch}</div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 h-5 px-2 rounded-[5px] text-[9px] font-medium font-mono ${followUpClass[c.followUp.type]}`}
                      >
                        {c.followUp.label}
                      </span>
                    </div>
                    <div>
                      <Tag variant={c.status.variant}>{c.status.label}</Tag>
                    </div>
                    <div className="flex justify-end">
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 text-rt-blue" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-rt-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="p-3 bg-rt-blue-pale flex gap-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500">
                          Contact Info
                        </div>
                        <div className="text-[10px] text-rt-gray-700">✉ {c.detail.email}</div>
                        <div className="text-[10px] text-rt-gray-700">🔗 {c.detail.linkedin}</div>
                        <div className="text-[10px] text-rt-gray-700">📅 Met: {c.detail.metAt}</div>
                      </div>
                      <div className="flex-[1.4] flex flex-col gap-1">
                        <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500">
                          Notes
                        </div>
                        <div className="bg-card border border-border rounded-[5px] p-1.5">
                          <div className="text-[10px] text-rt-gray-500 leading-relaxed">{c.detail.notes}</div>
                        </div>
                      </div>
                      <div className="flex-[1.4] flex flex-col gap-1">
                        <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500">
                          Suggested Action
                        </div>
                        <div className="bg-rt-amber-light rounded-[5px] p-1.5 border border-rt-amber">
                          <div className="text-[10px] text-rt-amber-dark font-medium">{c.detail.suggestedAction}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast("Drafting follow-up email…");
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
          </>
        ) : (
          <div className="grid grid-cols-[1.2fr_1fr] gap-2.5">
            {/* Timeline */}
            <div className="bg-card border border-border rounded-lg p-3.5">
              <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
                Interaction Timeline
              </div>
              {mergedTimeline
                .filter((item) => item.title !== "Added to tracker")
                .map((item, i) => (
                <div key={i} className="flex gap-2.5 pb-3">
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
                <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
                  Key Contacts
                </div>
                {companyContacts.length > 0 ? (
                  companyContacts.map((contact, j) => (
                    <div
                      key={j}
                      className={j < companyContacts.length - 1 ? "py-1.5 border-b border-rt-gray-100" : "py-1.5"}
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
                        <Tag variant={contact.followUp.type === "done" ? "green" : "amber"}>
                          {contact.followUp.type === "done" ? "Sent" : contact.followUp.label}
                        </Tag>
                      </div>
                      {(contact.detail?.metAt || contact.detail?.notes) && (
                        <div className="ml-8 mt-1.5 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-rt-gray-400 flex-shrink-0" />
                            <span className="text-[10px] text-rt-gray-400">
                              {contact.detail?.metAt ?? contact.detail?.notes}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-rt-gray-400 py-2">No contacts</div>
                )}
              </div>

              {/* Role Details */}
              <div className="bg-card border border-border rounded-lg p-3.5">
                <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
                  Role Details
                </div>
                {company?.detail?.roleDetails && company.detail.roleDetails.length > 0 ? (
                  company.detail.roleDetails.map((r, i, arr) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center py-1.5 ${
                        i < arr.length - 1 ? "border-b border-rt-gray-100" : ""
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

              {/* Quick Notes */}
              <div className="bg-card border border-border rounded-lg p-3.5 flex-1 flex flex-col">
                <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
                  Quick Notes
                </div>
                {editingQuickNotes ? (
                  <textarea
                    ref={quickNotesTextareaRef}
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    onBlur={() => setEditingQuickNotes(false)}
                    placeholder="Add notes..."
                    className="w-full h-[70px] bg-rt-gray-50 border border-border rounded-md p-2 text-[10px] text-rt-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-rt-blue"
                    autoFocus
                  />
                ) : (
                  <div className="w-full min-h-[70px] bg-rt-gray-50 border border-border rounded-lg p-2 text-[10px] text-rt-gray-700">
                    {quickNotes.trim() ? (
                      <span className="text-rt-gray-700 whitespace-pre-wrap">{quickNotes}</span>
                    ) : (
                      <span className="text-rt-gray-400">Add notes...</span>
                    )}
                  </div>
                )}
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    aria-label="Edit quick notes"
                    onClick={() => {
                      setEditingQuickNotes(true);
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
        )}
      </div>
    </>
  );
};

export default CompanyDetail;
