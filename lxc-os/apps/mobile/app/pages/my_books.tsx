import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";

export default function MyBooksPage() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <PageHeader title="My Books" subtitle="Borrowed Resources" />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: Platform.OS === "web" ? 34 + 16 : insets.bottom + 16 },
                ]}
            >
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="bookmark-outline" size={48} color={COLORS.primary} />
                    </View>
                    <Text style={styles.comingSoonTitle}>My Library Coming Soon</Text>
                    <Text style={styles.comingSoonText}>
                        Keep track of your borrowed books, due dates, and reading history here.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20, alignItems: "center", justifyContent: "center", flexGrow: 1 },
    card: {
        backgroundColor: COLORS.surface,
        padding: 32,
        borderRadius: 24,
        alignItems: "center",
        width: "100%",
        maxWidth: 400,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    comingSoonTitle: {
        fontSize: 22,
        fontFamily: "Inter_700Bold",
        color: COLORS.textPrimary,
        marginBottom: 12,
        textAlign: "center",
    },
    comingSoonText: {
        fontSize: 15,
        fontFamily: "Inter_400Regular",
        color: COLORS.textSecondary,
        textAlign: "center",
        lineHeight: 22,
    },
});
