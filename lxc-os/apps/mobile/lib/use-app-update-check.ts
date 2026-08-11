import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { api } from "./api";

export interface UpdateInfo {
  updateAvailable: boolean;
  isForceUpdate: boolean;    // user CANNOT dismiss
  isUpdateOptional: boolean; // user CAN skip this time
  currentVersion: string;    // latest version on server
  clientVersion: string;     // this app's version
  downloadUrl: string;
  whatsNew: string;
}

// Get the version from app.json (set automatically by Expo)
const getAppVersion = (): string =>
  Constants.expoConfig?.version ?? "1.0.0";

export function useAppUpdateCheck() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const version  = getAppVersion();
        const platform = Platform.OS; // "android" | "ios"

        const data = await api.get<UpdateInfo>(
          `/api/v1/app/version?version=${version}&platform=${platform}`
        );

        if (!cancelled) {
          setUpdateInfo(data as any);
        }
      } catch (err) {
        // Silently fail — never block launch on a network error
        console.warn("[UpdateCheck] Could not reach version endpoint:", err);
      } finally {
        if (!cancelled) setChecked(true);
      }
    };

    check();
    return () => { cancelled = true; };
  }, []);

  return { updateInfo, checked };
}
