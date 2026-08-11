import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  RefreshControl,
  Modal,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { COLORS } from "@/constants/colors";
import { BottomNav } from "@/components/BottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { format, isPast, parseISO } from "date-fns";

// ─── Stream Chat REST helpers ───────────────────────────────────────────────
const STREAM_API_KEY = "e26ujrtcbwrx";
const STREAM_BASE = "https://chat.stream-io-api.com";

async function streamFetch(
  path: string,
  userId: string,
  token: string,
  opts: RequestInit = {}
) {
  const url = `${STREAM_BASE}${path}?api_key=${STREAM_API_KEY}&user_id=${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "Stream-Auth-Type": "jwt",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Stream API error ${res.status}`);
  }
  return res.json();
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface StreamMessage {
  id: string;
  text: string;
  created_at: string;
  user: { id: string; name: string; image?: string };
}

interface StreamChannel {
  channel: {
    id: string;
    type: string;
    name?: string;
    last_message_at?: string;
    member_count?: number;
    cid: string;
  };
  members: Array<{ user: { id: string; name: string; image?: string } }>;
  messages: StreamMessage[];
}

interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime?: string | null;
  joinToken: string;
  isActive: boolean;
  isEnded: boolean;
  creator: { id: string; name: string };
  participants: Array<{ user: { id: string; name: string } }>;
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CommunicationPage() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"chat" | "meetings">("chat");
  // Hide the floating bottom nav while inside a chat channel so it doesn’t cover the input box
  const [hideNav, setHideNav] = useState(false);

  if (!user) return null;

  const canSchedule = user.role === "teacher" || user.role === "admin";
  const canInstant = user.role === "teacher" || user.role === "admin";
  const isParent = user.role === "parent";

  const BottomNavComponent =
    user.role === "teacher"
      ? TeacherBottomNav
      : user.role === "parent"
      ? ParentBottomNav
      : BottomNav;

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#fff", "#F4F8FB"]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Communication</Text>
            <Text style={styles.headerSub}>
              {isParent ? "Chat with teachers & join meetings" : "Chat, schedule & join meetings"}
            </Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="person-circle-outline" size={14} color={COLORS.primary} />
            <Text style={styles.roleBadgeText}>{user.role}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {(["chat", "meetings"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
            >
              <Ionicons
                name={t === "chat" ? "chatbubbles-outline" : "videocam-outline"}
                size={16}
                color={activeTab === t ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.tabLabel, activeTab === t && styles.tabLabelActive]}>
                {t === "chat" ? "Chat" : "Meetings"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "chat" && (
          <ChatPanel userId={user.id} userName={user.name} isParent={isParent} onChannelOpen={() => setHideNav(true)} onChannelClose={() => setHideNav(false)} />
        )}
        {activeTab === "meetings" && (
          <MeetingsPanel canSchedule={canSchedule} canInstant={canInstant} />
        )}
      </View>

      {/* Hide nav while inside a channel so it doesn’t cover the input */}
      {!hideNav && <BottomNavComponent />}
    </View>
  );
}

