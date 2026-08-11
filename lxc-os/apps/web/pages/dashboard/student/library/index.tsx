import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Book, Info } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'react-toastify';
import { Loader } from '@/components/ui/feedback/Loader';

export default function StudentLibraryCatalog() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [reserving, setReserving] = useState<string | null>(null);
    const [libraryId, setLibraryId] = useState<string | null>(null);
    const [member, setMember] = useState<any>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchLibraryData = async () => {
            if (!user?.id) return;
            try {
                const libRes = await fetch('/api/v1/library/get-my-library');
                const libData = await libRes.json();

                if (libData.id) {
                    setLibraryId(libData.id);

                    // Fetch Member Profile
                    const memRes = await fetch(`/api/v1/library/members?userId=${user.id}`);
                    const memData = await memRes.json();
                    setMember(memData);

                    const booksRes = await fetch(`/api/v1/library/books?libraryId=${libData.id}`);
                    const booksData = await booksRes.json();
                    if (Array.isArray(booksData)) setBooks(booksData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLibraryData();
    }, [user?.id]);

    const handleReserve = async (bookId: string) => {
        if (!member?.id) {
            toast.error("You are not a registered library member. Please contact the librarian.");
            return;
        }
        setReserving(bookId);
        try {
            const res = await fetch('/api/v1/library/circulation/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId: member.id, bookId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to place reservation');
            toast.success("Book reserved successfully! You will be notified when it's ready.");
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setReserving(null);
        }
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout role="student">
            <div className="p-4 md:p-6 space-y-6">
                <Head>
                    <title>Library Catalog | LearnXChain</title>
                </Head>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Library Catalog</h1>
                        <p className="text-slate-500 dark:text-slate-400">Browse and reserve books.</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search title, author..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading catalog...</div>
                ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No books found matching criteria.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredBooks.map((book) => {
                            const availableCopies = book.copies?.filter((c: any) => c.status === 'AVAILABLE').length || 0;
                            const isAvailable = availableCopies > 0;

                            return (
                                <Card key={book.id} className="flex flex-col h-full border-none shadow-sm hover:shadow-md transition-all">
                                    <div className="h-40 bg-slate-200 dark:bg-slate-800 flex items-center justify-center rounded-t-lg">
                                        {book.coverImage ? (
                                            <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover rounded-t-lg" />
                                        ) : (
                                            <Book className="h-12 w-12 text-slate-400" />
                                        )}
                                    </div>
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="line-clamp-2 text-lg leading-tight">{book.title}</CardTitle>
                                            <Badge variant="outline" className="shrink-0 text-[10px]">
                                                {book.type}
                                            </Badge>
                                        </div>
                                        <CardDescription className="line-clamp-1">{book.author}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="text-sm text-slate-500 space-y-2">
                                            <p>Publisher: {book.publisher || 'N/A'}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge className={isAvailable ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300'}>
                                                    {availableCopies} Available
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            disabled={!isAvailable || reserving === book.id}
                                            onClick={() => handleReserve(book.id)}
                                        >
                                            {reserving === book.id && <Loader size="sm" variant="white" />}
                                            {isAvailable ? "Reserve Now" : "Unavailable"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
