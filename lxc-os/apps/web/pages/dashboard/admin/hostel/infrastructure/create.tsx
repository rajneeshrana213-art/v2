import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";

export default function CreateHostelPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "BOYS",
        capacity: "",
        address: "",
        rules: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/v1/hostel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    capacity: Number(formData.capacity),
                    schoolId: "school_id_placeholder" // TODO: Get from context
                })
            });

            if (!res.ok) throw new Error("Failed to create hostel");

            toast.success("Hostel created successfully!");
            router.push("/dashboard/admin/hostel/infrastructure");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="max-w-2xl mx-auto p-6">
                <Link href="/dashboard/admin/hostel/infrastructure" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-100 h-10 px-4 py-2 mb-6 pl-0 text-gray-600">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Infrastructure
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Hostel</h1>
                        <p className="text-gray-500 mt-1">Set up a new hostel building in the system.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Hostel Name</Label>
                            <Input
                                required
                                placeholder="e.g. Boys Hostel A"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Hostel Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BOYS">Boys Hostel</SelectItem>
                                        <SelectItem value="GIRLS">Girls Hostel</SelectItem>
                                        <SelectItem value="COED">Co-Ed Hostel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Total Capacity (Approx)</Label>
                                <Input
                                    type="number"
                                    required
                                    placeholder="e.g. 500"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Location / Address</Label>
                            <Input
                                placeholder="e.g. North Campus, Near Main Gate"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Rules & Policies (Optional)</Label>
                            <textarea
                                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Enter basic rules for this hostel..."
                                value={formData.rules}
                                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? <Loader size="sm" variant="white" /> : "Create Hostel"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
