# 🚀 Play Store Release - Complete Checklist

Use this checklist to track your progress toward releasing Ekthaa Business on Google Play Store.

---

## Phase 1: Build Configuration ✅ COMPLETED

- [x] Updated app.json with proper app name, bundle ID, and version
- [x] Configured eas.json with production build profile
- [x] Added Android permissions to app.json
- [x] Updated .gitignore to protect sensitive files
- [x] Installed EAS CLI

**Files modified:**
- [app.json](app.json)
- [eas.json](eas.json)
- [.gitignore](.gitignore)

---

## Phase 2: Documentation Created ✅ COMPLETED

- [x] Created comprehensive release guide
- [x] Created privacy policy template
- [x] Created assets guide
- [x] Created build commands reference

**Files created:**
- [PLAY_STORE_RELEASE_GUIDE.md](PLAY_STORE_RELEASE_GUIDE.md) - Complete guide
- [PRIVACY_POLICY.md](PRIVACY_POLICY.md) - Privacy policy template
- [PLAY_STORE_ASSETS.md](PLAY_STORE_ASSETS.md) - Asset requirements
- [BUILD_COMMANDS.md](BUILD_COMMANDS.md) - Quick command reference

---

## Phase 3: Pre-Build Tasks (DO THIS NOW)

### A. Generate Signing Keystore
- [ ] Open terminal and run:
  ```bash
  keytool -genkeypair -v -storetype PKCS12 -keystore ekthaa-upload-key.keystore -alias ekthaa-key-alias -keyalg RSA -keysize 2048 -validity 10000
  ```
- [ ] Choose a strong password and remember it
- [ ] Fill in organization details
- [ ] Store keystore file securely (BACKUP IT!)
- [ ] Save password in a secure location (NOT in git repo)

**⚠️ CRITICAL:** Never lose this keystore! You cannot update your app without it.

### B. Login to EAS
- [ ] Run: `eas login`
- [ ] Enter your Expo account credentials
- [ ] If no account, create one at https://expo.dev

---

## Phase 4: Build the AAB

- [ ] Run: `eas build --platform android --profile production`
- [ ] Follow prompts for keystore setup:
  - Choose "Let Expo handle" OR
  - Choose "Upload my own keystore" if you generated one
- [ ] Wait for build to complete (10-20 minutes)
- [ ] Download the .aab file from the provided link
- [ ] Save .aab file in a safe location

**Build command:**
```bash
eas build --platform android --profile production
```

---

## Phase 5: Create Store Assets

### A. Privacy Policy
- [ ] Read PRIVACY_POLICY.md
- [ ] Update placeholders:
  - [ ] Replace `[Your Contact Number]` with actual phone
  - [ ] Replace `[Your Business Address]` with address
  - [ ] Replace `[Your City]` with your city
  - [ ] Update email addresses
- [ ] Host privacy policy:
  - [ ] Option 1: Upload to your website
  - [ ] Option 2: Publish as Google Doc (File → Share → Publish to web)
  - [ ] Option 3: Use privacy policy hosting service
- [ ] Copy the public URL
- [ ] Test URL is accessible

**Privacy Policy URL:** ___________________________

### B. Screenshots (Minimum 2, Maximum 8)
- [ ] Run the app: `npx expo start`
- [ ] Open on Android device/emulator
- [ ] Capture screenshots of:
  - [ ] Dashboard screen
  - [ ] Products list
  - [ ] Add product screen
  - [ ] Customers list
  - [ ] Invoice generator
  - [ ] Transaction history
  - [ ] QR code/business profile
  - [ ] Analytics (if applicable)
- [ ] Ensure screenshots are 1080x1920 or similar portrait size
- [ ] Remove any test/dummy data if inappropriate
- [ ] Save in organized folder

**Screenshots location:** ___________________________

### C. Feature Graphic (REQUIRED)
- [ ] Create 1024 x 500 pixel graphic
- [ ] Include app icon/logo
- [ ] Add app name: "Ekthaa Business"
- [ ] Add tagline: "Complete Business Management Solution"
- [ ] Use brand color: #5A9A8E
- [ ] Save as JPG or PNG

