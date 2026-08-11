import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import {
    Plus, Edit, Trash2, Globe, Check, X, Search, FileText, Image as ImageIcon, Link2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getAccessToken } from '@/lib/api/client';
import { Loader } from "@/components/ui/feedback/Loader";
import AnalyticsDashboard from '@/components/seo/AnalyticsDashboard';

interface SeoMeta {
    id: string;
    pageSlug: string;
    title: string | null;
    description: string | null;
    keywords: string | null;
    ogImage: string | null;
    canonical: string | null;
    noIndex: boolean;
    updatedAt: string;
}

export default function SeoManagementPage() {
    const [seoRecords, setSeoRecords] = useState<SeoMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [origin, setOrigin] = useState("");
    const [activeTab, setActiveTab] = useState<'config' | 'analytics'>('config');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentSeo, setCurrentSeo] = useState<Partial<SeoMeta>>({
        noIndex: false,
    });

    // Delete Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [seoToDelete, setSeoToDelete] = useState<string | null>(null);

    useEffect(() => {
        setOrigin(typeof window !== "undefined" ? window.location.origin : "");
        fetchSeoRecords();
    }, []);

    const fetchSeoRecords = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/v1/superadmin/seo', {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setSeoRecords(data);
            } else {
                toast.error(data.error || 'Failed to fetch SEO records');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load SEO records');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (slug: string) => {
        setSeoToDelete(slug);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!seoToDelete) return;

        const id = toast.loading('Deleting SEO record...');
        try {
            const res = await fetch(`/api/v1/superadmin/seo/${encodeURIComponent(seoToDelete)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            });

            if (!res.ok) throw new Error('Failed to delete');

            toast.update(id, {
                render: 'SEO record deleted successfully',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
            fetchSeoRecords();
            setIsDeleteModalOpen(false);
            setSeoToDelete(null);
        } catch (error) {
            toast.update(id, {
                render: 'Failed to delete SEO record',
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentSeo.pageSlug) {
            toast.error('Page slug is required');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(isEditMode ? 'Updating SEO record...' : 'Creating SEO record...');

        const url = isEditMode
            ? `/api/v1/superadmin/seo/${encodeURIComponent(currentSeo.pageSlug)}` // Uses the old slug if we didn't change it, but wait: if editing and changing slug, this fails unless we have originalSlug.
            // Let's assume slug changes are allowed but we use the old slug for the endpoint.
            : '/api/v1/superadmin/seo';

        const method = isEditMode ? 'PUT' : 'POST';

        // Fix for updating slug: keep original slug in state to PUT to the right URL
        const targetSlug = currentSeo.id // proxy for saying it has an ID
            ? seoRecords.find(r => r.id === currentSeo.id)?.pageSlug
            : currentSeo.pageSlug;

        const updateUrl = isEditMode ? `/api/v1/superadmin/seo/${encodeURIComponent(targetSlug || currentSeo.pageSlug || '')}` : '/api/v1/superadmin/seo';

        try {
            const res = await fetch(updateUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAccessToken()}`
                },
                body: JSON.stringify(currentSeo),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save');

            toast.update(toastId, {
                render: isEditMode ? 'SEO record updated successfully' : 'SEO record created successfully',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });

            setIsModalOpen(false);
            fetchSeoRecords();
        } catch (error: any) {
            toast.update(toastId, {
                render: error.message,
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setCurrentSeo({
            pageSlug: '',
            title: '',
            description: '',
            keywords: '',
            ogImage: '',
            canonical: '',
            noIndex: false,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (seo: SeoMeta) => {
        setIsEditMode(true);
        setCurrentSeo({ ...seo });
        setIsModalOpen(true);
    };

    const filteredRecords = seoRecords.filter(r =>
        r.pageSlug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <DashboardLayout role="superadmin">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            SEO Optimization
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage meta tags, Open Graph images, and indexing for all pages.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
                    >
                        <Plus size={20} />
                        Add SEO Record
                    </button>
                </div>
                {/* Tab Navigation */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'config'
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        Configurations
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'analytics'
                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        Keyword Analytics
                    </button>
                </div>
            </div>

            {activeTab === 'config' ? (
                <>
                    {/* Search Bar */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by page slug or title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        </div>
                    </div>

                    {/* SEO Records List */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Globe className="text-indigo-500" size={20} />
                                All SEO Configurations ({filteredRecords.length})
                            </h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader size="lg" />
                            </div>
                        ) : filteredRecords.length === 0 ? (
                            <div className="text-center py-20">
                                <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No SEO Records Found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Try creating a new SEO configuration or adjusting your search.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-semibold">Page Route (Slug)</th>
                                            <th className="p-4 font-semibold">Meta Title</th>
                                            <th className="p-4 font-semibold flex items-center gap-1"><ImageIcon size={14} /> OG Image</th>
                                            <th className="p-4 font-semibold">Indexing</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {filteredRecords.map((record) => (
                                            <tr
                                                key={record.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                            <Link2 size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 dark:text-white">
                                                                {record.pageSlug === '/' ? 'Home Route (/)' : `/${record.pageSlug}`}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Last updated: {format(new Date(record.updatedAt), 'MMM dd, yyyy')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate max-w-[200px]" title={record.title || ''}>
                                                        {record.title || <span className="text-gray-400 italic">Not set</span>}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={record.description || ''}>
                                                        {record.description || 'No description'}
                                                    </p>
                                                </td>
                                                <td className="p-4">
                                                    {record.ogImage ? (
                                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-max">
                                                            <Check size={14} /> Configured
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-400 text-sm">None</div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {record.noIndex ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                            No Index
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            Indexed
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(record)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(record.pageSlug)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <AnalyticsDashboard />
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all scale-100 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Globe className="text-indigo-500" />
                                {isEditMode ? 'Edit SEO Configuration' : 'Create SEO Configuration'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">

                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                <label className="text-sm font-bold text-indigo-900 dark:text-indigo-300 block mb-1">Page Slug (Route)</label>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-2">The URL path this SEO config applies to. Use '/' for the home page, or 'about' for '/about'.</p>
                                <div className="flex items-center">
                                    <span className="bg-white dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700 px-3 py-2.5 rounded-l-xl text-gray-500 font-mono text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] md:max-w-none">
                                        {origin}{currentSeo.pageSlug === '/' ? '' : '/'}
                                    </span>
                                    <input
                                        type="text"
                                        value={currentSeo.pageSlug || ''}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (val !== '/') {
                                                val = val.replace(/^\/+/, '');
                                            }
                                            setCurrentSeo({ ...currentSeo, pageSlug: val });
                                        }}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-r-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                                        placeholder="e.g. contact OR / for home"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-2">Basic Metadata</h3>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title <span className="text-gray-400 font-normal">(50-60 chars recommended)</span></label>
                                    <input
                                        type="text"
                                        value={currentSeo.title || ''}
                                        onChange={(e) => setCurrentSeo({ ...currentSeo, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="LearnXChain - The Ultimate School ERP"
                                    />
                                    <div className="text-right text-xs text-gray-400 mt-1">{(currentSeo.title || '').length} characters</div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description <span className="text-gray-400 font-normal">(150-160 chars recommended)</span></label>
                                    <textarea
                                        value={currentSeo.description || ''}
                                        onChange={(e) => setCurrentSeo({ ...currentSeo, description: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y h-24"
                                        placeholder="A detailed description of the page content for search engine snippets."
                                    />
                                    <div className="text-right text-xs text-gray-400 mt-1">{(currentSeo.description || '').length} characters</div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Keywords <span className="text-gray-400 font-normal">(Comma separated)</span></label>
                                    <input
                                        type="text"
                                        value={currentSeo.keywords || ''}
                                        onChange={(e) => setCurrentSeo({ ...currentSeo, keywords: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="school management, erp, education"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-2">Advanced SEO</h3>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <ImageIcon size={16} /> Open Graph (OG) Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={currentSeo.ogImage || ''}
                                        onChange={(e) => setCurrentSeo({ ...currentSeo, ogImage: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder={`${origin || 'https://domain.com'}/og-image.jpg`}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Link2 size={16} /> Canonical URL
                                    </label>
                                    <input
                                        type="url"
                                        value={currentSeo.canonical || ''}
                                        onChange={(e) => setCurrentSeo({ ...currentSeo, canonical: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder={`${origin || 'https://domain.com'}/original-page`}
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                                    <input
                                        type="checkbox"
                                        id="noIndex"
                                        checked={currentSeo.noIndex || false}
                                        onChange={(e) => setCurrentSeo({ ...currentSeo, noIndex: e.target.checked })}
                                        className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500 bg-white"
                                    />
                                    <div>
                                        <label htmlFor="noIndex" className="font-semibold text-red-800 dark:text-red-400 cursor-pointer select-none">Disable Search Engine Indexing</label>
                                        <p className="text-sm text-red-600 dark:text-red-300">Adds an "noindex, nofollow" meta tag. Bots will not index this page.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 pb-2 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader size="sm" variant="white" />
                                            {isEditMode ? 'Saving...' : 'Creating...'}
                                        </>
                                    ) : (
                                        isEditMode ? 'Save SEO Config' : 'Create SEO Config'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all scale-100 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete SEO Configuration?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 flex flex-col items-center">
                            Are you sure you want to delete the SEO configuration for:
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block mt-2 text-sm">/{seoToDelete}</span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSeoToDelete(null);
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
