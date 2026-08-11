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
  Linking,
  Dimensions,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { PYQ } from "@/lib/types/student";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeInDown, Layout } from "react-native-reanimated";
import { useAuth } from "@/lib/auth-context";

const { width } = Dimensions.get("window");

interface Subject {
  id: string;
  name: string;
}

const SUBJECT_THEMES: Record<string, { primary: string; secondary: string }> = {
  Mathematics: { primary: "#3B82F6", secondary: "#DBEAFE" },
  Physics: { primary: "#8B5CF6", secondary: "#EDE9FE" },
  English: { primary: "#10B981", secondary: "#D1FAE5" },
  Chemistry: { primary: "#F59E0B", secondary: "#FEF3C7" },
  "Computer Science": { primary: "#06B6D4", secondary: "#CFFAFE" },
  Hindi: { primary: "#EC4899", secondary: "#FCE7F3" },
  Default: { primary: COLORS.primary, secondary: COLORS.primary + "15" },
};

function PYQsPage() {
  const { user } = useAuth();

  // Redirect teachers to dedicated page
  useEffect(() => {
    if (user?.role === "teacher") {
      router.replace("/pages/teacher-pyq" as any);
    }
  }, [user?.role]);

  const insets = useSafeAreaInsets();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubjects = async () => {
    try {
      const response = await api.get<Subject[]>("/api/v1/dashboard/student/subjects");
      setSubjects(response as any || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchPYQs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await api.get<PYQ[]>("/api/v1/dashboard/student/pyq");
      setPyqs(response as any || []);
    } catch (error) {
      console.error("Error fetching PYQs:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchPYQs();
  }, [fetchPYQs]);

  const onRefresh = useCallback(() => fetchPYQs(true), [fetchPYQs]);

  const filteredPYQs = useMemo(() => {
    let filtered = pyqs;

    if (selectedSubject) {
      filtered = filtered.filter(item => item.subject.name === selectedSubject);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.year).includes(searchQuery)
      );
    }
    return filtered;
  }, [pyqs, selectedSubject, searchQuery]);

  const handleViewPaper = async (url: string) => {
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(url, {
          toolbarColor: COLORS.primary,
          enableBarCollapsing: true,
          showTitle: true,
        });
      }
    } catch (error) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Resources" subtitle="Previous Year Questions" />

      <View style={styles.searchSection}>
        <BlurView intensity={80} style={styles.searchBlur}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search papers by title or year..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </Pressable>
          )}
        </BlurView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.heroSection}>
          <LinearGradient colors={["#4F46E5", "#06B6D4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pyqs.length}</Text>
              <Text style={styles.statLabel}>Question Papers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="cloud-done" size={28} color="#FFFFFF" />
              <Text style={styles.statLabel}>Verified Sources</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectList}>
            <Pressable
              style={[styles.subjectChip, selectedSubject === null && styles.activeChip]}
              onPress={() => setSelectedSubject(null)}
            >
              <Text style={[styles.chipText, selectedSubject === null && styles.activeChipText]}>All Subjects</Text>
            </Pressable>
            {subjects.map((subject) => (
              <Pressable
                key={subject.id}
                style={[styles.subjectChip, selectedSubject === subject.name && styles.activeChip]}
                onPress={() => setSelectedSubject(subject.name)}
              >
                <Text style={[styles.chipText, selectedSubject === subject.name && styles.activeChipText]}>{subject.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading repository...</Text>
          </View>
        ) : filteredPYQs.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredPYQs.map((item, index) => {
              const theme = SUBJECT_THEMES[item.subject.name] || SUBJECT_THEMES.Default;
              return (
                <Animated.View key={item.id} entering={FadeInUp.delay(index * 100)} layout={Layout.springify()} style={styles.pyqCard}>
                  <View style={[styles.cardIcon, { backgroundColor: theme.secondary }]}>
                    <Ionicons name="document-text" size={24} color={theme.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.yearBadge, { backgroundColor: theme.primary + "15" }]}>
                        <Text style={[styles.yearText, { color: theme.primary }]}>{item.year}</Text>
                      </View>
                      <Text style={[styles.subjectLabel, { color: theme.primary }]}>{item.subject.name}</Text>
                    </View>
                    <Text style={styles.pyqTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.uploaderText}>Shared by {item.uploader.name}</Text>
                  </View>

                  <View style={styles.actionColumn}>
                    <Pressable
                      style={[styles.actionBtn, styles.viewBtn]}
                      onPress={() => item.fileUrl && handleViewPaper(item.fileUrl)}
                    >
                      <Ionicons name="eye" size={18} color={COLORS.primary} />
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, styles.downloadBtn]}
                      onPress={() => item.fileUrl && Linking.openURL(item.fileUrl)}
                    >
                      <Ionicons name="download" size={18} color={COLORS.success} />
                    </Pressable>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No question papers found</Text>
            <Text style={styles.emptySubtext}>Try a different search or select a specific subject.</Text>
          </View>
        )}
      </ScrollView>

      {user?.role === "parent" ? <ParentBottomNav /> : user?.role === "teacher" ? <TeacherBottomNav /> : <BottomNav />}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchSection: { padding: 16, backgroundColor: COLORS.background },
  searchBlur: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.7)", borderWidth: 1, borderColor: COLORS.border, gap: 12, overflow: "hidden" },
  searchInput: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium", color: COLORS.textPrimary },

  heroSection: { paddingHorizontal: 16, marginBottom: 8 },
  statsCard: { padding: 24, borderRadius: 24, flexDirection: "row", alignItems: "center", elevation: 8, shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 28, fontFamily: "Inter_900Black", color: "#FFFFFF" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.2)" },

  filterSection: { paddingVertical: 16 },
  subjectList: { paddingHorizontal: 16, gap: 10 },
  subjectChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: COLORS.border },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary },
  activeChipText: { color: "#FFFFFF" },

  listContainer: { padding: 16 },
  pyqCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 16, borderRadius: 22, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  cardIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1, marginLeft: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  yearBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  yearText: { fontSize: 10, fontFamily: "Inter_800ExtraBold" },
  subjectLabel: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  pyqTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 4 },
  uploaderText: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted },

  actionColumn: { gap: 8, marginLeft: 12 },
  actionBtn: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  viewBtn: { backgroundColor: COLORS.primary + "08", borderColor: COLORS.primary + "20" },
  downloadBtn: { backgroundColor: COLORS.success + "08", borderColor: COLORS.success + "20" },

  loaderContainer: { paddingVertical: 100, alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary },

  emptyState: { alignItems: "center", paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  emptySubtext: { fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textMuted, textAlign: "center" },
});

export default PYQsPage;
