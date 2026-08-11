import { useState, useEffect, useCallback } from "react";
import client from "@/lib/api/client";
import { Search, User, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import Loader from '@/components/ui/feedback/Loader';

interface Student {
    id: string;
    user: {
        name: string;
        email?: string;
        phone?: string;
    };
    admissionNo: string;
    class?: {
        name: string;
    };
}

interface StudentSearchPickerProps {
    onSelect: (student: Student | null) => void;
    placeholder?: string;
    className?: string;
    selectedStudentId?: string;
}

export default function StudentSearchPicker({
    onSelect,
    placeholder = "Search student by name, admission no, email or phone...",
    className = "",
    selectedStudentId,
}: StudentSearchPickerProps) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const fetchStudents = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);
            const res = await client.get("/v1/dashboard/admin/students", {
                params: { search: query, limit: 10 },
            });
            setResults(res.data.data || []);
        } catch (err) {
            console.error("Student search error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search) fetchStudents(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchStudents]);

    const handleSelect = (student: Student) => {
        setSelectedStudent(student);
        setSearch("");
        setResults([]);
        setIsOpen(false);
        onSelect(student);
    };

    const clearSelection = () => {
        setSelectedStudent(null);
        onSelect(null);
    };

    if (selectedStudent) {
        return (
            <div className={`flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50/50 p-2 dark:border-indigo-500/30 dark:bg-indigo-500/5 ${className}`}>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {selectedStudent.user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedStudent.class?.name || "No Class"} • {selectedStudent.admissionNo}
                        </p>
                    </div>
                </div>
                <button
                    onClick={clearSelection}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="pl-9"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader className="" />
                    </div>
                )}
            </div>

            {isOpen && (results.length > 0 || (search.length >= 2 && !loading)) && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
                    {results.length > 0 ? (
                        <ul className="max-h-60 overflow-auto py-1">
                            {results.map((student) => (
                                <li
                                    key={student.id}
                                    onClick={() => handleSelect(student)}
                                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {student.user.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                            ID: {student.admissionNo} • {student.class?.name || "No Class"}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No students found</div>
                    )}
                </div>
            )}
        </div>
    );
}
