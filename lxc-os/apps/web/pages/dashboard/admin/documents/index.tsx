import React, { useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
    Layout,
    FileText,
    History,
    Settings,
    Printer,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sub-components
import TemplateManagement from "@/components/dashboard/admin/documents/TemplateManagement";
import DocumentIssuer from "@/components/dashboard/admin/documents/DocumentIssuer";
import HistoryTable from "@/components/dashboard/admin/documents/HistoryTable";

export default function DocumentManagementPage() {
    const [activeTab, setActiveTab] = useState("generate");

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Smart Documents & Certificates | LearnXChain</title>
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                            <ShieldCheck className="h-10 w-10 text-indigo-600" />
                            SMART DOCUMENTS
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Generate, manage, and verify official school documents with one click.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setActiveTab("generate")}
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 gap-2"
                        >
                            <Printer className="h-4 w-4" /> Print Shop
                        </Button>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-gray-100/50 dark:bg-white/5 p-1 rounded-2xl border border-gray-200/50 dark:border-white/10 backdrop-blur-sm mb-6">
                        <TabsTrigger 
                            value="generate" 
                            className="rounded-xl gap-2 font-bold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-sm px-6 py-2.5 transition-all"
                        >
                            <Printer className="h-4 w-4" /> Generate
                        </TabsTrigger>
                        <TabsTrigger 
                            value="templates" 
                            className="rounded-xl gap-2 font-bold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-sm px-6 py-2.5 transition-all"
                        >
                            <Layout className="h-4 w-4" /> Templates
                        </TabsTrigger>
                        <TabsTrigger 
                            value="history" 
                            className="rounded-xl gap-2 font-bold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-sm px-6 py-2.5 transition-all"
                        >
                            <History className="h-4 w-4" /> Issuance Logs
                        </TabsTrigger>
                        <TabsTrigger 
                            value="verify" 
                            className="rounded-xl gap-2 font-bold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-sm px-6 py-2.5 transition-all"
                        >
                            <ShieldCheck className="h-4 w-4" /> Verification
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="animate-in fade-in slide-in-from-bottom-2">
                        <DocumentIssuer />
                    </TabsContent>

                    <TabsContent value="templates" className="animate-in fade-in slide-in-from-bottom-2">
                        <TemplateManagement />
                    </TabsContent>

                    <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2">
                        <Card className="border-none shadow-sm bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                            <CardContent className="pt-6">
                                <HistoryTable />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="verify" className="animate-in fade-in slide-in-from-bottom-2">
                        <Card className="border-none shadow-sm bg-white/50 dark:bg-white/5 backdrop-blur-sm p-12 text-center">
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="h-20 w-20 bg-green-100 dark:bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto">
                                    <ShieldCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">QR Verification System</h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Every document issued via LearnXChain includes a unique QR code.
                                    External parties can scan this code to verify authenticity
                                    instantly without any login.
                                </p>
                                <div className="pt-4">
                                    <Button variant="outline" className="rounded-xl">Learn More About Security</Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
