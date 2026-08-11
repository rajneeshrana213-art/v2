import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";

export default function CreateAllocationPage() {
    const [step, setStep] = useState(1); // 1: Select Student, 2: Select Bed, 3: Confirm
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedHostel, setSelectedHostel] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedBed, setSelectedBed] = useState("");

    const handleSubmit = async () => {
        // API call to create allocation
        toast.success("Allocation created!");
    }

    return (
        <DashboardLayout role="admin">
            <div className="max-w-3xl mx-auto p-6">
                <Link href="/dashboard/admin/hostel/allocations" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-100 h-10 px-4 py-2 mb-6 pl-0 text-gray-600">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Allocations
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h1 className="text-xl font-bold text-gray-900">New Hostel Allocation</h1>
                        <p className="text-sm text-gray-500">Assign a room and bed to a student</p>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 mt-4 text-sm">
                            <span className={`px-2 py-1 rounded ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1. Student</span>
                            <span className="text-gray-300">/</span>
                            <span className={`px-2 py-1 rounded ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2. Room & Bed</span>
                            <span className="text-gray-300">/</span>
                            <span className={`px-2 py-1 rounded ${step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3. Confirm</span>
                        </div>
                    </div>

                    <div className="p-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Search Student</Label>
                                    <Input placeholder="Enter admission no or name..." />
                                </div>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <p className="text-sm text-gray-500 text-center">Search for a student to proceed</p>
                                    {/* Mock Result */}
                                    <div className="flex items-center justify-between bg-white p-3 rounded border mt-3 cursor-pointer ring-2 ring-blue-500" onClick={() => setSelectedStudent("123")}>
                                        <div>
                                            <p className="font-medium">Rahul Kumar</p>
                                            <p className="text-xs text-gray-500">Class X-A | Adm: 2024001</p>
                                        </div>
                                        <Button size="sm" variant="secondary">Selected</Button>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={() => setStep(2)} disabled={!selectedStudent}>Next: Select Room</Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Hostel</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Select Hostel" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="h1">Boys Hostel A</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Room Type</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="STANDARD">Standard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Available Beds</Label>
                                    <div className="grid grid-cols-4 gap-3">
                                        <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 hover:border-blue-500 hover:bg-blue-50" onClick={() => { setSelectedBed("b1"); setSelectedRoom("101") }}>
                                            <span className="font-bold">101-A</span>
                                            <span className="text-[10px] text-green-600">Available</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                    <Button onClick={() => setStep(3)} disabled={!selectedBed}>Next: Confirm</Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                                    <UserPlus className="w-8 h-8" />
                                </div>
                                <h2 className="text-xl font-bold">Confirm Allocation</h2>
                                <p className="text-gray-500">Review the details before finalizing.</p>

                                <div className="bg-gray-50 rounded-lg p-6 text-left space-y-3 max-w-sm mx-auto">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Student:</span>
                                        <span className="font-medium">Rahul Kumar</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Hostel:</span>
                                        <span className="font-medium">Boys Hostel A</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Room/Bed:</span>
                                        <span className="font-medium">101 - A</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Monthly Rent:</span>
                                        <span className="font-medium">₹2000</span>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">Confirm Allocation</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
