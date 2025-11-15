# Complete Deployment Guide

To deploy all recent changes to https://pumulo-12eb1.web.app, follow these steps:

## 🚀 Quick Deploy (All Services)

### Option 1: Deploy Everything
```bash
# Build web app
pnpm build:web

# Deploy hosting, Firestore rules, and functions
firebase deploy
```

### Option 2: Step-by-Step Deployment

#### Step 1: Build the Web App
```bash
pnpm build:web
```
This creates the production build in `apps/web/dist`

#### Step 2: Deploy Firestore Security Rules ⚠️ IMPORTANT
```bash
firebase deploy --only firestore:rules
```
**Why first?** Security rules protect your database. Deploy these before anything else.

#### Step 3: Deploy Web App (Hosting)
```bash
firebase deploy --only hosting
```
This deploys your React app to https://pumulo-12eb1.web.app

#### Step 4: Deploy tRPC Functions (Optional)
```bash
firebase deploy --only functions
```
This deploys your tRPC backend server.

---

## 📝 Updated Deployment Commands

I've updated your `package.json` with better deployment options:

### Deploy Hosting Only (Most Common)
```bash
pnpm deploy
```
This builds and deploys just the web app.

### Deploy Everything
```bash
pnpm deploy:all
```
This builds and deploys hosting + Firestore rules + functions.

### Deploy Firestore Rules
```bash
pnpm deploy:rules
```
Just deploy security rules.

### Deploy Functions
```bash
pnpm deploy:functions
```
Just deploy tRPC backend.

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure:

- [ ] **Logged into Firebase CLI:**
  ```bash
  firebase login
  ```

- [ ] **Correct project selected:**
  ```bash
  firebase use pumulo-12eb1
  ```

- [ ] **No TypeScript errors:**
  ```bash
  pnpm typecheck
  ```

- [ ] **No lint errors:**
  ```bash
  pnpm lint
  ```

- [ ] **App builds successfully:**
  ```bash
  pnpm build:web
  ```

- [ ] **Verify build output exists:**
  - Check that `apps/web/dist/index.html` exists
  - Check that `apps/web/dist/assets/` folder has files

---

## 🔧 What Gets Deployed

### 1. **Web App (Hosting)** → https://pumulo-12eb1.web.app
   - All frontend changes (components, pages, etc.)
   - New tRPC client integration
   - Updated styling and features

### 2. **Firestore Security Rules** → Firebase Console
   - `firestore.rules` file
   - **Critical:** Protects your database
   - Controls who can read/write what

### 3. **tRPC Functions** → Firebase Cloud Functions
   - User router (getProfile, updateProfile, createProfile)
   - Goals router (CRUD operations)
   - Available at: `https://us-central1-pumulo-12eb1.cloudfunctions.net/trpc`

---

## ⚠️ After Deploying Functions

If you deploy the tRPC functions, you need to:

1. **Get the function URL:**
   ```bash
   firebase functions:config:get
   ```
   Or check: https://console.firebase.google.com/project/pumulo-12eb1/functions

2. **Update your environment variable:**
   Create/update `.env` or `.env.local`:
   ```env
   VITE_TRPC_ENDPOINT=https://us-central1-pumulo-12eb1.cloudfunctions.net/trpc
   ```

3. **Rebuild and redeploy:**
   ```bash
   pnpm build:web
   pnpm deploy
   ```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/web/node_modules
pnpm install

# Try building again
pnpm build:web
```

### Deployment Permission Denied
```bash
# Re-login
firebase logout
firebase login

# Verify project
firebase use pumulo-12eb1
firebase projects:list
```

### Functions Deploy Fails
```bash
# Make sure functions package is built
cd packages/functions
pnpm build
cd ../..

# Check for errors
firebase deploy --only functions --debug
```

### Rules Deploy Fails
```bash
# Validate rules locally first
firebase emulators:start --only firestore

# Test in emulator before deploying
```

---

## 📊 Deployment Verification

### Verify Web App
1. Visit: https://pumulo-12eb1.web.app
2. Check browser console for errors
3. Test core functionality (login, navigation)

### Verify Firestore Rules
1. Go to: https://console.firebase.google.com/project/pumulo-12eb1/firestore/rules
2. Check that rules are active
3. Rules should show: "Rules deployed successfully"

### Verify Functions
1. Go to: https://console.firebase.google.com/project/pumulo-12eb1/functions
2. Check that `trpc` function is deployed
3. Test endpoint (requires authentication)

---

## 🎯 Typical Deployment Workflow

For most updates, you only need:

```bash
# 1. Build
pnpm build:web

# 2. Deploy hosting
firebase deploy --only hosting

# Done! Changes are live at https://pumulo-12eb1.web.app
```

For security rule changes:

```bash
firebase deploy --only firestore:rules
```

For function updates:

```bash
# Build functions first
cd packages/functions
pnpm build
cd ../..

# Deploy
firebase deploy --only functions
```

---

## 🔄 Continuous Deployment

To automate deployments, you can:

1. **Add to CI/CD:**
   - Add deployment step to `.github/workflows/ci.yml`
   - Only deploy on `main` branch
   - Requires Firebase token secret

2. **Use GitHub Actions:**
   ```yaml
   - name: Deploy to Firebase
     uses: FirebaseExtended/action-hosting-deploy@v0
     with:
       repoToken: '${{ secrets.GITHUB_TOKEN }}'
       firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
       channelId: live
       projectId: pumulo-12eb1
   ```

---

## 📝 Notes

- **First time deploying?** Make sure you've run `firebase init` at some point
- **Firestore rules:** Deploy these FIRST for security
- **Functions:** Takes longer to deploy (5-10 minutes), be patient
- **Hosting:** Fast deployment (1-2 minutes)
- **Build size:** Large builds may take longer, watch for timeout errors

---

## ✅ Success Indicators

After deployment, you should see:

1. ✅ Console message: "Deploy complete!"
2. ✅ Hosting URL: https://pumulo-12eb1.web.app
3. ✅ No errors in Firebase console
4. ✅ App loads correctly in browser
5. ✅ Features work as expected

