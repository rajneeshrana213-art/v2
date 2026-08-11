
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
    Chat,
    Channel,
    ChannelList,
    MessageInput,
    MessageList,
    Thread,
    Window,
    useChatContext,
    useChannelStateContext,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import { MessageSquare, Search, X, Loader2 } from "lucide-react";
import client from "@/lib/api/client";
import { useTheme } from "@/hooks/useTheme";

import "stream-chat-react/dist/css/v2/index.css";

// Emoji picker — SSR disabled because emoji-mart is browser-only
const EmojiPicker = dynamic(
    () => import("stream-chat-react/emojis").then((m) => m.EmojiPicker),
    { ssr: false }
) as React.ComponentType<any>;

interface ChatPanelProps {
    userId: string;
    userName: string;
    userImage?: string;
    role: string;
    schoolId?: string;
    /** Restrict channel filter, e.g. for parent: only messaging channels */
    channelFilter?: Record<string, any>;
    /** Whether this role can create new channels */
    canCreateGroup?: boolean;
    /** Tab label overrides */
    tabLabel?: string;
}

export default function ChatPanel({
    userId,
    userName,
    userImage,
    role,
    schoolId,
    channelFilter,
    canCreateGroup = false,
}: ChatPanelProps) {
    const { theme } = useTheme();
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function initChat() {
            try {
                const { data } = await client.post("/v1/communication/chat/token");
                const { token, userId: uid } = data;

                const apiKey = process.env.STREAM_API_KEY!;
                const sc = StreamChat.getInstance(apiKey);

                await sc.connectUser(
                    {
                        id: uid,
                        name: userName,
                        image: userImage,
                        ...(schoolId ? { schoolId } : {}),
                    } as Parameters<typeof sc.connectUser>[0],
                    token
                );

                if (mounted) {
                    setChatClient(sc);
                    setLoading(false);
                }
            } catch (err: any) {
                if (mounted) {
                    setError(err.message || "Failed to connect to chat");
                    setLoading(false);
                }
            }
        }

        initChat();

        return () => {
            mounted = false;
            chatClient?.disconnectUser();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Connecting to chat…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-2">
                    <MessageSquare className="w-12 h-12 text-red-400 mx-auto" />
                    <p className="text-red-500 font-medium">Chat unavailable</p>
                    <p className="text-sm text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!chatClient) return null;

    const baseFilter = { members: { $in: [userId] }, ...channelFilter };

    const streamTheme = theme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light";

    return (
        <div className="h-full min-h-[600px] flex flex-col rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <Chat client={chatClient} theme={streamTheme}>
                <div className="flex h-full" style={{ minHeight: 600 }}>
                    {/* Sidebar with working search */}
                    <ChannelSidebar userId={userId} baseFilter={baseFilter} />

                    {/* Message area */}
                    <ChatMessages />
                </div>
            </Chat>
        </div>
    );
}

// ─── Channel Sidebar with live search ────────────────────────────────────────

interface StreamUser {
    id: string;
    name?: string;
    image?: string;
}

function ChannelSidebar({
    userId,
    baseFilter,
}: {
    userId: string;
    baseFilter: Record<string, any>;
}) {
    const { client, setActiveChannel } = useChatContext();
    const [search, setSearch] = useState("");
    const [userResults, setUserResults] = useState<StreamUser[]>([]);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Search users by name as the admin types
    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (!search.trim()) {
            setUserResults([]);
            setSearching(false);
            return;
        }
        setSearching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const { users } = await (client as any).queryUsers(
                    { name: { $autocomplete: search.trim() }, id: { $ne: userId } },
                    { name: 1 },
                    { limit: 10 }
                );
                setUserResults(users as StreamUser[]);
            } catch {
                setUserResults([]);
            } finally {
                setSearching(false);
            }
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [search, client, userId]);

    // Open or create a DM with the selected user
    const openDM = async (target: StreamUser) => {
        try {
            const channel = client.channel("messaging", {
                members: [userId, target.id],
            });
            await channel.watch();
            setActiveChannel(channel);
            setSearch("");
            setUserResults([]);
        } catch {
            // channel may already exist — just watch it
        }
    };

    const sort = { last_message_at: -1 as const };

    // When searching by name, filter channels by name too (works for named groups)
    const listFilter = search.trim()
        ? { ...baseFilter, name: { $autocomplete: search.trim() } }
        : baseFilter;

    const initials = (name?: string) =>
        (name || "?")
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase();

    return (
        <div className="w-72 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Search input */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name…"
                        className="w-full pl-9 pr-8 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 outline-none placeholder-gray-400 text-gray-900 dark:text-white"
                    />
                    {search && (
                        <button
                            onClick={() => { setSearch(""); setUserResults([]); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* User search results */}
            {search.trim() && (
                <div className="border-b border-gray-100 dark:border-gray-700 max-h-52 overflow-y-auto">
                    {searching ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        </div>
                    ) : userResults.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-3">No people found</p>
                    ) : (
                        <>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 pt-2 pb-1">
                                People
                            </p>
                            {userResults.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => openDM(u)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left"
                                >
                                    {u.image ? (
                                        <img
                                            src={u.image}
                                            alt={u.name}
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                            {initials(u.name)}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                        {u.name || u.id}
                                    </span>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* Channel list — re-keyed so it re-queries when search changes */}
            <div className="flex-1 overflow-y-auto">
                <ChannelList
                    key={search}
                    filters={listFilter}
                    sort={sort}
                    showChannelSearch={false}
                    setActiveChannelOnMount={!search}
                />
            </div>
        </div>
    );
}

// ─── Custom channel header — DM vs Group aware ───────────────────────────────
function CustomChannelHeader() {
    const { client } = useChatContext();
    const { channel } = useChannelStateContext();

    const members = Object.values(channel.state.members);
    const isDM = channel.type === "messaging" && members.length === 2;

    if (isDM) {
        // Find the other participant (not the logged-in user)
        const other = members.find((m) => m.user?.id !== client.userID)?.user;
        const name = other?.name || other?.id || "Unknown";
        const image = (other as any)?.image as string | undefined;
        const online = other?.online ?? false;
        const initials = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

        return (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="relative flex-shrink-0">
                    {image ? (
                        <img src={image} alt={name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                            {initials}
                        </div>
                    )}
                    <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${online ? "bg-green-500" : "bg-gray-400"
                            }`}
                    />
                </div>
                <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{name}</p>
                    <p className="text-xs text-gray-400">{online ? "Online" : "Offline"}</p>
                </div>
            </div>
        );
    }

    // Group channel header
    const groupName = (channel.data as any)?.name || "Group Chat";
    const groupImage = (channel.data as any)?.image as string | undefined;
    const onlineCount = members.filter((m) => m.user?.online).length;
    const initials = groupName.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex-shrink-0">
                {groupImage ? (
                    <img src={groupImage} alt={groupName} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {initials}
                    </div>
                )}
            </div>
            <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{groupName}</p>
                <p className="text-xs text-gray-400">{members.length} members · {onlineCount} online</p>
            </div>
        </div>
    );
}

/** Inner component: reads the active channel from stream-chat-react's ChatContext */
function ChatMessages() {
    const { channel } = useChatContext();

    if (!channel) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto" />
                    <p className="text-gray-400 font-medium">Select a conversation</p>
                    <p className="text-sm text-gray-300">Choose from the list on the left</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            <Channel EmojiPicker={EmojiPicker}>
                <Window>
                    <CustomChannelHeader />
                    <MessageList />
                    <MessageInput focus />
                </Window>
                <Thread />
            </Channel>
        </div>
    );
}
