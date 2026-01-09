# Privacy Policy Hosting Guide

Play Store requires a publicly accessible URL for your privacy policy. Here are the easiest ways to host it:

## Option 1: GitHub Pages (Recommended - FREE)

1. **Create a new repository** or use existing one:
   - Go to https://github.com/new
   - Name it `ekthaa-policies` or similar
   - Make it **Public**

2. **Upload the HTML file**:
   - Upload `privacy-policy.html` to the repository
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)
   - Click Save

3. **Your URL will be**:
   ```
   https://[your-username].github.io/ekthaa-policies/privacy-policy.html
   ```
   Or if using organization:
   ```
   https://ekthaa.github.io/ekthaa-policies/privacy-policy.html
   ```

## Option 2: Netlify (FREE)

1. Go to https://www.netlify.com/
2. Sign up / Log in
3. Drag and drop the `privacy-policy.html` file
4. Get instant URL like: `https://your-site-name.netlify.app/privacy-policy.html`

## Option 3: Vercel (FREE)

1. Go to https://vercel.com/
2. Sign up / Log in
3. Create new project
4. Upload the `privacy-policy.html` file
5. Get URL like: `https://your-project.vercel.app/privacy-policy.html`

## Option 4: Your Own Domain

If you have a domain (e.g., ekthaa.app):
- Upload `privacy-policy.html` to your web hosting
- Access at: `https://ekthaa.app/privacy-policy.html`

---

## What to do in Play Console

1. Go to Play Console → Your App
2. Navigate to: **App content** → **Privacy policy**
3. Click **Start**
4. Enter your privacy policy URL (from above)
5. Click **Save**

The URL must be:
- ✅ Publicly accessible (no login required)
- ✅ Use HTTPS
- ✅ Display your complete privacy policy
- ✅ Be active and working

---

## Quick Test Commands

Test if your URL is accessible:
```bash
# Test with curl
curl -I https://your-privacy-url.com/privacy-policy.html

# Should return 200 OK
```

Or simply open the URL in a browser - it should display the privacy policy page.
