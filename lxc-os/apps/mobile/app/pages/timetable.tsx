import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInUp, FadeInRight, Layout } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { WeeklyTimetable, TimetableLesson } from "@/lib/types/student";
import { format, isAfter, isBefore, parse } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { getISTCurrentDayOfWeek, getISTDayOfWeek, getISTHours, getISTMinutes, makeISTDateTime, formatISTDateKey } from "@/lib/date-utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_API_MAP = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function TimetablePage() {
  const { user } = useAuth();

  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = getISTCurrentDayOfWeek(); // 0 is Sunday (IST)
    return d === 0 ? 6 : d - 1; // Map 1-6 to 0-5, 0 to 6
  });

  const [timetable, setTimetable] = useState<WeeklyTimetable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("All Classes");

  const fetchTimetable = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      let data;
      if (user?.role === "teacher") {
        data = await api.get<WeeklyTimetable>("/api/v1/dashboard/teacher/timetable");
      } else {
        data = await api.get<WeeklyTimetable>("/api/v1/dashboard/student/timetable");
      }
      setTimetable(data as any);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const onRefresh = useCallback(() => {
    fetchTimetable(true);
  }, [fetchTimetable]);

  const currentDayKey = DAYS_API_MAP[selectedDay] as keyof WeeklyTimetable;
  
  // Extract all unique classes from the entire timetable for the teacher
  const allAvailableClasses = useMemo(() => {
    if (!timetable || user?.role !== "teacher") return ["All Classes"];
    const classes = new Set<string>();
    classes.add("All Classes");
    
    Object.values(timetable).forEach((dayLessons) => {
      if (Array.isArray(dayLessons)) {
        dayLessons.forEach((lesson) => {
          if (lesson.class) classes.add(lesson.class);
        });
      }
    });
    
    return Array.from(classes);
  }, [timetable, user?.role]);

  const currentPeriods = useMemo(() => {
    if (!timetable) return [];
    const periods = timetable[currentDayKey] || [];
    
    if (user?.role === "teacher" && selectedClass !== "All Classes") {
      return periods.filter(p => p.class === selectedClass);
    }
    
    return periods;
  }, [timetable, currentDayKey, selectedClass, user?.role]);

  const todayIndex = (() => {
    const d = getISTCurrentDayOfWeek();
    return d === 0 ? 6 : d - 1;
  })();

  const getSubjectIcon = (subject: string): keyof typeof Ionicons.glyphMap => {
    const s = subject.toLowerCase();
    if (s.includes("math")) return "calculator-outline";
    if (s.includes("science") || s.includes("physics") || s.includes("chem")) return "beaker-outline";
    if (s.includes("english") || s.includes("lang")) return "book-outline";
    if (s.includes("history") || s.includes("social")) return "earth-outline";
    if (s.includes("art")) return "brush-outline";
    if (s.includes("computer") || s.includes("it") || s.includes("tech")) return "desktop-outline";
    if (s.includes("phys") || s.includes("gym") || s.includes("sport")) return "fitness-outline";
    return "school-outline";
  };

  const isCurrentClass = (startTime: string, endTime: string) => {
    const now = new Date();
    const toISTMinutes = (d: Date) => getISTHours(d) * 60 + getISTMinutes(d);

    const makeDate = (value: string) => {
      if (value.includes("T")) return new Date(value);
      return makeISTDateTime(formatISTDateKey(new Date()), value);
    };

    const start = makeDate(startTime);
    const end = makeDate(endTime);
    const nowMins = toISTMinutes(now);
    const startMins = toISTMinutes(start);
    const endMins = toISTMinutes(end);
    
    // Check if same day first
    if (todayIndex !== selectedDay) return false;
    
    return nowMins >= startMins && nowMins <= endMins;
  };

  const isPastClass = (endTime: string) => {
    const now = new Date();
    const toISTMinutes = (d: Date) => getISTHours(d) * 60 + getISTMinutes(d);

    const makeDate = (value: string) => {
      if (value.includes("T")) return new Date(value);
      return makeISTDateTime(formatISTDateKey(new Date()), value);
    };

    const end = makeDate(endTime);
    const nowMins = toISTMinutes(now);
    const endMins = toISTMinutes(end);

    // If day is before today
    if (selectedDay < todayIndex) return true;
    // If day is after today
    if (selectedDay > todayIndex) return false;
    
    // Same day, check time
    return nowMins > endMins;
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = timeStr.includes("T") ? new Date(timeStr) : makeISTDateTime(formatISTDateKey(new Date()), timeStr);
      return format(date, "hh:mm a");
    } catch {
      return timeStr;
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Timetable" subtitle="Weekly Schedule" />

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
        {/* Modern Hero Section */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.heroContainer}>
          <LinearGradient
            colors={[COLORS.primary, "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View>
                <Text style={styles.heroDate}>{format(new Date(), "EEEE, MMM dd")}</Text>
                <Text style={styles.heroTitle}>
                  {currentPeriods.length} Classes Today
                </Text>
              </View>
              <View style={styles.heroIconContainer}>
                <Ionicons name="calendar" size={28} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Glassmorphic Day Switcher */}
        <View style={styles.dayTabsWrapper}>
          <BlurView intensity={20} tint="light" style={styles.dayTabsContent}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {DAYS.map((day, index) => {
                const isSelected = selectedDay === index;
                const isToday = todayIndex === index;
                return (
                  <Animated.View key={day} entering={FadeInRight.delay(index * 100)}>
                    <Pressable
                      onPress={() => setSelectedDay(index)}
                      style={[
                        styles.dayTab,
                        isSelected && styles.dayTabActive,
                      ]}
                    >
                      <Text style={[styles.dayTabText, isSelected && styles.dayTabTextActive]}>
                        {day}
                      </Text>
                      {isToday && !isSelected && <View style={styles.todayIndicator} />}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </BlurView>
        </View>

        {/* Teacher Class Filter */}
        {user?.role === "teacher" && allAvailableClasses.length > 2 && (
          <Animated.View entering={FadeInUp.delay(300)} style={styles.classFilterWrapper}>
            <Text style={styles.filterTitle}>Filter by Class</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classFilterScroll}>
              {allAvailableClasses.map((className, idx) => {
                const isSelected = selectedClass === className;
                return (
                  <Pressable
                    key={className}
                    onPress={() => setSelectedClass(className)}
                    style={[
                      styles.classChip,
                      isSelected && styles.classChipActive
                    ]}
                  >
                    <Text style={[styles.classChipText, isSelected && styles.classChipTextActive]}>
                      {className}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        <View style={styles.timelineContainer}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : currentPeriods.length > 0 ? (
            <View>
              {/* Timeline vertical line */}
              <View style={styles.timelineLine} />

              {currentPeriods.map((period, idx) => {
                const isActive = isCurrentClass(period.startTime, period.endTime);
                const isPast = isPastClass(period.endTime);
                const colors = ["#3B82F6", "#8B5CF6", "#22C55E", "#F59E0B", "#EC4899", "#14B8A6", "#EF4444"];
                const color = isPast ? COLORS.textMuted : colors[idx % colors.length];

                return (
                  <Animated.View
                    key={idx}
                    entering={FadeInDown.delay(idx * 100 + 400)}
                    style={[styles.periodRow, isPast && { opacity: 0.6 }]}
                  >
                    <View style={styles.timeColumn}>
                      <Text style={[styles.timeStart, isActive && { color: COLORS.primary }, isPast && { color: COLORS.textMuted }]}>
                        {formatTime(period.startTime)}
                      </Text>
                      <View style={[styles.timelineDot, isActive && styles.timelineDotActive, { backgroundColor: color }]} />
                      <Text style={[styles.timeEnd, isPast && { color: COLORS.textMuted }]}>
                        {formatTime(period.endTime)}
                      </Text>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.periodCard,
                        isActive && styles.periodCardActive,
                        isPast && styles.periodCardPast,
                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.subjectRow}>
                          <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
                            <Ionicons name={getSubjectIcon(period.subject)} size={18} color={color} />
                          </View>
                          <View>
                            <Text style={[styles.periodSubject, isPast && { color: COLORS.textMuted }]}>{period.subject}</Text>
                            <Text style={styles.teacherName}>
                              {period.teacher}{period.class ? ` • ${period.class}` : ""}
                            </Text>
                          </View>
                        </View>
                        {isActive && (
                          <BlurView intensity={30} tint="light" style={styles.nowBadge}>
                            <Text style={styles.nowText}>NOW</Text>
                          </BlurView>
                        )}
                      </View>

                      <View style={styles.cardFooter}>
                        <View style={styles.infoItem}>
                          <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                          <Text style={styles.infoText}>{period.room === "N/A" ? "Online" : period.room}</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                          <Text style={styles.infoText}>Period {idx + 1}</Text>
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="calendar-clear-outline" size={32} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No classes today</Text>
              <Text style={styles.emptySubtitle}>You&apos;re all set for a break!</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {user?.role === "parent" ? <ParentBottomNav /> : user?.role === "teacher" ? <TeacherBottomNav /> : <BottomNav />}
    </View>
  );
}

export default TimetablePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroContainer: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroDate: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: "Inter_800ExtraBold",
    color: "#FFFFFF",
  },
  heroIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTabsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dayTabsContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: 'center',
    marginRight: 4,
  },
  dayTabActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dayTabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textSecondary,
  },
  dayTabTextActive: {
    color: "#FFFFFF",
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  timelineContainer: {
    paddingHorizontal: 16,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 43,
    top: 20,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.border + "60",
  },
  periodRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  timeColumn: {
    width: 55,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  timeStart: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  timeEnd: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.background,
    zIndex: 1,
  },
  timelineDotActive: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  periodCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodCardActive: {
    borderColor: COLORS.primary + "60",
    backgroundColor: COLORS.primary + "05",
    borderWidth: 1.5,
  },
  periodCardPast: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border + "40",
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subjectRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSubject: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  teacherName: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
  },
  nowBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.primary + "20",
    overflow: 'hidden',
  },
  nowText: {
    fontSize: 10,
    fontFamily: "Inter_800ExtraBold",
    color: COLORS.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + "40",
    paddingTop: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
  },
  loaderContainer: {
    paddingVertical: 100,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: COLORS.textMuted,
    textAlign: "center",
  },
  classFilterWrapper: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  filterTitle: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: COLORS.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  classFilterScroll: {
    gap: 8,
    paddingRight: 20,
  },
  classChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  classChipActive: {
    backgroundColor: COLORS.primary + "15",
    borderColor: COLORS.primary,
  },
  classChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textSecondary,
  },
  classChipTextActive: {
    color: COLORS.primary,
  },
});