**Tools:** Canva, Figma, Adobe Express

**Feature graphic location:** ___________________________

### D. App Icon
- [x] Already exists: `./assets/icon.png`
- [ ] Verify it's 512x512 pixels
- [ ] Verify it's high quality

---

## Phase 6: Google Play Console Setup

### A. Create/Access Play Console Account
- [ ] Go to https://play.google.com/console
- [ ] Sign in with Google account
- [ ] Pay one-time $25 registration fee (if new account)
- [ ] Complete account setup

### B. Create New App
- [ ] Click "Create app"
- [ ] Enter app name: "Ekthaa Business"
- [ ] Choose default language: English (or your preferred)
- [ ] App type: Free (or Paid if charging)
- [ ] Accept declarations
- [ ] Click "Create app"

---

## Phase 7: Complete Store Listing

### A. Main Store Listing (Store presence → Main store listing)
- [ ] App name: "Ekthaa Business"
- [ ] Short description (80 chars):
  ```
  Manage your business efficiently - products, customers, invoices & transactions
  ```
- [ ] Full description: Copy from PLAY_STORE_RELEASE_GUIDE.md
- [ ] App icon: Upload 512x512 icon
- [ ] Feature graphic: Upload 1024x500 graphic
- [ ] Phone screenshots: Upload 2-8 screenshots
- [ ] App category: Business
- [ ] Contact email: support@ekthaa.com (or your email)
- [ ] Privacy policy URL: [Paste your URL]
- [ ] Save

### B. App Content (Policy → App content)

#### 1. Privacy Policy
- [ ] Add privacy policy URL
- [ ] Save

#### 2. App Access
- [ ] Select: "All functionality is available without restrictions"
  OR "Some functionality is restricted"
- [ ] If restricted, provide demo account:
  ```
  Username: demo@ekthaa.com
  Password: DemoPass123!
  Instructions: Login and navigate through app features
  ```
- [ ] Save

#### 3. Ads
- [ ] Select: "No, my app does not contain ads"
- [ ] Save

#### 4. Content Rating
- [ ] Start questionnaire
- [ ] Select category: Business/Productivity
- [ ] Answer all questions (mostly "No" for violence, etc.)
- [ ] For user interaction: Select "Yes" if users share info
- [ ] Submit questionnaire
- [ ] Review rating (should be PEGI 3 / Everyone)
- [ ] Apply rating

#### 5. Target Audience and Content
- [ ] Select age group: 18 and over
- [ ] Appeal to children? No
- [ ] Save

#### 6. News Apps (if applicable)
- [ ] Select: "No, my app is not a news app"
- [ ] Save

#### 7. COVID-19 Contact Tracing and Status Apps
- [ ] Select: "No"
- [ ] Save

#### 8. Data Safety
This is IMPORTANT - be accurate!

**Data Collection:**
- [ ] Personal Info: Name, Email, Phone, User IDs - ✅ Collected, Required
- [ ] Financial Info: Purchase history - ✅ Collected, Required
- [ ] Location: Approximate/Precise location - ✅ Collected, Optional
- [ ] Photos: Photos - ✅ Collected, Optional (for product images)

**Data Usage:**
- [ ] App functionality - ✅
- [ ] Analytics - ✅
- [ ] Personalization - ✅

**Data Sharing:**
- [ ] Not shared with third parties - ✅

**Security:**
- [ ] Data encrypted in transit - ✅
- [ ] Data encrypted at rest - ✅ (if your backend supports)
- [ ] Users can request deletion - ✅

- [ ] Submit data safety form

#### 9. Government Apps
- [ ] Select: "No, my app is not a government app"
- [ ] Save

#### 10. Financial Features
- [ ] If you process payments: "Yes" (provide details)
- [ ] If you only track transactions: "No"
- [ ] Save

#### 11. Health
- [ ] Select: "No, my app does not include health features"
- [ ] Save

---

## Phase 8: Upload AAB and Create Release

