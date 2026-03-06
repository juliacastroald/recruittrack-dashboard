import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { initialCompanies, type Company } from "@/data/companies";

const STORAGE_KEY = "recruittrack-companies";

function loadCompanies(): Company[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialCompanies;
    const parsed = JSON.parse(raw) as Company[];
    if (!Array.isArray(parsed) || parsed.length === 0) return initialCompanies;

    const storedIds = new Set(parsed.map((c) => c.id));
    const missingSeed = initialCompanies.filter((seed) => !storedIds.has(seed.id));
    const merged = missingSeed.length > 0 ? [...parsed, ...missingSeed] : parsed;

    const seedById = new Map(initialCompanies.map((c) => [c.id, c]));

    return merged.map((c) => {
      const seed = seedById.get(c.id);
      if (!seed?.detail?.roleDetails?.length) return c;
      const hasRoleDetails = (c.detail?.roleDetails?.length ?? 0) > 0;
      if (hasRoleDetails) return c;
      return {
        ...c,
        detail: {
          timelineItems: c.detail?.timelineItems ?? seed.detail?.timelineItems ?? [],
          contacts: c.detail?.contacts ?? seed.detail?.contacts ?? [],
          roleDetails: seed.detail.roleDetails,
        },
      };
    });
  } catch {
    return initialCompanies;
  }
}

type SetCompanies = React.Dispatch<React.SetStateAction<Company[]>>;

const CompaniesContext = createContext<{
  companies: Company[];
  setCompanies: SetCompanies;
} | null>(null);

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(loadCompanies);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  }, [companies]);

  return (
    <CompaniesContext.Provider value={{ companies, setCompanies }}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  const ctx = useContext(CompaniesContext);
  if (!ctx) throw new Error("useCompanies must be used within CompaniesProvider");
  return ctx;
}

export type { Company } from "@/data/companies";
