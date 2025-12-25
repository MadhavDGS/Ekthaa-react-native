# Play Store Assets Template

## Required Assets Checklist

### 1. App Icon ✅
- **Status:** Already exists at `./assets/icon.png`
- **Size:** 512x512 pixels
- **Format:** PNG (32-bit with alpha)

---

### 2. Feature Graphic (REQUIRED)
**Size:** 1024 x 500 pixels
**Format:** JPG or 24-bit PNG (no alpha channel)

**Design Elements:**
- App icon/logo
- App name: "Ekthaa Business"
- Tagline: "Complete Business Management Solution"
- Key feature icons or text
- Brand color: #5A9A8E (teal/green from splash)

**Tools to create:**
- Canva: https://www.canva.com/ (free templates)
- Figma: https://www.figma.com/
- Adobe Express: https://www.adobe.com/express/

---

### 3. Screenshots (REQUIRED - Minimum 2)
**Specifications:**
- **Format:** PNG or JPG
- **Quantity:** 2-8 screenshots
- **Orientation:** Portrait (phone)
- **Aspect Ratio:** 9:16 (recommended)
- **Min dimensions:** 320px
- **Max dimensions:** 3840px
- **Recommended size:** 1080 x 1920 pixels (Full HD)

**Recommended Screenshots:**

1. **Dashboard Screen**
   - Shows business overview
   - Total credit, payment, outstanding balance
   - Recent transactions preview

2. **Products Screen**
   - Product inventory list
   - Shows organized products
   - Clean interface

3. **Add Product Screen**
   - Product entry form
   - Category selection
   - Image upload feature

4. **Customers Screen**
   - Customer list with balances
   - Search functionality
   - Easy navigation

5. **Invoice Generator**
   - Professional invoice template
   - Business details
   - Customer info and items

6. **Transaction History**
   - Transaction list
   - Credit/Payment indicators
   - Date and amount display

7. **QR Code/Business Profile**
   - QR code for sharing
   - Business information
   - Contact details

8. **Analytics Dashboard**
   - Business insights
   - Charts and metrics
   - Performance tracking

**How to Capture:**
1. Run the app on your phone or emulator
2. Navigate to each screen
3. Take high-quality screenshots
4. Ensure text is readable
5. Use consistent device/aspect ratio
6. Remove any test data with inappropriate info
7. Optionally: Add device frames using mockups

**Tools for Device Frames:**
- https://mockuphone.com/
- https://www.screely.com/
- https://deviceframes.com/

---

### 4. Short Description (80 characters max)
```
Manage your business efficiently - products, customers, invoices & transactions
```
**Character count:** 79/80 ✅

---

### 5. Full Description (4000 characters max)
See PLAY_STORE_RELEASE_GUIDE.md, Section "Store Listing Content"

---

### 6. Privacy Policy URL (REQUIRED)
**Options:**

**Option A: Host on Website**
- Upload to your domain (e.g., https://ekthaa.com/privacy-policy)

**Option B: Google Docs (Quick Solution)**
1. Create document in Google Docs
2. File → Share → Publish to web
3. Get public URL
4. Use this URL in Play Console

**Option C: Privacy Policy Generators**
- https://www.privacypolicies.com/
- https://www.termly.io/products/privacy-policy-generator/
- https://app-privacy-policy-generator.firebaseapp.com/

See PLAY_STORE_RELEASE_GUIDE.md for privacy policy template content.

---

### 7. Video (Optional but Recommended)
**Specifications:**
- Upload to YouTube
- Duration: 30 seconds to 2 minutes
- Shows key features
- Professional quality

**Content:**
1. App opening/splash (3 sec)
2. Dashboard overview (10 sec)
3. Adding a product (10 sec)
4. Creating an invoice (15 sec)
5. Transaction tracking (10 sec)
6. Closing with logo/website (5 sec)

---

## Asset Creation Workflow

### Step 1: Capture Screenshots
```bash
# Run the app
npx expo start

# Then:
# 1. Open on Android device or emulator
# 2. Navigate through the app
# 3. Capture screenshots of key screens
# 4. Transfer to computer
```

**On Android Device:**
- Press Power + Volume Down simultaneously

**On Android Emulator:**
- Click camera icon in emulator controls
- Or use device screenshots button

### Step 2: Organize Screenshots
Create a folder structure:
```
/play-store-assets
  /screenshots
    01-dashboard.png
    02-products-list.png
    03-add-product.png
    04-customers-list.png
    05-invoice-generator.png
    06-transactions.png
    07-qr-code.png
    08-analytics.png
  /feature-graphic
    feature-graphic.png
  /icon
    icon-512.png
```

### Step 3: Optimize Screenshots (Optional)
1. Add device frames
2. Add captions/titles to highlight features
3. Ensure consistent styling
4. Compress file sizes if needed

---

## Quick Checklist Before Upload

- [ ] 2-8 screenshots captured and organized
- [ ] Feature graphic created (1024x500)
- [ ] App icon ready (512x512)
- [ ] Privacy policy created and URL ready
- [ ] Short description written (under 80 chars)
- [ ] Full description written (under 4000 chars)
- [ ] Demo account credentials prepared
- [ ] All screenshots show no sensitive/test data
- [ ] All text in screenshots is readable
- [ ] Screenshots represent current app version
- [ ] Feature graphic follows Play Store guidelines
- [ ] Contact email verified and working

---

## Helpful Resources

### Design Inspiration
- Browse top business apps on Play Store
- Look at successful invoice/business management apps
- Note their screenshot styles and feature graphics

### Tools
- **Canva:** Easy graphic design
- **Figma:** Professional design tool
- **Screenshot Framer:** Add device frames
- **TinyPNG:** Compress images
- **ImageOptim:** Optimize images for Mac

### Google Guidelines
- [App Store Listing Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Graphic Assets Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)

---

## Next Steps

1. **Capture screenshots** from your running app
2. **Create feature graphic** using template tools
3. **Write/host privacy policy**
4. **Organize all assets** in a folder
5. **Review quality** of all assets
6. **Proceed to upload** in Play Console

---

Remember: First impressions matter! Quality screenshots and graphics can significantly impact download rates.
