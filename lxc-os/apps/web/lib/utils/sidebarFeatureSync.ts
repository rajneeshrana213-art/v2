/**
 * Converts the admin dashboard sidebar config into a Feature Catalog skeleton.
 * Each sidebar Section → Feature; each Section Item → Sub-feature.
 * Sections in SKIP_SECTIONS are excluded (they aren't monetisable features).
 */
import { dashboardConfig } from "@/components/dashboard/config/dashboardConfig";

const SKIP_SECTIONS = new Set(["Overview", "Support Management", "System"]);

/** Default base price per section (₹/mo). Adjust as needed. */
const DEFAULT_SECTION_PRICE: Record<string, number> = {
  PEOPLE: 199,
  ACADEMICS: 499,
  OPERATIONS: 399,
  COMMUNICATION: 149,
  MANAGEMENT: 249,
  REPORTS_DOCUMENTS: 349,
};

/** Default sub-feature price overrides (₹/mo). */
const DEFAULT_SUB_PRICE: Record<string, number> = {
  // Academics
  CLASSES_SECTIONS: 99,
  SUBJECTS: 49,
  TIMETABLE: 99,
  ATTENDANCE: 149,
  EXAMS_RESULTS: 199,
  STUDENT_PROMOTION: 99,
  // Operations
  TRANSPORT: 299,
  LIBRARY: 149,
  FEES_ACCOUNTS: 349,
  // People
  STUDENTS: 99,
  TEACHERS: 99,
  STAFF: 79,
  PARENTS: 79,
  // Communication
  CHAT_MEETINGS: 99,
  SMS_EMAIL: 99,
  // Management
  NOTICES: 49,
  EVENTS: 49,
  HOLIDAYS: 29,
  LEAVE_REQUESTS: 79,
  // Reports & Documents
  REPORTS_ANALYTICS: 249,
  SMART_DOCUMENTS: 199,
  ROLES_PERMISSIONS: 99,
};

export interface SyncedSubFeature {
  key: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  threeYearlyPrice?: number;
  route: string;
}

export interface SyncedFeature {
  key: string;
  name: string;
  defaultPrice: number;
  yearlyPrice?: number;
  threeYearlyPrice?: number;
  routes: string[];
  subFeatures: SyncedSubFeature[];
  /** true = came from sidebar auto-sync, false = manually added */
  isAuto: boolean;
}

function toKey(label: string): string {
  return label
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Derive features from the admin sidebar sections. */
export function deriveFeaturesFromSidebar(): SyncedFeature[] {
  const adminSections = dashboardConfig.admin?.sections ?? [];
  const features: SyncedFeature[] = [];

  for (const section of adminSections) {
    if (SKIP_SECTIONS.has(section.label)) continue;

    const subFeatures: SyncedSubFeature[] = section.items.map((item) => ({
      key: toKey(item.label),
      name: item.label,
      price: DEFAULT_SUB_PRICE[toKey(item.label)] ?? 49,
      route: item.href,
    }));

    const sectionKey = toKey(section.label);
    features.push({
      key: sectionKey,
      name: section.label,
      defaultPrice: DEFAULT_SECTION_PRICE[sectionKey] ?? 199,
      routes: section.items.map((i) => i.href),
      subFeatures,
      isAuto: true,
    });
  }

  return features;
}

/**
 * Merge saved catalog (from DB) with auto-derived sidebar features.
 * - Auto features that already exist in saved catalog retain their saved prices.
 * - New auto features are added with price = 0.
 * - Custom (non-auto) features from saved catalog are kept as-is.
 */
export function mergeCatalogs(
  savedCatalog: any[],
  autoCatalog: SyncedFeature[]
): SyncedFeature[] {
  const savedMap = new Map<string, any>(
    savedCatalog.map((f) => [f.key, f])
  );

  // Start with auto features, inheriting saved prices where available
  const merged: SyncedFeature[] = autoCatalog.map((autoF) => {
    const saved = savedMap.get(autoF.key);
    if (!saved) return autoF;

    return {
      ...autoF,
      defaultPrice: saved.defaultPrice ?? autoF.defaultPrice,
      yearlyPrice: saved.yearlyPrice ?? (saved.defaultPrice ? saved.defaultPrice * 10 : undefined),
      threeYearlyPrice: saved.threeYearlyPrice ?? (saved.defaultPrice ? saved.defaultPrice * 30 : undefined),
      subFeatures: autoF.subFeatures.map((sf) => {
        const savedSf = (saved.subFeatures ?? []).find(
          (s: any) => s.key === sf.key
        );
        return savedSf ? { 
          ...sf, 
          price: savedSf.price ?? sf.price,
          yearlyPrice: savedSf.yearlyPrice ?? (savedSf.price ? savedSf.price * 10 : undefined),
          threeYearlyPrice: savedSf.threeYearlyPrice ?? (savedSf.price ? savedSf.price * 30 : undefined),
        } : sf;
      }),
    };
  });

  // Append manually added features that aren't in the auto set
  const autoKeys = new Set(autoCatalog.map((f) => f.key));
  for (const saved of savedCatalog) {
    if (!autoKeys.has(saved.key)) {
      merged.push({
        key: saved.key,
        name: saved.name,
        defaultPrice: saved.defaultPrice ?? 0,
        yearlyPrice: saved.yearlyPrice ?? (saved.defaultPrice ? saved.defaultPrice * 10 : 0),
        threeYearlyPrice: saved.threeYearlyPrice ?? (saved.defaultPrice ? saved.defaultPrice * 30 : 0),
        routes: saved.routes ?? [],
        subFeatures: (saved.subFeatures ?? []).map((sf: any) => ({
          key: sf.key,
          name: sf.name,
          price: sf.price ?? 0,
          yearlyPrice: sf.yearlyPrice ?? (sf.price ? sf.price * 10 : 0),
          threeYearlyPrice: sf.threeYearlyPrice ?? (sf.price ? sf.price * 30 : 0),
          route: sf.route ?? "",
        })),
        isAuto: false,
      });
    }
  }

  return merged;
}
