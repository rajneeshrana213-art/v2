import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { toast } from "react-toastify";
import {
    Plus, X, RefreshCcw, Save, ChevronDown, ChevronRight,
    Layers, Zap, Tag, DollarSign, Link2, Cpu
} from "lucide-react";
import {
    deriveFeaturesFromSidebar,
    mergeCatalogs,
    SyncedFeature,
    SyncedSubFeature,
} from "@/lib/utils/sidebarFeatureSync";
import { Loader } from "@/components/ui/feedback/Loader";

/* ─── helpers ────────────────────────────────────────────────── */
function toKey(label: string) {
    return label.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function emptyFeature(): SyncedFeature {
    return { key: "", name: "", defaultPrice: 0, routes: [], subFeatures: [], isAuto: false };
}

function emptySubFeature(): SyncedSubFeature {
    return { key: "", name: "", price: 0, route: "" };
}

/* ─── sub-component: SubFeature row ─────────────────────────── */
function SubFeatureRow({
    sf, fIdx, sIdx, onChange, onRemove,
}: {
    sf: SyncedSubFeature;
    fIdx: number;
    sIdx: number;
    onChange: (fIdx: number, sIdx: number, field: keyof SyncedSubFeature, val: any) => void;
    onRemove: (fIdx: number, sIdx: number) => void;
}) {
    return (
        <div className="grid grid-cols-12 gap-2 items-end rounded-lg border border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/60 px-3 py-2">
            <div className="col-span-3 space-y-0.5">
                <label className="block text-[10px] font-medium text-gray-400">Key</label>
                <input
                    className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900 px-2 py-1 text-xs dark:text-white"
                    value={sf.key}
                    placeholder="e.g. ONLINE_PAYMENT"
                    onChange={(e) => {
                        onChange(fIdx, sIdx, "key", e.target.value.toUpperCase().replace(/\s+/g, "_"));
                    }}
                />
            </div>
            <div className="col-span-4 space-y-0.5">
                <label className="block text-[10px] font-medium text-gray-400">Display Name</label>
                <input
                    className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900 px-2 py-1 text-xs dark:text-white"
                    value={sf.name}
                    placeholder="e.g. Online Payment"
                    onChange={(e) => {
                        onChange(fIdx, sIdx, "name", e.target.value);
                        if (!sf.key || sf.key === toKey(sf.name)) {
                            onChange(fIdx, sIdx, "key", toKey(e.target.value));
                        }
                    }}
                />
            </div>
            <div className="col-span-2 space-y-0.5">
                <label className="block text-[10px] font-medium text-gray-400">Monthly ₹</label>
                <input
                    type="number" min={0}
                    className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900 px-2 py-1 text-xs dark:text-white"
                    value={sf.price}
                    onChange={(e) => onChange(fIdx, sIdx, "price", Number(e.target.value))}
                />
            </div>
            <div className="col-span-2 space-y-0.5">
                <label className="block text-[10px] font-medium text-gray-400 font-bold text-indigo-500">Yearly ₹</label>
                <input
                    type="number" min={0}
                    className="w-full rounded-md border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-1 text-xs dark:text-white"
                    value={sf.yearlyPrice || 0}
                    onChange={(e) => onChange(fIdx, sIdx, "yearlyPrice", Number(e.target.value))}
                />
            </div>
            <div className="col-span-1 space-y-0.5">
                <label className="block text-[10px] font-medium text-gray-400">Route</label>
                <input
                    className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900 px-2 py-1 text-xs dark:text-white"
                    value={sf.route}
                    placeholder="/..."
                    onChange={(e) => onChange(fIdx, sIdx, "route", e.target.value)}
                />
            </div>
            <div className="col-span-1 flex justify-end">
                <button
                    onClick={() => onRemove(fIdx, sIdx)}
                    className="p-1 rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    title="Remove sub-feature"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

/* ─── sub-component: Feature card ───────────────────────────── */
function FeatureCard({
    feature, fIdx, onFieldChange, onSubChange, onAddSub, onRemoveSub, onRemove,
}: {
    feature: SyncedFeature;
    fIdx: number;
    onFieldChange: (fIdx: number, field: keyof SyncedFeature, val: any) => void;
    onSubChange: (fIdx: number, sIdx: number, field: keyof SyncedSubFeature, val: any) => void;
    onAddSub: (fIdx: number) => void;
    onRemoveSub: (fIdx: number, sIdx: number) => void;
    onRemove: (fIdx: number) => void;
}) {
    const [open, setOpen] = useState(true);

    return (
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/40 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                <button
                    onClick={() => setOpen((o) => !o)}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Key badge */}
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${feature.isAuto
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                    }`}>
                    {feature.isAuto ? <Cpu className="w-2.5 h-2.5" /> : <Tag className="w-2.5 h-2.5" />}
                    {feature.isAuto ? "Auto" : "Custom"}
                </span>

                <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                        <input
                            className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs font-mono font-semibold text-gray-700 dark:text-gray-200"
                            value={feature.key}
                            placeholder="FEATURE_KEY"
                            readOnly={feature.isAuto}
                            onChange={(e) => onFieldChange(fIdx, "key", e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                        />
                    </div>
                    <div className="col-span-4">
                        <input
                            className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-white"
                            value={feature.name}
                            placeholder="Display Name"
                            readOnly={feature.isAuto}
                            onChange={(e) => {
                                onFieldChange(fIdx, "name", e.target.value);
                                if (!feature.isAuto) onFieldChange(fIdx, "key", toKey(e.target.value));
                            }}
                        />
                    </div>
                    <div className="col-span-2 flex items-center gap-1">
                        <input
                            type="number" min={0}
                            className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs text-gray-700 dark:text-white"
                            value={feature.defaultPrice}
                            placeholder="Monthly"
                            onChange={(e) => onFieldChange(fIdx, "defaultPrice", Number(e.target.value))}
                        />
                    </div>
                    <div className="col-span-2 flex items-center gap-1">
                        <input
                            type="number" min={0}
                            className="w-full rounded-md border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300"
                            value={feature.yearlyPrice || 0}
                            placeholder="Yearly"
                            onChange={(e) => onFieldChange(fIdx, "yearlyPrice", Number(e.target.value))}
                        />
                    </div>
                    <div className="col-span-1 flex justify-end">
                        <button
                            onClick={() => onRemove(fIdx)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Remove feature"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded body */}
            {open && (
                <div className="px-4 py-3 space-y-3">
                    {/* Routes */}
                    {feature.isAuto && feature.routes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {feature.routes.map((r) => (
                                <span key={r} className="inline-flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded px-1.5 py-0.5 font-mono">
                                    <Link2 className="w-2.5 h-2.5" />{r}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Sub-features */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Sub-features ({feature.subFeatures.length})
                            </span>
                            <button
                                onClick={() => onAddSub(fIdx)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                <Plus className="w-3 h-3" /> Add Sub-feature
                            </button>
                        </div>

                        {feature.subFeatures.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic">No sub-features. Click Add Sub-feature above.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {feature.subFeatures.map((sf, sIdx) => (
                                    <SubFeatureRow
                                        key={sIdx}
                                        sf={sf}
                                        fIdx={fIdx}
                                        sIdx={sIdx}
                                        onChange={onSubChange}
                                        onRemove={onRemoveSub}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function FeatureCatalogPage() {
    const [catalog, setCatalog] = useState<SyncedFeature[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const { get: getSettings, post: postSettings } = useApi<any[]>();

    /* Load saved catalog, then merge with auto-derived */
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await getSettings("/v1/superadmin/subscription-control/global-settings", { autoToast: false });
                const saved: any[] = res ?? [];
                const catalogEntry = saved.find((s) => s.key === "FEATURE_CATALOG");
                let savedCatalog: any[] = [];
                if (catalogEntry?.value) {
                    try { savedCatalog = JSON.parse(catalogEntry.value); } catch { /* ignore */ }
                }
                const auto = deriveFeaturesFromSidebar();
                setCatalog(mergeCatalogs(savedCatalog, auto));
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    /* ─ handlers ─────────────────────────────────────────────── */
    const handleFieldChange = useCallback((fIdx: number, field: keyof SyncedFeature, val: any) => {
        setCatalog((prev) => {
            const clone = [...prev];
            clone[fIdx] = { ...clone[fIdx], [field]: val };
            return clone;
        });
    }, []);

    const handleSubChange = useCallback((fIdx: number, sIdx: number, field: keyof SyncedSubFeature, val: any) => {
        setCatalog((prev) => {
            const clone = [...prev];
            const subs = [...clone[fIdx].subFeatures];
            subs[sIdx] = { ...subs[sIdx], [field]: val };
            clone[fIdx] = { ...clone[fIdx], subFeatures: subs };
            return clone;
        });
    }, []);

    const handleAddSub = useCallback((fIdx: number) => {
        setCatalog((prev) => {
            const clone = [...prev];
            clone[fIdx] = { ...clone[fIdx], subFeatures: [...clone[fIdx].subFeatures, emptySubFeature()] };
            return clone;
        });
    }, []);

    const handleRemoveSub = useCallback((fIdx: number, sIdx: number) => {
        setCatalog((prev) => {
            const clone = [...prev];
            const subs = clone[fIdx].subFeatures.filter((_, i) => i !== sIdx);
            clone[fIdx] = { ...clone[fIdx], subFeatures: subs };
            return clone;
        });
    }, []);

    const handleRemoveFeature = useCallback((fIdx: number) => {
        setCatalog((prev) => prev.filter((_, i) => i !== fIdx));
    }, []);

    const handleAddFeature = useCallback(() => {
        setCatalog((prev) => [...prev, emptyFeature()]);
    }, []);

    const handleSync = useCallback(() => {
        const auto = deriveFeaturesFromSidebar();
        setCatalog((prev) => mergeCatalogs(prev, auto));
        toast.info("Re-synced features from admin sidebar.", { autoClose: 2500 });
    }, []);

    const handleSave = async () => {
        // Validate: each feature must have a key and name
        const invalid = catalog.find((f) => !f.key.trim() || !f.name.trim());
        if (invalid) {
            toast.error(`Feature "${invalid.name || "(unnamed)"}" is missing a key or name.`);
            return;
        }

        setIsSaving(true);
        try {
            const serialized = catalog.map((f) => ({
                key: f.key,
                name: f.name,
                defaultPrice: f.defaultPrice,
                yearlyPrice: f.yearlyPrice,
                threeYearlyPrice: f.threeYearlyPrice,
                routes: f.routes,
                isAuto: f.isAuto,
                subFeatures: f.subFeatures.map((sf) => ({
                    key: sf.key,
                    name: sf.name,
                    price: sf.price,
                    yearlyPrice: sf.yearlyPrice,
                    threeYearlyPrice: sf.threeYearlyPrice,
                    route: sf.route,
                })),
            }));

            const res = await postSettings(
                "/v1/superadmin/subscription-control/global-settings",
                { settings: [{ key: "FEATURE_CATALOG", value: serialized }] },
                { autoToast: false }
            );

            if (res) {
                toast.success("Feature catalog saved successfully!");
            } else {
                toast.error("Failed to save. Please try again.");
            }
        } catch {
            toast.error("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    /* ─ filtered view ────────────────────────────────────────── */
    const filtered = search.trim()
        ? catalog.filter(
            (f) =>
                f.name.toLowerCase().includes(search.toLowerCase()) ||
                f.key.toLowerCase().includes(search.toLowerCase())
        )
        : catalog;

    const autoCount = catalog.filter((f) => f.isAuto).length;
    const customCount = catalog.filter((f) => !f.isAuto).length;

    return (
        <>
            <Head><title>Feature Catalog | LearnXChain Superadmin</title></Head>
            <DashboardLayout role="superadmin">
                <div className="w-full space-y-6">

                    {/* ── Page header ──────────────────────────────── */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Catalog</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Manage features and sub-features available in subscription plans. Auto-features are derived from the admin sidebar.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Stats bar ────────────────────────────────── */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Total Features", value: catalog.length, color: "text-indigo-600 dark:text-indigo-400" },
                            { label: "Auto (Sidebar)", value: autoCount, color: "text-indigo-500 dark:text-indigo-300", icon: <Cpu className="w-3.5 h-3.5" /> },
                            { label: "Custom", value: customCount, color: "text-amber-500 dark:text-amber-400", icon: <Tag className="w-3.5 h-3.5" /> },
                        ].map((s) => (
                            <div key={s.label} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/40 px-4 py-3 flex items-center gap-3">
                                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* ── Toolbar ──────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="flex-1 max-w-xs relative">
                            <input
                                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-sm text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                placeholder="Search features…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSync}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Sync from Sidebar
                            </button>
                            <button
                                onClick={handleAddFeature}
                                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Custom Feature
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-colors"
                            >
                                {isSaving ? <Loader size="sm" variant="white" /> : <Save className="w-4 h-4" />}
                                {isSaving ? "Saving…" : "Save Catalog"}
                            </button>
                        </div>
                    </div>

                    {/* ── Column headers ───────────────────────────── */}
                    <div className="hidden md:grid grid-cols-12 gap-2 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <div className="col-span-1" />
                        <div className="col-span-1">Type</div>
                        <div className="col-span-2">Key</div>
                        <div className="col-span-3">Display Name</div>
                        <div className="col-span-2">Monthly ₹</div>
                        <div className="col-span-2 border-l border-gray-100 dark:border-white/10 pl-2">Yearly ₹</div>
                        <div className="col-span-1" />
                    </div>

                    {/* ── Cards ────────────────────────────────────── */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader size="lg" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-24 text-center">
                            <Layers className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {search ? "No features match your search." : "No features yet. Click \"Sync from Sidebar\" to auto-import."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((feature, fIdx) => (
                                <FeatureCard
                                    key={`${feature.key}-${fIdx}`}
                                    feature={feature}
                                    fIdx={search ? catalog.indexOf(feature) : fIdx}
                                    onFieldChange={handleFieldChange}
                                    onSubChange={handleSubChange}
                                    onAddSub={handleAddSub}
                                    onRemoveSub={handleRemoveSub}
                                    onRemove={handleRemoveFeature}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── Footer save ──────────────────────────────── */}
                    {!isLoading && catalog.length > 0 && (
                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/10">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-colors"
                            >
                                {isSaving ? <Loader size="sm" variant="white" /> : <Save className="w-4 h-4" />}
                                {isSaving ? "Saving…" : "Save All Changes"}
                            </button>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
