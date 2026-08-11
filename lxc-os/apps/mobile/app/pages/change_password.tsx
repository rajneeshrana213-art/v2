import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ActivityIndicator,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ChangePasswordPage() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdatePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill all password fields");
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert("Error", "New password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New password and confirm password do not match");
            return;
        }

        try {
            setIsLoading(true);
            await api.post("/api/v1/auth/change-password", {
                userId: user?.id,
                oldPassword,
                newPassword,
            });

            Alert.alert("Success", "Password updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const message = error?.message || "Failed to update password";
            Alert.alert("Error", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <PageHeader title="Change Password" />

            <View style={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Current Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter current password"
                            placeholderTextColor={COLORS.textMuted}
                            secureTextEntry={!showOld}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                        />
                        <Pressable onPress={() => setShowOld(!showOld)} style={styles.eyeIcon}>
                            <Ionicons name={showOld ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textMuted} />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="key-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="At least 8 characters"
                            placeholderTextColor={COLORS.textMuted}
                            secureTextEntry={!showNew}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <Pressable onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                            <Ionicons name={showNew ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textMuted} />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Re-enter new password"
                            placeholderTextColor={COLORS.textMuted}
                            secureTextEntry={!showConfirm}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                            <Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textMuted} />
                        </Pressable>
                    </View>
                </View>

                <Pressable
                    style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
                    onPress={handleUpdatePassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.updateButtonText}>Update Password</Text>
                        </>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 52,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontFamily: "Inter_400Regular",
        color: COLORS.textPrimary,
    },
    eyeIcon: {
        padding: 8,
    },
    updateButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        gap: 8,
    },
    updateButtonDisabled: {
        opacity: 0.7,
    },
    updateButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "Inter_600SemiBold",
    },
});
