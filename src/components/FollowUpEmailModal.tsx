import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  getSarahKimContact,
  type FollowUpEmailContact,
  type BadgeVariant,
} from "@/data/followUpEmailContacts";

const badgeClass: Record<BadgeVariant, string> = {
  red: "bg-[#FEE2E2] text-[#DC2626]",
  amber: "bg-rt-amber-light text-rt-amber-dark",
  green: "bg-rt-green-light text-rt-green",
};

interface FollowUpEmailModalProps {
  open: boolean;
  onClose: () => void;
  contact?: FollowUpEmailContact;
}

const FollowUpEmailModal = ({ open, onClose, contact: contactProp }: FollowUpEmailModalProps) => {
  const contact = contactProp ?? getSarahKimContact();
  const [emailSubject, setEmailSubject] = useState(contact.subject);
  const [emailBody, setEmailBody] = useState(contact.body);

  useEffect(() => {
    if (open) {
      setEmailSubject(contact.subject);
      setEmailBody(contact.body);
    }
  }, [open, contact.subject, contact.body]);

  const handleClose = () => {
    setEmailSubject(contact.subject);
    setEmailBody(contact.body);
    onClose();
  };

  const handleSendEmail = () => {
    setEmailSubject(contact.subject);
    setEmailBody(contact.body);
    onClose();
    const firstName = contact.name.split(" ")[0] ?? contact.name;
    toast.success(`Follow-up email sent to ${firstName}!`);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-[#111827]/50" aria-hidden />
      <div
        className="relative bg-white rounded-lg shadow-lg w-[560px] max-w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-[16px] font-semibold text-[#111827]">Follow-up Email</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-rt-gray-100 text-rt-gray-500 hover:text-rt-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-4">
          {/* Contact summary strip */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F3F4F6] mb-4">
            <div className="w-10 h-10 rounded-full bg-rt-blue flex items-center justify-center flex-shrink-0">
              <span className="text-[12px] font-semibold text-white">{contact.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#111827]">{contact.name}</div>
              <div className="text-[11px] text-rt-gray-500">{contact.roleCompany}</div>
            </div>
            <span className={`inline-flex items-center h-6 px-2 rounded text-[10px] font-medium font-mono flex-shrink-0 ${badgeClass[contact.badgeVariant]}`}>
              {contact.badge}
            </span>
          </div>

          {/* Email fields */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] block mb-1">To</label>
              <input
                type="text"
                readOnly
                value={contact.email}
                className="w-full h-9 px-3 rounded-lg border border-[#E5E7EB] bg-rt-gray-100 text-rt-gray-500 text-[13px] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] block mb-1">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] text-[13px] placeholder:text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] block mb-1">Body</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full min-h-[260px] px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] text-[13px] placeholder:text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#2563EB] resize-y leading-[1.6]"
                placeholder="Email body..."
              />
            </div>

            {/* Info box */}
            <div className="p-3 rounded-lg border-l-[3px] border-l-rt-blue bg-rt-blue-pale">
              <p className="text-[11px] text-rt-gray-700">{contact.infoText}</p>
            </div>

            <p className="text-[10px] text-rt-gray-500 font-mono">
              📎 In a future version, this will connect directly to your email client
            </p>
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
            type="button"
            onClick={handleSendEmail}
            className="h-9 px-4 rounded-lg bg-[#2563EB] text-white text-[12px] font-medium"
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpEmailModal;
