
import { useState, useEffect } from "react";
import client from "@/lib/api/client";
import { ChevronDown, User } from "lucide-react";

interface Child {
    id: string;
    name: string;
    className: string;
    profilePic: string | null;
}

interface ChildSelectorProps {
    onSelect: (childId: string) => void;
    selectedId: string | null;
}

export default function ChildSelector({ onSelect, selectedId }: ChildSelectorProps) {
    const [children, setChildren] = useState<Child[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await client.get("/v1/dashboard/parent/children");
                setChildren(res.data);
                if (res.data.length > 0 && !selectedId) {
                    onSelect(res.data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch children", err);
            }
        };
        fetchChildren();
    }, []);

    const selectedChild = children.find(c => c.id === selectedId);

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-amber-500 dark:border-white/5 dark:bg-gray-900"
            >
                <div className="h-8 w-8 overflow-hidden rounded-xl bg-amber-50 flex items-center justify-center dark:bg-amber-950/30">
                    {selectedChild?.profilePic ? (
                        <img src={selectedChild.profilePic} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-4 w-4 text-amber-600" />
                    )}
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Viewing Child</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                        {selectedChild?.name || "Select Child"}
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </p>
                </div>
            </button>

            {isOpen && (
                <div className="absolute left-0 z-50 mt-2 w-64 rounded-3xl border border-gray-100 bg-white p-2 shadow-xl dark:border-white/5 dark:bg-gray-950 animate-in fade-in zoom-in duration-200">
                    <div className="p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Switch Control Center</p>
                    </div>
                    <div className="space-y-1">
                        {children.map((child) => (
                            <button
                                key={child.id}
                                onClick={() => {
                                    onSelect(child.id);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition-colors ${selectedId === child.id
                                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                                    }`}
                            >
                                <div className="h-10 w-10 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    {child.profilePic ? (
                                        <img src={child.profilePic} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{child.name}</p>
                                    <p className="text-[10px] font-medium text-gray-500 uppercase">{child.className}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
