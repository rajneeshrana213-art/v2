import { useState, useEffect, useCallback, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Pressable,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { LibraryBook } from "@/lib/types/student";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight, Layout } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function BrowseBooksPage() {
  const { user } = useAuth();

    const insets = useSafeAreaInsets();
    const [books, setBooks] = useState<LibraryBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const categories = useMemo(() => {
        const cats = ["All", ...new Set(books.map((b) => b.category))];
        return cats;
    }, [books]);

    const fetchBooks = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setIsLoading(true);

        try {
            const q = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
            const response = await api.get<LibraryBook[]>(`/api/v1/dashboard/student/library${q}`);
            setBooks(response as any || []);
        } catch (error) {
            console.error("Error fetching library books:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBooks();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchBooks]);

    const onRefresh = useCallback(() => fetchBooks(true), [fetchBooks]);

    const filteredBooks = useMemo(() => {
        if (selectedCategory === "All") return books;
        return books.filter((b) => b.category === selectedCategory);
    }, [books, selectedCategory]);

    const stats = useMemo(() => {
        return {
            total: books.length,
            available: books.filter((b) => b.availableCopies > 0).length,
        };
    }, [books]);

    return (
        <View style={styles.container}>
            <PageHeader title="Library" subtitle="Explore Knowledge" />

            <View style={styles.searchSection}>
                <BlurView intensity={80} style={styles.searchBlur}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search titles, authors..."
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
                    <LinearGradient colors={["#6366F1", "#A855F7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total Books</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.available}</Text>
                            <Text style={styles.statLabel}>Available Now</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <View style={styles.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
                        {categories.map((cat, idx) => (
                            <Animated.View key={cat} entering={FadeInRight.delay(idx * 50)}>
                                <Pressable
                                    onPress={() => setSelectedCategory(cat)}
                                    style={[styles.categoryChip, selectedCategory === cat && styles.activeChip]}
                                >
                                    <Text style={[styles.categoryText, selectedCategory === cat && styles.activeCategoryText]}>{cat}</Text>
                                </Pressable>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.booksGrid}>
                    {isLoading && !refreshing ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : filteredBooks.length > 0 ? (
                        filteredBooks.map((book, index) => (
                            <Animated.View key={book.id} entering={FadeInDown.delay(index * 100)} layout={Layout.springify()}>
                                <Pressable style={styles.bookCard}>
                                    <View style={[styles.bookIconBox, { backgroundColor: COLORS.primary + "10" }]}>
                                        <Ionicons name="book" size={28} color={COLORS.primary} />
                                        <View style={[styles.statusIndicator, { backgroundColor: book.availableCopies > 0 ? COLORS.success : COLORS.error }]} />
                                    </View>
                                    <View style={styles.bookInfo}>
                                        <Text style={styles.bookCategory}>{book.category}</Text>
                                        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                                        <Text style={styles.bookAuthor}>by {book.author}</Text>
                                        <View style={styles.bookFooter}>
                                            <View style={styles.copyBadge}>
                                                <Text style={styles.copyText}>{book.availableCopies} Copies Left</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
                                        </View>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={64} color={COLORS.border} />
                            <Text style={styles.emptyTitle}>No matching books</Text>
                            <Text style={styles.emptySubtitle}>Try different keywords or filters</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {user?.role === "parent" ? <ParentBottomNav /> : <BottomNav />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    searchSection: { padding: 16, backgroundColor: COLORS.background },
    searchBlur: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.7)", borderWidth: 1, borderColor: COLORS.border, gap: 12, overflow: "hidden" },
    searchInput: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium", color: COLORS.textPrimary },

    heroSection: { paddingHorizontal: 16, marginBottom: 24 },
    statsCard: { padding: 24, borderRadius: 24, flexDirection: "row", alignItems: "center", elevation: 8, shadowColor: "#6366F1", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
    statItem: { flex: 1, alignItems: "center" },
    statValue: { fontSize: 28, fontFamily: "Inter_900Black", color: "#FFFFFF" },
    statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 4 },
    statDivider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.2)" },

    filterSection: { marginBottom: 20 },
    categoryList: { paddingHorizontal: 16, gap: 10 },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: COLORS.border },
    activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    categoryText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary },
    activeCategoryText: { color: "#FFFFFF" },

    booksGrid: { paddingHorizontal: 16, gap: 12 },
    bookCard: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 12, borderWidth: 1, borderColor: COLORS.border, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    bookIconBox: { width: 70, height: 90, borderRadius: 14, alignItems: "center", justifyContent: "center", position: "relative" },
    statusIndicator: { position: "absolute", top: -4, right: -4, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#FFFFFF" },
    bookInfo: { flex: 1, marginLeft: 16, justifyContent: "center" },
    bookCategory: { fontSize: 10, fontFamily: "Inter_700Bold", color: COLORS.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
    bookTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 2 },
    bookAuthor: { fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginBottom: 8 },
    bookFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    copyBadge: { backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border },
    copyText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary },

    emptyState: { alignItems: "center", paddingVertical: 80, gap: 12 },
    emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
    emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
});
