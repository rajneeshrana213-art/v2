import { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { getAccessToken } from "@/lib/api/client";
import {
  Smartphone,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowUpCircle,
  Shield,
  ExternalLink,
} from "lucide-react";

interface AppVersionConfig {
  currentVersion: string;
  minimumVersion: string;
  downloadUrl: string;
  whatsNew: string;
  updatedAt: string;
  updatedBy: string;
}

function VersionBadge({ label, version, color }: { label: string; version: string; color: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 px-5 py-4 rounded-xl border ${color}`}>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-2xl font-bold font-mono">v{version}</span>
    </div>
  );
}

function InfoBox({ icon: Icon, color, title, desc }: { icon: any; color: string; title: string; desc: string }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${color}`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs opacity-80 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default function ManageAppPage() {
  const [config, setConfig] = useState<AppVersionConfig | null>(null);
  const [form, setForm] = useState({ currentVersion: "", minimumVersion: "", downloadUrl: "", whatsNew: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/superadmin/manage-app", {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      if (!res.ok) throw new Error("Failed to load config");
      const data: AppVersionConfig = await res.json();
      setConfig(data);
      setForm({
        currentVersion: data.currentVersion,
        minimumVersion: data.minimumVersion,
        downloadUrl:    data.downloadUrl,
        whatsNew:       data.whatsNew,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/v1/superadmin/manage-app", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setConfig(data.config);
      setSuccess("App version settings saved! Users on older builds will see the update prompt next launch.");
      setTimeout(() => setSuccess(null), 6000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    config &&
    (form.currentVersion !== config.currentVersion ||
      form.minimumVersion !== config.minimumVersion ||
      form.downloadUrl    !== config.downloadUrl    ||
      form.whatsNew       !== config.whatsNew);

  return (
    <DashboardLayout role="superadmin">
      <Head>
        <title>Manage App | LearnXChain Super Admin</title>
        <meta name="description" content="Control the LearnXChain mobile app version — set current and minimum versions to trigger update prompts for users." />
      </Head>

      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              <Smartphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Manage App</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Control mobile app version & update prompts</p>
            </div>
          </div>
          <button
            onClick={fetchConfig}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw className={`h-5 w-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── Error / Success banners ── */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10 p-4 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-800/40 dark:bg-green-900/10 p-4 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* ── Current live status ── */}
        {config && (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-indigo-500" />
              Live Configuration
            </h2>
            <div className="flex flex-wrap gap-4">
              <VersionBadge
                label="Latest Version"
                version={config.currentVersion}
                color="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
              />
              <VersionBadge
                label="Minimum Required"
                version={config.minimumVersion}
                color="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
              />
            </div>
            {config.updatedAt && (
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                Last updated {new Date(config.updatedAt).toLocaleString("en-IN")} by <span className="font-medium">{config.updatedBy}</span>
              </p>
            )}
          </div>
        )}

        {/* ── Edit form ── */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Update Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Current Version <span className="text-xs text-indigo-500">(latest available)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1.2.0"
                value={form.currentVersion}
                onChange={e => setForm(f => ({ ...f, currentVersion: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Minimum Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Minimum Version <span className="text-xs text-amber-500">(force update below this)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1.1.0"
                value={form.minimumVersion}
                onChange={e => setForm(f => ({ ...f, minimumVersion: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Download URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Download / Store URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://play.google.com/store/apps/details?id=com.myapp"
                value={form.downloadUrl}
                onChange={e => setForm(f => ({ ...f, downloadUrl: e.target.value }))}
                className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {form.downloadUrl && (
                <a
                  href={form.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </a>
              )}
            </div>
          </div>

          {/* What's New */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              What's New <span className="text-xs text-gray-400">(shown in the update prompt)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe what's new in this release…"
              value={form.whatsNew}
              onChange={e => setForm(f => ({ ...f, whatsNew: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Save button */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-400">
              {hasChanges
                ? "⚠ You have unsaved changes"
                : config ? "✓ Settings are up-to-date" : ""}
            </p>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-indigo-500" />
            How Update Prompts Work
          </h2>
          <div className="space-y-3">
            <InfoBox
              icon={ArrowUpCircle}
              color="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
              title="Optional Update"
              desc="User's version < Current Version but ≥ Minimum Version. A dismissible prompt appears with 'Maybe later' option."
            />
            <InfoBox
              icon={Shield}
              color="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
              title="Force Update (Cannot Dismiss)"
              desc="User's version < Minimum Version. The modal cannot be closed — user MUST update to continue using the app."
            />
            <InfoBox
              icon={CheckCircle2}
              color="border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300"
              title="No Prompt"
              desc="User's version = Current Version. Nothing is shown. The check runs silently in the background every launch."
            />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
