---
name: mobile-app-development
description: >
  Development workflow and patterns for the LearnXChain Expo React Native
  mobile app (lxc-app/). Covers file-based routing, API client usage, auth
  flow, EAS builds, platform-specific code, push notifications, and camera
  integrations. Use this skill when building or modifying any mobile screen.
---

# LearnXChain — Mobile App Development Skill

> **Mobile is not an afterthought.** Every web feature must have a mobile equivalent.
> Follow these patterns for consistency, performance, and a premium UX.

---

## 📱 Project Identity

| Property | Value |
|---|---|
| **Location** | `lxc-app/` (inside monorepo root) |
| **Framework** | Expo SDK (React Native) |
| **Routing** | `expo-router` (file-based, `lxc-app/app/`) |
| **API Client** | `lxc-app/lib/api.ts` — fetch-based with auto Bearer token |
| **Auth Storage** | `@react-native-async-storage/async-storage` → key: `@learnxchain_token` |
| **Build System** | EAS Build (Expo Application Services) |
| **Config** | `lxc-app/app.json` + `lxc-app/eas.json` |
| **Bundler** | Metro (`metro.config.js`) |

---

## 📁 Directory Structure

```
lxc-app/
├── app/                          → Expo file-based routing (pages)
│   ├── _layout.tsx               → Root layout (providers, fonts, splash)
│   ├── index.tsx                 → Welcome/onboarding screen
│   ├── login.tsx                 → Login screen
│   ├── forgot-password.tsx       → Password reset screen
│   ├── dashboard/                → Dashboard screens (role-based)
│   │   ├── _layout.tsx           → Dashboard layout (tab bar or drawer)
│   │   ├── index.tsx             → Home dashboard
│   │   ├── attendance.tsx        → Attendance screen
│   │   ├── profile.tsx           → Profile screen
│   │   └── [module].tsx          → Dynamic module screens
│   └── pages/                    → Additional pages
├── components/                   → Mobile-specific UI components
│   ├── ui/                       → Primitive components (Button, Card, Input)
│   └── dashboard/                → Dashboard-specific components
├── lib/
│   ├── api.ts                    → API client (THE source of truth for all HTTP calls)
│   └── [helpers].ts              → Utility functions
├── constants/                    → Colors, dimensions, config values
├── shared/                       → Code shared between web and mobile
├── assets/                       → Images, fonts, icons
├── scripts/                      → Helper scripts
├── app.json                      → Expo config (name, scheme, plugins)
├── eas.json                      → EAS Build profiles
├── metro.config.js               → Metro bundler config
└── package.json                  → Mobile-specific dependencies
```

---

## 🔑 API Client Usage (`lxc-app/lib/api.ts`)

The API client auto-attaches Bearer tokens from AsyncStorage.

### Making API Calls
```typescript
import { api } from '@/lib/api';

// ─── POST (Login) ──────────────────────────────────────
const result = await api.post<UserType>('api/v1/auth/mobile-login', {
  email,
  password,
});

// Save token after login
if (result.accessToken) {
  await api.setToken(result.accessToken);
}

// ─── GET (Fetch Data) ──────────────────────────────────
const data = await api.get<DashboardData>('api/v1/dashboard/stats');

// ─── PUT (Update) ──────────────────────────────────────
const updated = await api.put('api/v1/student/update', { id, name: 'New Name' });

// ─── DELETE ────────────────────────────────────────────
await api.delete('api/v1/student/delete?id=xxx');

// ─── Logout ────────────────────────────────────────────
await api.removeToken();
```

### Base URL Logic
```
Development:  http://<auto-detected-ip>:3000/   (local dev server)
Production:   https://beta.learnxchain.com/      (Vercel deployment)
```
The IP is auto-detected from `Constants.expoConfig.hostUri`. If detection fails, it falls back to `localhost:3000`.

---

## 🏗️ Screen Template

