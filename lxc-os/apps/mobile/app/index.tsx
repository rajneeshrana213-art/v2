import { useEffect, useRef } from "react";
import { View, StyleSheet, Platform, Image, Text } from "react-native";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useAuth } from "@/lib/auth-context";
import { COLORS } from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function SplashScreenView() {
  const { loadUser, user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.2)) });

    titleOpacity.value = withDelay(500, withTiming(1, { duration: 700 }));
    titleTranslateY.value = withDelay(500, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));

    subtitleOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));
    footerOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));

    pulseScale.value = withDelay(
      1400,
      withSequence(
        withTiming(1.05, { duration: 600 }),
        withTiming(1, { duration: 600 })
      )
    );
  }, []);

  useEffect(() => {
    if (!isLoading && !hasNavigated.current) {
      const timer = setTimeout(() => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;
        if (user) {
          router.replace(`/dashboard/${user.role}` as any);
        } else {
          router.replace("/login");
        }
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, user]);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value * pulseScale.value }],
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const footerAnimStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topGlow} />

      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimStyle]}>
          <View style={styles.logoGlow} />
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
{/* 
        <Animated.View style={titleAnimStyle}>
          <Text style={styles.appName}>LearnXChain</Text>
        </Animated.View>

        <Animated.Text style={[styles.tagline, subtitleAnimStyle]}>
          Smart School Management
        </Animated.Text> */}
      </View>

      <Animated.View
        style={[
          styles.footerContainer,
          footerAnimStyle,
          { paddingBottom: Platform.OS === "web" ? 44 : insets.bottom + 24 },
        ]}
      >
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>A Product by LearnXChain</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topGlow: {
    position: "absolute",
    top: -100,
    left: "50%",
    marginLeft: -200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoContainer: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.4,
  },
  logo: {
    width: 160,
    height: 160,
  },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: COLORS.primary,
    textAlign: "center",
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footerContainer: {
    alignItems: "center",
    gap: 10,
  },
  footerLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
