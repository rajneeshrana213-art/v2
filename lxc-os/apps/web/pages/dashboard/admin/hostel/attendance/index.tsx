import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    CalendarCheck, Clock, UserX, UserCheck,
    Search, Filter, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getISTDateString } from "@/lib/utils/date-utils";

export default function HostelAttendancePage() {
    const [date, setDate] = useState(getISTDateString());
    const [students, setStudents] = useState([
        { id: 1, name: "Rahul Kumar", room: "101-A", status: "PRESENT", time: "21:30" },
        { id: 2, name: "Amit Singh", room: "102-B", status: "ABSENT", time: "-" },
        { id: 3, name: "Sneha Gupta", room: "205-A", status: "LATE", time: "22:15" },
    ]);

    const stats = {
        present: 120,
        absent: 5,
        late: 3,
        leave: 2
    };

    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hostel Attendance</h1>
                        <p className="text-gray-500">Track daily student presence</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                        <Button variant="ghost" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
                        <span className="font-medium px-2">{date}</span>
                        <Button variant="ghost" size="icon"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center">
                            <UserCheck className="w-6 h-6 text-green-500 mb-2" />
                            <span className="text-2xl font-bold">{stats.present}</span>
                            <span className="text-xs text-gray-500">Present</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center">
                            <UserX className="w-6 h-6 text-red-500 mb-2" />
                            <span className="text-2xl font-bold">{stats.absent}</span>
                            <span className="text-xs text-gray-500">Absent</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center">
                            <Clock className="w-6 h-6 text-orange-500 mb-2" />
                            <span className="text-2xl font-bold">{stats.late}</span>
                            <span className="text-xs text-gray-500">Late</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center">
                            <CalendarCheck className="w-6 h-6 text-blue-500 mb-2" />
                            <span className="text-2xl font-bold">{stats.leave}</span>
                            <span className="text-xs text-gray-500">On Leave</span>
                        </CardContent>
                    </Card>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-100 flex gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input placeholder="Search student..." className="pl-9" />
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">Mark Attendance</Button>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {students.map((student) => (
                            <div key={student.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarFallback>{student.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-gray-900">{student.name}</p>
                                        <p className="text-xs text-gray-500">Room: {student.room}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-sm text-right">
                                        <p className="text-gray-900 font-medium">In Time</p>
                                        <p className="text-gray-500">{student.time}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium w-20 text-center
                                ${student.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                            student.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                                                'bg-orange-100 text-orange-700'}`}>
                                        {student.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
