import { useState, useEffect } from 'react';
import { encodeId } from "@/lib/utils/hashId";
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Search, Plus, Edit, FilterX, Tags, GraduationCap, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Loader } from '@/components/ui/feedback/Loader';

export default function BookInventory() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>('Category');
    const [classFilter, setClassFilter] = useState<string>('Class');

    // Delete state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [libraryId, setLibraryId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchLibraryData = async () => {
            try {
                const libRes = await fetch('/api/v1/library/get-my-library');
                const libData = await libRes.json();

                if (libData.id) {
                    setLibraryId(libData.id);
                    // Concurrent fetch for books, categories and classes
                    const [booksRes, catsRes, classesRes] = await Promise.all([
                        fetch(`/api/v1/library/books?libraryId=${libData.id}`),
                        fetch('/api/v1/library/categories'),
                        fetch(`/api/v1/library/classes?libraryId=${libData.id}`)
                    ]);

                    const [booksData, catsData, classesData] = await Promise.all([
                        booksRes.json(),
                        catsRes.json(),
                        classesRes.json()
                    ]);

                    if (Array.isArray(booksData)) setBooks(booksData);
                    if (Array.isArray(catsData)) setCategories(catsData);
                    if (Array.isArray(classesData)) setClasses(classesData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLibraryData();
    }, []);

    const filteredBooks = books.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author.toLowerCase().includes(search.toLowerCase()) ||
            b.isbn?.includes(search);

        const matchesCategory = categoryFilter === 'Category' || b.categoryId === categoryFilter;
        const matchesClass = classFilter === 'Class' || b.classId === classFilter;

        return matchesSearch && matchesCategory && matchesClass;
    });

    const handleDelete = async () => {
        if (!bookToDelete) return;
        console.log("Deleting book:", bookToDelete.id);
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/v1/library/books/${bookToDelete.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
                setDeleteModalOpen(false);
                toast.success("Book deleted successfully");
            } else {
                toast.error("Failed to delete book");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting book");
        } finally {
            setIsDeleting(false);
            setBookToDelete(null);
        }
    };

    const columns: ColumnDef<any>[] = [
        { key: "title", header: "Title", render: (v, row) => <span className="font-medium text-slate-900">{row.title}</span> },
        { key: "author", header: "Author" },
        { key: "isbn", header: "ISBN", render: (v) => v || 'N/A' },
        { key: "category", header: "Category", render: (v, row) => row.category?.name || '-' },
        { key: "class", header: "Class", render: (v, row) => row.class?.name || '-' },
        { key: "price", header: "Price", render: (v) => v ? `₹${v}` : 'Free' },
        { key: "copies", header: "Copies", render: (v, row) => row.copies?.length || 0 },
        {
            key: "status", header: "Status", render: (v) => (
                <Badge className={v === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-500'}>
                    {v}
                </Badge>
            )
        },
        {
            key: "id", header: "Actions", align: "right", render: (v, row) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                        onClick={() => router.push(`/dashboard/admin/library/books/edit/${encodeId(row.id)}`)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                        onClick={() => {
                            setBookToDelete(row);
                            setDeleteModalOpen(true);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout role="admin">
            <div className="p-4 md:p-6 space-y-6">
                <Head>
                    <title>Book Inventory | LearnXChain</title>
                </Head>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Book Inventory</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage library catalog and copies.</p>
                    </div>
                    <Link href="/dashboard/admin/library/books/add">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="h-4 w-4" />
                            Add New Book
                        </Button>
                    </Link>
                </div>

                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3 px-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <CardTitle className="text-xl font-semibold">Catalog</CardTitle>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="w-full sm:w-[170px] h-9 bg-slate-50 dark:bg-slate-900 border-slate-200">
                                            <div className="flex items-center gap-2">
                                                <Tags className="h-3.5 w-3.5 text-slate-400" />
                                                <SelectValue placeholder="Category">
                                                    {categoryFilter === 'Category' ? 'All Categories' : categories.find(c => c.id === categoryFilter)?.name}
                                                </SelectValue>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Category">All Categories</SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={classFilter} onValueChange={setClassFilter}>
                                        <SelectTrigger className="w-full sm:w-[150px] h-9 bg-slate-50 dark:bg-slate-900 border-slate-200">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                                                <SelectValue placeholder="Class">
                                                    {classFilter === 'Class' ? 'All Classes' : classes.find(c => c.id === classFilter)?.name}
                                                </SelectValue>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Class">All Classes</SelectItem>
                                            {classes.map(cls => (
                                                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                                    {(categoryFilter !== 'Category' || classFilter !== 'Class' || search !== '') && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setCategoryFilter('Category');
                                                setClassFilter('Class');
                                                setSearch('');
                                            }}
                                            className="text-slate-500 hover:text-slate-900 h-9 px-2 whitespace-nowrap"
                                        >
                                            <FilterX className="h-4 w-4 mr-1" />
                                            Clear
                                        </Button>
                                    )}

                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search catalog..."
                                            className="pl-9 h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 w-full"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={filteredBooks}
                            loading={loading}
                            emptyState="No books found."
                            clickableRows
                        />
                    </CardContent>
                </Card>

                {/* Delete Confirmation Modal */}
                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete Book</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{bookToDelete?.title}</strong>? This action cannot be undone and will remove all associated copies.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? <Loader size="sm" variant="white" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                {isDeleting ? "" : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
