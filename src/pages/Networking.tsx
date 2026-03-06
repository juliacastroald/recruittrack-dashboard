import { useState } from "react";
import TopBar from "@/components/TopBar";
import Tag from "@/components/Tag";
import FollowUpEmailModal from "@/components/FollowUpEmailModal";
import AddContactModal from "@/components/AddContactModal";
import type { NewContactData } from "@/components/AddContactModal";
import { useContacts } from "@/contexts/ContactsContext";
import { FOLLOW_UP_EMAIL_CONTACTS } from "@/data/followUpEmailContacts";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const followUpClass = {
  done: "bg-rt-green-light text-rt-green",
  overdue: "bg-rt-red-light text-rt-red-dark",
  pending: "bg-rt-amber-light text-rt-amber-dark",
};

const Networking = () => {
  const { contacts, setContacts } = useContacts();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [followUpEmailModalOpen, setFollowUpEmailModalOpen] = useState(false);
  const [selectedContactName, setSelectedContactName] = useState<string | null>(null);
  const [addContactModalOpen, setAddContactModalOpen] = useState(false);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const handleAddContact = (data: NewContactData) => {
    setContacts((prev) => [{ ...data }, ...prev]);
    setExpandedIdx(null);
  };

  const handleSubmitContact = (data: NewContactData) => {
    if (editingContactIndex !== null) {
      setContacts((prev) =>
        prev.map((ct, i) => (i === editingContactIndex ? data : ct))
      );
      setEditingContactIndex(null);
      setAddContactModalOpen(false);
    } else {
      handleAddContact(data);
    }
  };

  const handleDeleteContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
    setDeleteConfirmIndex(null);
    setExpandedIdx(null);
  };

  const filtered = contacts.filter((c) => {
    if (followUpFilter !== "all" && c.followUp.type !== followUpFilter) return false;
    if (trackFilter !== "all" && c.track !== trackFilter) return false;
    return true;
  });

  return (
    <>
      <FollowUpEmailModal
        open={followUpEmailModalOpen}
        onClose={() => setFollowUpEmailModalOpen(false)}
        contact={selectedContactName ? FOLLOW_UP_EMAIL_CONTACTS[selectedContactName] : undefined}
      />

      <AddContactModal
        open={addContactModalOpen}
        onClose={() => {
          setAddContactModalOpen(false);
          setEditingContactIndex(null);
        }}
        onSubmit={handleSubmitContact}
        initialData={editingContactIndex !== null ? contacts[editingContactIndex] : undefined}
      />

      <TopBar
        title="People"
        actionLabel="+ Add Contact"
        onAction={() => setAddContactModalOpen(true)}
      >
        <div className="flex gap-1.5 items-center">
          <Select value={followUpFilter} onValueChange={setFollowUpFilter}>
            <SelectTrigger className="h-6 w-[100px] text-[9px] font-mono border-border bg-rt-gray-100 px-2 rounded-md">
              <SelectValue placeholder="Follow-Up" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px]">All Follow-Ups</SelectItem>
              <SelectItem value="done" className="text-[10px]">Sent</SelectItem>
              <SelectItem value="pending" className="text-[10px]">Due</SelectItem>
              <SelectItem value="overdue" className="text-[10px]">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={trackFilter} onValueChange={setTrackFilter}>
            <SelectTrigger className="h-6 w-[100px] text-[9px] font-mono border-border bg-rt-gray-100 px-2 rounded-md">
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px]">All Tracks</SelectItem>
              <SelectItem value="blue" className="text-[10px]">Consulting</SelectItem>
              <SelectItem value="purple" className="text-[10px]">Tech/PM</SelectItem>
              <SelectItem value="gray" className="text-[10px]">VC/PE</SelectItem>
            </SelectContent>
          </Select>
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
        {filtered.map((c, i) => {
          const isExpanded = expandedIdx === i;
          const contactIndex = contacts.indexOf(c);
          const showDeleteConfirm = deleteConfirmIndex === contactIndex;
          return (
            <div
              key={contactIndex}
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
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Tag variant={c.status.variant}>{c.status.label}</Tag>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-rt-blue" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-rt-gray-400" />
                  )}
                  <div className="flex flex-col gap-0.5 ml-auto relative">
                    <button
                      type="button"
                      aria-label="Edit contact"
                      onClick={() => {
                        setEditingContactIndex(contactIndex);
                        setAddContactModalOpen(true);
                      }}
                      className="p-1 rounded hover:bg-rt-gray-100 text-rt-gray-500 hover:text-rt-gray-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        aria-label="Delete contact"
                        onClick={() => setDeleteConfirmIndex(showDeleteConfirm ? null : contactIndex)}
                        className="p-1 rounded hover:bg-rt-gray-100 text-rt-gray-500 hover:text-rt-red-dark hover:bg-rt-red-light"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {showDeleteConfirm && (
                        <div className="absolute right-0 top-full mt-1 z-10 min-w-[140px] bg-card border border-border rounded-lg shadow-lg p-2">
                          <p className="text-[11px] font-medium text-rt-gray-700 mb-2">Delete Contact?</p>
                          <div className="flex gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmIndex(null)}
                              className="h-7 px-2.5 rounded text-[10px] font-medium bg-rt-gray-100 text-rt-gray-700 hover:bg-rt-gray-200"
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(contactIndex)}
                              className="h-7 px-2.5 rounded text-[10px] font-medium bg-rt-red text-white hover:opacity-90"
                            >
                              Yes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        if (c.detail && FOLLOW_UP_EMAIL_CONTACTS[c.name]) {
                          setSelectedContactName(c.name);
                          setFollowUpEmailModalOpen(true);
                        }
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
      </div>
    </>
  );
};

export default Networking;
