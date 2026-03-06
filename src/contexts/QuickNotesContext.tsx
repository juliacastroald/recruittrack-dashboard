import { createContext, useContext, useState, type ReactNode } from "react";

type QuickNotesByCompany = Record<string, string>;

const QuickNotesContext = createContext<{
  quickNotesByCompany: QuickNotesByCompany;
  setQuickNotesByCompany: React.Dispatch<React.SetStateAction<QuickNotesByCompany>>;
} | null>(null);

const initialQuickNotes: QuickNotesByCompany = {
  mckinsey: "Remember PEI interview is about connection, drive, leadership and growth",
};

export function QuickNotesProvider({ children }: { children: ReactNode }) {
  const [quickNotesByCompany, setQuickNotesByCompany] = useState<QuickNotesByCompany>(initialQuickNotes);
  return (
    <QuickNotesContext.Provider value={{ quickNotesByCompany, setQuickNotesByCompany }}>
      {children}
    </QuickNotesContext.Provider>
  );
}

export function useQuickNotes() {
  const ctx = useContext(QuickNotesContext);
  if (!ctx) throw new Error("useQuickNotes must be used within QuickNotesProvider");
  return ctx;
}
