# JMNet — Cloud Backend & Personal Hosting Platform

**JMNet** turns your GitHub account (`ya77iumin`) into a cloud hosting backend, asset CDN, and full-control web management console.

---

## ⚡ Key Highlights

- **🔒 Military-Grade Encryption**: The GitHub Personal Access Token (PAT) is encrypted with **AES-256-GCM** using **PBKDF2** key derivation (100,000 iterations of SHA-256). It is never committed in plaintext, keeping it safe from secret scanners and repository visitors.
- **🔑 Password Protected**: Unlocks with vault password **`123as`**.
- **⚡ Cached Authentication**: Once entered, the credentials are encrypted and cached in your browser's local cache so you never need to re-enter the password on every visit.
- **🌐 Cloud Drive & File Hosting (CDN)**:
  - Drag-and-drop file uploader (supports Images, Videos, Audio, ZIPs, Code, Docs up to 100MB).
  - Instant CDN link generator:
    - **jsDelivr Fast Global CDN**: `https://cdn.jsdelivr.net/gh/ya77iumin/jmnet@main/<filepath>`
    - **GitHub Raw URL**: `https://raw.githubusercontent.com/ya77iumin/jmnet/main/<filepath>`
    - **HTML & Markdown Embed Tags** with one-click copy.
  - In-browser file explorer: preview media, view code, edit text files directly, and download.
- **📦 Repository Controller**:
  - Browse public & private repositories under your account.
  - Create new repositories with custom names and privacy settings.
  - Delete repositories with security confirmations.
  - Switch active storage target to any repo.
- **⚡ REST API Console**:
  - Full account control: execute arbitrary GitHub REST API requests (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`).
  - Pre-built presets for Gists, SSH Keys, Actions, Commits, and User profiles.
- **🚀 Vercel Deployable**: 100% zero-configuration deployment to Vercel.

---

## 🚀 Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser. Enter password **`123as`** to unlock.

---

## ☁️ Deploying to Vercel

### Method 1: Push to GitHub & Connect to Vercel (Recommended)
1. Push this workspace code to your `ya77iumin/jmnet` repository:
   ```bash
   git init
   git add .
   git commit -m "Deploy JMNet Hosting Platform"
   git remote add origin https://github.com/ya77iumin/jmnet.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `ya77iumin/jmnet` repository.
4. Framework preset: **Vite** (auto-detected).
5. Click **Deploy**!

### Method 2: Deploy directly via Vercel CLI
```bash
npx vercel --prod
```

---

## 🔐 Security & Password Info

- **Default Password**: `123as`
- **Cached in Browser**: Kept in `localStorage` until you click **Lock** in the top navigation bar.
- **Vault Settings**: You can change your password or update your GitHub token anytime from the **Vault** tab in the dashboard.
