
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useAuth } from "@/lib/context/AuthContext";
import { useState } from "react";
import { MessageSquare, Video, Users, UserPlus } from "lucide-react";

const ChatPanel = dynamic(() => import("@/components/dashboard/shared/communication/ChatPanel"), { ssr: false });
const MeetingPanel = dynamic(() => import("@/components/dashboard/shared/communication/MeetingPanel"), { ssr: false });
const FriendRequests = dynamic(() => import("@/components/dashboard/shared/communication/FriendRequests"), { ssr: false });

type Tab = "chat" | "meetings" | "friends";

export default function StudentCommunicationPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("chat");

    if (!user) return null;

    const tabs: { key: Tab; label: string; icon: React.ComponentType<any> }[] = [
        { key: "chat", label: "Chat", icon: MessageSquare },
        { key: "meetings", label: "Meetings", icon: Video },
        { key: "friends", label: "Friends", icon: UserPlus },
    ];

    return (
        <>
            <Head>
                <title>Communication · Student · LearnXChain</title>
            </Head>
            <DashboardLayout role="student">
                <div className="space-y-6 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communication</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Chat with classmates & teachers, join meetings, manage friends</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium">
                            <Users className="w-4 h-4" />
                            Student
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                        {tabs.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === key
                                        ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
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
                            channelFilter={{ type: { $in: ["messaging", "team"] } }}
                            canCreateGroup
                        />
                    )}

                    {activeTab === "meetings" && (
                        <MeetingPanel
                            userId={user.id}
                            canSchedule={false}
                            canInstant={false}
                        />
                    )}

                    {activeTab === "friends" && (
                        <FriendRequests />
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
