
import React, { useEffect, useState } from "react";
import { User, UserPlus, UserCheck, UserX, Clock } from "lucide-react";
import client from "@/lib/api/client";
import toast from "react-hot-toast";

interface FriendUser {
    id: string;
    name: string;
    profilePic?: string | null;
    role: string;
}

interface FriendEntry {
    friendRequestId: string;
    since: string;
    user: FriendUser;
}

interface PendingRequest {
    id: string;
    createdAt: string;
    sender?: FriendUser;
    receiver?: FriendUser;
}

export default function FriendRequests() {
    const [friends, setFriends] = useState<FriendEntry[]>([]);
    const [received, setReceived] = useState<PendingRequest[]>([]);
    const [sent, setSent] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"friends" | "received" | "sent">("received");

    const loadData = async () => {
        try {
            const { data } = await client.get("/v1/communication/friends/list");
            setFriends(data.friends || []);
            setReceived(data.receivedRequests || []);
            setSent(data.sentRequests || []);
        } catch {
            toast.error("Failed to load friends");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleRespond = async (requestId: string, action: "accept" | "decline") => {
        try {
            await client.post("/v1/communication/friends/respond", { requestId, action });
            toast.success(action === "accept" ? "Friend request accepted!" : "Request declined");
            loadData();
        } catch {
            toast.error("Action failed");
        }
    };

    const handleRemove = async (friendId: string) => {
        try {
            await client.delete("/v1/communication/friends/remove", { data: { friendId } });
            toast.success("Friend removed");
            loadData();
        } catch {
            toast.error("Failed to remove friend");
        }
    };

    const tabs = [
        { key: "received" as const, label: "Requests", count: received.length },
        { key: "friends" as const, label: "Friends", count: friends.length },
        { key: "sent" as const, label: "Sent", count: sent.length },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t.key
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        {t.label}
                        {t.count > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                {t.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="p-4 space-y-3">
                {/* Received requests */}
                {tab === "received" && (
                    received.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No pending friend requests</p>
                    ) : (
                        received.map((r) => (
                            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
                                    {r.sender?.profilePic ? (
                                        <img src={r.sender.profilePic} alt={r.sender.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-blue-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{r.sender?.name}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRespond(r.id, "accept")}
                                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition"
                                        title="Accept"
                                    >
                                        <UserCheck className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleRespond(r.id, "decline")}
                                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                                        title="Decline"
                                    >
                                        <UserX className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )
                )}

                {/* Friends list */}
                {tab === "friends" && (
                    friends.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No friends yet</p>
                    ) : (
                        friends.map((f) => (
                            <div key={f.friendRequestId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center overflow-hidden">
                                    {f.user.profilePic ? (
                                        <img src={f.user.profilePic} alt={f.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-purple-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{f.user.name}</p>
                                    <p className="text-xs text-gray-400">Friends since {new Date(f.since).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => handleRemove(f.user.id)}
                                    className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition"
                                    title="Remove friend"
                                >
                                    <UserX className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )
                )}

                {/* Sent requests */}
                {tab === "sent" && (
                    sent.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No sent requests</p>
                    ) : (
                        sent.map((r) => (
                            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center overflow-hidden">
                                    {r.receiver?.profilePic ? (
                                        <img src={r.receiver.profilePic} alt={r.receiver.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-yellow-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{r.receiver?.name}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Pending · {new Date(r.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Pending</span>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
}
