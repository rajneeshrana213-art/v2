import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { encodeId } from "@/lib/utils/hashId";
import { useApi } from '@/hooks/useApi';
import { Plus, Search, Building, Trash2, Edit, Power, MapPin, Mail, Phone, ChevronLeft, ChevronRight, User, School, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';
import { Loader } from '@/components/ui/feedback/Loader';

interface Organization {
    id: string;
    name: string;
    logo?: string | null;
    isActive: boolean;
    owner: {
        name: string;
        email: string;
        phone: string;
    };
    _count?: {
        schools: number;
    };
    address: string;
    createdAt: string;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface GroupsResponse {
    data: Organization[];
    meta: PaginationMeta;
}

export default function OrganizationList() {
    const { loading, get, del, patch } = useApi<GroupsResponse>();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [groups, setGroups] = useState<Organization[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [modal, setModal] = useState<{
        open: boolean; title: string; message: string;
        confirmLabel: string; danger: boolean; onConfirm: () => void;
    }>({ open: false, title: '', message: '', confirmLabel: 'Confirm', danger: true, onConfirm: () => { } });

    const closeModal = () => setModal(m => ({ ...m, open: false }));
    const openConfirm = (opts: Omit<typeof modal, 'open'>) => setModal({ ...opts, open: true });

    const fetchGroups = useCallback(async (currentPage: number, search: string) => {
        // Since we don't have a dedicated /v1/superadmin/groups GET yet in my mind, 
        // I'll assume it exists or I'll create it. Based on the school list, I'll follow that pattern.
        const queryParams = new URLSearchParams({
            page: currentPage.toString(),
            limit: '10',
            ...(search && { search })
        });
        const result = await get(`/v1/superadmin/groups?${queryParams.toString()}`);
        if (result) {
            setGroups(result.data);
            setMeta(result.meta);
        } else {
            // Mock data for demonstration if API doesn't exist yet
            setGroups([]);
        }
        setIsInitialLoad(false);
    }, [get]);

    const debouncedFetch = useCallback(
        debounce((currentPage: number, search: string) => {
            fetchGroups(currentPage, search);
        }, 500),
        [fetchGroups]
    );

    useEffect(() => {
        fetchGroups(page, searchTerm);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setPage(1);
        debouncedFetch(1, value);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && (meta ? newPage <= meta.totalPages : true)) {
            setPage(newPage);
            fetchGroups(newPage, searchTerm);
        }
    };

    const handleDelete = (id: string, name: string) => {
        openConfirm({
            title: 'Delete Organization',
            message: `Are you sure you want to permanently delete "${name}"? All linked schools, students, and records will be removed. This action cannot be undone.`,
            confirmLabel: 'Delete Organization',
            danger: true,
            onConfirm: async () => {
                closeModal();
                const result = await del(`/v1/superadmin/groups/${id}`, undefined, {
                    successMessage: 'Organization deleted successfully',
                });
                if (result) fetchGroups(page, searchTerm);
            }
        });
    };

    const handleToggleStatus = (id: string, currentStatus: boolean, name: string) => {
        const action = currentStatus ? 'disable' : 'enable';
        openConfirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Organization`,
            message: `Are you sure you want to ${action} "${name}"?${currentStatus
                    ? ' All linked schools and users will lose access until it is re-enabled.'
                    : ' This will restore access for all schools and users in this organization.'
                }`,
            confirmLabel: `${action.charAt(0).toUpperCase() + action.slice(1)} Organization`,
            danger: currentStatus,
            onConfirm: async () => {
                closeModal();
                const result = await patch(`/v1/superadmin/groups/${id}`, { isActive: !currentStatus }, {
                    successMessage: `Organization ${action}d successfully`
                });
                if (result) fetchGroups(page, searchTerm);
            }
        });
    };

    return (
        <DashboardLayout role="superadmin">

            {/* ── Confirm Modal ── */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl p-6">
                        <div className={`inline-flex rounded-full p-3 mb-4 ${modal.danger ? 'bg-red-100 dark:bg-red-500/10' : 'bg-emerald-100 dark:bg-emerald-500/10'
                            }`}>
                            <AlertTriangle className={`w-5 h-5 ${modal.danger ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                                }`} />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">{modal.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{modal.message}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={modal.onConfirm}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm ${modal.danger
                                        ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                                    }`}
                            >
                                {modal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Organizations (School Groups)</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage multi-school organizations and their administrators.</p>
                    </div>
                    <Link href="/dashboard/superadmin/groups/create"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        Add Organization
                    </Link>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search organizations by name or admin..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
                    />
                </div>

                {(loading || isInitialLoad) ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="lg" />
                    </div>
                ) : groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full mb-3">
                            <Building className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No organizations found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new organization.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {groups.map((group) => (
                            <div
                                key={group.id}
                                className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => router.push(`/dashboard/superadmin/groups/${encodeId(group.id)}`)}
                            >
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                            {group.logo ? (
                                                <img src={group.logo} alt={group.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{group.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${group.isActive
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                                    }`}>
                                                    {group.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    Owner: {group.owner?.name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <School className="w-3 h-3" />
                                                    {group._count?.schools || 0} Branches
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {group.address}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleToggleStatus(group.id, group.isActive, group.name)}
                                            className={`p-2 rounded-lg transition-colors ${group.isActive
                                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <Power className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => router.push(`/dashboard/superadmin/groups/create?edit=${encodeId(group.id)}`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(group.id, group.name)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {meta && meta.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-gray-900 sm:px-6 rounded-xl mt-4">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === meta.totalPages}
                                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-400">
                                            Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{meta.totalPages}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={() => handlePageChange(page - 1)}
                                                disabled={page === 1}
                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-white/10 dark:hover:bg-white/5"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(page + 1)}
                                                disabled={page === meta.totalPages}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-white/10 dark:hover:bg-white/5"
                                            >
                                                <span className="sr-only">Next</span>
                                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

               
            </div>
        </DashboardLayout>
    );
}
