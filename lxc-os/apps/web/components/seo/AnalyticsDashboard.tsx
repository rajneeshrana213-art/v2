import React, { useState, useEffect } from 'react';
import {
    TrendingUp, MousePointerClick, Eye, Navigation,
    BarChart3, Activity, Target, ArrowUpRight, ArrowDownRight, Award, Calendar
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { getAccessToken } from '@/lib/api/client';
import { Loader } from "@/components/ui/feedback/Loader";

interface AnalyticsData {
    overview: {
        totalClicks: number;
        totalImpressions: number;
        averageCtr: number;
        averagePosition: number;
        clicksTrend?: number;
        impressionsTrend?: number;
        ctrTrend?: number;
        positionTrend?: number;
    };
    chartData: {
        date: string;
        clicks: number;
        impressions: number;
    }[];
    keywordRankings: {
        keyword: string;
        position: number;
        volume: number;
        traffic: number;
        difficulty: number;
        intent: string;
    }[];
    pageRankings: {
        pageUrl: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }[];
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'keywords' | 'pages'>('keywords');
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '16m'>('16m');

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/v1/superadmin/seo/analytics?range=${dateRange}`, {
                    headers: { 'Authorization': `Bearer ${getAccessToken()}` }
                });
                const jsonData = await res.json();

                if (res.ok) {
                    setData(jsonData);
                } else {
                    setError(jsonData.error || 'Failed to fetch analytics');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load SEO analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[500px]">
                <Loader size="xl" />
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Gathering Google Ranking Data...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
                <p className="text-red-600 dark:text-red-400 font-medium">{error || 'Something went wrong.'}</p>
            </div>
        );
    }

    const { overview, chartData, keywordRankings, pageRankings } = data;

    const getRangeLabel = () => {
        switch (dateRange) {
            case '7d': return 'vs last 7 days';
            case '30d': return 'vs last 30 days';
            case '90d': return 'vs last 3 months';
            case '16m': return 'All Time';
            default: return '';
        }
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, trend, prefix = "", suffix = "" }: any) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(trend)}%
                </div>
            </div>
            <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
                <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </div>
                <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
        </div>
    );

    const getIntentColor = (intent: string) => {
        switch (intent) {
            case 'Informational': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Navigational': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'Commercial': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Transactional': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Inner Tab Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('keywords')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'keywords'
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        Keyword Rankings
                    </button>
                    <button
                        onClick={() => setActiveTab('pages')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'pages'
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        Page Indexing Rank
                    </button>
                </div>
                
                {/* Date Filter */}
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl text-sm shadow-sm transition-all focus-within:ring-2 ring-indigo-500/20">
                    <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                    <select 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="bg-transparent border-none text-gray-700 dark:text-gray-200 font-medium focus:ring-0 cursor-pointer outline-none w-full"
                    >
                        <option value="7d" className="dark:bg-gray-800">Last 7 Days</option>
                        <option value="30d" className="dark:bg-gray-800">Last 30 Days</option>
                        <option value="90d" className="dark:bg-gray-800">Last 3 Months</option>
                        <option value="16m" className="dark:bg-gray-800">All Time (16 Months)</option>
                    </select>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Clicks"
                    value={overview.totalClicks}
                    icon={MousePointerClick}
                    trend={overview.clicksTrend || 0}
                    subtitle={getRangeLabel()}
                />
                <StatCard
                    title="Total Impressions"
                    value={overview.totalImpressions}
                    icon={Eye}
                    trend={overview.impressionsTrend || 0}
                    subtitle={getRangeLabel()}
                />
                <StatCard
                    title="Average CTR"
                    value={overview.averageCtr}
                    icon={Target}
                    trend={overview.ctrTrend || 0}
                    suffix="%"
                    subtitle="Click-through rate"
                />
                <StatCard
                    title="Avg Search Position"
                    value={overview.averagePosition}
                    icon={Navigation}
                    trend={(overview.positionTrend || 0) * -1} // Reverse trend sign since lower position (negative change) represents an improvement
                    subtitle="Rank # on Google"
                />
            </div>

            {/* Performance Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-indigo-500" size={20} />
                    Search Performance ({dateRange === '16m' ? 'All Time' : dateRange === '90d' ? '3 Months' : dateRange === '30d' ? '30 Days' : '7 Days'})
                </h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Area yAxisId="left" type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" name="Clicks" />
                            <Line yAxisId="right" type="monotone" dataKey="impressions" stroke="#a855f7" strokeWidth={2} dot={false} name="Impressions" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Conditional Data Tables */}
            {activeTab === 'keywords' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="text-indigo-500" size={20} />
                            Your Keyword Rankings
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Metrics extracted based on queries driving traffic to your site.</p>
                    </div>

                    {keywordRankings.length === 0 ? (
                        <div className="text-center py-16">
                            <Award className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={48} />
                            <h4 className="text-gray-900 dark:text-gray-100 font-medium text-lg">No Keywords Indexed</h4>
                            <p className="text-gray-500 mt-2">We couldn't find any keywords ranking on Google during this period.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Keyword</th>
                                        <th className="p-4 font-semibold">Google Position</th>
                                        <th className="p-4 font-semibold">Clicks (Traffic)</th>
                                        <th className="p-4 font-semibold">Search Volume</th>
                                        <th className="p-4 font-semibold">KD %</th>
                                        <th className="p-4 font-semibold text-right">Intent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {keywordRankings.map((kw, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="p-4">
                                                <span className="font-semibold text-gray-900 dark:text-white">{kw.keyword}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold ${kw.position <= 3 ? 'text-green-600 dark:text-green-400' : kw.position <= 10 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        #{kw.position}
                                                    </span>
                                                    {kw.position <= 3 && <Award size={14} className="text-amber-500" />}
                                                    {kw.position <= 10 && <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded dark:bg-green-900/30 dark:text-green-400 font-bold">PAGE 1</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                                {kw.traffic.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                                                {kw.volume.toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${kw.difficulty < 30 ? 'bg-green-500' : kw.difficulty < 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${kw.difficulty}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{kw.difficulty}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getIntentColor(kw.intent)}`}>
                                                    {kw.intent}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Navigation className="text-emerald-500" size={20} />
                            Top Indexed Pages
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">See exactly which pages on your site are getting the most visibility.</p>
                    </div>

                    {(!pageRankings || pageRankings.length === 0) ? (
                        <div className="text-center py-16">
                            <Activity className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={48} />
                            <h4 className="text-gray-900 dark:text-gray-100 font-medium text-lg">No Pages Indexed</h4>
                            <p className="text-gray-500 mt-2">Google has not sent any traffic to your pages in the selected period.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Page URL</th>
                                        <th className="p-4 font-semibold">Clicks</th>
                                        <th className="p-4 font-semibold">Impressions</th>
                                        <th className="p-4 font-semibold">CTR (%)</th>
                                        <th className="p-4 font-semibold text-right">Avg Position</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {pageRankings.map((page, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="p-4">
                                                <a href={page.pageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
                                                    {page.pageUrl.replace(/https?:\/\/[^\/]+/, '') || '/'}
                                                </a>
                                            </td>
                                            <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                {page.clicks.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                                                {page.impressions.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                                                {page.ctr}%
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`text-sm font-bold ${page.position <= 10 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    #{page.position}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
