
import React, { useEffect, useState } from "react";
import {
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    CallControls,
    SpeakerLayout,
    useCallStateHooks,
    CallingState,
    StreamTheme,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Video, VideoOff, PhoneOff, Users, X } from "lucide-react";
import client from "@/lib/api/client";
import { useTheme } from "@/hooks/useTheme";

interface VideoCallProps {
    callId: string;
    userId: string;
    userName: string;
    userImage?: string;
    onLeave?: () => void;
}

function CallUI({ onLeave, isDark }: { onLeave?: () => void; isDark: boolean }) {
    const { useCallCallingState, useParticipantCount, useParticipants } = useCallStateHooks();
    const callingState = useCallCallingState();
    const participantCount = useParticipantCount();
    const participants = useParticipants();
    const [showParticipants, setShowParticipants] = useState(false);

    const bg = isDark ? "bg-gray-900" : "bg-gray-100";
    const header = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const headerText = isDark ? "text-white" : "text-gray-900";
    const subText = isDark ? "text-gray-300" : "text-gray-600";
    // Participants panel and controls bar: light/dark adaptive
    const panelBg = isDark ? "bg-white/5 border-gray-200/10" : "bg-white border-gray-200";
    const panelText = isDark ? "text-white" : "text-gray-900";
    const panelHover = isDark ? "hover:bg-white/10" : "hover:bg-gray-50";
    const pillActive = "bg-blue-600 text-white";
    const pillInactive = isDark ? "bg-white/10 hover:bg-white/20 text-gray-100" : "bg-gray-200 hover:bg-gray-300 text-gray-700";
    const controlsBorder = isDark ? "bg-white/5 border-t border-gray-200/10" : "bg-white border-t border-gray-200";
    const leftBtnColor = isDark ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-900";

    if (callingState === CallingState.LEFT) {
        return (
            <div className={`flex items-center justify-center h-full ${bg} rounded-xl`}>
                <div className={`text-center ${panelText} space-y-3`}>
                    <PhoneOff className="w-16 h-16 mx-auto text-red-400" />
                    <p className="text-xl font-semibold">You left the meeting</p>
                    <button
                        onClick={onLeave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <StreamTheme as="div" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div className={`h-full flex flex-col ${bg} rounded-xl overflow-hidden`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${header}`}>
                    <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-green-500" />
                        <span className={`font-semibold text-sm ${headerText}`}>LXC Meet</span>
                    </div>
                    <button
                        onClick={() => setShowParticipants((v) => !v)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${showParticipants ? pillActive : pillInactive
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>{participantCount} {participantCount === 1 ? "participant" : "participants"}</span>
                    </button>
                </div>

                {/* Main content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Video grid — always dark since video tiles need dark background */}
                    <div className="flex-1 overflow-hidden bg-gray-900">
                        <SpeakerLayout participantsBarPosition="bottom" />
                    </div>

                    {/* Participants panel */}
                    {showParticipants && (
                        <div className={`w-64 flex-shrink-0 border-l ${panelBg} flex flex-col`}>
                            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "bg-white/5 border-gray-200/10" : "bg-white border-gray-200"}`}>
                                <span className={`font-medium text-sm ${panelText}`}>Participants ({participantCount})</span>
                                <button onClick={() => setShowParticipants(false)} className={`transition ${leftBtnColor}`}>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-2">
                                {participants.map((p) => {
                                    const name = p.name || p.userId || "Unknown";
                                    const initials = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
                                    return (
                                        <div key={p.sessionId} className={`flex items-center gap-3 px-4 py-2 transition ${panelHover}`}>
                                            {p.image ? (
                                                <img src={p.image} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                    {initials}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm truncate ${panelText}`}>
                                                    {name}
                                                    {p.isLocalParticipant && (
                                                        <span className={`ml-1 text-xs ${subText}`}>(you)</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                {p.audioStream && <span className="w-2 h-2 rounded-full bg-green-400" title="Mic on" />}
                                                {p.videoStream && <span className="w-2 h-2 rounded-full bg-blue-400" title="Camera on" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className={`border-t ${controlsBorder}`}>
                    <CallControls onLeave={onLeave} />
                </div>
            </div>
        </StreamTheme>
    );
}

export default function VideoCall({ callId, userId, userName, userImage, onLeave }: VideoCallProps) {
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<ReturnType<StreamVideoClient["call"]> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        let vc: StreamVideoClient | null = null;
        let callRef: ReturnType<StreamVideoClient["call"]> | null = null;

        async function init() {
            try {
                const { data } = await client.get("/v1/communication/meetings/token");
                const { token, apiKey } = data;

                // Abort early if React StrictMode already unmounted this effect
                if (!mounted) return;

                vc = new StreamVideoClient({
                    apiKey,
                    user: { id: userId, name: userName, image: userImage },
                    token,
                });

                const c = vc.call("default", callId);
                callRef = c;

                // Single atomic join — avoids the two-step getOrCreate+join
                // double-session issue caused by React StrictMode re-mounting.
                await c.join({ create: true });

                // If StrictMode unmounted us while we were joining, leave immediately
                if (!mounted) {
                    c.leave().catch(() => { });
                    vc.disconnectUser().catch(() => { });
                    return;
                }

                setVideoClient(vc);
                setCall(c);
                setLoading(false);
            } catch (err: any) {
                if (mounted) {
                    setError(err.message || "Failed to join meeting");
                    setLoading(false);
                }
            }
        }

        init();

        return () => {
            mounted = false;
            callRef?.leave().catch(() => { });
            vc?.disconnectUser().catch(() => { });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callId, userId]);

    const { theme } = useTheme();
    const isDark = theme === "dark";
    const bg = isDark ? "bg-gray-900" : "bg-gray-100";
    const text = isDark ? "text-white" : "text-gray-900";
    const subText = isDark ? "text-gray-300" : "text-gray-500";
    const btnBack = isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300";

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-full min-h-[500px] ${bg} rounded-xl`}>
                <div className={`flex flex-col items-center gap-4 ${text}`}>
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className={subText}>Joining meeting…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center h-full min-h-[500px] ${bg} rounded-xl`}>
                <div className={`text-center ${text} space-y-3`}>
                    <VideoOff className="w-16 h-16 text-red-400 mx-auto" />
                    <p className="font-medium">{error}</p>
                    <button onClick={onLeave} className={`px-4 py-2 ${btnBack} ${text} rounded-lg text-sm transition`}>
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    if (!videoClient || !call) return null;

    return (
        <StreamVideo client={videoClient}>
            <StreamCall call={call}>
                <CallUI onLeave={onLeave} isDark={isDark} />
            </StreamCall>
        </StreamVideo>
    );
}
