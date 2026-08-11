import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface Role {
  id: string;
  name: string;
  description?: string;
  type?: string;
  isCustom?: boolean;
  permissions?: string[];
  _count?: { users: number };
}

const ROLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  ADMIN: "shield-checkmark",
  TEACHER: "school",
  STUDENT: "person",
  PARENT: "people",
  STAFF: "briefcase",
  ACCOUNTANT: "calculator",
  LIBRARIAN: "library",
  DRIVER: "bus",
};
const ROLE_COLORS = ["#1A73B5", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4", "#EF4444", "#D97706"];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api.get<any>("/api/v1/dashboard/admin/roles");
      const data = (res as any)?.roles ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setRoles(data);
    } catch (err) { console.error("Roles fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchRoles(); }, [fetchRoles]);

  const renderItem = ({ item, index }: { item: Role; index: number }) => {
    const color = ROLE_COLORS[index % ROLE_COLORS.length];
    const icon = ROLE_ICONS[item.type ?? item.name.toUpperCase()] ?? "shield-outline";
    const isOpen = expanded === item.id;
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <TouchableOpacity style={styles.card} onPress={() => setExpanded(isOpen ? null : item.id)} activeOpacity={0.85}>
          <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
            <Ionicons name={icon} size={22} color={color} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.roleName}>{item.name}</Text>
            {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            {item._count ? (
              <View style={[styles.badge, { backgroundColor: color + "15" }]}>
                <Text style={[styles.badgeText, { color }]}>{item._count.users} users</Text>
              </View>
            ) : null}
            {item.isCustom && (
              <View style={[styles.badge, { backgroundColor: COLORS.warning + "20" }]}>
                <Text style={[styles.badgeText, { color: COLORS.warning }]}>Custom</Text>
              </View>
            )}
          </View>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        {isOpen && item.permissions && item.permissions.length > 0 && (
          <View style={styles.permsContainer}>
            <Text style={styles.permsTitle}>Permissions ({item.permissions.length})</Text>
            <View style={styles.permsGrid}>
              {item.permissions.map((p) => (
                <View key={p} style={[styles.permBadge, { borderColor: color + "40" }]}>
                  <Text style={[styles.permText, { color }]}>{p.replace(/_/g, " ")}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Roles" subtitle={`${roles.length} roles defined`} />
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={roles}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="shield-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No roles found</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  iconBox: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  roleName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  desc: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  permsContainer: { backgroundColor: COLORS.background, borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: COLORS.border },
  permsTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary, marginBottom: 8 },
  permsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  permBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, backgroundColor: "transparent" },
  permText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
