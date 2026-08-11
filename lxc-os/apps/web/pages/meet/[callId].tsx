
import { useRouter } from "next/router";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { ArrowLeft, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";

const VideoCall = dynamic(() => import("@/components/dashboard/shared/communication/VideoCall"), { ssr: false });

export default function MeetPage() {
    const router = useRouter();
    const { callId } = router.query;
    const { user, loading: authLoading } = useAuth();
    const [meetingTitle, setMeetingTitle] = useState<string>("LXC Meeting");

    useEffect(() => {
        if (!callId || typeof callId !== "string") return;
        // Try to fetch meeting info (non-critical)
        client
            .get(`/v1/communication/meetings/list`)
            .then(({ data }) => {
                const match = data.meetings?.find((m: any) => m.joinToken === callId);
                if (match) setMeetingTitle(match.title);
            })
            .catch(() => { });
    }, [callId]);

    const { theme } = useTheme();
    const isDark = theme === "dark";
    const pageBg = isDark ? "bg-gray-950" : "bg-gray-50";
    const headerBg = isDark ? "border-gray-800" : "border-gray-200";
    const backHover = isDark ? "hover:bg-gray-800 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900";
    const titleText = isDark ? "text-white" : "text-gray-900";
    const subText = isDark ? "text-gray-300" : "text-gray-600";
    const mutedText = isDark ? "text-gray-500" : "text-gray-400";
    const nameText = isDark ? "text-gray-400" : "text-gray-500";

    if (authLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
                <div className={`text-center space-y-4 ${titleText}`}>
                    <Video className={`w-16 h-16 mx-auto ${mutedText}`} />
                    <p className="text-xl font-semibold">Please sign in to join the meeting</p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (!callId || typeof callId !== "string") {
        return (
            <div className={`min-h-screen flex items-center justify-center ${pageBg} ${titleText}`}>
                <p>Invalid meeting link.</p>
            </div>
        );
    }

    const handleLeave = () => {
        // Navigate to the user's dashboard communication page
        const rolePaths: Record<string, string> = {
            admin: "/dashboard/admin/communication",
            teacher: "/dashboard/teacher/communication",
            student: "/dashboard/student/communication",
            parent: "/dashboard/parent/communication",
        };
        router.push(rolePaths[user.role] ?? "/dashboard/admin");
    };

    return (
        <>
            <Head>
                <title>{meetingTitle} · LXC Meet</title>
            </Head>
            <div className={`min-h-screen ${pageBg} flex flex-col`}>
                {/* Top bar */}
                <header className={`flex items-center justify-between px-6 py-3 border-b ${headerBg} ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/dashboard/${user.role}`}
                            className={`p-2 rounded-lg transition ${backHover}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-blue-400" />
                            <span className={`font-semibold ${titleText}`}>LXC Meet</span>
                            <span className={mutedText}>·</span>
                            <span className={`text-sm ${subText}`}>{meetingTitle}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${nameText}`}>{user.name}</span>
                    </div>
                </header>

                {/* Video area */}
                <main className="flex-1 p-4">
                    <div className="h-full min-h-[calc(100vh-80px)]">
                        <VideoCall
                            callId={callId}
                            userId={user.id}
                            userName={user.name}
                            userImage={user.profilePic}
                            onLeave={handleLeave}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}
