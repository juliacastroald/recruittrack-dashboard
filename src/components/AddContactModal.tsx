import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const COMPANIES = [
  "McKinsey & Company",
  "Bain & Company",
  "BCG",
  "Stripe",
  "Google",
  "Sequoia Capital",
  "Other (type below)",
];

const HOW_WE_MET = [
  "Sloan Trek",
  "Alumni Network",
  "LinkedIn Outreach",
  "Networking Event",
  "Company Presentation",
  "Referral",
  "Other",
];

const TRACKS = ["Consulting", "Tech/PM", "VC/PE", "Other"];
const WARMTH = ["Warm", "Active", "Cold", "Inactive"];
const FOLLOW_UP_STATUS = ["Scheduled", "Due Today", "Overdue", "Sent", "None"];

const trackToVariant: Record<string, "blue" | "purple" | "gray"> = {
  Consulting: "blue",
  "Tech/PM": "purple",
  "VC/PE": "gray",
  Other: "gray",
};

const warmthToVariant: Record<string, "green" | "amber" | "red" | "gray"> = {
  Warm: "amber",
  Active: "green",
  Cold: "red",
  Inactive: "gray",
};

const followUpStatusToData: Record<
  string,
  { label: string; type: "done" | "overdue" | "pending" }
> = {
  Scheduled: { label: "Scheduled", type: "pending" },
  "Due Today": { label: "Due Today", type: "pending" },
  Overdue: { label: "⚠ Overdue", type: "overdue" },
  Sent: { label: "✓ Sent", type: "done" },
  None: { label: "None", type: "pending" },
};

export interface NewContactData {
  name: string;
  role: string;
  company: string;
  track: "blue" | "purple" | "gray";
  trackLabel: string;
  lastTouch: string;
  followUp: { label: string; type: "done" | "overdue" | "pending" };
  status: { label: string; variant: "green" | "amber" | "red" | "gray" };
  avatarColor: string;
  detail: {
    email: string;
    linkedin: string;
    metAt: string;
    notes: string;
    suggestedAction: string;
  };
}

const inputBase =
  "w-full h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] text-[13px] placeholder:text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#2563EB]";
const labelBase =
  "text-[10px] font-mono uppercase tracking-wider text-[#6B7280]";

const emptyForm = {
  firstName: "",
  lastName: "",
  role: "",
  company: "",
  companyOther: "",
  email: "",
  linkedin: "",
  track: "",
  howWeMet: "",
  howWeMetOther: "",
  warmth: "",
  referral: "",
  lastTouchDate: "",
  followUpDate: "",
  followUpStatus: "",
  notes: "",
};

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewContactData) => void;
}

