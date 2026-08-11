# 🚀 LearnXChain Mobile App (Expo)

This is the official Expo-based mobile application for the LearnXChain
(LXC) platform.

The project uses modern React Native architecture with Expo SDK 54, Expo
Router, and a full-stack setup including backend services, database
integration, and advanced mobile UI capabilities.

---

# 📱 Tech Stack

- Expo SDK 54
- React Native 0.81
- Expo Router (file-based routing)
- TypeScript
- React Query
- Drizzle ORM
- Express backend
- PostgreSQL
- Reanimated + Gesture Handler

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <your-repo-url>
cd expo-app
```

Install dependencies:

```bash
npm install
```

---

# ▶️ Development

## Start Expo development server

```bash
npm start
```

or:

```bash
npx expo start
```

---

## Custom Development Mode (with domain)

```bash
npm run expo:dev
```

Make sure environment variable is configured:

    LearnXChain_DEV_DOMAIN

---

## Start Backend Server

Open another terminal:

```bash
npm run server:dev
```

---

# 🧹 Clear Cache (Recommended if errors occur)

```bash
npx expo start -c
```

---

# 📦 Build Android APK (Testing)

Used for internal testing or direct installation.

```bash
npx eas build -p android --profile preview
```
# command to start dev build
```bash
npx expo start --dev-client
```
---

# 🏪 Build Android AAB (Google Play Store)

Required for Play Store publishing:

```bash
npx eas build -p android --profile production
```

---

# 🔐 Signing & Play Store

Before publishing ensure:

- Android package name configured
- versionCode incremented
- App icons added
- Permissions reviewed
- Privacy policy prepared

---

# 🧩 Project Structure

    /app                → Expo Router screens
    /components         → Reusable UI components
    /server             → Backend API
    /scripts            → Build scripts

---

# 🧠 Development Notes

- Always install native packages using:

```bash
npx expo install <package>
```

- Avoid manual version installs for native libraries.

---

# 🤝 Contributing

1.  Create a feature branch.
2.  Follow code standards.
3.  Test on Android device.
4.  Submit PR.

---

# 📄 License

Private proprietary software --- LearnXChain.
