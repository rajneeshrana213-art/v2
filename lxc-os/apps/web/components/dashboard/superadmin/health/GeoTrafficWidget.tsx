
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { getAccessToken } from "@/lib/api/client";

interface GeoEntry {
    country: string;
    percentage: number;
    color: string;
}

export function GeoTrafficWidget() {
    const [data, setData] = useState<GeoEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
            try {
                const res = await fetch("/api/v1/superadmin/geo-traffic", {
                    headers: { Authorization: `Bearer ${getAccessToken()}` },
                });
                if (res.ok) {
                    const json = await res.json();
                    if (Array.isArray(json.geoTraffic) && json.geoTraffic.length > 0) {
                        setData(json.geoTraffic);
                    }
                }
            } catch {
                // non-critical — silently fail
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900 h-full">
            <div className="mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-50">Traffic Source</h3>
                {!loading && (
                    <span className="ml-auto text-[10px] font-medium text-emerald-500 uppercase tracking-wide">Live</span>
                )}
            </div>

            {loading ? (
                <p className="text-xs text-gray-400">Loading…</p>
            ) : data.length === 0 ? (
                <p className="text-xs text-gray-400">No geo data available yet.</p>
            ) : (
                <div className="space-y-4">
                    {data.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-20 text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{item.country}</div>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                    className={`h-full rounded-full ${item.color} transition-all duration-700`}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                            <div className="w-8 text-xs font-bold text-gray-900 dark:text-white text-right">{item.percentage}%</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
