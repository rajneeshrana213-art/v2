import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { Loader } from '@/components/ui/feedback/Loader';

export default function AddBookPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
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
        quantity: 1,
        price: 0,
        classId: ''
    });

    React.useEffect(() => {
        fetch('/api/v1/library/get-my-library')
            .then(async res => {
                const data = await res.json();
                if (res.ok && data.id) {
                    setLibrary(data);

                    // Fetch categories
                    fetch('/api/v1/library/categories')
                        .then(r => r.json())
                        .then(cats => setCategories(Array.isArray(cats) ? cats : []));

                    // Fetch classes
                    fetch(`/api/v1/library/classes?libraryId=${data.id}`)
                        .then(r => r.json())
                        .then(cls => setClassrooms(Array.isArray(cls) ? cls : []));
                } else {
                    console.error("Failed to fetch library:", data);
                }
            })
            .catch(err => {
                console.error("Error fetching library:", err);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!library?.id) {
            alert("Library not initialized. Please try again later.");
            return;
        }
        setIsLoading(true);

        try {
            const res = await fetch(`/api/v1/library/books?libraryId=${library.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    libraryId: library.id
                })
            });

            if (!res.ok) throw new Error('Failed to create book');
            toast.success("Book added successfully");
            router.push('/dashboard/admin/library/books');
        } catch (error) {
            console.error(error);
            toast.error("Error adding book");
        } finally {
            setIsLoading(false);
        }
    };

    const labelClass = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300";

    return (
        <DashboardLayout role="admin">
            <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
                <Head>
                    <title>Add New Book | LearnXChain</title>
                </Head>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Book</h1>
                        <p className="text-slate-500 dark:text-slate-400">Enter book details to add to inventory.</p>
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
                                    <Input id="title" name="title" required placeholder="e.g. Clean Code" onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="author" className={labelClass}>Author *</label>
                                    <Input id="author" name="author" required placeholder="e.g. Robert C. Martin" onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="isbn" className={labelClass}>ISBN</label>
                                    <Input id="isbn" name="isbn" placeholder="e.g. 978-0132350884" onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="publisher" className={labelClass}>Publisher</label>
                                    <Input id="publisher" name="publisher" placeholder="e.g. Prentice Hall" onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="type" className={labelClass}>Type</label>
                                    <Select onValueChange={(val) => setFormData({ ...formData, type: val })} defaultValue="BOOK">
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
                                    <Select value={formData.categoryId} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category">
                                                {categories.find(c => c.id === formData.categoryId)?.name}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="classId" className={labelClass}>Class Relation</label>
                                    <Select value={formData.classId} onValueChange={(val) => setFormData({ ...formData, classId: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class">
                                                {classrooms.find(c => c.id === formData.classId)?.name}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classrooms.map(cls => (
                                                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="price" className={labelClass}>Price (if any)</label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        placeholder="0.00"
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="quantity" className={labelClass}>Number of Copies *</label>
                                    <Input
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className={labelClass}>Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Book summary..."
                                    rows={4}
                                    onChange={handleChange}
                                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-50"
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader size="sm" variant="white" />
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Book
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
