import { useState, useCallback, useEffect, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Platform,
    Dimensions,
    Linking,
    KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as WebBrowser from "expo-web-browser";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { api } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getISTNowParts } from "@/lib/date-utils";

const BASE_URL = "https://beta.learnxchain.com";
const TOKEN_KEY = "@learnxchain_token";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ClassInfo { id: string; name: string; }
interface SubjectInfo { id: string; name: string; classId: string; }

interface PYQItem {
    id: string;
    title: string;
    year: number;
    fileUrl: string;
    class: { id: string; name: string };
    subject: { id: string; name: string };
    uploader: { name: string };
    createdAt: string;
}

const SUBJECT_COLORS = [
    "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#06B6D4", "#EC4899", "#84CC16",
];

const { height } = Dimensions.get("window");
const currentYear = getISTNowParts().year;
const YEARS = Array.from({ length: 15 }, (_, i) => currentYear - i);

// ────────────────────────────────────────────────────────────────────────────────
export default function TeacherPYQPage() {
    const insets = useSafeAreaInsets();

    // List state
    const [pyqs, setPyqs] = useState<PYQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSubject, setFilterSubject] = useState<string | null>(null);

    // Metadata
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [subjects, setSubjects] = useState<SubjectInfo[]>([]);

    // Upload modal state
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [selectedYear, setSelectedYear] = useState(currentYear - 1);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [pickedFile, setPickedFile] = useState<{ name: string; uri: string; type: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);

    const filteredSubjects = subjects.filter(s => s.classId === selectedClassId);

    // ── Fetch list ──────────────────────────────────────────────────────────────
    const fetchPYQs = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const data = await api.get<PYQItem[]>("/api/v1/dashboard/teacher/pyq");
            setPyqs((data as any) || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    // ── Fetch metadata ──────────────────────────────────────────────────────────
    const fetchMetadata = useCallback(async () => {
        try {
            const data = await api.get<{ classes: ClassInfo[]; subjects: SubjectInfo[] }>(
                "/api/v1/dashboard/teacher/homework/metadata"
            );
            const d = data as any;
            setClasses(d?.classes || []);
            setSubjects(d?.subjects || []);
            if (d?.classes?.length > 0) setSelectedClassId(d.classes[0].id);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchPYQs(); fetchMetadata(); }, []);

    // ── Pick file ───────────────────────────────────────────────────────────────
    const handlePickFile = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets?.length > 0) {
                const asset = result.assets[0];
                setPickedFile({
                    name: asset.name,
                    uri: asset.uri,
                    type: asset.mimeType || "application/pdf",
                });
            }
        } catch (e) { Alert.alert("Error", "Could not pick file."); }
    }, []);

    // ── Upload PYQ ──────────────────────────────────────────────────────────────
    const handleUpload = useCallback(async () => {
        if (!title.trim()) return Alert.alert("Missing", "Please enter a title.");
        if (!selectedClassId) return Alert.alert("Missing", "Please select a class.");
        if (!selectedSubjectId) return Alert.alert("Missing", "Please select a subject.");
        if (!pickedFile) return Alert.alert("Missing", "Please attach a PDF or image file.");

        setUploading(true);
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            const form = new FormData();
            form.append("title", title.trim());
            form.append("year", String(selectedYear));
            form.append("classId", selectedClassId);
            form.append("subjectId", selectedSubjectId);
            form.append("file", {
                uri: pickedFile.uri,
                name: pickedFile.name,
                type: pickedFile.type,
            } as any);

            const res = await fetch(`${BASE_URL}/api/v1/dashboard/teacher/pyq`, {
                method: "POST",
                body: form,
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Upload failed");
            }

            Alert.alert("Uploaded!", "PYQ has been added successfully.");
            setShowModal(false);
            resetForm();
            fetchPYQs();
        } catch (e: any) {
            Alert.alert("Upload Failed", e?.message || "Something went wrong.");
        } finally { setUploading(false); }
    }, [title, selectedYear, selectedClassId, selectedSubjectId, pickedFile, fetchPYQs]);

    const resetForm = () => {
        setTitle(""); setSelectedYear(currentYear - 1);
        setSelectedSubjectId(""); setPickedFile(null);
    };

    // ── Delete PYQ ──────────────────────────────────────────────────────────────
    const handleDelete = useCallback((pyq: PYQItem) => {
        Alert.alert(
            "Delete PYQ",
            `Remove "${pyq.title}" (${pyq.year})?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/api/v1/dashboard/teacher/pyq?id=${pyq.id}`);
                            setPyqs(prev => prev.filter(p => p.id !== pyq.id));
                        } catch (e: any) {
                            Alert.alert("Error", e?.message || "Failed to delete.");
                        }
                    },
                },
            ]
        );
    }, []);

    // ── View file ───────────────────────────────────────────────────────────────
    const handleView = useCallback(async (url: string) => {
        try {
            await WebBrowser.openBrowserAsync(url);
        } catch {
            Linking.openURL(url);
        }
    }, []);

    // ── Filtered PYQs ───────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = pyqs;
        if (filterSubject) list = list.filter(p => p.subject?.id === filterSubject);
        if (searchQuery) list = list.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.subject?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(p.year).includes(searchQuery)
        );
        return list;
    }, [pyqs, filterSubject, searchQuery]);

    const uniqueSubjects = useMemo(() => {
        const seen = new Set<string>();
        return pyqs.filter(p => { const ok = !seen.has(p.subject?.id); seen.add(p.subject?.id); return ok; })
            .map(p => ({ id: p.subject?.id, name: p.subject?.name }));
    }, [pyqs]);

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>

            {/* Header */}
            <LinearGradient
                colors={["#4F46E5", "#7C3AED", "#9333EA"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Previous Year Papers</Text>
                    <Text style={styles.headerSub}>Manage PYQ repository</Text>
                </View>
                <Pressable onPress={() => setShowModal(true)} style={styles.addBtn}>
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                </Pressable>
            </LinearGradient>

            {/* Stats */}
            {!loading && (
                <Animated.View entering={FadeInDown.duration(350)} style={styles.statsRow}>
                    {[
                        { icon: "document-text" as const, color: "#4F46E5", bg: "#EEF2FF", label: "Papers", value: pyqs.length },
                        { icon: "book" as const, color: "#10B981", bg: "#ECFDF5", label: "Subjects", value: uniqueSubjects.length },
                        { icon: "school" as const, color: "#F59E0B", bg: "#FFFBEB", label: "Classes", value: new Set(pyqs.map(p => p.class?.id)).size },
                    ].map(s => (
                        <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
                            <Ionicons name={s.icon} size={18} color={s.color} />
                            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                            <Text style={styles.statLbl}>{s.label}</Text>
                        </View>
                    ))}
                </Animated.View>
            )}

            {/* Search */}
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={16} color="#94A3B8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by title, subject, year…"
                        placeholderTextColor="#CBD5E1"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={16} color="#CBD5E1" />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Subject filter chips */}
            {uniqueSubjects.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                    <Pressable
                        onPress={() => setFilterSubject(null)}
                        style={[styles.chip, !filterSubject && styles.chipActive]}
                    >
                        <Text style={[styles.chipText, !filterSubject && styles.chipTextActive]}>All</Text>
                    </Pressable>
                    {uniqueSubjects.map(s => (
                        <Pressable
                            key={s.id}
                            onPress={() => setFilterSubject(filterSubject === s.id ? null : s.id ?? null)}
                            style={[styles.chip, filterSubject === s.id && styles.chipActive]}
                        >
                            <Text style={[styles.chipText, filterSubject === s.id && styles.chipTextActive]}>{s.name}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}

            {/* List */}
            {loading ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loaderText}>Loading papers…</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 140 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchPYQs(true)} tintColor="#4F46E5" />
                    }
                >
                    {filtered.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="document-text-outline" size={40} color="#CBD5E1" />
                            </View>
                            <Text style={styles.emptyTitle}>No papers yet</Text>
                            <Text style={styles.emptySubtitle}>Upload the first PYQ using the button above.</Text>
                            <Pressable onPress={() => setShowModal(true)} style={styles.emptyBtn}>
                                <Ionicons name="cloud-upload" size={18} color="#4F46E5" />
                                <Text style={styles.emptyBtnText}>Upload PYQ</Text>
                            </Pressable>
                        </View>
                    ) : (
                        filtered.map((pyq, idx) => {
                            const accentColor = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                            return (
                                <Animated.View key={pyq.id} entering={FadeInDown.delay(idx * 50)} layout={Layout.springify()}>
                                    <View style={styles.pyqCard}>
                                        <View style={[styles.pyqAccent, { backgroundColor: accentColor }]} />
                                        <View style={[styles.pyqIconBox, { backgroundColor: accentColor + "18" }]}>
                                            <Ionicons name="document-text" size={22} color={accentColor} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.pyqTitle} numberOfLines={2}>{pyq.title}</Text>
                                            <View style={styles.pyqMeta}>
                                                <View style={[styles.yearBadge, { backgroundColor: accentColor + "18" }]}>
                                                    <Text style={[styles.yearText, { color: accentColor }]}>{pyq.year}</Text>
                                                </View>
                                                <Text style={styles.pyqMetaText}>
                                                    {pyq.class?.name}  ·  {pyq.subject?.name}
                                                </Text>
                                            </View>
                                            <Text style={styles.uploaderText}>by {pyq.uploader?.name}</Text>
                                        </View>
                                        {/* Actions */}
                                        <View style={styles.actionCol}>
                                            <Pressable
                                                onPress={() => pyq.fileUrl && handleView(pyq.fileUrl)}
                                                style={[styles.actionBtn, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}
                                            >
                                                <Ionicons name="eye" size={16} color="#4F46E5" />
                                            </Pressable>
                                            <Pressable
                                                onPress={() => pyq.fileUrl && Linking.openURL(pyq.fileUrl)}
                                                style={[styles.actionBtn, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}
                                            >
                                                <Ionicons name="download" size={16} color="#10B981" />
                                            </Pressable>
                                            <Pressable
                                                onPress={() => handleDelete(pyq)}
                                                style={[styles.actionBtn, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}
                                            >
                                                <Ionicons name="trash" size={16} color="#EF4444" />
                                            </Pressable>
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        })
                    )}
                </ScrollView>
            )}

            {/* FAB */}
            <Animated.View entering={FadeInUp.delay(300)} style={[styles.fab, { bottom: insets.bottom + 90 }]}>
                <Pressable
                    onPress={() => setShowModal(true)}
                    style={({ pressed }) => [pressed && { transform: [{ scale: 0.93 }] }]}
                >
                    <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.fabGradient}>
                        <Ionicons name="cloud-upload" size={24} color="#fff" />
                    </LinearGradient>
                </Pressable>
            </Animated.View>

            <TeacherBottomNav />

            {/* ══════════════ UPLOAD MODAL ══════════════ */}
            <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <Pressable style={styles.overlay} onPress={() => setShowModal(false)} />
                    <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>

                        <View style={styles.dragHandle} />

                        <View style={styles.sheetHeader}>
                            <View>
                                <Text style={styles.sheetTitle}>Upload PYQ</Text>
                                <Text style={styles.sheetSub}>PDF or image, max 10 MB</Text>
                            </View>
                            <Pressable onPress={() => setShowModal(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={20} color="#64748B" />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                            {/* Title */}
                            <Text style={styles.label}>Title <Text style={{ color: "#EF4444" }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Mathematics Mid-Term 2023"
                                placeholderTextColor="#CBD5E1"
                                value={title}
                                onChangeText={setTitle}
                            />

                            {/* Year */}
                            <Text style={styles.label}>Year <Text style={{ color: "#EF4444" }}>*</Text></Text>
                            <Pressable onPress={() => setShowYearPicker(!showYearPicker)} style={styles.pickerBtn}>
                                <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
                                <Text style={styles.pickerBtnText}>{selectedYear}</Text>
                                <Ionicons name={showYearPicker ? "chevron-up" : "chevron-down"} size={16} color="#CBD5E1" />
                            </Pressable>
                            {showYearPicker && (
                                <View style={styles.yearDropdown}>
                                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                        {YEARS.map(y => (
                                            <Pressable
                                                key={y}
                                                onPress={() => { setSelectedYear(y); setShowYearPicker(false); }}
                                                style={[styles.yearOption, y === selectedYear && styles.yearOptionActive]}
                                            >
                                                <Text style={[styles.yearOptionText, y === selectedYear && { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>
                                                    {y}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* Class */}
                            <Text style={styles.label}>Class <Text style={{ color: "#EF4444" }}>*</Text></Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                    {classes.map(cls => (
                                        <Pressable
                                            key={cls.id}
                                            onPress={() => { setSelectedClassId(cls.id); setSelectedSubjectId(""); }}
                                            style={[styles.optChip, selectedClassId === cls.id && styles.optChipActive]}
                                        >
                                            <Text style={[styles.optChipText, selectedClassId === cls.id && { color: "#fff" }]}>{cls.name}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </ScrollView>

                            {/* Subject */}
                            <Text style={styles.label}>Subject <Text style={{ color: "#EF4444" }}>*</Text></Text>
                            {filteredSubjects.length === 0 ? (
                                <Text style={styles.noDataText}>{selectedClassId ? "No subjects for this class" : "Select a class first"}</Text>
                            ) : (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                    <View style={{ flexDirection: "row", gap: 8 }}>
                                        {filteredSubjects.map(sub => (
                                            <Pressable
                                                key={sub.id}
                                                onPress={() => setSelectedSubjectId(sub.id)}
                                                style={[styles.optChip, selectedSubjectId === sub.id && styles.optChipActive]}
                                            >
                                                <Text style={[styles.optChipText, selectedSubjectId === sub.id && { color: "#fff" }]}>{sub.name}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </ScrollView>
                            )}

                            {/* File */}
                            <Text style={styles.label}>File (PDF / Image) <Text style={{ color: "#EF4444" }}>*</Text></Text>
                            <Pressable onPress={handlePickFile} style={styles.filePicker}>
                                <Ionicons name={pickedFile ? "document" : "cloud-upload-outline"} size={28} color={pickedFile ? "#4F46E5" : "#94A3B8"} />
                                <Text style={[styles.filePickerText, pickedFile && { color: "#4F46E5" }]}>
                                    {pickedFile ? pickedFile.name : "Tap to select PDF or image"}
                                </Text>
                                {pickedFile && (
                                    <Pressable onPress={() => setPickedFile(null)} style={styles.clearFile}>
                                        <Ionicons name="close-circle" size={18} color="#EF4444" />
                                    </Pressable>
                                )}
                            </Pressable>

                            {/* Submit */}
                            <Pressable
                                onPress={handleUpload}
                                disabled={uploading}
                                style={({ pressed }) => [styles.uploadBtn, uploading && { opacity: 0.6 }, pressed && { transform: [{ scale: 0.97 }] }]}
                            >
                                <LinearGradient colors={["#4F46E5", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.uploadBtnGradient}>
                                    {uploading ? <ActivityIndicator color="#fff" /> : (
                                        <>
                                            <Ionicons name="cloud-upload" size={20} color="#fff" />
                                            <Text style={styles.uploadBtnText}>Upload PYQ</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </Pressable>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFF" },

    header: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 16, paddingBottom: 22,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
    headerSub: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.72)", marginTop: 2 },
    addBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.25)",
        alignItems: "center", justifyContent: "center",
    },

    statsRow: {
        flexDirection: "row", marginHorizontal: 16, marginTop: 16, gap: 10,
    },
    statCard: {
        flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, gap: 3,
    },
    statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
    statLbl: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.4 },

    searchRow: { paddingHorizontal: 16, marginTop: 14, marginBottom: 4 },
    searchBox: {
        flexDirection: "row", alignItems: "center", gap: 10,
        backgroundColor: "#FFFFFF", borderRadius: 14,
        borderWidth: 1, borderColor: "#E2E8F0",
        paddingHorizontal: 14, paddingVertical: 11,
        shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: "#1E293B" },

    chipRow: { marginBottom: 4, paddingVertical: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12,
        borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFFFFF",
    },
    chipActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
    chipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#64748B" },
    chipTextActive: { color: "#fff" },

    loaderBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loaderText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#94A3B8" },
    emptyBox: { alignItems: "center", paddingVertical: 80, gap: 12 },
    emptyIcon: { width: 80, height: 80, borderRadius: 28, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", marginBottom: 4 },
    emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#1E293B" },
    emptySubtitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#94A3B8", textAlign: "center", paddingHorizontal: 32 },
    emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, backgroundColor: "#EEF2FF", borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: "#C7D2FE" },
    emptyBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#4F46E5" },

    pyqCard: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#FFFFFF", borderRadius: 18,
        marginBottom: 12, overflow: "hidden",
        paddingVertical: 14, paddingRight: 14, gap: 12,
        shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.09, shadowRadius: 10, elevation: 3,
    },
    pyqAccent: { width: 5, alignSelf: "stretch" },
    pyqIconBox: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    pyqTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1E293B", marginBottom: 5 },
    pyqMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
    yearBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    yearText: { fontSize: 11, fontFamily: "Inter_800ExtraBold" },
    pyqMetaText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#94A3B8" },
    uploaderText: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#CBD5E1" },
    actionCol: { gap: 6 },
    actionBtn: {
        width: 36, height: 36, borderRadius: 11,
        alignItems: "center", justifyContent: "center", borderWidth: 1,
    },

    fab: { position: "absolute", right: 20 },
    fabGradient: {
        width: 56, height: 56, borderRadius: 18,
        alignItems: "center", justifyContent: "center",
        shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
    },

    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
    sheet: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 24, maxHeight: height * 0.90,
        shadowColor: "#000", shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12, shadowRadius: 24, elevation: 20,
    },
    dragHandle: {
        width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0",
        alignSelf: "center", marginBottom: 20,
    },
    sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
    sheetTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1E293B" },
    sheetSub: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#94A3B8", marginTop: 3 },
    closeBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },

    label: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#475569", marginBottom: 8 },
    input: {
        backgroundColor: "#F8FAFF", borderRadius: 14,
        borderWidth: 1, borderColor: "#E2E8F0",
        paddingHorizontal: 16, paddingVertical: 13,
        fontSize: 14, fontFamily: "Inter_500Medium", color: "#1E293B", marginBottom: 18,
    },
    pickerBtn: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: "#EEF2FF", borderRadius: 14,
        borderWidth: 1, borderColor: "#C7D2FE",
        paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8,
    },
    pickerBtnText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#4F46E5" },
    yearDropdown: {
        backgroundColor: "#FFFFFF", borderRadius: 14,
        borderWidth: 1, borderColor: "#E2E8F0",
        marginBottom: 16, overflow: "hidden",
        shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    yearOption: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F8FAFF" },
    yearOptionActive: { backgroundColor: "#EEF2FF" },
    yearOptionText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#1E293B" },

    optChip: {
        paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12,
        borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F8FAFF",
    },
    optChipActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
    optChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#64748B" },
    noDataText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#94A3B8", marginBottom: 16 },

    filePicker: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: "#F8FAFF", borderRadius: 14,
        borderWidth: 1.5, borderColor: "#E2E8F0", borderStyle: "dashed",
        paddingHorizontal: 16, paddingVertical: 20, marginBottom: 24,
    },
    filePickerText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: "#94A3B8" },
    clearFile: { padding: 2 },

    uploadBtn: { borderRadius: 16, marginTop: 8 },
    uploadBtnGradient: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 10, paddingVertical: 16, borderRadius: 16,
    },
    uploadBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
