import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// In development, localhost doesn't work on real devices or some emulators.
// We use the host machine's IP address dynamically.

// **************************** Localhost Keys ****************************

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "web") return "http://localhost:3000/";

    // Get the IP of the machine running the Expo server
    const debuggerHost = 
      Constants.expoConfig?.hostUri || 
      (Constants as any).manifest?.debuggerHost || 
      (Constants as any).manifest2?.extra?.expoGoHost;

    const ip = debuggerHost?.split(":")[0];

    if (ip) {
      console.log(`[API] Using detected IP: ${ip} for development`);
      return `http://${ip}:3000/`;
    }

    console.warn("[API] Could not detect host IP, falling back to localhost");
    return "http://localhost:3000/";
  }
  return "https://beta.learnxchain.com/";
};



// **************************** Beta Keys ****************************

// const getBaseUrl = () => {
//   if (__DEV__) {
//     if (Platform.OS === "web") return "https://beta.learnxchain.com/";

//     // Get the IP of the machine running the Expo server
//     const debuggerHost = Constants.expoConfig?.hostUri;
//     const ip = debuggerHost?.split(":")[0];

//     return ip ? `https://beta.learnxchain.com/` : "https://beta.learnxchain.com/";
//   }
//   return "https://beta.learnxchain.com/";
// };


// **************************** Production Keys ****************************

// const getBaseUrl = () => {
//   if (__DEV__) {
//     if (Platform.OS === "web") return "https://www.learnxchain.com/";

//     // Get the IP of the machine running the Expo server
//     const debuggerHost = Constants.expoConfig?.hostUri;
//     const ip = debuggerHost?.split(":")[0];

//     return ip ? `https://www.learnxchain.com/` : "https://www.learnxchain.com/";
//   }
//   return "https://www.learnxchain.com/";
// };

const BASE_URL = getBaseUrl();
const TOKEN_KEY = "@learnxchain_token";

// Strip leading slash to prevent double-slash URLs
// BASE_URL already ends with '/', so endpoints must NOT start with '/'
const buildUrl = (endpoint: string) =>
  `${BASE_URL}${endpoint.startsWith("/") ? endpoint.slice(1) : endpoint}`;

export interface ApiResponse<T = any> {
  success?: string;
  error?: string | any[];
  accessToken?: string;
  user?: T;
}

export const api = {
  async post<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const response = await fetch(buildUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "An error occurred");
      }
      return data;
    } catch (error: any) {
      console.error(`API POST Error [${endpoint}]:`, error);
      throw error;
    }
  },

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const response = await fetch(buildUrl(endpoint), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "An error occurred");
      }
      return data;
    } catch (error: any) {
      console.error(`API GET Error [${endpoint}]:`, error);
      throw error;
    }
  },

  async patch<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const response = await fetch(buildUrl(endpoint), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "An error occurred");
      }
      return data;
    } catch (error: any) {
      console.error(`API PATCH Error [${endpoint}]:`, error);
      throw error;
    }
  },

  async put<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const response = await fetch(buildUrl(endpoint), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "An error occurred");
      }
      return data;
    } catch (error: any) {
      console.error(`API PUT Error [${endpoint}]:`, error);
      throw error;
    }
  },

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const response = await fetch(buildUrl(endpoint), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "An error occurred");
      }
      return data;
    } catch (error: any) {
      console.error(`API DELETE Error [${endpoint}]:`, error);
      throw error;
    }
  },

  async setToken(token: string) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async removeToken() {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
};
