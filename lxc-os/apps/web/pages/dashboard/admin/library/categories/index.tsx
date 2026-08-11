import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { Loader } from '@/components/ui/feedback/Loader';

export default function CategoryManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/library/categories');
            const data = await res.json();
            if (Array.isArray(data)) setCategories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch('/api/v1/library/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory)
            });
            if (res.ok) {
                setNewCategory({ name: '', description: '' });
                fetchCategories();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/v1/library/categories?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout role="admin">
            <div className="p-4 md:p-6 space-y-6">
                <Head>
                    <title>Category Management | LearnXChain</title>
                </Head>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Category Management</h1>
                        <p className="text-slate-500">Organize your library books by categories.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-1 border-none shadow-sm h-fit">
                        <CardHeader>
                            <CardTitle>{editingId ? "Edit Category" : "Add New Category"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category Name</label>
                                    <Input
                                        required
                                        placeholder="e.g. Science Fiction"
                                        value={newCategory.name}
                                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description (Optional)</label>
                                    <Input
                                        placeholder="Brief description"
                                        value={newCategory.description}
                                        onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-indigo-600" disabled={actionLoading}>
                                    {actionLoading ? <Loader size="sm" variant="white" /> : editingId ? "Update" : "Create"}
                                </Button>
                                {editingId && (
                                    <Button variant="ghost" className="w-full" onClick={() => setEditingId(null)}>Cancel</Button>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Current Categories</CardTitle>
                            <div className="relative w-48 mt-0">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-8 h-9"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-3">
                                    <Loader size="lg" variant="primary" />
                                    <p className="text-sm font-medium text-slate-400">Loading categories...</p>
                                </div>
                            ) : filteredCategories.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 border border-dashed rounded-lg">No categories found.</div>
                            ) : (
                                <div className="divide-y dark:divide-slate-800">
                                    {filteredCategories.map(cat => (
                                        <div key={cat.id} className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-md transition-colors">
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">{cat.name}</h3>
                                                <p className="text-xs text-slate-500">{cat.description || "No description"}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => {
                                                    setEditingId(cat.id);
                                                    setNewCategory({ name: cat.name, description: cat.description || '' });
                                                }}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(cat.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
