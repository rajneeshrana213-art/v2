
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useAuth } from "@/lib/context/AuthContext";
import { useState } from "react";
import { MessageSquare, Video } from "lucide-react";

const ChatPanel = dynamic(() => import("@/components/dashboard/shared/communication/ChatPanel"), { ssr: false });
const MeetingPanel = dynamic(() => import("@/components/dashboard/shared/communication/MeetingPanel"), { ssr: false });

type Tab = "chat" | "meetings";

export default function ParentCommunicationPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("chat");

    if (!user) return null;

    const tabs: { key: Tab; label: string; icon: React.ComponentType<any> }[] = [
        { key: "chat", label: "Chat with Teachers", icon: MessageSquare },
        { key: "meetings", label: "Meetings", icon: Video },
    ];

    return (
        <>
            <Head>
                <title>Communication · Parent · LearnXChain</title>
            </Head>
            <DashboardLayout role="parent">
                <div className="space-y-6 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communication</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Chat with teachers and join scheduled meetings</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                        {tabs.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === key
                                        ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {activeTab === "chat" && (
                        <ChatPanel
                            userId={user.id}
                            userName={user.name}
                            userImage={user.profilePic}
                            role={user.role}
                            schoolId={user.schoolId}
                            channelFilter={{ type: "messaging" }}
                            canCreateGroup={false}
                        />
                    )}

                    {activeTab === "meetings" && (
                        <MeetingPanel
                            userId={user.id}
                            canSchedule={false}
                            canInstant={false}
                        />
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
