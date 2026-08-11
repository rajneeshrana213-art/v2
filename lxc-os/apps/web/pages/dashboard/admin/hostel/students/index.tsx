import React, { useState } from "react";
import { encodeId } from "@/lib/utils/hashId";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Search, Filter, MoreVertical, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function HostelStudentsPage() {
    const [students, setStudents] = useState([
        { id: 1, name: "Rahul Kumar", class: "X-A", room: "101-A", hostel: "Boys Hostel A", contact: "+91 9876543210", parent: "Rajesh Kumar", status: "Active" },
        { id: 2, name: "Amit Singh", class: "XI-B", room: "102-B", hostel: "Boys Hostel A", contact: "+91 9876543211", parent: "Suresh Singh", status: "Active" },
    ]);

    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hostel Students</h1>
                        <p className="text-gray-500">Directory of all boarding students</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline"><Mail className="w-4 h-4 mr-2" /> Message All</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student) => (
                        <Card key={student.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">{student.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{student.name}</h3>
                                            <p className="text-xs text-gray-500">{student.class}</p>
                                        </div>
                                    </div>
                                    <Badge variant="soft" className="bg-green-100 text-green-700 hover:bg-green-100">{student.status}</Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                        <span>{student.hostel}, Room {student.room}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        <span>{student.contact}</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-2">
                                    <Link href={`/dashboard/admin/students/${encodeId(String(student.id))}`} className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 h-9 px-3">
                                        View Profile
                                    </Link>
                                    <Button variant="outline" size="icon" className="h-9 w-9 text-gray-400">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
