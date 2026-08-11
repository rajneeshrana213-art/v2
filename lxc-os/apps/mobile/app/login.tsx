import { useState, useCallback } from "react";
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
  Modal,
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
import { useAuth } from "@/lib/auth-context";
import { COLORS } from "@/constants/colors";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Google Login states
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const handleGooglePress = useCallback(() => {
    Keyboard.dismiss();
    setGoogleModalVisible(true);
  }, []);

  const handleGoogleAuthorize = useCallback(async () => {
    Keyboard.dismiss();
    if (!googleEmail.trim() || !googleEmail.includes("@")) {
      setGoogleError("Please enter a valid Google email address");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    setGoogleSubmitting(true);
    setGoogleError("");

    try {
      const authUser = await loginWithGoogle(googleEmail.trim(), googleName.trim());
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setGoogleModalVisible(false);
      setGoogleEmail("");
      setGoogleName("");

      const roleToDashboard: Record<string, string> = {
        superadmin: "admin",
        admin: "admin",
        teacher: "teacher",
        student: "student",
        parent: "parent",
        driver: "driver",
        forum_user: "student", // Auto-redirect forum users to default view
      };

      const dashboard = roleToDashboard[authUser.role] || "student";
      router.replace(`/dashboard/${dashboard}` as any);
    } catch (e: any) {
      setGoogleError(e.message || "Google Sign In failed. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setGoogleSubmitting(false);
    }
  }, [googleEmail, googleName, loginWithGoogle]);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();
    if (!username.trim()) {
      setError("Please enter your email or username");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const authUser = await login(username.trim(), password);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const roleToDashboard: Record<string, string> = {
        superadmin: "admin",
        admin: "admin",
        teacher: "teacher",
        student: "student",
        parent: "parent",
        driver: "driver",
      };

      const dashboard = roleToDashboard[authUser.role] || "student";
      router.replace(`/dashboard/${dashboard}` as any);
    } catch (e: any) {
      setError(e.message || "Login failed. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [username, password, login]);

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
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to continue to LearnXChain</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email or username"
                placeholderTextColor={COLORS.textMuted}
                value={username}
                onChangeText={(t) => { setUsername(t); setError(""); }}
                autoCapitalize="none"
                autoCorrect={false}
                testID="username-input"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(""); }}
                secureTextEntry={!showPassword}
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

          <Pressable 
            onPress={() => router.push("/forgot-password")}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

          {!!error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.signInBtnContainer,
              pressed && { transform: [{ scale: 0.98 }] },
              isSubmitting && { opacity: 0.8 },
            ]}
            onPress={handleLogin}
            disabled={isSubmitting}
            testID="login-button"
          >
            <LinearGradient
              colors={COLORS.gradients.premium as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signInBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={22} color="#fff" />
                  <Text style={styles.signInBtnText}>Sign In</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.googleBtnContainer,
              pressed && { transform: [{ scale: 0.98 }] },
              isSubmitting && { opacity: 0.8 },
            ]}
            onPress={handleGooglePress}
            disabled={isSubmitting}
            testID="google-login-button"
          >
            <View style={styles.googleBtn}>
              <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.googleIcon} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </View>
          </Pressable>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don&apos;t have an account? </Text>
            <Pressable onPress={() => router.push("/register" as any)}>
              <Text style={styles.registerLink}>Register</Text>
            </Pressable>
          </View>


        </Animated.View>

        <Animated.View entering={FadeIn.delay(800)} style={styles.footer}>
          <View style={styles.secureBadge}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
            <Text style={styles.secureText}>Your data is secure with us</Text>
          </View>
          <Text style={styles.copyrightText}>© 2026 LXC — A Product of LearnXChain · RIT AI</Text>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      {/* Mock Google Authorization Modal */}
      <Modal
        visible={googleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setGoogleModalVisible(false);
          setGoogleEmail("");
          setGoogleName("");
          setGoogleError("");
        }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.duration(400)} style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.googleIconBg}>
                <Ionicons name="logo-google" size={28} color="#EA4335" />
              </View>
              <Text style={styles.modalTitle}>Sign In with Google</Text>
              <Text style={styles.modalSubtitle}>LearnXChain developer Google Auth environment</Text>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Google Account Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="username@gmail.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={googleEmail}
                    onChangeText={(t) => { setGoogleEmail(t); setGoogleError(""); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Alex Mercer"
                    placeholderTextColor={COLORS.textMuted}
                    value={googleName}
                    onChangeText={(t) => setGoogleName(t)}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {!!googleError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{googleError}</Text>
                </View>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.modalSubmitBtnContainer,
                  pressed && { transform: [{ scale: 0.98 }] },
                  googleSubmitting && { opacity: 0.8 },
                ]}
                onPress={handleGoogleAuthorize}
                disabled={googleSubmitting}
              >
                <LinearGradient
                  colors={COLORS.gradients.premium as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalSubmitBtn}
                >
                  {googleSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                      <Text style={styles.modalSubmitBtnText}>Authorize Account</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => {
                  setGoogleModalVisible(false);
                  setGoogleEmail("");
                  setGoogleName("");
                  setGoogleError("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    width: 80,
    height: 80,
  },
  welcomeTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#1E293B",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
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
    marginBottom: 18,
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
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.primary,
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
  signInBtnContainer: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 24,
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
  signInBtn: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  signInBtnText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  registerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
  },
  registerLink: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
  },
  googleBtnContainer: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }
    }),
  },
  googleBtn: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleIcon: {
    marginRight: 4,
  },
  googleBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1E293B",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      }
    }),
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  googleIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#1E293B",
    marginBottom: 6,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "center",
  },
  modalForm: {
    gap: 16,
  },
  modalSubmitBtnContainer: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
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
  modalSubmitBtn: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modalSubmitBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  modalCancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#64748B",
  },
});



