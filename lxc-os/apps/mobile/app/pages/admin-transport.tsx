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

type Tab = "buses" | "routes" | "drivers";

interface Bus { id: string; busNumber: string; capacity: number; status: string; driver?: { user: { name: string } }; route?: { name: string } }
interface Route { id: string; name: string; distance?: number; _count?: { stops: number; assignments: number } }
interface Driver { id: string; licenseNumber?: string; status: string; user: { name: string; phone?: string }; bus?: { busNumber: string } }

export default function AdminTransportPage() {
  const [activeTab, setActiveTab] = useState<Tab>("buses");
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [busRes, routeRes, driverRes] = await Promise.allSettled([
        api.get<any>("/api/v1/dashboard/admin/transport/buses"),
        api.get<any>("/api/v1/dashboard/admin/transport/routes"),
        api.get<any>("/api/v1/dashboard/admin/transport/drivers"),
      ]);
      if (busRes.status === "fulfilled") {
        const d = busRes.value as any;
        setBuses(Array.isArray(d) ? d : d?.buses ?? d?.data ?? []);
      }
      if (routeRes.status === "fulfilled") {
        const d = routeRes.value as any;
        setRoutes(Array.isArray(d) ? d : d?.routes ?? d?.data ?? []);
      }
      if (driverRes.status === "fulfilled") {
        const d = driverRes.value as any;
        setDrivers(Array.isArray(d) ? d : d?.drivers ?? d?.data ?? []);
      }
    } catch (err) {
      console.error("Transport fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const statusColor = (s: string) => s === "ACTIVE" ? COLORS.success : s === "MAINTENANCE" ? COLORS.warning : COLORS.error;

  const renderBus = ({ item, index }: { item: Bus; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: "#06B6D420" }]}>
        <Ionicons name="bus" size={22} color="#06B6D4" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.itemTitle}>{item.busNumber}</Text>
        <Text style={styles.itemSub}>Capacity: {item.capacity}</Text>
        {item.driver ? <Text style={styles.itemSub}>Driver: {item.driver.user.name}</Text> : null}
        {item.route ? <Text style={styles.itemSub}>Route: {item.route.name}</Text> : null}
      </View>
      <View style={[styles.badge, { backgroundColor: statusColor(item.status) + "20" }]}>
        <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
      </View>
    </Animated.View>
  );

  const renderRoute = ({ item, index }: { item: Route; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: "#1A73B520" }]}>
        <Ionicons name="map" size={22} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        {item.distance ? <Text style={styles.itemSub}>{item.distance} km</Text> : null}
        {item._count ? (
          <Text style={styles.itemSub}>
            {item._count.stops} stops · {item._count.assignments} assignments
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </Animated.View>
  );

  const renderDriver = ({ item, index }: { item: Driver; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: "#F59E0B20" }]}>
        <Ionicons name="person" size={22} color="#F59E0B" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.itemTitle}>{item.user.name}</Text>
        {item.licenseNumber ? <Text style={styles.itemSub}>License: {item.licenseNumber}</Text> : null}
        {item.user.phone ? <Text style={styles.itemSub}>{item.user.phone}</Text> : null}
        {item.bus ? <Text style={styles.itemSub}>Bus: {item.bus.busNumber}</Text> : <Text style={[styles.itemSub, { color: COLORS.warning }]}>No bus assigned</Text>}
      </View>
      <View style={[styles.badge, { backgroundColor: statusColor(item.status) + "20" }]}>
        <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
      </View>
    </Animated.View>
  );

  const tabData = activeTab === "buses" ? buses : activeTab === "routes" ? routes : drivers;
  const renderItem = activeTab === "buses" ? renderBus : activeTab === "routes" ? renderRoute : renderDriver;

  const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "buses", label: "Buses", icon: "bus-outline" },
    { key: "routes", label: "Routes", icon: "map-outline" },
    { key: "drivers", label: "Drivers", icon: "person-outline" },
  ];

  return (
    <View style={styles.container}>
      <PageHeader title="Transport" />

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Ionicons name={t.icon} size={15} color={activeTab === t.key ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={tabData as any[]}
          keyExtractor={(i: any) => i.id}
          renderItem={renderItem as any}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="bus-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No {activeTab} found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  tabText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontFamily: "Inter_600SemiBold" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  itemTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  itemSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
