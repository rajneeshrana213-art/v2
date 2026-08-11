# LearnXChain Mobile Application - Developer Guide

This guide contains the checklist and instructions to run, build, and version the mobile application locally.

---

## 📋 Prerequisites Check

Ensure you have the correct system tools installed and configured:

| Requirement | Supported Version / Configuration | Check Command |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.19.4` | `node -v` |
| **pnpm** | `10.22.0` | `pnpm -v` |
| **Java Development Kit (JDK)** | **JDK 17** (Required for Android build tools) | `java -version` |
| **Android SDK** | Platforms: `android-36`<br>Build Tools: `36.0.0`<br>NDK: `27.1.12297006` | Check via Android Studio SDK Manager |

### 🛠️ Environment Variables Configuration (Windows)

Ensure the following environment variables are set:

* **`JAVA_HOME`**: Must point to your JDK 17 installation (e.g., `C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot`).
* **`ANDROID_HOME`**: Must point to your Android SDK root (e.g., `C:\Users\<YourUser>\AppData\Local\Android\Sdk`).
* **`PATH`**: Add these directories to your system environment `PATH`:
  * `%ANDROID_HOME%\platform-tools` (for `adb` commands)
  * `%ANDROID_HOME%\emulator` (for running emulators)

---

## 🚀 How to Start the App Locally

Follow this step-by-step checklist to boot and run the application:

### Step 1: Start the Android Emulator
1. List available virtual devices:
   ```powershell
   emulator -list-avds
   ```
2. Start your preferred emulator (e.g., `Pixel_10_Pro`):
   ```powershell
   emulator -avd Pixel_10_Pro
   ```
3. Check if ADB detects the booted device:
   ```powershell
   adb devices
   ```
   *(Ensure the device status changes from `offline` to `device` before proceeding).*

### Step 2: Start the Metro Bundler
Navigate to the mobile directory (`apps/mobile`) and launch the bundler:
```bash
# Using pnpm from monorepo root
pnpm --filter @learnxchain/mobile dev

# Or directly inside apps/mobile
npm run dev
```

### Step 3: Run the Application
In a new terminal window, compile and install the application onto the active emulator:
```bash
# Inside apps/mobile
npm run android
```
*(For iOS on macOS, use `npm run ios`)*

---

## 🏗️ How to Create Builds Locally

> [!IMPORTANT]
> If compilation fails due to Windows path limit (MAX_PATH) errors or NDK linker bugs, verify that the CMake staging directory override (`C:\tmp\lxc-cxx`) and `-DCMAKE_INTERPROCEDURAL_OPTIMIZATION=FALSE` argument are configured in [build.gradle](file:///c:/Users/learn/OneDrive/Desktop/LearnXChain/Office/lxc-os/apps/mobile/android/build.gradle).

### 🧹 1. Perform a Clean Sync
Before creating any release or testing build, always clean the Gradle cache:
```powershell
cd android
./gradlew clean
```

### ⚙️ 2. Build Debug APK
To create a debug APK for local testing:
```powershell
cd android
./gradlew assembleDebug
```
* **Output Path:** [app-debug.apk](file:///c:/Users/learn/OneDrive/Desktop/LearnXChain/Office/lxc-os/apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk)

### 📦 3. Build Release APK / App Bundle (AAB)
To package the app for production distribution:
```powershell
cd android
# Compile a standalone Release APK
./gradlew assembleRelease

# Compile a Play Store Release AAB (App Bundle)
./gradlew bundleRelease
```
* **Release APK Output:** `android/app/build/outputs/apk/release/app-release.apk`
* **Release AAB Output:** `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🏷️ How to Update App Versions

When publishing a new app update, you must increment the version coordinates in **both** the Expo settings and native configurations.

### 1. Update Version in app.json
Open [app.json](file:///c:/Users/learn/OneDrive/Desktop/LearnXChain/Office/lxc-os/apps/mobile/app.json) and modify:
```json
{
  "expo": {
    "version": "1.0.4",          // Human-readable semver version string
    "android": {
      "versionCode": 33,         // Incremented integer code (must be higher than the last release)
      ...
    }
  }
}
```

### 2. Update Version in package.json
Open [package.json](file:///c:/Users/learn/OneDrive/Desktop/LearnXChain/Office/lxc-os/apps/mobile/package.json) and update the version field:
```json
{
  "name": "@learnxchain/mobile",
  "version": "1.0.4",
  ...
}
```

### 3. Update Native Gradle Settings
Open [android/app/build.gradle](file:///c:/Users/learn/OneDrive/Desktop/LearnXChain/Office/lxc-os/apps/mobile/android/app/build.gradle) and update the build coordinates inside the `defaultConfig` block (around line 95):
```groovy
    defaultConfig {
        applicationId 'com.learnxchain.lxc'
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 33             // Matches app.json android.versionCode
        versionName "1.0.4"        // Matches app.json version
        ...
    }
```

---

## 💡 Troubleshooting Checklist

* **Metro bundler port conflicts:** If port `8081` is already in use, kill the occupying process:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess -Force
  ```
* **Java Version mismatch:** Ensure `$env:JAVA_HOME` outputs JDK 17. Run `$env:JAVA_HOME` in Powershell to confirm.
* **CMake build issues:** Run `./gradlew clean` to clear CMake caches in the `C:\tmp\lxc-cxx` directory.
