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

export default function SuperAdminDocumentManagementPage() {
    const [activeTab, setActiveTab] = useState("templates");

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Global Templates & Documents | Super Admin | LearnXChain</title>
            </Head>

            <div className="space-y-6 pb-10 min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1 md:px-0">
                    <div className="min-w-0">
                        <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2 md:gap-3 tracking-tight">
                            <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-indigo-600 shrink-0" />
                            <span className="truncate">GLOBAL DOCUMENTS</span>
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Manage global and school-specific templates.</p>
                    </div>
                    <div className="flex items-center">
                        <Button
                            onClick={() => setActiveTab("generate")}
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 gap-2 w-40 md:w-48 h-11 md:h-12 rounded-xl md:rounded-2xl"
                        >
                            <Printer className="h-4 w-4" /> Print Shop
                        </Button>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 [ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
                        <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm mb-4 inline-flex w-auto min-w-full md:min-w-0 [ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
                            <TabsTrigger value="templates" className="rounded-xl gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm px-4 md:px-6 py-2 md:py-2.5 whitespace-nowrap">
                                <Layout className="h-4 w-4" /> Management
                            </TabsTrigger>
                            <TabsTrigger value="generate" className="rounded-xl gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm px-4 md:px-6 py-2 md:py-2.5 whitespace-nowrap">
                                <Printer className="h-4 w-4" /> Test Generation
                            </TabsTrigger>
                            <TabsTrigger value="history" className="rounded-xl gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm px-4 md:px-6 py-2 md:py-2.5 whitespace-nowrap">
                                <History className="h-4 w-4" /> Platform Logs
                            </TabsTrigger>
                            <TabsTrigger value="verify" className="rounded-xl gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm px-4 md:px-6 py-2 md:py-2.5 whitespace-nowrap">
                                <ShieldCheck className="h-4 w-4" /> Verification
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="templates" className="animate-in fade-in slide-in-from-bottom-2">
                        <TemplateManagement />
                    </TabsContent>

                    <TabsContent value="generate" className="animate-in fade-in slide-in-from-bottom-2">
                        <DocumentIssuer />
                    </TabsContent>

                    <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2">
                        <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm dark:border-white/10">
                            <CardContent className="pt-6">
                                <HistoryTable />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="verify" className="animate-in fade-in slide-in-from-bottom-2">
                        <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 md:p-16 text-center dark:border-white/10 rounded-[1.5rem] md:rounded-[2.5rem]">
                            <div className="max-w-md mx-auto space-y-4 md:space-y-6">
                                <div className="h-16 w-16 md:h-20 md:w-20 bg-green-100 dark:bg-green-900/30 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                                    <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight dark:text-white">QR Verification</h2>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Every document issued includes a unique QR code.
                                    Third parties can scan it to verify authenticity
                                    instantly without any login required.
                                </p>
                                <div className="pt-2 md:pt-4">
                                    <Button variant="outline" className="rounded-xl h-11 px-6 font-bold dark:border-white/10 dark:hover:bg-white/5 border-gray-100 text-xs uppercase tracking-wider">Security Whitepaper</Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