const AddContactModal = ({ open, onClose, onSubmit }: AddContactModalProps) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = "This field is required";
    if (!form.lastName.trim()) newErrors.lastName = "This field is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const companyName =
      form.company === "Other (type below)"
        ? form.companyOther.trim() || "Other"
        : form.company;

    const metAt =
      form.howWeMet === "Other"
        ? form.howWeMetOther.trim() || "Other"
        : form.howWeMet;

    const lastTouch = form.lastTouchDate
      ? format(new Date(form.lastTouchDate), "MMM d")
      : format(new Date(), "MMM d");

    const trackLabel = form.track || "Other";
    const track = trackToVariant[form.track] ?? "gray";
    const statusLabel = form.warmth || "Active";
    const statusVariant = warmthToVariant[form.warmth] ?? "green";
    const followUpData = form.followUpStatus
      ? followUpStatusToData[form.followUpStatus] ?? { label: "None", type: "pending" as const }
      : { label: "None", type: "pending" as const };

    const suggestedAction = form.followUpStatus
      ? form.followUpStatus === "Sent"
        ? "No action needed — follow-up already sent"
        : form.followUpStatus === "Scheduled"
          ? "Follow-up scheduled"
          : form.followUpStatus === "Due Today"
            ? "Follow up today"
            : form.followUpStatus === "Overdue"
              ? "Re-engage — follow-up overdue"
              : "Send follow-up"
      : "Add follow-up date";

    const data: NewContactData = {
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      role: form.role.trim() || "—",
      company: companyName,
      track,
      trackLabel,
      lastTouch,
      followUp: followUpData,
      status: { label: statusLabel, variant: statusVariant },
      avatarColor: "bg-rt-gray-200",
      detail: {
        email: form.email.trim() || "—",
        linkedin: form.linkedin.trim() || "—",
        metAt: metAt,
        notes: form.notes.trim() || "—",
        suggestedAction,
      },
    };

    onSubmit(data);
    handleClose();
    toast.success("Contact added successfully!");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-[#111827]/50" aria-hidden />
      <div
        className="relative bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-[16px] font-bold text-[#111827]">Add New Contact</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-rt-gray-100 text-rt-gray-500 hover:text-rt-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="overflow-y-auto flex-1 px-6 pb-4">
            <div className="flex flex-col gap-6">
              {/* Section 1 — Personal Info */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[13px] font-bold text-[#111827] pb-2 border-b border-[#E5E7EB]">
                  Personal Info
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className={`${labelBase} block mb-1`}>
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={form.firstName}
                        onChange={(e) =>
                          setForm({ ...form, firstName: e.target.value })
                        }
                        className={inputBase}
                        placeholder="First name"
                      />
                      {errors.firstName && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className={`${labelBase} block mb-1`}>
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={form.lastName}
                        onChange={(e) =>
                          setForm({ ...form, lastName: e.target.value })
                        }
                        className={inputBase}
                        placeholder="Last name"
                      />
                      {errors.lastName && (
                        <p className="text-[11px] text-red-500 mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={`${labelBase} block mb-1`}>
                      Role / Title
                    </label>
                    <Input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className={inputBase}
                      placeholder="e.g. Senior Associate"
                    />
                  </div>
                  <div>
                    <label className={`${labelBase} block mb-1`}>Company</label>
                    <Select
                      value={form.company}
                      onValueChange={(v) => setForm({ ...form, company: v })}
                    >
                      <SelectTrigger className={`${inputBase} h-9`}>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.company === "Other (type below)" && (
                      <Input
                        value={form.companyOther}
                        onChange={(e) =>
                          setForm({ ...form, companyOther: e.target.value })
                        }
                        className={`${inputBase} mt-2`}
                        placeholder="Enter company name"
                      />
                    )}
                  </div>
                  <div>
                    <label className={`${labelBase} block mb-1`}>Email</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className={inputBase}
                      placeholder="name@company.com"
                    />
                  </div>
                  <div>
                    <label className={`${labelBase} block mb-1`}>
                      LinkedIn URL
                    </label>
                    <Input
                      value={form.linkedin}
                      onChange={(e) =>
                        setForm({ ...form, linkedin: e.target.value })
                      }
                      className={inputBase}
                      placeholder="linkedin.com/in/..."
                    />
                  </div>
                </div>
              </div>

              {/* Section 2 — Relationship Details */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[13px] font-bold text-[#111827] pb-2 border-b border-[#E5E7EB]">
                  Relationship Details
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={`${labelBase} block mb-1`}>Track</label>
                    <Select
                      value={form.track}
                      onValueChange={(v) => setForm({ ...form, track: v })}
                    >
                      <SelectTrigger className={`${inputBase} h-9`}>
                        <SelectValue placeholder="Select track" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRACKS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={`${labelBase} block mb-1`}>
                      How We Met
                    </label>
                    <Select
                      value={form.howWeMet}
                      onValueChange={(v) =>
                        setForm({ ...form, howWeMet: v })
                      }
                    >
                      <SelectTrigger className={`${inputBase} h-9`}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOW_WE_MET.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.howWeMet === "Other" && (
                      <Input
                        value={form.howWeMetOther}
                        onChange={(e) =>
                          setForm({ ...form, howWeMetOther: e.target.value })
                        }
                        className={`${inputBase} mt-2`}
                        placeholder="Describe how you met"
                      />
                    )}
                  </div>
                  <div>
                    <label className={`${labelBase} block mb-1`}>
                      Warmth / Status
                    </label>
                    <Select
                      value={form.warmth}
                      onValueChange={(v) => setForm({ ...form, warmth: v })}
                    >
                      <SelectTrigger className={`${inputBase} h-9`}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {WARMTH.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={`${labelBase} block mb-1`}>
                      Referral
                    </label>
                    <Input
                      value={form.referral}
                      onChange={(e) =>
                        setForm({ ...form, referral: e.target.value })
                      }
                      className={inputBase}
                      placeholder="e.g. Referred by David Park · BCG"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3 — Follow-Up */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[13px] font-bold text-[#111827] pb-2 border-b border-[#E5E7EB]">
                  Follow-Up
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={`${labelBase} block mb-1`}>
                      Last Touch Date
                    </label>
                    <Input
                      type="date"
                      value={form.lastTouchDate}
                      onChange={(e) =>
                        setForm({ ...form, lastTouchDate: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={`${labelBase} block mb-1`}>
                      Follow-Up Date
                    </label>
                    <Input
                      type="date"
                      value={form.followUpDate}
                      onChange={(e) =>
                        setForm({ ...form, followUpDate: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={`${labelBase} block mb-1`}>
                      Follow-Up Status
                    </label>
                    <Select
                      value={form.followUpStatus}
                      onValueChange={(v) =>
                        setForm({ ...form, followUpStatus: v })
                      }
                    >
                      <SelectTrigger className={`${inputBase} h-9`}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {FOLLOW_UP_STATUS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 4 — Notes */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[13px] font-bold text-[#111827] pb-2 border-b border-[#E5E7EB]">
                  Notes
                </h3>
                <div>
                  <label className={`${labelBase} block mb-1`}>Notes</label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    className={`${inputBase} min-h-[80px] py-2`}
                    placeholder="Add any notes from your conversation..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="h-9 px-4 rounded-lg bg-rt-gray-100 text-rt-gray-700 border border-[#E5E7EB] text-[12px] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-[#2563EB] text-white text-[12px] font-medium"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;
