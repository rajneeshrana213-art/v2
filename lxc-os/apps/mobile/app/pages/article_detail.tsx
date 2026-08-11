import { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/lib/api";
import { COLORS } from "@/constants/colors";
import { Article } from "@/lib/types/student";
import { format } from "date-fns";

export default function ArticleDetail() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [submissionContent, setSubmissionContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const fetchArticle = useCallback(async () => {
        if (!id) return;
        try {
            const res = await api.get<Article[]>(`api/v1/dashboard/student/enhancement?type=article`);
            const found = (res as any || []).find((a: Article) => a.id === id);

            if (found) {
                setArticle(found);
                if (found.NewspaperSubmission && found.NewspaperSubmission.length > 0) {
                    setHasSubmitted(true);
                    setSubmissionContent(found.NewspaperSubmission[0].content);
                }
            } else {
                Alert.alert("Not Found", "Article not found");
                router.back();
            }
        } catch (error) {
            console.error("Error fetching article:", error);
            Alert.alert("Error", "Failed to load article");
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    const handleSubmit = async () => {
        if (!submissionContent.trim()) {
            Alert.alert("Required", "Please enter your content first");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("api/v1/dashboard/student/enhancement/article", {
                newspaperId: id,
                content: submissionContent
            });
            Alert.alert("Success", "Submission successful!");
            setHasSubmitted(true);
        } catch (error) {
            console.error("Error submitting article:", error);
            Alert.alert("Error", "Failed to submit");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Opening Article...</Text>
            </View>
        );
    }

    if (!article) return null;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Article</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentPadding as any}>
                    <View style={styles.metaRow as any}>
                        <View style={styles.typeBadge as any}>
                            <Text style={styles.typeBadgeText as any}>{article.submissionType} TASK</Text>
                        </View>
                        <Text style={styles.dateText as any}>{format(new Date(article.createdAt || new Date()), "MMM d, yyyy")}</Text>
                    </View>

                    <Text style={styles.title}>{article.title}</Text>

                    {article.instructions && (
                        <View style={styles.instructionsBox}>
                            <View style={styles.instructionHeader}>
                                <Ionicons name="information-circle" size={20} color="#92400E" />
                                <Text style={styles.instructionTitle}>Teacher's Instructions</Text>
                            </View>
                            <Text style={styles.instructionText}>{article.instructions}</Text>
                        </View>
                    )}

                    <Text style={styles.articleBody}>{article.content}</Text>

                    <View style={styles.divider} />

                    <View style={styles.submissionSection as any}>
                        <View style={styles.submissionHeader as any}>
                            <View style={styles.submissionIcon as any}>
                                <Ionicons name="create" size={24} color="#FFF" />
                            </View>
                            <View>
                                <Text style={styles.submissionTitle as any}>Your Submission</Text>
                                <Text style={styles.submissionSubtitle as any}>
                                    {article.submissionType === "SUMMARY" ? "Write a brief summary of the article." :
                                        article.submissionType === "QA" ? "Answer the questions based on the text." :
                                            "Express your opinion on this topic."}
                                </Text>
                            </View>
                        </View>

                        {hasSubmitted ? (
                            <View style={styles.submittedBox}>
                                <Text style={styles.submittedText}>{submissionContent}</Text>
                                <View style={styles.statusBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                                    <Text style={styles.statusBadgeText}>SUBMITTED</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder={`Type your ${article.submissionType.toLowerCase()} here...`}
                                    value={submissionContent}
                                    onChangeText={setSubmissionContent}
                                    multiline
                                    numberOfLines={8}
                                    textAlignVertical="top"
                                />
                                <TouchableOpacity
                                    style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="send" size={20} color="#FFF" />
                                            <Text style={styles.submitButtonText}>Submit Entry</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF" },
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
    contentPadding: { padding: 20 },
    metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    typeBadge: { backgroundColor: "#DBEAFE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeBadgeText: { fontSize: 10, fontFamily: "Inter_800ExtraBold", color: "#1E40AF" },
    dateText: { fontSize: 13, color: COLORS.textMuted, fontFamily: "Inter_500Medium" },
    title: { fontSize: 28, fontFamily: "Inter_800ExtraBold", color: "#111827", marginBottom: 20, lineHeight: 34 },
    instructionsBox: {
        backgroundColor: "#FEF3C7",
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#FDE68A",
    },
    instructionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    instructionTitle: { fontSize: 14, fontFamily: "Inter_800ExtraBold", color: "#92400E" },
    instructionText: { fontSize: 14, color: "#92400E", fontFamily: "Inter_500Medium", lineHeight: 22 },
    articleBody: {
        fontSize: 18,
        fontFamily: "Inter_400Regular",
        color: "#374151",
        lineHeight: 30,
        marginBottom: 32
    },
    divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 32 },
    submissionSection: { backgroundColor: "#F9FAFB", padding: 20, borderRadius: 32, borderWidth: 1, borderColor: "#F3F4F6" },
    submissionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
    submissionIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
    submissionTitle: { fontSize: 20, fontFamily: "Inter_800ExtraBold", color: "#111827" },
    submissionSubtitle: { fontSize: 13, color: COLORS.textMuted, fontFamily: "Inter_500Medium" },
    inputWrapper: { gap: 16 },
    textArea: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        minHeight: 200,
        fontSize: 16,
        color: COLORS.textPrimary,
        fontFamily: "Inter_400Regular",
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        borderRadius: 16,
        gap: 10,
    },
    submitButtonText: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
    submittedBox: {
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#10B98130",
    },
    submittedText: { fontSize: 16, color: "#4B5563", fontStyle: "italic", lineHeight: 24 },
    statusBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#10B981",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusBadgeText: { color: "#FFF", fontSize: 10, fontFamily: "Inter_800ExtraBold" },
});
