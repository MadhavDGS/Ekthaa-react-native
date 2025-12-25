# Build Commands Reference

## Production Build (AAB for Play Store)

### Step 1: Login to EAS (if not already logged in)
```bash
eas login
```

### Step 2: Configure Project (First Time Only)
```bash
eas build:configure
```

### Step 3: Build AAB for Production
```bash
eas build --platform android --profile production
```

**This will:**
- Build an Android App Bundle (.aab) file
- Auto-increment version code
- Use production configuration
- Sign the app (you'll be prompted for keystore setup if first time)

**Expected output:**
- Build URL on Expo servers
- Download link for the .aab file
- Build usually takes 10-20 minutes

---

## Alternative: Build with Your Own Keystore

If you already generated your keystore (see PLAY_STORE_RELEASE_GUIDE.md), you can configure EAS to use it:

### Option 1: Let EAS manage keystore (Recommended for first-timers)
Just run the build command and follow prompts:
```bash
eas build --platform android --profile production
```
Choose: "Generate new keystore"

### Option 2: Use your own keystore
```bash
eas build --platform android --profile production
```
Choose: "I want to upload my own keystore" and provide:
- Path to keystore file
- Keystore password
- Key alias
- Key password

---

## Local Build (if you have Android Studio)

```bash
eas build --platform android --profile production --local
```

**Requirements:**
- Android Studio installed
- Android SDK configured
- Java JDK installed

---

## Preview/Testing Build (APK)

For testing before production release:

```bash
eas build --platform android --profile preview
```

This creates an APK file you can install directly on devices for testing.

---

## Development Build

```bash
eas build --platform android --profile development
```

---

## Check Build Status

If you lose the build URL:

```bash
eas build:list
```

Shows all your builds with download links.

---

## Download Built AAB

After build completes:
1. Visit the build URL provided in terminal
2. Click "Download" button
3. Save the .aab file
4. Upload to Play Console

Or download via CLI:
```bash
eas build:download --platform android --latest
```

---

## Submit to Play Store (After AAB is built)

### Manual Upload:
1. Go to Play Console
2. Navigate to Production → Create new release
3. Upload the .aab file
4. Add release notes
5. Review and rollout

### Automated Upload (Requires service account setup):
```bash
eas submit --platform android --latest
```

**Note:** This requires a Google Play service account JSON file configured in your project.

---

## Troubleshooting

### Build fails with dependency errors:
```bash
npx expo-doctor
npm install
eas build --platform android --profile production --clear-cache
```

### Keystore issues:
- Ensure you have the correct passwords
- Don't lose your keystore file (backup securely!)
- If first-time, let EAS generate and manage keystore

### Build takes too long:
- Builds typically take 10-20 minutes
- Check build queue status on Expo dashboard
- Use `--local` flag to build on your machine (faster if you have good hardware)

---

## Version Management

### Update version before building:

Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // Update this
    "android": {
      "versionCode": 2   // Update this (must increment)
    }
  }
}
```

Or let EAS auto-increment (already configured with `"autoIncrement": true` in eas.json)

---

## Build Profiles Explained

Your `eas.json` has three profiles:

1. **development:** For dev testing with expo-dev-client
2. **preview:** Creates APK for internal testing
3. **production:** Creates AAB for Play Store release

---

## Quick Command Summary

```bash
# First time setup
eas login
eas build:configure

# Build for Play Store
eas build --platform android --profile production

# Check build status
eas build:list

# Download latest build
eas build:download --platform android --latest

# Submit to Play Store (requires setup)
eas submit --platform android --latest
```

---

Good luck with your build! 🚀
