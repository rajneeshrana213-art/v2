import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

type Tab = "books" | "members" | "circulation";

interface Book { id: string; title: string; author?: string; isbn?: string; category?: string; available: number; total: number }
interface Member { id: string; memberNo: string; user: { name: string; role: string }; status: string }
interface Circulation { id: string; book: { title: string }; member: { user: { name: string } }; issueDate: string; returnDate?: string; status: string }

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "books", label: "Books", icon: "book-outline" },
  { key: "members", label: "Members", icon: "people-outline" },
  { key: "circulation", label: "Issued", icon: "repeat-outline" },
];

export default function AdminLibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("books");
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [circulation, setCirculation] = useState<Circulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [bRes, mRes, cRes] = await Promise.allSettled([
        api.get<any>("/api/v1/dashboard/admin/library/books"),
        api.get<any>("/api/v1/dashboard/admin/library/members"),
        api.get<any>("/api/v1/dashboard/admin/library/circulation"),
      ]);
      if (bRes.status === "fulfilled") { const d = bRes.value as any; setBooks(Array.isArray(d) ? d : d?.books ?? d?.data ?? []); }
      if (mRes.status === "fulfilled") { const d = mRes.value as any; setMembers(Array.isArray(d) ? d : d?.members ?? d?.data ?? []); }
      if (cRes.status === "fulfilled") { const d = cRes.value as any; setCirculation(Array.isArray(d) ? d : d?.circulation ?? d?.data ?? []); }
    } catch (err) { console.error("Library fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const renderBook = ({ item, index }: { item: Book; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()} style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: "#D9770620" }]}>
        <Ionicons name="book" size={20} color="#D97706" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.title}>{item.title}</Text>
        {item.author ? <Text style={styles.sub}>{item.author}</Text> : null}
        {item.category ? <Text style={styles.sub}>{item.category}</Text> : null}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.availText, { color: item.available > 0 ? COLORS.success : COLORS.error }]}>
          {item.available}/{item.total}
        </Text>
        <Text style={styles.availLabel}>available</Text>
      </View>
    </Animated.View>
  );

  const renderMember = ({ item, index }: { item: Member; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()} style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.user.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.title}>{item.user.name}</Text>
        <Text style={styles.sub}>{item.user.role} · #{item.memberNo}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: item.status === "ACTIVE" ? COLORS.success + "20" : COLORS.error + "20" }]}>
        <Text style={[styles.badgeText, { color: item.status === "ACTIVE" ? COLORS.success : COLORS.error }]}>{item.status}</Text>
      </View>
    </Animated.View>
  );

  const renderCirc = ({ item, index }: { item: Circulation; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()} style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: "#10B98120" }]}>
        <Ionicons name="repeat" size={18} color="#10B981" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.title}>{item.book.title}</Text>
        <Text style={styles.sub}>{item.member.user.name}</Text>
        <Text style={styles.sub}>{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : ""}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: item.status === "RETURNED" ? COLORS.success + "20" : COLORS.warning + "20" }]}>
        <Text style={[styles.badgeText, { color: item.status === "RETURNED" ? COLORS.success : COLORS.warning }]}>{item.status}</Text>
      </View>
    </Animated.View>
  );

  const data = activeTab === "books" ? books : activeTab === "members" ? members : circulation;
  const render = activeTab === "books" ? renderBook : activeTab === "members" ? renderMember : renderCirc;

  return (
    <View style={styles.container}>
      <PageHeader title="Library" />
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && styles.tabActive]} onPress={() => setActiveTab(t.key)}>
            <Ionicons name={t.icon} size={15} color={activeTab === t.key ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={data as any[]}
          keyExtractor={(i: any) => i.id}
          renderItem={render as any}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="library-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No data found</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  tabText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontFamily: "Inter_600SemiBold" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.primary },
  title: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  availText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  availLabel: { fontSize: 9, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
