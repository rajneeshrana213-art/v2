import { useState, useEffect, useCallback, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    TouchableOpacity,
    Alert,
    Image,
    Linking,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInUp, FadeInRight, Layout, ZoomIn } from "react-native-reanimated";
import * as DocumentPicker from "expo-document-picker";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { Doubt } from "@/lib/types/student";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";


const STATUS_COLORS: Record<string, string> = {
    OPEN: "#F59E0B", // Amber
    ANSWERED: "#10B981", // Emerald
    CLOSED: "#6B7280", // Gray
};

interface Subject {
    id: string;
    name: string;
}

function DoubtsPage() {
    const { user } = useAuth();

    useEffect(() => {
        if (user?.role === "teacher") {
            router.replace("/pages/teacher-doubt-forum");
        }
    }, [user]);

    const insets = useSafeAreaInsets();
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<{ status?: string; mine: boolean }>({ status: undefined, mine: false });
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [showAskModal, setShowAskModal] = useState(false);
    const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [doubtDetails, setDoubtDetails] = useState<any>(null);

    // Form states
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [formData, setFormData] = useState({ title: "", content: "", subjectId: "", chapter: "" });
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    const fetchDoubts = useCallback(async (isRefresh = false) => {
        if (user?.role === "teacher") return;

        if (isRefresh) setRefreshing(true);
        else setIsLoading(true);

        try {
            const queryParams = new URLSearchParams();
            if (filter.status) queryParams.append("status", filter.status);
            if (filter.mine) queryParams.append("mine", "true");
            if (searchQuery) queryParams.append("search", searchQuery);

            const response = await api.get<Doubt[]>(`api/v1/dashboard/student/doubt-forum?${queryParams.toString()}`);
            setDoubts(response as any || []);
        } catch (error) {
            console.error("Error fetching doubts:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [filter, searchQuery]);

    const fetchSubjects = async () => {
        if (user?.role === "teacher") return;

        try {
            const res = await api.get<Subject[]>("api/v1/dashboard/student/subjects");
            setSubjects(res as any || []);
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    const fetchDoubtDetail = async (id: string) => {
        setDetailLoading(true);
        try {
            const res = await api.get(`api/v1/dashboard/student/doubt-forum/${id}`);
            setDoubtDetails(res);
        } catch (error) {
            console.error("Error fetching doubt details:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchDoubts();
    }, [fetchDoubts]);

    useEffect(() => {
        if (showAskModal && subjects.length === 0) {
            fetchSubjects();
        }
    }, [showAskModal]);

    const onRefresh = useCallback(() => {
        fetchDoubts(true);
    }, [fetchDoubts]);

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
            });
            if (!result.canceled) {
                setSelectedFile(result);
            }
        } catch (err) {
            console.error("Error picking document:", err);
            Alert.alert("Error", "Failed to pick document");
        }
    };

    const convertToBase64 = async (uri: string) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            return await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error converting to base64:", error);
            return null;
        }
    };

    const handleCreateDoubt = async () => {
        if (!formData.title || !formData.content || !formData.subjectId) return;
        setIsSubmitting(true);
        try {
            let fileData = undefined;
            let fileName = undefined;

            if (selectedFile && !selectedFile.canceled) {
                const asset = selectedFile.assets[0];
                fileData = await convertToBase64(asset.uri);
                fileName = asset.name;
            }

            await api.post("api/v1/dashboard/student/doubt-forum", {
                ...formData,
                priority: "LOW",
                file: fileData,
                fileName: fileName
            });
            setShowAskModal(false);
            setFormData({ title: "", content: "", subjectId: "", chapter: "" });
            setSelectedFile(null);
            fetchDoubts();
        } catch (error) {
            console.error("Error creating doubt:", error);
            Alert.alert("Error", "Failed to post doubt");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePostReply = async () => {
        if (!replyContent.trim() || !selectedDoubt) return;
        setIsSubmitting(true);
        try {
            await api.post("api/v1/dashboard/student/doubt-forum", {
                action: "reply",
                doubtId: selectedDoubt.id,
                content: replyContent
            });
            setReplyContent("");
            fetchDoubtDetail(selectedDoubt.id);
            fetchDoubts();
        } catch (error) {
            console.error("Error posting reply:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVote = async (replyId: string, direction: 1 | -1) => {
        try {
            await api.patch(`api/v1/dashboard/student/doubt-forum/${selectedDoubt?.id}`, {
                action: "vote-reply",
                replyId,
                direction
            });
            fetchDoubtDetail(selectedDoubt!.id);
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    const handleMarkResolved = async () => {
        if (!selectedDoubt) return;
        try {
            await api.patch(`api/v1/dashboard/student/doubt-forum/${selectedDoubt.id}`, {
                status: "CLOSED"
            });
            fetchDoubtDetail(selectedDoubt.id);
            fetchDoubts();
        } catch (error) {
            console.error("Error marking resolved:", error);
        }
    };

    const renderAttachment = (url: string) => {
        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
        if (isImage) {
            return (
                <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.attachmentWrapper}>
                    <Image source={{ uri: url }} style={styles.attachmentImage} />
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.fileAttachment}>
                <Ionicons name="document-attach" size={20} color={COLORS.primary} />
                <Text style={styles.fileAttachmentText}>View Attachment</Text>
            </TouchableOpacity>
        );
    };

    const stats = useMemo(() => {
        const resolved = doubts.filter(d => d.status === "CLOSED").length;
        return { total: doubts.length, resolved };
    }, [doubts]);

    return (
        <View style={styles.container}>
            <PageHeader title="Doubt Forum" subtitle="Peer Learning" />

            {/* Premium Hero Section with Integrated Search */}
            <Animated.View entering={FadeInUp.duration(600)} style={styles.heroContainer}>
                <LinearGradient
                    colors={[COLORS.primary, "#6366F1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroGradient}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.total}</Text>
                                <Text style={styles.statLabel}>Total Doubts</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.resolved}</Text>
                                <Text style={styles.statLabel}>Resolved</Text>
                            </View>
                        </View>

                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search discussions..."
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>

            {/* Glassmorphic Filter Bar */}
            <View style={styles.filterSection}>
                <BlurView intensity={20} tint="light" style={styles.filterBar}>
                    <Pressable
                        style={[styles.filterChip, !filter.status && !filter.mine && styles.activeChip]}
                        onPress={() => setFilter({ status: undefined, mine: false })}
                    >
                        <Text style={[styles.chipText, !filter.status && !filter.mine && styles.activeChipText]}>All</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.filterChip, filter.mine && styles.activeChip]}
                        onPress={() => setFilter({ mine: true, status: undefined })}
                    >
                        <Text style={[styles.chipText, filter.mine && styles.activeChipText]}>My Questions</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.filterChip, filter.status === "CLOSED" && styles.activeChip]}
                        onPress={() => setFilter({ status: "CLOSED", mine: false })}
                    >
                        <Text style={[styles.chipText, filter.status === "CLOSED" && styles.activeChipText]}>Resolved</Text>
                    </Pressable>
                </BlurView>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 100,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {isLoading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Gathering discussions...</Text>
                    </View>
                ) : doubts.length > 0 ? (
                    <View style={styles.listContainer}>
                        {doubts.map((doubt, index) => (
                            <Animated.View key={doubt.id} entering={FadeInDown.delay(index * 100).duration(500)}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.messageItem,
                                        pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }
                                    ]}
                                    onPress={() => {
                                        setSelectedDoubt(doubt);
                                        setShowDetailModal(true);
                                        fetchDoubtDetail(doubt.id);
                                    }}
                                >
                                    <View style={styles.cardHeader}>
                                        <View style={styles.avatarRow}>
                                            <View style={[styles.avatar, { backgroundColor: COLORS.primary + "15" }]}>
                                                <Text style={styles.avatarText}>{doubt.user.name.charAt(0)}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.userName}>{doubt.user.name}</Text>
                                                <Text style={styles.timestamp}>
                                                    {format(new Date(doubt.createdAt), "MMM d, h:mm a")}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[doubt.status] + "20" }]}>
                                            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[doubt.status] }]} />
                                            <Text style={[styles.statusText, { color: STATUS_COLORS[doubt.status] }]}>{doubt.status}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardBody}>
                                        <Text style={styles.doubtTitle}>{doubt.title}</Text>
                                        <Text style={styles.doubtBody} numberOfLines={2}>{doubt.content}</Text>
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <View style={styles.subjectBadge}>
                                            <Ionicons name="library-outline" size={12} color={COLORS.primary} />
                                            <Text style={styles.subjectText}>{doubt.subject.name}</Text>
                                        </View>

                                        <View style={styles.footerActions}>
                                            {doubt._count.replies > 0 && (
                                                <View style={styles.replyCounter}>
                                                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.textMuted} />
                                                    <Text style={styles.replyCountText}>{doubt._count.replies}</Text>
                                                </View>
                                            )}
                                            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                                        </View>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        ))}
                    </View>
                ) : (
                    <Animated.View entering={ZoomIn} style={styles.emptyCard}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>Quiet in here...</Text>
                        <Text style={styles.emptyText}>Be the first to ask a doubt or try a different filter.</Text>
                    </Animated.View>
                )}
            </ScrollView>

            <Pressable
                style={[styles.fab, { bottom: insets.bottom + 90 }]} // Lifted above BottomNav
                onPress={() => setShowAskModal(true)}
            >
                <Ionicons name="add" size={30} color="#FFFFFF" />
            </Pressable>

            {user?.role === "parent" ? (
                <ParentBottomNav />
            ) : user?.role === "teacher" ? (
                <TeacherBottomNav />
            ) : (
                <BottomNav />
            )}

            {/* Modal for Adding Doubt */}
            <Modal visible={showAskModal} animationType="slide" transparent={true}>
                <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Ask a Doubt</Text>
                                <Text style={styles.modalSubtitle}>Get help from teachers & peers</Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowAskModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Title</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="What's your question?"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.title}
                                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Subject</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectPicker}>
                                    {subjects.map((s) => (
                                        <TouchableOpacity
                                            key={s.id}
                                            style={[
                                                styles.subjectChip,
                                                formData.subjectId === s.id && styles.activeSubjectChip
                                            ]}
                                            onPress={() => setFormData({ ...formData, subjectId: s.id })}
                                        >
                                            <Text style={[
                                                styles.subjectChipText,
                                                formData.subjectId === s.id && styles.activeSubjectChipText
                                            ]}>{s.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Chapter / Topic (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Thermodynamics"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.chapter}
                                    onChangeText={(text) => setFormData({ ...formData, chapter: text })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Explain your doubt in detail..."
                                    placeholderTextColor={COLORS.textMuted}
                                    multiline
                                    numberOfLines={6}
                                    value={formData.content}
                                    onChangeText={(text) => setFormData({ ...formData, content: text })}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.attachmentBtn, selectedFile && styles.hasAttachment]}
                                onPress={handlePickFile}
                            >
                                <Ionicons
                                    name={selectedFile ? "checkmark-circle" : "attach"}
                                    size={20}
                                    color={selectedFile ? COLORS.success : COLORS.primary}
                                />
                                <Text style={[styles.attachmentBtnText, selectedFile && { color: COLORS.success }]}>
                                    {selectedFile && !selectedFile.canceled ? selectedFile.assets[0].name : "Add Attachment"}
                                </Text>
                                {selectedFile && (
                                    <TouchableOpacity onPress={() => setSelectedFile(null)}>
                                        <Ionicons name="close-circle" size={18} color={COLORS.error} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.submitButton, (isSubmitting || !formData.title || !formData.content || !formData.subjectId) && styles.disabledButton]}
                            onPress={handleCreateDoubt}
                            disabled={isSubmitting || !formData.title || !formData.content || !formData.subjectId}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <LinearGradient
                                    colors={[COLORS.primary, "#6366F1"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitGradient}
                                >
                                    <Text style={styles.submitButtonText}>Post Discussion</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                </LinearGradient>
                            )}
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </BlurView>
            </Modal>

            {/* Modal for Doubt Detail */}
            <Modal visible={showDetailModal} animationType="slide" transparent={false}>
                <View style={styles.detailContainer}>
                    <BlurView intensity={40} tint="light" style={[styles.detailHeader, { paddingTop: insets.top + 10 }]}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => {
                                setShowDetailModal(false);
                                setSelectedDoubt(null);
                                setDoubtDetails(null);
                            }}
                        >
                            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle} numberOfLines={1}>Discussion</Text>
                            <Text style={styles.headerSubtitle}>{selectedDoubt?.subject.name}</Text>
                        </View>
                        {doubtDetails?.status !== "CLOSED" && (
                            <TouchableOpacity style={styles.resolveButton} onPress={handleMarkResolved}>
                                <Ionicons name="checkmark-done" size={18} color={COLORS.success} />
                            </TouchableOpacity>
                        )}
                    </BlurView>

                    {detailLoading ? (
                        <View style={styles.centerLoader}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.loaderText}>Loading discussion...</Text>
                        </View>
                    ) : doubtDetails ? (
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                            style={{ flex: 1 }}
                        >
                            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
                                {/* Original Question Card */}
                                <Animated.View entering={FadeInUp} style={styles.questionCard}>
                                    <View style={styles.authorRow}>
                                        <View style={[styles.avatar, styles.smallAvatar, { backgroundColor: COLORS.primary + "15" }]}>
                                            <Text style={styles.avatarText}>{doubtDetails.user.name.charAt(0)}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.authorName}>{doubtDetails.user.name}</Text>
                                            <Text style={styles.authorMeta}>
                                                {format(new Date(doubtDetails.createdAt), "MMM d, yyyy • h:mm a")}
                                            </Text>
                                        </View>
                                        <View style={styles.opBadge}>
                                            <Text style={styles.opText}>Author</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.detailTitleText}>{doubtDetails.title}</Text>
                                    <Text style={styles.detailContentText}>{doubtDetails.content}</Text>

                                    {doubtDetails.attachmentUrl && (
                                        <View style={styles.attachmentSection}>
                                            {renderAttachment(doubtDetails.attachmentUrl)}
                                        </View>
                                    )}
                                </Animated.View>

                                <View style={styles.repliesHeader}>
                                    <Text style={styles.repliesTitle}>Responses ({doubtDetails.replies.length})</Text>
                                </View>

                                {/* Replies list */}
                                {doubtDetails.replies.map((reply: any, idx: number) => (
                                    <Animated.View
                                        key={reply.id}
                                        entering={FadeInDown.delay(idx * 100)}
                                        style={[styles.replyCard, reply.role === "teacher" && styles.teacherReplyCard]}
                                    >
                                        <View style={styles.replyMain}>
                                            <View style={styles.authorRow}>
                                                <View style={[
                                                    styles.avatar,
                                                    styles.smallAvatar,
                                                    { backgroundColor: reply.role === "teacher" ? "#EEF2FF" : "#F8FAFC" }
                                                ]}>
                                                    <Text style={[styles.avatarText, { color: reply.role === "teacher" ? "#4F46E5" : "#64748B" }]}>
                                                        {reply.user.name.charAt(0)}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <View style={styles.nameRow}>
                                                        <Text style={styles.authorName}>{reply.user.name}</Text>
                                                        {reply.role === "teacher" && (
                                                            <View style={styles.teacherBadge}>
                                                                <Ionicons name="ribbon" size={10} color="#4F46E5" />
                                                                <Text style={styles.teacherBadgeText}>Teacher</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text style={styles.authorMeta}>{format(new Date(reply.createdAt), "MMM d, h:mm a")}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.replyContent}>{reply.content}</Text>
                                            {reply.attachmentUrl && (
                                                <View style={styles.attachmentSection}>
                                                    {renderAttachment(reply.attachmentUrl)}
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.voteBar}>
                                            <TouchableOpacity
                                                style={styles.voteBtn}
                                                onPress={() => handleVote(reply.id, 1)}
                                            >
                                                <Ionicons name="arrow-up" size={16} color={COLORS.textSecondary} />
                                            </TouchableOpacity>
                                            <Text style={styles.voteNumber}>{reply.upvotes || 0}</Text>
                                            <TouchableOpacity
                                                style={styles.voteBtn}
                                                onPress={() => handleVote(reply.id, -1)}
                                            >
                                                <Ionicons name="arrow-down" size={16} color={COLORS.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                    </Animated.View>
                                ))}

                                {doubtDetails.replies.length === 0 && (
                                    <View style={styles.emptyThread}>
                                        <Ionicons name="hourglass-outline" size={40} color={COLORS.textMuted} />
                                        <Text style={styles.emptyThreadText}>No responses yet. Be the first to help!</Text>
                                    </View>
                                )}
                            </ScrollView>

                            {/* Refined Reply Input Area */}
                            {doubtDetails.status !== "CLOSED" ? (
                                <BlurView intensity={60} tint="light" style={[styles.replyDock, { paddingBottom: insets.bottom + 10 }]}>
                                    <View style={styles.replyDockContent}>
                                        <TextInput
                                            style={styles.replyDockInput}
                                            placeholder="Typing a helpful response..."
                                            placeholderTextColor={COLORS.textMuted}
                                            multiline
                                            value={replyContent}
                                            onChangeText={setReplyContent}
                                        />
                                        <TouchableOpacity
                                            style={[styles.replySendBtn, !replyContent.trim() && styles.replySendDisabled]}
                                            onPress={handlePostReply}
                                            disabled={isSubmitting || !replyContent.trim()}
                                        >
                                            {isSubmitting ? (
                                                <ActivityIndicator size="small" color="#FFF" />
                                            ) : (
                                                <Ionicons name="send" size={20} color="#FFF" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </BlurView>
                            ) : (
                                <View style={[styles.closedDock, { paddingBottom: insets.bottom + 20 }]}>
                                    <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
                                    <Text style={styles.closedDockText}>Discussion marked as resolved</Text>
                                </View>
                            )}
                        </KeyboardAvoidingView>
                    ) : null}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    // Hero Section
    heroContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 24,
        overflow: "hidden",
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    heroGradient: {
        padding: 24,
    },
    heroContent: {
        gap: 20,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "#FFF",
    },
    statLabel: {
        fontSize: 12,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: "#FFF",
        fontSize: 15,
    },

    // Filter Section
    filterSection: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    filterBar: {
        flexDirection: "row",
        padding: 6,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.7)",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        gap: 8,
    },
    filterChip: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 14,
    },
    activeChip: {
        backgroundColor: "#FFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    chipText: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.textMuted,
    },
    activeChipText: {
        color: COLORS.primary,
    },

    // List & Cards
    listContainer: {
        padding: 16,
        gap: 16,
    },
    messageItem: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.03)",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    userName: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textPrimary,
    },
    timestamp: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    cardBody: {
        marginBottom: 16,
    },
    doubtTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.textPrimary,
        marginBottom: 6,
        lineHeight: 22,
    },
    doubtBody: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.03)",
    },
    subjectBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.primary + "10",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    subjectText: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.primary,
    },
    footerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    replyCounter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    replyCountText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textMuted,
    },

    // Empty State
    emptyCard: {
        marginTop: 60,
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: "center",
        lineHeight: 20,
    },

    // FAB
    fab: {
        position: "absolute",
        bottom: 100,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },

    // Modals
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: "90%",
        paddingTop: 24,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: COLORS.textPrimary,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBody: {
        flex: 1,
        paddingHorizontal: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textPrimary,
        marginBottom: 10,
        marginLeft: 4,
    },
    input: {
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    subjectPicker: {
        flexDirection: "row",
        marginHorizontal: -4,
    },
    subjectChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: "#F1F5F9",
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    activeSubjectChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    subjectChipText: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    activeSubjectChipText: {
        color: "#FFF",
    },
    attachmentBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: 16,
        borderRadius: 16,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 12,
        marginBottom: 24,
    },
    hasAttachment: {
        borderColor: COLORS.success,
        backgroundColor: COLORS.success + "05",
    },
    attachmentBtnText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.primary,
        fontWeight: "600",
    },
    submitButton: {
        margin: 24,
        borderRadius: 18,
        overflow: "hidden",
    },
    submitGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 56,
        gap: 10,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFF",
    },
    disabledButton: {
        opacity: 0.6,
    },

    // Detail Modal Styles
    detailContainer: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    detailHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: "600",
    },
    resolveButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.success + "15",
        justifyContent: "center",
        alignItems: "center",
    },
    centerLoader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    loaderText: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: "600",
    },
    questionCard: {
        backgroundColor: "#FFF",
        marginHorizontal: 16,
        marginTop: 16,
        padding: 20,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
    },
    authorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
    },
    smallAvatar: {
        width: 36,
        height: 36,
        borderRadius: 12,
    },
    authorName: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textPrimary,
    },
    authorMeta: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 1,
    },
    opBadge: {
        marginLeft: "auto",
        backgroundColor: COLORS.primary + "15",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    opText: {
        fontSize: 10,
        fontWeight: "800",
        color: COLORS.primary,
        textTransform: "uppercase",
    },
    detailTitleText: {
        fontSize: 20,
        fontWeight: "800",
        color: COLORS.textPrimary,
        marginBottom: 10,
        lineHeight: 28,
    },
    detailContentText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    attachmentSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    repliesHeader: {
        paddingHorizontal: 24,
        marginTop: 24,
        marginBottom: 12,
    },
    repliesTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.textPrimary,
    },
    replyCard: {
        backgroundColor: "#FFF",
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 20,
        flexDirection: "row",
        gap: 12,
    },
    teacherReplyCard: {
        borderWidth: 1.5,
        borderColor: "rgba(79, 70, 229, 0.2)",
        backgroundColor: "#F5F3FF",
    },
    replyMain: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    teacherBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4F46E5" + "15",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 4,
    },
    teacherBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#4F46E5",
    },
    replyContent: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 22,
        marginTop: 8,
    },
    voteBar: {
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        paddingVertical: 8,
        gap: 4,
        alignSelf: "flex-start",
    },
    voteBtn: {
        padding: 4,
    },
    voteNumber: {
        fontSize: 13,
        fontWeight: "800",
        color: COLORS.textSecondary,
    },
    emptyThread: {
        alignItems: "center",
        paddingVertical: 40,
        gap: 12,
    },
    emptyThreadText: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: "500",
    },
    replyDock: {
        padding: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    replyDockContent: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 12,
    },
    replyDockInput: {
        flex: 1,
        backgroundColor: "#FFF",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 15,
        color: COLORS.textPrimary,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    replySendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    replySendDisabled: {
        backgroundColor: COLORS.textMuted,
        opacity: 0.5,
    },
    closedDock: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 16,
        backgroundColor: "#F1F5F9",
    },
    closedDockText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textMuted,
    },
    attachmentImage: {
        width: "100%",
        height: 200,
        borderRadius: 15,
        backgroundColor: '#f1f1f1',
    },
    attachmentWrapper: {
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 10,
    },
    fileAttachment: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    fileAttachmentText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    attachmentFile: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 12,
    },
    attachmentFileName: {
        fontSize: 13,
        color: COLORS.primary,
        marginLeft: 8,
        flex: 1,
    }
});

export default DoubtsPage;
