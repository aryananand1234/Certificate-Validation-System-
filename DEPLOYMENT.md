# 🚀 Deployment Guide

This guide will help you deploy your Certificate Validation System and get a public link.

## Option 1: Deploy to Vercel (Recommended - Easiest)

### Steps:
1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click **"New Project"**
3. Import this repository
4. Vercel will auto-detect React settings
5. Click **"Deploy"**
6. Your app will be live at: `https://your-project.vercel.app`

**Time:** ~2 minutes  
**Custom Domain:** Free with Vercel

---

## Option 2: Deploy to Netlify

### Steps:
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import from Git"**
3. Connect your GitHub repository
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
5. Click **"Deploy site"**
6. Your app will be live at: `https://your-site.netlify.app`

**Time:** ~3 minutes  
**Custom Domain:** Free with Netlify

---

## Option 3: Deploy to GitHub Pages

### Prerequisites:
You need a GitHub account and repository.

### Steps:

#### 1. Create GitHub Repository
```bash
# Go to github.com and create a new repository
# Name it: certificate-validation-system
# Don't initialize with README (we already have files)
```

#### 2. Update package.json
Replace `yourusername` in the `homepage` field with your actual GitHub username:
```json
"homepage": "https://YOURUSERNAME.github.io/certificate-validation-system"
```

#### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOURUSERNAME/certificate-validation-system.git
git branch -M main
git push -u origin main
```

#### 4. Deploy
```bash
npm run deploy
```

Your app will be live at:  
**`https://YOURUSERNAME.github.io/certificate-validation-system`**

---

## Quick Start: Push to GitHub

If you just want to create a GitHub repository link:

```bash
# 1. Create a new repository on github.com
# 2. Run these commands:

git remote add origin https://github.com/YOURUSERNAME/REPONAME.git
git branch -M main
git push -u origin main
```

Then share your repository link:  
**`https://github.com/YOURUSERNAME/REPONAME`**

---

## Important Notes

### ⚠️ Before Deployment:

1. **Deploy Smart Contract First:**
   - Deploy `contracts/CertificateValidation.sol` to Sepolia testnet
   - Update `src/config.js` with the deployed contract address
   - Commit and push the changes

2. **Environment Variables (if needed):**
   - Vercel/Netlify: Add env vars in their dashboard
   - GitHub Pages: Not recommended for sensitive data

3. **Router Configuration:**
   - For GitHub Pages with React Router, the homepage URL matters
   - Vercel/Netlify handle routing automatically

### 🔗 What You Get:

- **GitHub Repository Link:** For code sharing and collaboration
- **Live Deployment Link:** For public access to your dApp
- **Automatic Updates:** Push to main branch = auto-deploy (Vercel/Netlify)

---

## Recommended Workflow

1. ✅ **Deploy smart contract to Sepolia**
2. ✅ **Update config.js with contract address**
3. ✅ **Test locally** (`npm start`)
4. ✅ **Commit changes** (`git add . && git commit -m "Update contract address"`)
5. ✅ **Push to GitHub**
6. ✅ **Deploy to Vercel/Netlify** (or run `npm run deploy` for GitHub Pages)
7. ✅ **Share your link!** 🎉

---

## Getting Help

- Vercel docs: https://vercel.com/docs
- Netlify docs: https://docs.netlify.com
- GitHub Pages: https://pages.github.com

Your project is ready for deployment! Choose the option that works best for you.
