import React from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/forms/input";
import { Switch } from "@/components/ui/switch";
// import { Switch } from "@/components/ui/switch";


export default function HostelSettingsPage() {
    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Hostel Settings</h1>
                    <Button>Save Changes</Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>General Configuration</CardTitle>
                        <CardDescription>Manage global settings for all hostels</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Automatic Fee Generation</Label>
                                <p className="text-sm text-gray-500">Generate monthly invoices on 1st of every month</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Allow Online Gate Pass</Label>
                                <p className="text-sm text-gray-500">Students can request gate pass via app</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Label>Default Visitor Hours</Label>
                            <div className="flex gap-4">
                                <Input type="time" defaultValue="09:00" className="w-32" />
                                <span className="self-center">to</span>
                                <Input type="time" defaultValue="18:00" className="w-32" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
