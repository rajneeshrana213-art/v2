import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { StudentDashboardData } from "@/lib/types/student";
import { TeacherDashboardData } from "@/lib/types/teacher";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { DriverBottomNav } from "@/components/DriverBottomNav";
import { useAuth } from "@/lib/auth-context";
import { DriverDashboardData } from "@/lib/types/driver";

function ProfilePage() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      let endpoint = "/api/v1/dashboard/student";
      if (user?.role === "parent") {
        endpoint = "/api/v1/dashboard/parent/profile";
      } else if (user?.role === "teacher") {
        endpoint = "/api/v1/dashboard/teacher";
      } else if (user?.role === "driver") {
        endpoint = "/api/v1/dashboard/driver/overview";
      }
      const response = await api.get<StudentDashboardData>(endpoint);
      setData(response as any);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = useCallback(() => {
    fetchProfile(true);
  }, [fetchProfile]);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/login");
            } catch (error) {
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isTeacher = user?.role === "teacher";
  const isDriver = user?.role === "driver";
  
  const teacherProfile = isTeacher ? (data as unknown as TeacherDashboardData)?.personalInfo : null;
  const driverProfile = isDriver ? (data as unknown as DriverDashboardData) : null;
  const profile = (isTeacher || isDriver) ? null : data?.personalInfo;

  const displayName = isTeacher ? teacherProfile?.name : isDriver ? driverProfile?.driverName : profile?.name;
  const displayPic = isTeacher ? teacherProfile?.profilePic : isDriver ? driverProfile?.profilePic : profile?.profilePic;

  const initialsUrl = displayName
    ? `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(displayName)}&backgroundColor=4f46e5&textColor=ffffff`
    : `https://api.dicebear.com/7.x/initials/png?seed=User&backgroundColor=4f46e5&textColor=ffffff`;

  const contactInfo = [
    { icon: "mail-outline" as const, label: "Email", value: (isTeacher ? teacherProfile?.email : isDriver ? driverProfile?.email : profile?.email) || "N/A" },
    { icon: "call-outline" as const, label: "Phone", value: (isTeacher ? teacherProfile?.phone : isDriver ? driverProfile?.phone : profile?.phone) || "N/A" },
  ];

  // Teacher-specific professional info
  const teacherProfInfo = isTeacher ? [
    { icon: "school-outline" as const, label: "School", value: teacherProfile?.school || "N/A" },
    { icon: "book-outline" as const, label: "Subjects", value: teacherProfile?.subjects?.join(", ") || "N/A" },
    { icon: "calendar-outline" as const, label: "Date of Joining", value: teacherProfile?.dateOfJoin ? new Date(teacherProfile.dateOfJoin).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "N/A" },
  ] : [];

  // Driver-specific info
  const driverInfo = isDriver ? [
    { icon: "card-outline" as const, label: "License Number", value: driverProfile?.license || "N/A" },
    { icon: "bus-outline" as const, label: "Assigned Vehicle", value: driverProfile?.busNumber || "N/A" },
    { icon: "school-outline" as const, label: "School", value: driverProfile?.schoolName || "N/A" },
  ] : [];

  // Student-specific academic info — hidden for teachers and drivers
  const academicInfo = (!isTeacher && !isDriver) ? [
    { icon: "school-outline" as const, label: "Class", value: profile?.class || "N/A" },
    { icon: "list-outline" as const, label: "Roll Number", value: profile?.rollNo || "N/A" },
    { icon: "time-outline" as const, label: "Admission Date", value: profile?.admissionDate ? new Date(profile.admissionDate).toLocaleDateString() : "N/A" },
  ] : [];

  return (
    <View style={styles.container}>
      <PageHeader title="Profile" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100, // Space for BottomNav
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <View style={styles.avatarSection}>
          <Image
            source={{ uri: displayPic || initialsUrl }}
            style={styles.avatarImage}
          />
          <Text style={styles.profileName}>{displayName || "Loading..."}</Text>
          <Text style={styles.profileRole}>
            {user?.role === "parent" ? "Parent" : user?.role === "teacher" ? "Teacher" : user?.role === "driver" ? "Driver" : `Student | Roll No: ${profile?.rollNo || "N/A"}`}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoSectionHeader}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.infoSectionTitle}>Contact Information</Text>
          </View>
          {contactInfo.map((info, idx) => (
            <View key={idx} style={[styles.infoRow, idx < contactInfo.length - 1 && styles.infoRowBorder]}>
              <View style={styles.infoIconBox}>
                <Ionicons name={info.icon} size={16} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{info.label}</Text>
                <Text style={styles.infoValue}>{info.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Teacher Professional Info */}
        {isTeacher && teacherProfInfo.length > 0 && (
          <View style={styles.infoSection}>
            <View style={styles.infoSectionHeader}>
              <Ionicons name="briefcase-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.infoSectionTitle}>Professional Information</Text>
            </View>
            {teacherProfInfo.map((info, idx) => (
              <View key={idx} style={[styles.infoRow, idx < teacherProfInfo.length - 1 && styles.infoRowBorder]}>
                <View style={styles.infoIconBox}>
                  <Ionicons name={info.icon} size={16} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                  <Text style={styles.infoValue}>{info.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Student Academic Info — hidden for teachers / drivers */}
        {!isTeacher && !isDriver && user?.role !== "parent" && (
          <View style={styles.infoSection}>
            <View style={styles.infoSectionHeader}>
              <Ionicons name="school-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.infoSectionTitle}>Academic Information</Text>
            </View>
            {academicInfo.map((info, idx) => (
              <View key={idx} style={[styles.infoRow, idx < academicInfo.length - 1 && styles.infoRowBorder]}>
                <View style={styles.infoIconBox}>
                  <Ionicons name={info.icon} size={16} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                  <Text style={styles.infoValue}>{info.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Driver Details */}
        {isDriver && driverInfo.length > 0 && (
          <View style={styles.infoSection}>
            <View style={styles.infoSectionHeader}>
              <Ionicons name="bus-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.infoSectionTitle}>Driver Information</Text>
            </View>
            {driverInfo.map((info, idx) => (
              <View key={idx} style={[styles.infoRow, idx < driverInfo.length - 1 && styles.infoRowBorder]}>
                <View style={styles.infoIconBox}>
                  <Ionicons name={info.icon} size={16} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                  <Text style={styles.infoValue}>{info.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={styles.infoSection}>
          <View style={styles.infoSectionHeader}>
            <Ionicons name="settings-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.infoSectionTitle}>Account Settings</Text>
          </View>
          <Pressable
            style={[styles.infoRow, styles.infoRowBorder]}
            onPress={() => router.push("/pages/change_password" as any)}
          >
            <View style={styles.infoIconBox}>
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoValue}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </Pressable>
          <Pressable
            style={styles.infoRow}
            onPress={handleLogout}
          >
            <View style={[styles.infoIconBox, { backgroundColor: COLORS.error + "20" }]}>
              <Ionicons name="log-out-outline" size={16} color={COLORS.error} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoValue, { color: COLORS.error }]}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
      {user?.role === "parent" ? (
        <ParentBottomNav />
      ) : user?.role === "teacher" ? (
        <TeacherBottomNav />
      ) : user?.role === "driver" ? (
        <DriverBottomNav />
      ) : (
        <BottomNav />
      )}
    </View>
  );
}

export default ProfilePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  profileRole: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  infoSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  infoSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoSectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: COLORS.textPrimary,
  },
});