### A. Production Release
- [ ] Go to: Production → Releases
- [ ] Click "Create new release"
- [ ] Upload AAB file (the one you built with EAS)
- [ ] Review app details
- [ ] Add release notes:
  ```
  Version 1.0.0 (Initial Release)
  
  Welcome to Ekthaa Business!
  
  Features:
  • Complete product inventory management
  • Customer database and tracking
  • Professional invoice generation
  • Transaction recording and history
  • Business analytics dashboard
  • QR code business profile
  • Offers management
  • Dark mode support
  
  We're excited to help you manage your business efficiently!
  ```
- [ ] Click "Next"
- [ ] Review release
- [ ] Click "Start rollout to Production"

### B. Alternative: Start with Testing Track (Recommended)
- [ ] Go to: Internal testing → Create new release
- [ ] Upload AAB
- [ ] Add testers (email addresses)
- [ ] Test thoroughly
- [ ] Once satisfied, promote to Production

---

## Phase 9: Pre-Launch Report (Wait for Google)

- [ ] Google will run automated tests (24-48 hours)
- [ ] Review pre-launch report
- [ ] Fix any critical issues if found
- [ ] Re-upload if necessary

---

## Phase 10: Review and Approval

- [ ] Wait for Google review (typically 1-7 days)
- [ ] Check email for status updates
- [ ] If rejected, read feedback carefully
- [ ] Make required changes
- [ ] Resubmit

---

## Phase 11: App Goes Live! 🎉

- [ ] Receive approval email
- [ ] App appears on Play Store within few hours
- [ ] Search for "Ekthaa Business" on Play Store
- [ ] Share Play Store link with users
- [ ] Monitor reviews and ratings
- [ ] Respond to user feedback

**Play Store URL:** ___________________________

---

## Post-Launch Tasks

### Monitor Performance
- [ ] Check Play Console dashboard daily for first week
- [ ] Monitor crash reports
- [ ] Read user reviews
- [ ] Track download statistics
- [ ] Analyze user ratings

### Respond to Users
- [ ] Set up alerts for new reviews
- [ ] Respond to user feedback
- [ ] Address complaints and issues
- [ ] Thank users for positive reviews

### Plan Updates
- [ ] Fix bugs based on user reports
- [ ] Implement feature requests
- [ ] Improve based on analytics
- [ ] Release regular updates

---

## Quick Command Reference

### Build AAB:
```bash
eas build --platform android --profile production
```

### Check build status:
```bash
eas build:list
```

### Download build:
```bash
eas build:download --platform android --latest
```

### Run app locally:
```bash
npx expo start
```

---

## Important URLs

- **EAS Dashboard:** https://expo.dev
- **Play Console:** https://play.google.com/console
- **Your Privacy Policy:** ___________________________
- **Your App on Play Store:** ___________________________

---

## Support Documents

For detailed information, refer to:
1. [PLAY_STORE_RELEASE_GUIDE.md](PLAY_STORE_RELEASE_GUIDE.md) - Comprehensive guide
2. [PRIVACY_POLICY.md](PRIVACY_POLICY.md) - Privacy policy template
3. [PLAY_STORE_ASSETS.md](PLAY_STORE_ASSETS.md) - Asset creation guide
4. [BUILD_COMMANDS.md](BUILD_COMMANDS.md) - Build commands

---

## Emergency Contacts

- **Expo Support:** https://expo.dev/support
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Community:** https://forums.expo.dev

---

## Notes & Reminders

**⚠️ Never commit to git:**
- Keystore files (.keystore, .jks)
- Passwords or credentials
- Service account JSON files
- Private keys

**✅ Always backup:**
- Keystore file (multiple secure locations!)
- Keystore passwords
- Service account files
- App signing key SHA certificates

**📱 Test thoroughly before submission:**
- Test on multiple devices
- Test all features
- Check for crashes
- Verify permissions work
- Test offline functionality
- Test different Android versions

---

## Progress Tracking

**Current Status:** ___________________________

**Last Updated:** ___________________________

**Target Launch Date:** ___________________________

**Actual Launch Date:** ___________________________

---

**Good luck with your Play Store release! 🚀📱**

You've got this! Follow each step carefully, and your app will be live soon.
