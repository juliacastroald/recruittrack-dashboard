import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Tag from "@/components/Tag";
import { ChevronDown, ChevronUp, FileText, Presentation, Download, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

const mckinseyContacts: McKinseyContact[] = [
  {
    name: "Sarah Kim",
    role: "Senior Associate",
    lastTouch: "Feb 22",
    followUp: { label: "Overdue", type: "overdue" },
    status: { label: "Warm", variant: "amber" },
    avatarColor: "bg-rt-blue-light",
    detail: {
      email: "skim@mckinsey.com",
      linkedin: "linkedin.com/in/sarahkim",
      metAt: "Sloan Trek Jan 2025",
      notes: "Really helpful conversation about the BA role. Said to follow up after submitting application.",
      suggestedAction: "Haven't followed up in 7 days — send a check-in",
    },
  },
  {
    name: "Tom Walsh",
    role: "Recruiting Coordinator",
    lastTouch: "Feb 15",
    followUp: { label: "Due Mar 3", type: "pending" },
    status: { label: "Active", variant: "green" },
    avatarColor: "bg-rt-gray-200",
    detail: {
      email: "twalsh@mckinsey.com",
      linkedin: "linkedin.com/in/tomwalsh",
      metAt: "Direct outreach",
      notes: "Confirmed application was received. Mentioned decisions go out mid-March.",
      suggestedAction: "Follow up approaching — due Mar 3",
    },
  },
];

const followUpClass = {
  overdue: "bg-rt-red-light text-rt-red-dark",
  pending: "bg-rt-amber-light text-rt-amber-dark",
};

const timelineItems = [
  {
    title: "1st Round Interview Scheduled", sub: "Mar 8 · Confirmed", filled: true,
    note: { bg: "bg-rt-blue-light", text: "text-rt-blue", content: "Prep note: Review case frameworks, MBB structure" },
  },
  {
    title: "Coffee Chat — Sarah Kim", sub: "Feb 22 · 30 min video call", filled: true,
    note: { bg: "bg-rt-gray-50 border border-border", text: "text-rt-gray-500", content: "Really helpful conversation about the BA role. Said to follow up after submitting application." },
  },
  { title: "Application Submitted", sub: "Feb 10 · Via company portal", filled: true },
  { title: "Added to tracker", sub: "Feb 1", filled: false, last: true },
];

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
  interviewDate: "2025-03-08",
  interviewTime: "14:00",
  interviewFormat: "Case",
  interviewNotes: "Review case frameworks. Sarah mentioned the first round is a behavioral + one business case.",
  generalNotes: "Strong culture fit. Sarah was very helpful during Sloan Trek. Focus on operations and strategy cases for prep.",
};

const inputBase =
  "w-full h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] text-[13px] placeholder:text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#2563EB]";
const labelBase = "text-[10px] font-mono uppercase tracking-wider text-[#6B7280]";

const notesFromInteractions = [
  {
    date: "Mar 3",
    sourceTags: [{ label: "Interview Prep", variant: "amber" as const }],
    noteText: "Review case frameworks. Sarah mentioned the first round is a behavioral + one business case.",
  },
  {
    date: "Feb 22",
    sourceTags: [
      { label: "Sarah Kim", variant: "blue" as const },
      { label: "Coffee Chat", variant: "gray" as const },
    ],
    noteText: "Really helpful conversation about the BA role. Said to follow up after submitting application.",
  },
  {
    date: "Feb 15",
    sourceTags: [
      { label: "Tom Walsh", variant: "green" as const },
      { label: "Direct Outreach", variant: "gray" as const },
    ],
    noteText: "Confirmed application was received. Mentioned decisions go out mid-March.",
  },
];

const CompanyDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as { tab?: string } | null)?.tab === "Notes" ? "Notes" : "Overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [quickNotes, setQuickNotes] = useState("");
  const [myNotes, setMyNotes] = useState("");
  const [contactsExpandedIdx, setContactsExpandedIdx] = useState<number | null>(0);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [documentTypeFilter, setDocumentTypeFilter] = useState("All Types");
  const [removingDocId, setRemovingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyProfile, setCompanyProfile] = useState({
    companyName: "McKinsey & Company",
    track: "Consulting",
    stage: "1st Round Interview",
    applicationType: "Internship",
  });
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState(mckinseyUpdateForm);
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});
  const updateLogoRef = useRef<HTMLInputElement>(null);

  const resetUpdateForm = () => {
    setUpdateForm(mckinseyUpdateForm);
    setUpdateErrors({});
  };

  const handleSaveCompany = () => {
    const newErrors: Record<string, string> = {};
    if (!updateForm.companyName.trim()) newErrors.companyName = "This field is required";
    if (!updateForm.track) newErrors.track = "This field is required";
    if (!updateForm.stage) newErrors.stage = "This field is required";
    setUpdateErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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
                      <div className="flex items-center gap-2 py-2 px-3 bg-rt-gray-50 rounded-lg border border-[#E5E7EB]">
                        <div className="w-8 h-8 rounded-full bg-rt-blue-light flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium text-[#111827]">Sarah Kim</div>
                          <div className="text-[10px] text-rt-gray-500">Senior Associate · skim@mckinsey.com</div>
                        </div>
                        <Tag variant="amber">Warm</Tag>
                      </div>
                      <div className="flex items-center gap-2 py-2 px-3 bg-rt-gray-50 rounded-lg border border-[#E5E7EB]">
                        <div className="w-8 h-8 rounded-full bg-rt-gray-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium text-[#111827]">Tom Walsh</div>
                          <div className="text-[10px] text-rt-gray-500">Recruiting Coordinator · twalsh@mckinsey.com</div>
                        </div>
                        <Tag variant="amber">Due Mar 3</Tag>
                      </div>
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
              <Tag variant="blue">{companyProfile.track}</Tag>
              <Tag variant={stageToVariant[companyProfile.stage] ?? "amber"}>{companyProfile.stage}</Tag>
              <Tag variant="gray">{applicationTypeToTag[companyProfile.applicationType] ?? companyProfile.applicationType}</Tag>
            </div>
          </div>
          <button
            onClick={() => {
              setUpdateForm({
                ...mckinseyUpdateForm,
                companyName: companyProfile.companyName,
                track: companyProfile.track,
                stage: companyProfile.stage,
                applicationType: companyProfile.applicationType,
              });
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
                placeholder="Write your notes about McKinsey here..."
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemovingDocId(doc.id);
                        }}
                        className="p-1.5 rounded hover:bg-rt-red-light text-rt-gray-500 hover:text-rt-red transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
              <span className="text-[11px] text-rt-gray-500">Showing {mckinseyContacts.length} contacts at McKinsey</span>
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
            {mckinseyContacts.map((c, i) => {
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
              {timelineItems.map((item, i) => (
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
                      <span className="text-[10px] text-rt-gray-700">
                        Referral via <span className="text-rt-blue font-medium">David Park (BCG)</span>
                      </span>
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
                    <Tag variant="amber">Due Mar 3</Tag>
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
                <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
                  Role Details
                </div>
                {[
                  { label: "Role", value: "Business Analyst Intern" },
                  { label: "Deadline", value: "Mar 5 (closed)", color: "text-rt-amber" },
                  { label: "Interview", value: "Mar 8, 2:00 PM" },
                ].map((r, i, arr) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center py-1.5 ${
                      i < arr.length - 1 ? "border-b border-rt-gray-100" : ""
                    }`}
                  >
                    <span className="text-[10px] text-rt-gray-500 font-mono">{r.label}</span>
                    <span className={`text-[10px] font-mono ${r.color ?? "text-rt-gray-700"}`}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Quick Notes */}
              <div className="bg-card border border-border rounded-lg p-3.5 flex-1">
                <div className="text-[10px] font-semibold font-mono uppercase tracking-wider text-rt-gray-500 mb-2.5">
                  Quick Notes
                </div>
                <textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  className="w-full h-[70px] bg-rt-gray-50 border border-border rounded-md p-2 text-[10px] text-rt-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-rt-blue"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CompanyDetail;
