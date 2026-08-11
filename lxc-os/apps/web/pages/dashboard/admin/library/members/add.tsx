import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/forms/input";
import { ArrowLeft, Save, CheckSquare, Square, Search, Users, Filter, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader } from '@/components/ui/feedback/Loader';

export default function AddMemberPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Selection state
    const [memberType, setMemberType] = useState('STUDENT');
    const [schoolId] = useState('default-school-id');

    // Data state
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);

    // Local Filter
    const [searchQuery, setSearchQuery] = useState('');

    // Selection set
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

    // Fetch Classes and Library Data
    useEffect(() => {
        const init = async () => {
            try {
                const libRes = await fetch('/api/v1/library/get-my-library');
                const libData = await libRes.json();

                if (libData.id) {
                    const classesRes = await fetch(`/api/v1/library/classes?libraryId=${libData.id}`);
                    const classesData = await classesRes.json();
                    if (Array.isArray(classesData)) setClasses(classesData);
                }
            } catch (err) {
                console.error("Initialization failed:", err);
            }
        };

        if (memberType === 'STUDENT') {
            init();
        } else {
            setClasses([]);
            setSelectedClassId('');
        }
        setAvailableUsers([]);
        setSelectedUserIds(new Set());
    }, [memberType]);

    // Fetch Users
    useEffect(() => {
        if (memberType === 'STUDENT' && !selectedClassId) {
            setAvailableUsers([]);
            return;
        }

        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const libRes = await fetch('/api/v1/library/get-my-library');
                const libData = await libRes.json();

                const typeParam = memberType === 'STUDENT' ? 'students' : 'teachers';
                const classParam = selectedClassId ? `&classId=${selectedClassId}` : '';

                const usersRes = await fetch(`/api/v1/library/members/options?type=${typeParam}&schoolId=${libData.schoolId}${classParam}`);
                const usersData = await usersRes.json();
                if (Array.isArray(usersData)) setAvailableUsers(usersData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [memberType, selectedClassId]);

    const toggleUser = (userId: string) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(userId)) newSet.delete(userId);
        else newSet.add(userId);
        setSelectedUserIds(newSet);
    };

    const toggleAll = () => {
        if (selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0) {
            setSelectedUserIds(new Set());
        } else {
            const newSet = new Set(selectedUserIds);
            filteredUsers.forEach(u => newSet.add(u.userId));
            setSelectedUserIds(newSet);
        }
    };

    const handleSubmit = async () => {
        if (selectedUserIds.size === 0) return;
        setIsLoading(true);

        try {
            const promises = Array.from(selectedUserIds).map(userId =>
                fetch('/api/v1/library/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, type: memberType })
                }).then(res => res.json())
            );

            await Promise.all(promises);
            // alert(`Successfully added ${selectedUserIds.size} members.`);
            router.push('/dashboard/admin/library/members');
        } catch (error: any) {
            console.error(error);
            alert("Some registrations may have failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = availableUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAllSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.has(u.userId));

    return (
        <DashboardLayout role="admin">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-6 space-y-6">
                <Head>
                    <title>Register Member | LearnXChain</title>
                </Head>

                {/* Header */}
                <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Register Members
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Import students or teachers into the library system.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12 max-w-6xl mx-auto w-full items-start">
                    {/* Left Column: Filters */}
                    <Card className="lg:col-span-4 border-none shadow-md lg:sticky lg:top-6 !overflow-visible">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Filter className="h-4 w-4 text-indigo-500" />
                                Source Filters
                            </CardTitle>
                            <CardDescription>
                                Select the group of users you want to add.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Member Type</Label>
                                <Select
                                    onValueChange={setMemberType}
                                    defaultValue="STUDENT"
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue>
                                            {memberType === 'STUDENT' ? 'Student' : 'Teacher'}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STUDENT">Student</SelectItem>
                                        <SelectItem value="TEACHER">Teacher</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {memberType === 'STUDENT' && (
                                <div className="space-y-3">
                                    <Label>Filter by Class</Label>
                                    <Select
                                        onValueChange={setSelectedClassId}
                                        value={selectedClassId}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select class...">
                                                {classes.find((c: any) => c.id === selectedClassId)?.name}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls: any) => (
                                                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500">
                                        Selecting a class will fetch all students in that section.
                                    </p>
                                </div>
                            )}

                            {memberType === 'TEACHER' && (
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm text-indigo-700 dark:text-indigo-300">
                                    Fetching all active faculty members from the school directory.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: List & Selection */}
                    <Card className="lg:col-span-8 border-none shadow-md flex flex-col h-[600px] lg:h-[calc(100vh-200px)] min-h-[500px]">
                        <CardHeader className="border-b pb-4 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Select Users</CardTitle>
                                    <CardDescription>
                                        {availableUsers.length > 0
                                            ? `Showing ${filteredUsers.length} of ${availableUsers.length} users`
                                            : "No users loaded"}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="px-3 py-1">
                                        {selectedUserIds.size} Selected
                                    </Badge>
                                </div>
                            </div>

                            {/* Search and Tool Bar */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by name, email or roll no..."
                                        className="pl-9 bg-slate-50 dark:bg-slate-900 border-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        disabled={availableUsers.length === 0}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={toggleAll}
                                    disabled={availableUsers.length === 0}
                                    className={isAllSelected ? "bg-indigo-50 border-indigo-200 text-indigo-700" : ""}
                                >
                                    {isAllSelected ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {filteredUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                                        <Users className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <div className="max-w-xs">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {isLoading ? "Fetching users..." : "No users found"}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {isLoading
                                                ? "Please wait while we retrieving the user list."
                                                : memberType === 'STUDENT' && !selectedClassId
                                                    ? "Start by selecting a class from the filters on the left."
                                                    : "Try adjusting your search terms or filters."}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredUsers.map((user) => {
                                        const isSelected = selectedUserIds.has(user.userId);
                                        return (
                                            <div
                                                key={user.userId}
                                                className={`group flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                                                    ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 shadow-sm"
                                                    : "bg-white dark:bg-slate-950 border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:shadow-sm"
                                                    }`}
                                                onClick={() => toggleUser(user.userId)}
                                            >
                                                <div className={`shrink-0 transition-colors ${isSelected ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-400"}`}>
                                                    {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                                </div>

                                                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-900">
                                                    <AvatarFallback className={`${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {user.name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-white'}`}>
                                                            {user.name}
                                                        </p>
                                                        {user.rollNo && (
                                                            <Badge variant="outline" className="text-[10px] ml-2 shrink-0">
                                                                Roll: {user.rollNo}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="border-t p-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <p className="text-sm text-slate-500">
                                {selectedUserIds.size > 0
                                    ? <span>Selected <strong>{selectedUserIds.size}</strong> members</span>
                                    : "No members selected"}
                            </p>
                            <Button
                                onClick={handleSubmit}
                                disabled={selectedUserIds.size === 0 || isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px] shadow-lg shadow-indigo-500/20"
                            >
                                {isLoading ? (
                                    <Loader size="sm" variant="white" />
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Add Members
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
