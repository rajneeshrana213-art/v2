import React, { useEffect, useState } from "react";
import { School, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import client from "@/lib/api/client";
import { useRouter } from "next/router";

interface Branch {
    id: string;
    schoolName: string;
    schoolLogo?: string;
}

export default function BranchSwitcher() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await client.get("/v1/group-admin/branches");
                setBranches(response.data);

                // Check if there's a branch in URL or storage
                const urlBranchId = router.query.branchId as string;
                if (urlBranchId) {
                    setSelectedBranchId(urlBranchId);
                } else if (response.data.length > 0) {
                    setSelectedBranchId(response.data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch branches:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBranches();
    }, [router.query.branchId]);

    const handleBranchSelect = (branchId: string) => {
        setSelectedBranchId(branchId);
        // Update URL or context
        const currentPath = router.pathname;
        const query = { ...router.query, branchId };
        router.push({ pathname: currentPath, query }, undefined, { shallow: true });
    };

    if (loading) return <div className="h-10 w-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />;

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {branches.map((branch) => (
                <button
                    key={branch.id}
                    onClick={() => handleBranchSelect(branch.id)}
                    className={cn(
                        "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all shadow-sm border",
                        selectedBranchId === branch.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-white/10 dark:hover:bg-white/5"
                    )}
                >
                    {branch.schoolLogo ? (
                        <img src={branch.schoolLogo} alt="" className="h-4 w-4 rounded-full object-cover" />
                    ) : (
                        <School className="h-4 w-4" />
                    )}
                    <span>{branch.schoolName}</span>
                    {selectedBranchId === branch.id && <Check className="h-3 w-3 ml-1" />}
                </button>
            ))}
        </div>
    );
}
