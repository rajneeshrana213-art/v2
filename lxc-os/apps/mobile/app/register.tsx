import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Image,
    Platform,
    ActivityIndicator,
    Keyboard,
    Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
    FadeInUp,
    FadeIn,
} from "react-native-reanimated";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        Keyboard.dismiss();
        
        // Basic validations
        if (!name.trim()) {
            setError("Please enter your full name");
            if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            return;
        }
        if (!email.trim() || !email.includes("@")) {
            setError("Please enter a valid email address");
            if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            return;
        }
        if (!phone.trim()) {
            setError("Please enter your phone number");
            if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await api.post("/api/v1/forum/register", {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password,
            });
            setSuccess(true);
            if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (e: any) {
            setError(e.message || "Failed to register. Please try again.");
            if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            {/* Background Abstract Shapes */}
            <View style={StyleSheet.absoluteFill}>
                <LinearGradient
                    colors={["#F8FBFF", "#FFFFFF"] as [string, string]}
                    style={StyleSheet.absoluteFill}
                />
                <View style={[styles.bgBlob, { top: -100, left: -50, backgroundColor: "#3BA5D9", opacity: 0.1, width: 300, height: 300, borderRadius: 150 }]} />
                <View style={[styles.bgBlob, { top: -50, right: -150, backgroundColor: COLORS.primary, opacity: 0.15, width: 400, height: 400, borderRadius: 200 }]} />
                <View style={[styles.bgBlob, { bottom: 100, right: -100, backgroundColor: COLORS.secondary, opacity: 0.05, width: 350, height: 350, borderRadius: 175 }]} />
            </View>

            <KeyboardAwareScrollViewCompat
                style={{ flex: 1 }}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: insets.top + 20,
                        paddingBottom: insets.bottom + 20,
                    },
                ]}
                bottomOffset={60}
            >
                <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Image
                                source={require("@/assets/images/logo.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Register as a forum user to join our community</Text>
                </Animated.View>

                {success ? (
                    <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.formCard}>
                        <View style={styles.successContainer}>
                            <View style={styles.successIconWrapper}>
                                <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.secondary} />
                            </View>
                            <Text style={styles.successTitle}>Registration Successful!</Text>
                            <Text style={styles.successText}>
                                Your forum user account has been successfully created. You can now log in using {"\n"}
                                <Text style={styles.successEmail}>{email}</Text>
                            </Text>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.submitButtonContainer,
                                    pressed && { transform: [{ scale: 0.98 }] },
                                ]}
                                onPress={() => router.replace("/login")}
                            >
                                <LinearGradient
                                    colors={COLORS.gradients.premium as [string, string]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitButton}
                                >
                                    <Text style={styles.submitButtonText}>Go to Sign In</Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={name}
                                    onChangeText={(t) => { setName(t); setError(""); }}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    testID="name-input"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email address"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setError(""); }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    testID="email-input"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="call-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your phone number"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={phone}
                                    onChangeText={(t) => { setPhone(t); setError(""); }}
                                    keyboardType="phone-pad"
                                    autoCorrect={false}
                                    testID="phone-input"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create a password (min. 6 chars)"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={password}
                                    onChangeText={(t) => { setPassword(t); setError(""); }}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    testID="password-input"
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={COLORS.textMuted}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={confirmPassword}
                                    onChangeText={(t) => { setConfirmPassword(t); setError(""); }}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    testID="confirm-password-input"
                                />
                                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                                    <Ionicons
                                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={COLORS.textMuted}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {!!error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <Pressable
                            style={({ pressed }) => [
                                styles.submitButtonContainer,
                                pressed && { transform: [{ scale: 0.98 }] },
                                isSubmitting && { opacity: 0.8 },
                            ]}
                            onPress={handleRegister}
                            disabled={isSubmitting}
                            testID="register-button"
                        >
                            <LinearGradient
                                colors={COLORS.gradients.premium as [string, string]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitButton}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="person-add-outline" size={22} color="#fff" />
                                        <Text style={styles.submitButtonText}>Register</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </Pressable>

                        <Pressable
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.cancelText}>Back to Sign In</Text>
                        </Pressable>
                    </Animated.View>
                )}

                <Animated.View entering={FadeIn.delay(800)} style={styles.footer}>
                    <View style={styles.secureBadge}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.secureText}>Your data is secure with us</Text>
                    </View>
                    <Text style={styles.copyrightText}>© 2026 LXC — A Product of LearnXChain · RIT AI</Text>
                </Animated.View>
            </KeyboardAwareScrollViewCompat>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    bgBlob: {
        position: "absolute",
        zIndex: 0,
    },
    scrollContent: {
        paddingHorizontal: 24,
        flexGrow: 1,
        justifyContent: "center",
        zIndex: 1,
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 6,
            },
            web: {
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }
        }),
    },
    logo: {
        width: 66,
        height: 66,
    },
    title: {
        fontSize: 32,
        fontFamily: "Inter_700Bold",
        color: "#1E293B",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        fontFamily: "Inter_400Regular",
        color: "#64748B",
        textAlign: "center",
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.06,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
            }
        }),
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: "Inter_700Bold",
        color: "#1E293B",
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 14,
        height: 54,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontFamily: "Inter_400Regular",
        color: "#1E293B",
        height: "100%",
    },
    eyeButton: {
        padding: 6,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 13,
        fontFamily: "Inter_500Medium",
        color: COLORS.error,
    },
    submitButtonContainer: {
        borderRadius: 14,
        overflow: "hidden",
        marginTop: 6,
        marginBottom: 8,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 6,
            },
            web: {
                boxShadow: "0 6px 20px rgba(26, 115, 181, 0.3)",
            }
        }),
    },
    submitButton: {
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    submitButtonText: {
        fontSize: 18,
        fontFamily: "Inter_700Bold",
        color: "#FFFFFF",
    },
    cancelButton: {
        alignItems: "center",
        paddingVertical: 12,
        marginTop: 6,
    },
    cancelText: {
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        color: COLORS.primary,
    },
    successContainer: {
        alignItems: "center",
        paddingVertical: 12,
    },
    successIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.secondaryLight,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontFamily: "Inter_700Bold",
        color: "#1E293B",
        marginBottom: 12,
        textAlign: "center",
    },
    successText: {
        fontSize: 15,
        fontFamily: "Inter_400Regular",
        color: "#64748B",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    successEmail: {
        fontFamily: "Inter_700Bold",
        color: "#1E293B",
    },
    footer: {
        marginTop: 32,
        alignItems: "center",
    },
    secureBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    secureText: {
        fontSize: 13,
        fontFamily: "Inter_500Medium",
        color: "#64748B",
    },
    copyrightText: {
        fontSize: 11,
        fontFamily: "Inter_400Regular",
        color: "#94A3B8",
    },
});