### Standard Dashboard Screen
```tsx
// lxc-app/app/dashboard/[module].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { api } from '@/lib/api';

interface DataItem {
  id: string;
  name: string;
}

export default function ModuleScreen() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const result = await api.get<any>('api/v1/module/list?page=1&limit=20');
      setData(result.data?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ─── Loading State ──────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2C81B4" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // ─── Error State ────────────────────────────────────
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchData}>Tap to retry</Text>
      </View>
    );
  }

  // ─── Data Rendering ─────────────────────────────────
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071B2C' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: '#9FB3C8', marginTop: 12, fontSize: 14 },
  errorText: { color: '#EF4444', fontSize: 16, textAlign: 'center' },
  retryText: { color: '#2C81B4', fontSize: 14, marginTop: 8 },
  emptyText: { color: '#9FB3C8', fontSize: 16 },
  card: {
    backgroundColor: '#224662',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E3A52',
  },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
```

---

## 🔐 Auth Flow (Mobile)

### Login Flow
```
1. User enters email + password on login.tsx
2. POST to api/v1/auth/mobile-login
3. Server returns { accessToken, user }
4. Save token: await api.setToken(accessToken)
5. Save user to AsyncStorage: @learnxchain_user
6. Navigate to dashboard/_layout.tsx
```

### Auto-Login (Splash Screen)
```typescript
// In app/_layout.tsx or index.tsx
useEffect(() => {
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('@learnxchain_token');
    if (token) {
      // Validate token is still valid
      try {
        await api.get('api/v1/auth/validate-token');
        router.replace('/dashboard');
      } catch {
        await api.removeToken();
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  };
  checkAuth();
}, []);
```

### Logout
```typescript
const handleLogout = async () => {
  await api.removeToken();
  await AsyncStorage.removeItem('@learnxchain_user');
  router.replace('/login');
};
```

---

## 📦 Build & Deploy Commands

```powershell
cd lxc-app

# ─── Development ────────────────────────────────────
npx expo start                        # Start Expo dev server
npx expo start --clear                # Clear cache and start

# ─── EAS Development Build ──────────────────────────
eas build --platform android --profile development
eas build --platform ios --profile development

# ─── EAS Production Build ───────────────────────────
eas build --platform android --profile production
eas build --platform ios --profile production

# ─── OTA Update (JS-only changes) ───────────────────
eas update --branch production --message "Fix: description"

# ─── Install on Connected Device ─────────────────────
npx expo run:android                  # Direct Android install
npx expo run:ios                      # Direct iOS install (Mac only)
```

---

## 🎨 Brand Colors (Mobile)

```typescript
// lxc-app/constants/colors.ts
export const Colors = {
  primaryDark: '#071B2C',
  primaryBlue: '#2C81B4',
  secondaryBlue: '#224662',
  accentGreen: '#75B96D',
  textMuted: '#9FB3C8',
  border: '#1E3A52',
  white: '#FFFFFF',
  error: '#EF4444',
  warning: '#F59E0B',
};
```

---

## ⚠️ Mobile Anti-Patterns

```typescript
// ❌ Hardcoding API base URL
fetch('http://localhost:3000/api/v1/student/list'); // BAD
// ✅ Use the api client
api.get('api/v1/student/list');

// ❌ Not handling network errors
const data = await api.get('endpoint'); // BAD — no try/catch
// ✅ Always wrap in try/catch
try { const data = await api.get('endpoint'); } catch (err) { /* handle */ }

// ❌ Storing sensitive data in plain AsyncStorage
await AsyncStorage.setItem('password', pwd); // BAD — use SecureStore
// ✅ Only store tokens in AsyncStorage (they rotate)

// ❌ Not showing loading states
return <FlatList data={data} />; // BAD — shows nothing while loading
// ✅ Show ActivityIndicator while loading

// ❌ Using ScrollView for long lists
<ScrollView>{items.map(...)}</ScrollView>; // BAD — renders all items
// ✅ Use FlatList (virtualizes the list)
```
