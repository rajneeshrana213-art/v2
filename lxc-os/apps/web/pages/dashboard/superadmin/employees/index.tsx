import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { encodeId } from "@/lib/utils/hashId";
import { useApi } from '@/hooks/useApi';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, UserX, UserCheck, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { clsx } from 'clsx';
import { toast } from 'react-toastify';
import { Loader } from '@/components/ui/feedback/Loader';
import { ConfirmModal } from '@/components/ui/modals/ConfirmModal';


interface Employee {
    id: string;
    employeeCode: string;
    employeeType: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    user: {
        name: string;
        email: string;
        phone: string;
        profilePic: string | null;
    };
    department: { name: string } | null;
    designation: { name: string } | null;
}

export default function EmployeesPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const router = useRouter();
    const { data: employeesData, loading, error, get, del, patch } = useApi<{ data: Employee[], pagination: any }>();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);




    useEffect(() => {
        console.log('EmployeesPage mounted');
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [page, search]);

    const fetchEmployees = () => {
        get(`/v1/superadmin/employees?page=${page}&search=${search}`);
    };

    const handleDelete = (id: string) => {
        setEmployeeToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;
        setActionLoading(`delete_${employeeToDelete}`);
        try {
            await del(`/v1/superadmin/employees/${employeeToDelete}`);
            toast.success('Employee deleted successfully');
            fetchEmployees();
        } catch (err) {
            toast.error('Failed to delete employee');
        } finally {
            setActionLoading(null);
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const handleStatusChange = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        setActionLoading(`status_${id}`);
        try {
            await patch(`/v1/superadmin/employees/${id}`, { status: newStatus });
            toast.success(`Employee ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully`);
            fetchEmployees();
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    if (!mounted) return null;

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Employees - LearnXChain</title>
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage all your employees, track attendance and performance</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/superadmin/employees/create')}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Employee
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-500"
                        />
                    </div>
                    {/* <button className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </button> */}
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-white/5 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Employee</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Employee ID</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center">
                                            <div className="flex justify-center">
                                                <Loader size="lg" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : employeesData?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No employees found
                                        </td>
                                    </tr>
                                ) : (
                                    employeesData?.data.map((employee) => (
                                        <tr key={employee.id} className="group hover:bg-gray-50 dark:hover:bg-white/5">
                                            <td className="px-6 py-4">
                                                <div
                                                    className="flex cursor-pointer items-center gap-3"
                                                    onClick={() => router.push(`/dashboard/superadmin/employees/${encodeId(employee.id)}`)}
                                                >
                                                    {employee.user.profilePic ? (
                                                        <img src={employee.user.profilePic} alt={employee.user.name} className="h-10 w-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold">
                                                            {employee.user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-colors">{employee.user.name}</p>
                                                        <p className="text-xs text-gray-500">{employee.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20">
                                                    {employee.employeeType.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">{employee.employeeCode}</td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                                                    employee.status === 'ACTIVE'
                                                        ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/10 dark:text-green-400 dark:ring-green-400/20"
                                                        : "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/10 dark:text-red-400 dark:ring-red-400/20"
                                                )}>
                                                    <span className={clsx("mr-1.5 h-1.5 w-1.5 rounded-full", employee.status === 'ACTIVE' ? "bg-green-600 dark:bg-green-400" : "bg-red-600 dark:bg-red-400")}></span>
                                                    {employee.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => employee.id && router.push(`/dashboard/superadmin/employees/edit/${encodeId(employee.id)}`)}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-white/5 dark:hover:text-indigo-400"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(employee.id, employee.status)}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-orange-600 dark:hover:bg-white/5 dark:hover:text-orange-400"
                                                        title={employee.status === 'ACTIVE' ? "Suspend" : "Activate"}
                                                        disabled={actionLoading !== null}
                                                    >
                                                        {actionLoading === `status_${employee.id}` ? (
                                                            <Loader size="sm" variant="white" />
                                                        ) : (
                                                            employee.status === 'ACTIVE' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(employee.id)}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-white/5 dark:hover:text-red-400"
                                                        title="Delete"
                                                        disabled={actionLoading !== null}
                                                    >
                                                        {actionLoading === `delete_${employee.id}` ? (
                                                            <Loader size="sm" variant="white" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {employeesData?.pagination && employeesData.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-gray-900 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(employeesData.pagination.totalPages, p + 1))}
                                    disabled={page === employeesData.pagination.totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-400">
                                        Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{employeesData.pagination.totalPages}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-white/10 dark:hover:bg-white/5"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setPage(p => Math.min(employeesData.pagination.totalPages, p + 1))}
                                            disabled={page === employeesData.pagination.totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-white/10 dark:hover:bg-white/5"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Employee"
                description="Are you sure you want to delete this employee? This action cannot be undone."
                isLoading={actionLoading === `delete_${employeeToDelete}`}
            />
        </DashboardLayout>

    );
}
