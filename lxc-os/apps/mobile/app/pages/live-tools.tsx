import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { COLORS } from "@/constants/colors";
import { PageHeader } from "@/components/PageHeader";

export default function LiveToolsPage() {
    const insets = useSafeAreaInsets();
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["", ""]);

    const startTimer = (minutes: number) => {
        setTimer(minutes * 60);
        setTimerActive(true);
        Alert.alert("Timer Started", `${minutes} minute timer is now active.`);
    };

    const addOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, ""]);
        }
    };

    const handleCreatePoll = () => {
        if (!pollQuestion.trim()) return Alert.alert("Error", "Please enter a question");
        Alert.alert("Poll Created", "The live poll has been broadcasted to the class.");
    };

    return (
        <View style={styles.container}>
            <PageHeader title="Live Classroom Tools" subtitle="Interactive tools for your ongoing lesson" />

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
                {/* Random Student Picker */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="shuffle-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.cardTitle}>Random Picker</Text>
                    </View>
                    <Text style={styles.cardDesc}>Select a random student for answering questions.</Text>
                    <Pressable style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>Pick a Student</Text>
                    </Pressable>
                </Animated.View>

                {/* Classroom Timer */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="timer-outline" size={24} color={COLORS.warning} />
                        <Text style={styles.cardTitle}>Classroom Timer</Text>
                    </View>
                    <View style={styles.timerRow}>
                        {[1, 5, 10, 15].map(m => (
                            <Pressable key={m} onPress={() => startTimer(m)} style={styles.timerChip}>
                                <Text style={styles.timerChipText}>{m}m</Text>
                            </Pressable>
                        ))}
                    </View>
                    {timerActive && (
                        <Text style={styles.activeTimer}>Active: {Math.floor(timer/60)}:{(timer%60).toString().padStart(2, '0')}</Text>
                    )}
                </Animated.View>

                {/* Live Poll Creator */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="stats-chart-outline" size={24} color={COLORS.success} />
                        <Text style={styles.cardTitle}>Quick Poll</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask a question..."
                        value={pollQuestion}
                        onChangeText={setPollQuestion}
                    />
                    {pollOptions.map((opt, idx) => (
                        <TextInput
                            key={idx}
                            style={styles.optInput}
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChangeText={(val) => {
                                const newOpts = [...pollOptions];
                                newOpts[idx] = val;
                                setPollOptions(newOpts);
                            }}
                        />
                    ))}
                    <View style={styles.pollActions}>
                        <Pressable onPress={addOption} style={styles.addOptBtn}>
                            <Ionicons name="add" size={20} color={COLORS.primary} />
                            <Text style={styles.addOptText}>Add Option</Text>
                        </Pressable>
                        <Pressable onPress={handleCreatePoll} style={styles.launchBtn}>
                            <Text style={styles.launchBtnText}>Launch Poll</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFF" },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
    cardTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
    cardDesc: { fontSize: 14, color: COLORS.textMuted, marginBottom: 16 },
    actionBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    actionBtnText: { color: "#FFF", fontFamily: "Inter_700Bold" },
    timerRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
    timerChip: {
        flex: 1,
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        borderRadius: 10,
        paddingVertical: 8,
        alignItems: "center",
    },
    timerChipText: { color: "#D97706", fontFamily: "Inter_700Bold" },
    activeTimer: { textAlign: "center", fontSize: 20, fontFamily: "Inter_800ExtraBold", color: COLORS.warning, marginTop: 10 },
    input: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        padding: 12,
        fontSize: 15,
        marginBottom: 12,
    },
    optInput: {
        backgroundColor: "#F8FAFC",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        padding: 10,
        fontSize: 14,
        marginBottom: 8,
    },
    pollActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
    addOptBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    addOptText: { color: COLORS.primary, fontFamily: "Inter_600SemiBold" },
    launchBtn: { backgroundColor: COLORS.success, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
    launchBtnText: { color: "#FFF", fontFamily: "Inter_700Bold" },
});