// ─── Chat Panel ──────────────────────────────────────────────────────────────
function ChatPanel({
  userId,
  userName,
  isParent,
  onChannelOpen,
  onChannelClose,
}: {
  userId: string;
  userName: string;
  isParent: boolean;
  onChannelOpen: () => void;
  onChannelClose: () => void;
}) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<StreamChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sendingRef = useRef(false); // blocks poll from wiping optimistic messages
  const flatListRef = useRef<any>(null);

  // New Chat state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch chat token on mount
  useEffect(() => {
    api
      .post("/api/v1/communication/chat/token", {})
      .then((res) => {
        const t = (res as any).token as string;
        setToken(t);
      })
      .catch((e) => setError(e.message || "Failed to get chat token"));
  }, []);

  // Fetch channels once token is available
  const fetchChannels = useCallback(async () => {
    if (!token) return;
    try {
      const typeFilter = isParent
        ? { type: "messaging" }
        : { type: { $in: ["messaging", "team"] } };
      const data = await streamFetch("/channels", userId, token, {
        method: "POST",
        body: JSON.stringify({
          filter_conditions: { members: { $in: [userId] }, ...typeFilter },
          sort: [{ field: "last_message_at", direction: -1 }],
          message_limit: 1,
          watch: false,
        }),
      });
      setChannels(data.channels || []);
      setFilteredChannels(data.channels || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingChannels(false);
    }
  }, [token, userId, isParent]);

  useEffect(() => {
    if (token) {
      setLoadingChannels(true);
      fetchChannels();
    }
  }, [token, fetchChannels]);

  // Filter channels on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredChannels(channels);
    } else {
      const q = search.toLowerCase();
      setFilteredChannels(
        channels.filter((ch) => {
          const name = getChannelName(ch, userId).toLowerCase();
          return name.includes(q);
        })
      );
    }
  }, [search, channels, userId]);

  // Open a channel and load messages
  const openChannel = async (ch: StreamChannel) => {
    setActiveChannel(ch);
    setLoadingMessages(true);
    // Seed with whatever messages the channel list already returned
    setMessages(ch.messages || []);
    onChannelOpen();            // ← hide bottom nav
    if (token) await loadMessages(ch, token);
  };

  const loadMessages = async (ch: StreamChannel, tok: string) => {
    // Don’t overwrite state while a send is in flight — avoids clearing optimistic msgs
    if (sendingRef.current && messages.length > 0) return;
    try {
      const { type, id } = ch.channel;
      const data = await streamFetch(`/channels/${type}/${encodeURIComponent(id)}/query`, userId, tok, {
        method: "POST",
        body: JSON.stringify({ state: true, messages: { limit: 50 }, watch: false }),
      });
      const incoming: StreamMessage[] = data.messages || [];
      console.log(`[Chat] loadMessages: ${incoming.length} msgs for ${id}`);
      // Only update if server has at least as many messages as we do locally
      // (prevents the poll from clearing optimistic messages on propagation lag)
      setMessages(prev => incoming.length >= prev.length ? incoming : prev);
    } catch (e: any) {
      console.warn("Failed to load messages", e.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Poll for new messages every 4 seconds when in channel view
  useEffect(() => {
    if (!activeChannel || !token) return;
    pollRef.current = setInterval(() => {
      loadMessages(activeChannel, token);
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeChannel, token]);

  // Scroll to the newest message (index 0 in an inverted list) whenever list grows
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: 0, animated: true });
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!inputText.trim() || !activeChannel || !token || sending) return;
    const text = inputText.trim();
    const msgId = `${userId}_${Date.now()}`;

    // 1. Clear input immediately so the UX feels snappy
    setInputText("");
    setSending(true);
    sendingRef.current = true;

    // 2. Optimistic update — show message in the list RIGHT NOW
    const optimisticMsg: StreamMessage = {
      id: msgId,
      text,
      created_at: new Date().toISOString(),
      user: { id: userId, name: userName },
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const { type, id } = activeChannel.channel;
      await streamFetch(`/channels/${type}/${encodeURIComponent(id)}/message`, userId, token, {
        method: "POST",
        body: JSON.stringify({ message: { id: msgId, text } }),
      });
      // 3. Wait 900ms for Stream to index the message, then refresh to get real server state
      //    (replaces the optimistic msg with confirmed server data incl. exact timestamp)
      setTimeout(() => {
        sendingRef.current = false;
        if (activeChannel && token) loadMessages(activeChannel, token);
      }, 900);
    } catch (e: any) {
      // 4. On failure — remove the optimistic message and restore the input
      setMessages(prev => prev.filter(m => m.id !== msgId));
      Alert.alert("Failed to send", e.message);
      setInputText(text);
      sendingRef.current = false;
    } finally {
      setSending(false);
    }
  };

  const goBack = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setActiveChannel(null);
    setMessages([]);
    onChannelClose();           // ← restore bottom nav
  };

  const searchUsers = async (query: string) => {
    setUserSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      // Fetch users from our API
      const res = await api.get(`/api/v1/communication/users?schoolId=${user?.schoolId || ""}`);
      const allUsers = (res as any) || [];
      // Frontend filter by name for responsiveness
      const q = query.toLowerCase();
      const filtered = allUsers.filter((u: any) => 
        u.id !== userId && (u.name?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q))
      );
      setSearchResults(filtered);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setSearching(false);
    }
  };

  const startConversation = async (targetUser: any) => {
    setCreating(true);
    try {
      // Create channel via our API
      const res = await api.post("/api/v1/communication/chat/channel/create", {
        type: "direct",
        memberIds: [targetUser.id]
      });
      const result = res as any;
      
      // Sync channels list and open the new one
      await fetchChannels();
      setShowNewChatModal(false);
      setUserSearch("");
      setSearchResults([]);
      
      // Wait a bit for Stream to catch up
      setTimeout(() => {
        const newCh = {
          channel: result.channel,
          members: [
            { user: { id: userId, name: userName } },
            { user: { id: targetUser.id, name: targetUser.name, image: targetUser.profilePic } }
          ],
          messages: []
        };
        openChannel(newCh as any);
      }, 500);

    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to start chat");
    } finally {
      setCreating(false);
    }
  };

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Ionicons name="chatbubble-ellipses-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Chat unavailable</Text>
        <Text style={styles.errorSub}>{error}</Text>
      </View>
    );
  }

  // ── Channel view ──
  if (activeChannel) {
    const chName = getChannelName(activeChannel, userId);
    const isTeamChannel = activeChannel.channel.type === "team";

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Channel header */}
        <View style={styles.channelHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.channelHeaderAvatar}>
            <Ionicons
              name={isTeamChannel ? "people" : "person"}
              size={18}
              color="#fff"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.channelHeaderName} numberOfLines={1}>{chName}</Text>
            <Text style={styles.channelHeaderSub}>
              {activeChannel.members.length} member{activeChannel.members.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Messages */}
        {loadingMessages ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            keyExtractor={(m) => m.id}
            inverted
            contentContainerStyle={styles.messageList}
            onScrollToIndexFailed={() => flatListRef.current?.scrollToEnd?.({ animated: true })}
            renderItem={({ item }) => {
              const isMe = item.user.id === userId;
              return (
                <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
                  {!isMe && (
                    <View style={styles.msgAvatar}>
                      <Text style={styles.msgAvatarText}>
                        {item.user.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleThem]}>
                    {!isMe && (
                      <Text style={styles.msgSenderName}>{item.user.name}</Text>
                    )}
                    <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.text}</Text>
                    <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
                      {format(new Date(item.created_at), "h:mm a")}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centerBox}>
                <Ionicons name="chatbubble-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyTxt}>No messages yet. Say hello!</Text>
              </View>
            }
          />
        )}

        {/* Input — sits above device home indicator */}
        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message…"
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Channel list ──
  return (
    <View style={{ flex: 1 }}>
      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations…"
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {loadingChannels ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.loadingTxt}>Connecting to chat…</Text>
        </View>
      ) : filteredChannels.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="chatbubbles-outline" size={52} color={COLORS.textMuted} />
          <Text style={styles.emptyTxt}>No conversations yet</Text>
          <Text style={styles.emptySub}>Your messages will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChannels}
          keyExtractor={(ch) => ch.channel.cid}
          contentContainerStyle={styles.channelList}
          renderItem={({ item, index }) => {
            const lastMsg = item.messages?.[0];
            const chName = getChannelName(item, userId);
            const isTeam = item.channel.type === "team";
            return (
              <Animated.View entering={FadeInDown.delay(index * 40)}>
                <TouchableOpacity style={styles.channelItem} onPress={() => openChannel(item)}>
                  <View style={[styles.chAvatar, isTeam && styles.chAvatarTeam]}>
                    <Ionicons
                      name={isTeam ? "people" : "person"}
                      size={20}
                      color={isTeam ? COLORS.primary : COLORS.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chName} numberOfLines={1}>{chName}</Text>
                    {lastMsg ? (
                      <Text style={styles.chLastMsg} numberOfLines={1}>
                        {lastMsg.user.id === userId ? "You: " : ""}{lastMsg.text}
                      </Text>
                    ) : (
                      <Text style={styles.chLastMsg}>No messages yet</Text>
                    )}
                  </View>
                  <View style={styles.chMeta}>
                    {lastMsg && (
                      <Text style={styles.chTime}>
                        {format(new Date(lastMsg.created_at), "h:mm a")}
                      </Text>
                    )}
                    <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
          refreshControl={
            <RefreshControl refreshing={loadingChannels} onRefresh={fetchChannels} tintColor={COLORS.primary} />
          }
        />
      )}

      {/* New Chat FAB */}
      {!activeChannel && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => {
            setShowNewChatModal(true);
            searchUsers(""); // load initial users if any
          }}
        >
          <LinearGradient colors={[COLORS.primary, "#3B82F6"]} style={styles.fabGradient}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* New Chat Modal */}
      <Modal visible={showNewChatModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { height: "90%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Conversation</Text>
              <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchRow}>
              <Ionicons name="search" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search students, teachers, admins…"
                placeholderTextColor={COLORS.textMuted}
                autoFocus
                value={userSearch}
                onChangeText={searchUsers}
              />
            </View>

            {searching ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(u) => u.id}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.userItem} 
                    onPress={() => startConversation(item)}
                    disabled={creating}
                  >
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>{item.name?.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userRole}>{item.role}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.modalEmpty}>
                    <Ionicons name="people-outline" size={48} color={COLORS.border} />
                    <Text style={styles.modalEmptyText}>
                      {userSearch.length < 2 ? "Type name to search" : "No users found"}
                    </Text>
                  </View>
                }
              />
            )}
            {creating && (
              <View style={styles.creatingOverlay}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.creatingText}>Starting chat…</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Meetings Panel ───────────────────────────────────────────────────────────
function MeetingsPanel({
  canSchedule,
  canInstant,
}: {
  canSchedule: boolean;
  canInstant: boolean;
}) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [meetingTab, setMeetingTab] = useState<"upcoming" | "past">("upcoming");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [startingInstant, setStartingInstant] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    durationMinutes: "60",
    participantIds: "",
  });

  const fetchMeetings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await api.get(`/api/v1/communication/meetings/list?filter=${meetingTab}`);
      setMeetings((data as any).meetings || []);
    } catch (e: any) {
      console.error("Failed to load meetings", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [meetingTab]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const joinMeeting = async (m: Meeting) => {
    const url = `https://beta.learnxchain.com/meet/${m.joinToken}`;
    await WebBrowser.openBrowserAsync(url);
  };

  const startInstant = async () => {
    setStartingInstant(true);
    try {
      const data = await api.post("/api/v1/communication/meetings/instant", {});
      const callId = (data as any).callId;
      if (callId) {
        await WebBrowser.openBrowserAsync(`https://beta.learnxchain.com/meet/${callId}`);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to start meeting");
    } finally {
      setStartingInstant(false);
    }
  };

  const scheduleMeeting = async () => {
    if (!form.title.trim() || !form.startTime.trim()) {
      Alert.alert("Please fill in the required fields (Title and Start Time).");
      return;
    }
    setScheduling(true);
    try {
      const participantIds = form.participantIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.post("/api/v1/communication/meetings/schedule", {
        title: form.title,
        description: form.description,
        startTime: new Date(form.startTime).toISOString(),
        durationMinutes: parseInt(form.durationMinutes, 10) || 60,
        participantIds,
      });
      Alert.alert("Success", "Meeting scheduled!");
      setShowSchedule(false);
      setForm({ title: "", description: "", startTime: "", durationMinutes: "60", participantIds: "" });
      fetchMeetings();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to schedule meeting");
    } finally {
      setScheduling(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Meetings sub-header */}
      <View style={styles.meetingHeader}>
        <View style={styles.meetingTabs}>
          {(["upcoming", "past"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setMeetingTab(t)}
              style={[styles.meetingTabBtn, meetingTab === t && styles.meetingTabBtnActive]}
            >
              <Text style={[styles.meetingTabLabel, meetingTab === t && styles.meetingTabLabelActive]}>
                {t === "upcoming" ? "Upcoming" : "Past"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.meetingActions}>
          {canInstant && (
            <TouchableOpacity
              onPress={startInstant}
              disabled={startingInstant}
              style={[styles.actionBtn, styles.instantBtn]}
            >
              {startingInstant ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="videocam" size={14} color="#fff" />
                  <Text style={styles.actionBtnTxt}>Instant</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {canSchedule && (
            <TouchableOpacity
              onPress={() => setShowSchedule(true)}
              style={[styles.actionBtn, styles.scheduleBtn]}
            >
              <Ionicons name="add" size={14} color="#fff" />
              <Text style={styles.actionBtnTxt}>Schedule</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Meetings list */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : meetings.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="calendar-outline" size={52} color={COLORS.textMuted} />
          <Text style={styles.emptyTxt}>No {meetingTab} meetings</Text>
          {canSchedule && meetingTab === "upcoming" && (
            <Text style={styles.emptySub}>Tap &quot;Schedule&quot; to create one</Text>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.meetingList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchMeetings(true)}
              tintColor={COLORS.primary}
            />
          }
        >
          {meetings.map((m, i) => {
            const start = parseISO(m.startTime);
            const pastMeeting = isPast(start) || m.isEnded;
            return (
              <Animated.View key={m.id} entering={FadeInDown.delay(i * 50)}>
                <View style={styles.meetingCard}>
                  <View style={styles.meetingCardLeft}>
                    <LinearGradient
                      colors={pastMeeting ? ["#9CA3AF", "#6B7280"] : [COLORS.primary, "#3BA5D9"]}
                      style={styles.meetingIconBg}
                    >
                      <Ionicons name="videocam" size={18} color="#fff" />
                    </LinearGradient>
                  </View>
                  <View style={styles.meetingCardBody}>
                    <Text style={styles.meetingTitle} numberOfLines={1}>{m.title}</Text>
                    <View style={styles.meetingInfoRow}>
                      <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.meetingInfoTxt}>
                        {format(start, "MMM d, h:mm a")}
                      </Text>
                    </View>
                    <View style={styles.meetingInfoRow}>
                      <Ionicons name="people-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.meetingInfoTxt}>
                        {m.participants.length} participant{m.participants.length !== 1 ? "s" : ""}
                        {" · "}{m.creator.name}
                      </Text>
                    </View>
                    {m.description && (
                      <Text style={styles.meetingDesc} numberOfLines={2}>{m.description}</Text>
                    )}
                  </View>
                  {!pastMeeting && (
                    <TouchableOpacity onPress={() => joinMeeting(m)} style={styles.joinBtn}>
                      <Text style={styles.joinBtnTxt}>Join</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      {/* Schedule Meeting Modal */}
      <Modal visible={showSchedule} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule a Meeting</Text>
              <TouchableOpacity onPress={() => setShowSchedule(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ScheduleField label="Title *" placeholder="e.g. Math Class Review">
                <TextInput
                  style={styles.fieldInput}
                  value={form.title}
                  onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                  placeholder="Meeting title"
                  placeholderTextColor={COLORS.textMuted}
                />
              </ScheduleField>
              <ScheduleField label="Start Date & Time *" placeholder="">
                <TextInput
                  style={styles.fieldInput}
                  value={form.startTime}
                  onChangeText={(v) => setForm((f) => ({ ...f, startTime: v }))}
                  placeholder="YYYY-MM-DDTHH:MM e.g. 2026-03-15T10:00"
                  placeholderTextColor={COLORS.textMuted}
                />
              </ScheduleField>
              <ScheduleField label="Duration (minutes)" placeholder="">
                <TextInput
                  style={styles.fieldInput}
                  value={form.durationMinutes}
                  onChangeText={(v) => setForm((f) => ({ ...f, durationMinutes: v }))}
                  keyboardType="numeric"
                  placeholder="60"
                  placeholderTextColor={COLORS.textMuted}
                />
              </ScheduleField>
              <ScheduleField label="Description" placeholder="">
                <TextInput
                  style={[styles.fieldInput, { height: 72 }]}
                  value={form.description}
                  onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                  placeholder="Optional description"
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                />
              </ScheduleField>
              <ScheduleField label="Participant IDs (comma-separated)" placeholder="">
                <TextInput
                  style={styles.fieldInput}
                  value={form.participantIds}
                  onChangeText={(v) => setForm((f) => ({ ...f, participantIds: v }))}
                  placeholder="userId1, userId2, …"
                  placeholderTextColor={COLORS.textMuted}
                />
              </ScheduleField>

              <TouchableOpacity
                onPress={scheduleMeeting}
                disabled={scheduling}
                style={styles.scheduleSubmitBtn}
              >
                {scheduling ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.scheduleSubmitTxt}>Schedule Meeting</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Small helper component for schedule form fields
function ScheduleField({ label, children, placeholder }: { label: string; children: React.ReactNode; placeholder: string }) {
  return (
    <View style={styles.scheduleField}>
      <Text style={styles.scheduleFieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function getChannelName(ch: StreamChannel, myId: string): string {
  if (ch.channel.name) return ch.channel.name;
  // For direct messaging, show the other person's name
  const other = ch.members.find((m) => m.user.id !== myId);
  return other?.user.name || ch.channel.id;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleBadgeText: { fontSize: 12, fontWeight: "600", color: COLORS.primary, textTransform: "capitalize" },
  tabBar: { flexDirection: "row", gap: 6, paddingBottom: 4 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  tabBtnActive: { backgroundColor: COLORS.primaryLight },
  tabLabel: { fontSize: 13, fontWeight: "500", color: COLORS.textMuted },
  tabLabelActive: { color: COLORS.primary, fontWeight: "600" },
  content: { flex: 1 },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  errorText: { fontSize: 16, fontWeight: "600", color: COLORS.error },
  errorSub: { fontSize: 13, color: COLORS.textMuted, textAlign: "center" },
  emptyTxt: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
  emptySub: { fontSize: 13, color: COLORS.textMuted, textAlign: "center" },
  loadingTxt: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },

  // Channel list
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    gap: 8,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  channelList: { paddingHorizontal: 12, paddingBottom: 100 },
  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  chAvatarTeam: { backgroundColor: COLORS.primaryLight },
  chName: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  chLastMsg: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  chMeta: { alignItems: "flex-end", gap: 4 },
  chTime: { fontSize: 11, color: COLORS.textMuted },

  // Channel header
  channelHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: { padding: 4 },
  channelHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  channelHeaderName: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },
  channelHeaderSub: { fontSize: 11, color: COLORS.textMuted },

  // Messages
  messageList: { padding: 12, paddingBottom: 8, flexGrow: 1 },
  msgRow: { flexDirection: "row", marginBottom: 10, alignItems: "flex-end" },
  msgRowMe: { justifyContent: "flex-end" },
  msgRowThem: { justifyContent: "flex-start" },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  msgAvatarText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
  msgBubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  msgBubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  msgBubbleThem: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgSenderName: { fontSize: 11, fontWeight: "600", color: COLORS.primary, marginBottom: 2 },
  msgText: { fontSize: 14, color: COLORS.textPrimary },
  msgTextMe: { color: "#fff" },
  msgTime: { fontSize: 10, color: COLORS.textMuted, marginTop: 3, textAlign: "right" },
  msgTimeMe: { color: "rgba(255,255,255,0.7)" },

  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    gap: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: COLORS.textMuted },

  // Meetings
  meetingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  meetingTabs: { flexDirection: "row", gap: 6 },
  meetingTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  meetingTabBtnActive: { backgroundColor: COLORS.primaryLight },
  meetingTabLabel: { fontSize: 13, fontWeight: "500", color: COLORS.textMuted },
  meetingTabLabelActive: { color: COLORS.primary, fontWeight: "600" },
  meetingActions: { flexDirection: "row", gap: 6 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  instantBtn: { backgroundColor: COLORS.success },
  scheduleBtn: { backgroundColor: COLORS.primary },
  actionBtnTxt: { fontSize: 12, fontWeight: "600", color: "#fff" },
  meetingList: { paddingHorizontal: 12, paddingBottom: 100 },
  meetingCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  meetingCardLeft: {},
  meetingIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  meetingCardBody: { flex: 1, gap: 4 },
  meetingTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  meetingInfoRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meetingInfoTxt: { fontSize: 12, color: COLORS.textMuted },
  meetingDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  joinBtn: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  joinBtnTxt: { fontSize: 13, fontWeight: "600", color: "#fff" },

  // Schedule modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textPrimary },
  scheduleField: { marginBottom: 14 },
  scheduleFieldLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 6 },
  fieldInput: {
    backgroundColor: "#F4F8FB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scheduleSubmitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  scheduleSubmitTxt: { fontSize: 15, fontWeight: "700", color: "#fff" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F8FB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontFamily: "Inter_500Medium",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + "50",
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: "capitalize",
    marginTop: 1,
  },
  modalEmpty: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    opacity: 0.5,
  },
  modalEmptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: "Inter_500Medium",
  },
  creatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    zIndex: 10,
  },
  creatingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
});
