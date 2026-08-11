import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import Loader from '@/components/ui/feedback/Loader';
import { decodeId } from "@/lib/utils/hashId";

export default function EditBookPage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [library, setLibrary] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        categoryId: '',
        type: 'BOOK',
        description: '',
        price: 0,
        classId: ''
    });

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                // Fetch library first
                const libRes = await fetch('/api/v1/library/get-my-library');
                const libData = await libRes.json();
                if (!libRes.ok || !libData.id) throw new Error("Library not found");
                setLibrary(libData);

                // Fetch categories and classes
                const [catsRes, classesRes, bookRes] = await Promise.all([
                    fetch('/api/v1/library/categories'),
                    fetch(`/api/v1/library/classes?libraryId=${libData.id}`),
                    fetch(`/api/v1/library/books/${id}`)
                ]);

                const cats = await catsRes.json();
                const cls = await classesRes.json();
                const book = await bookRes.json();

                if (Array.isArray(cats)) setCategories(cats);
                if (Array.isArray(cls)) setClassrooms(cls);

                if (book) {
                    setFormData({
                        title: book.title || '',
                        author: book.author || '',
                        isbn: book.isbn || '',
                        publisher: book.publisher || '',
                        categoryId: book.categoryId || '',
                        type: book.type || 'BOOK',
                        description: book.description || '',
                        price: book.price || 0,
                        classId: book.classId || ''
                    });
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/v1/library/books/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to update book');
            toast.success("Book updated successfully");
            router.push('/dashboard/admin/library/books');
        } catch (error) {
            console.error(error);
            toast.error("Error updating book");
        } finally {
            setIsLoading(false);
        }
    };

    const labelClass = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300";

    if (isFetching) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader className="" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
                <Head>
                    <title>Edit Book | LearnXChain</title>
                </Head>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Book</h1>
                        <p className="text-slate-500 dark:text-slate-400">Update book information.</p>
                    </div>
                </div>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Book Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="title" className={labelClass}>Book Title *</label>
                                    <Input id="title" name="title" required value={formData.title} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="author" className={labelClass}>Author *</label>
                                    <Input id="author" name="author" required value={formData.author} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="isbn" className={labelClass}>ISBN</label>
                                    <Input id="isbn" name="isbn" value={formData.isbn} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="publisher" className={labelClass}>Publisher</label>
                                    <Input id="publisher" name="publisher" value={formData.publisher} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="type" className={labelClass}>Type</label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BOOK">Book</SelectItem>
                                            <SelectItem value="MAGAZINE">Magazine</SelectItem>
                                            <SelectItem value="COMIC">Comic</SelectItem>
                                            <SelectItem value="JOURNAL">Journal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="categoryId" className={labelClass}>Category</label>
                                    <Select value={formData.categoryId || "none"} onValueChange={(val) => setFormData({ ...formData, categoryId: val === "none" ? "" : val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category">
                                                {formData.categoryId ? categories.find(c => c.id === formData.categoryId)?.name : "No Category"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Category</SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="classId" className={labelClass}>Class Relation</label>
                                    <Select value={formData.classId || "none"} onValueChange={(val) => setFormData({ ...formData, classId: val === "none" ? "" : val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class">
                                                {formData.classId ? classrooms.find(c => c.id === formData.classId)?.name : "No Class Relation"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Class Relation</SelectItem>
                                            {classrooms.map(cls => (
                                                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="price" className={labelClass}>Price</label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className={labelClass}>Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    rows={4}
                                    onChange={handleChange}
                                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-50"
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader className="" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Book
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
