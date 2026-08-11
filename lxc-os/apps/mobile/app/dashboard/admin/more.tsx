import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { AdminBottomNav } from "@/components/AdminBottomNav";
import { COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48) / 2;

interface FeatureCard {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  route: string;
}

const FEATURES: FeatureCard[] = [
  { label: "Classes", subtitle: "Sections & subjects", icon: "layers-outline", color: "#1A73B5", bg: "#EBF3FB", route: "/pages/admin-classes" },
  { label: "Subjects", subtitle: "Curriculum mapping", icon: "book-outline", color: "#0891B2", bg: "#CFFAFE", route: "/pages/admin-subjects" },
  { label: "Staff", subtitle: "Non-teaching staff", icon: "people-circle-outline", color: "#F59E0B", bg: "#FEF3C7", route: "/pages/admin-staff" },
  { label: "Parents", subtitle: "Guardian directory", icon: "heart-outline", color: "#EC4899", bg: "#FCE7F3", route: "/pages/admin-parents" },
  { label: "Notices", subtitle: "Post & manage", icon: "megaphone-outline", color: "#8B5CF6", bg: "#EDE9FE", route: "/pages/admin-notices" },
  { label: "Events", subtitle: "School calendar", icon: "calendar-outline", color: "#7C3AED", bg: "#EDE9FE", route: "/pages/admin-events" },
  { label: "Holidays", subtitle: "Scheduled holidays", icon: "sunny-outline", color: "#D97706", bg: "#FEF3C7", route: "/pages/admin-holidays" },
  { label: "Leave", subtitle: "Approve requests", icon: "document-text-outline", color: "#22C55E", bg: "#DCFCE7", route: "/pages/admin-leave" },
  { label: "Exams", subtitle: "Schedule & results", icon: "clipboard-outline", color: "#EF4444", bg: "#FEE2E2", route: "/pages/admin-exams" },
  { label: "Timetable", subtitle: "Class schedules", icon: "time-outline", color: "#10B981", bg: "#D1FAE5", route: "/pages/admin-timetable" },
  { label: "Transport", subtitle: "Buses & routes", icon: "bus-outline", color: "#06B6D4", bg: "#CFFAFE", route: "/pages/admin-transport" },
  { label: "Hostel", subtitle: "Rooms & allocations", icon: "home-outline", color: "#6366F1", bg: "#EEF2FF", route: "/pages/admin-hostel" },
  { label: "Library", subtitle: "Books & members", icon: "library-outline", color: "#D97706", bg: "#FEF3C7", route: "/pages/admin-library" },
  { label: "HRM", subtitle: "HR & payroll", icon: "briefcase-outline", color: "#8B5CF6", bg: "#EDE9FE", route: "/pages/admin-hrm" },
  { label: "Promotion", subtitle: "Promote students", icon: "trending-up-outline", color: "#059669", bg: "#D1FAE5", route: "/pages/admin-promotion" },
  { label: "Communication", subtitle: "Announcements", icon: "chatbubbles-outline", color: "#1A73B5", bg: "#EBF3FB", route: "/pages/admin-communication" },
  { label: "Feedback", subtitle: "Reviews & ratings", icon: "star-outline", color: "#F59E0B", bg: "#FEF3C7", route: "/pages/admin-feedback" },
  { label: "Tickets", subtitle: "Support requests", icon: "help-buoy-outline", color: "#EF4444", bg: "#FEE2E2", route: "/pages/admin-tickets" },
  { label: "Roles", subtitle: "Permissions & access", icon: "shield-outline", color: "#7C3AED", bg: "#EDE9FE", route: "/pages/admin-roles" },
  { label: "Alumni", subtitle: "Former students", icon: "school-outline", color: "#10B981", bg: "#D1FAE5", route: "/pages/admin-alumni" },
  { label: "Registrations", subtitle: "Admission requests", icon: "clipboard-outline", color: "#1A73B5", bg: "#EBF3FB", route: "/pages/admin-registrations" },
  { label: "Accounts", subtitle: "Transactions & ledger", icon: "receipt-outline", color: "#059669", bg: "#D1FAE5", route: "/pages/admin-accounts" },
  { label: "Collect Fees", subtitle: "Accept fee payments", icon: "cash-outline", color: "#10B981", bg: "#D1FAE5", route: "/pages/admin-collect-fees" },
  { label: "Fee Setup", subtitle: "Groups & fee heads", icon: "settings-outline", color: "#0891B2", bg: "#CFFAFE", route: "/pages/admin-fee-setup" },
  { label: "Student Fees", subtitle: "Individual ledger", icon: "person-circle-outline", color: "#7C3AED", bg: "#EDE9FE", route: "/pages/admin-student-fees" },
  { label: "Documents", subtitle: "Certificates & records", icon: "document-text-outline", color: "#6366F1", bg: "#EEF2FF", route: "/pages/admin-documents" },
  { label: "Membership", subtitle: "Plan & features", icon: "diamond-outline", color: "#D97706", bg: "#FEF3C7", route: "/pages/admin-membership" },
  { label: "Reports", subtitle: "Analytics & data", icon: "bar-chart-outline", color: "#7C3AED", bg: "#EDE9FE", route: "/pages/admin-reports" },
  { label: "Settings", subtitle: "School profile", icon: "settings-outline", color: "#6B7280", bg: "#F3F4F6", route: "/pages/admin-settings" },
];

export default function AdminMoreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        <Text style={styles.headerSub}>{FEATURES.length} admin features</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {FEATURES.map((f, i) => (
          <Animated.View key={f.label} entering={FadeInDown.delay(i * 40).springify()}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: f.bg }]}
              onPress={() => router.push(f.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: f.color + "20" }]}>
                <Ionicons name={f.icon} size={26} color={f.color} />
              </View>
              <Text style={[styles.cardLabel, { color: f.color }]}>{f.label}</Text>
              <Text style={styles.cardSub}>{f.subtitle}</Text>
              <Ionicons name="chevron-forward" size={14} color={f.color + "80"} style={styles.arrow} />
            </TouchableOpacity>
          </Animated.View>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      <AdminBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  grid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingTop: 4,
  },
  card: {
    width: CARD_SIZE,
    borderRadius: 18,
    padding: 18,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardLabel: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 3 },
  cardSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#6B7280" },
  arrow: { position: "absolute", top: 16, right: 16 },
});
