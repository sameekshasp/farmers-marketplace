# 🔧 Git Repository Setup Guide

## Initial Setup

### 1. Initialize Git Repository

```bash
git init
```

### 2. Configure Git (First Time Only)

```bash
# Set your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Optional: Set default branch name to 'main'
git config --global init.defaultBranch main
```

### 3. Create .env Files (DO NOT COMMIT THESE!)

Copy the example files and fill in your actual credentials:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MySQL password and JWT secret

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed (default values usually work)
```

**IMPORTANT:** Never commit `.env` files! They contain sensitive information.

### 4. Review What Will Be Committed

```bash
# Check which files will be tracked
git status

# You should NOT see:
# - node_modules/
# - .env files
# - package-lock.json files
# - build/ directories
# - Any .bat or utility scripts
```

### 5. Add Files to Git

```bash
# Add all files (respecting .gitignore)
git add .

# Or add specific files
git add README.md package.json backend/ frontend/ database/
```

### 6. Create Initial Commit

```bash
git commit -m "Initial commit: Farmers Marketplace application"
```

---

## Create GitHub Repository

### Option A: Using GitHub Website

1. Go to https://github.com/new
2. Repository name: `farmers-marketplace` (or your preferred name)
3. Description: "Local Farmers Direct Marketplace - Connecting farmers with consumers"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Option B: Using GitHub CLI

```bash
gh repo create farmers-marketplace --public --source=. --remote=origin
```

---

## Push to GitHub

### 1. Add Remote Repository

```bash
# Replace 'yourusername' with your GitHub username
git remote add origin https://github.com/yourusername/farmers-marketplace.git
```

### 2. Verify Remote

```bash
git remote -v
```

### 3. Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

---

## What's Included in Git

✅ **Source Code:**
- All JavaScript/React files
- Backend controllers, routes, middleware
- Frontend components, pages, contexts
- Database schema

✅ **Configuration:**
- package.json files
- .gitignore
- vercel.json
- Tailwind config
- .env.example files (templates)

✅ **Documentation:**
- README.md
- DEPLOYMENT.md
- HOW_TO_RUN.md

---

## What's Excluded from Git

❌ **Dependencies:**
- node_modules/ (can be reinstalled with `npm install`)
- package-lock.json (generated automatically)

❌ **Environment Variables:**
- .env files (contain sensitive data)
- All .env.* files except .env.example

❌ **Build Outputs:**
- build/ directories
- dist/ directories

❌ **Development Utilities:**
- *.bat scripts
- suppress-warnings.js
- kill-ports.js
- Other utility scripts

❌ **Logs & Cache:**
- *.log files
- .cache directories
- .eslintcache

❌ **Editor Files:**
- .vscode/
- .idea/
- *.swp files

❌ **OS Files:**
- .DS_Store (Mac)
- Thumbs.db (Windows)

---

## Common Git Commands

### Check Status
```bash
git status
```

### Add Changes
```bash
# Add all changes
git add .

# Add specific file
git add path/to/file.js
```

### Commit Changes
```bash
git commit -m "Description of changes"
```

### Push Changes
```bash
git push origin main
```

### Pull Latest Changes
```bash
git pull origin main
```

### Create New Branch
```bash
git checkout -b feature/new-feature
```

### Switch Branches
```bash
git checkout main
git checkout feature/new-feature
```

### View Commit History
```bash
git log --oneline
```

---

## Branch Strategy (Recommended)

### Main Branches
- `main` - Production-ready code
- `develop` - Development branch

### Feature Branches
- `feature/user-authentication`
- `feature/product-search`
- `bugfix/cart-calculation`

### Workflow
```bash
# Create feature branch from develop
git checkout develop
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push feature branch
git push origin feature/new-feature

# Create Pull Request on GitHub
# After review, merge to develop
# Periodically merge develop to main for releases
```

---

## Protecting Sensitive Data

### Before First Commit - Verify .env is Ignored

```bash
# This should return nothing (file is ignored)
git status | grep .env

# If .env appears, it's NOT being ignored!
# Check your .gitignore file
```

### If You Accidentally Committed .env

```bash
# Remove from Git but keep local file
git rm --cached backend/.env
git rm --cached frontend/.env

# Commit the removal
git commit -m "Remove .env files from Git"

# Push changes
git push origin main

# IMPORTANT: Change all passwords and secrets immediately!
# The old values are still in Git history
```

### To Completely Remove from History (Advanced)

```bash
# Use git filter-branch or BFG Repo-Cleaner
# This rewrites history - use with caution!

# Using BFG (recommended)
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

---

## Collaborating with Team

### Clone Repository
```bash
git clone https://github.com/yourusername/farmers-marketplace.git
cd farmers-marketplace
```

### Setup After Cloning
```bash
# Install dependencies
npm run install:all

# Create .env files from examples
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your credentials
# Setup database (see HOW_TO_RUN.md)
# Run seed script
npm run seed

# Start development
npm run dev
```

---

## GitHub Repository Settings

### Recommended Settings

1. **Branch Protection Rules** (Settings → Branches)
   - Protect `main` branch
   - Require pull request reviews
   - Require status checks to pass

2. **Secrets** (Settings → Secrets and variables → Actions)
   - Add environment variables for CI/CD
   - Never commit secrets to code

3. **Collaborators** (Settings → Collaborators)
   - Add team members
   - Set appropriate permissions

---

## Continuous Deployment

### Vercel Auto-Deploy

Once pushed to GitHub, Vercel can auto-deploy:

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Every push to `main` triggers deployment

See DEPLOYMENT.md for detailed instructions.

---

## Troubleshooting

### "Permission denied" when pushing
```bash
# Use HTTPS with personal access token
# Or setup SSH keys
```

### "Repository not found"
```bash
# Check remote URL
git remote -v

# Update if needed
git remote set-url origin https://github.com/yourusername/farmers-marketplace.git
```

### Large files rejected
```bash
# GitHub has 100MB file size limit
# Use Git LFS for large files
git lfs install
git lfs track "*.psd"
```

---

## Best Practices

✅ **DO:**
- Commit frequently with clear messages
- Use branches for features
- Review changes before committing
- Keep commits focused and atomic
- Write descriptive commit messages
- Pull before pushing
- Use .gitignore properly

❌ **DON'T:**
- Commit sensitive data (.env files)
- Commit node_modules/
- Commit build outputs
- Force push to main branch
- Commit commented-out code
- Use vague commit messages like "fix" or "update"

---

## Commit Message Guidelines

### Format
```
<type>: <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```bash
git commit -m "feat: Add product search functionality"
git commit -m "fix: Resolve cart calculation error"
git commit -m "docs: Update README with deployment instructions"
git commit -m "refactor: Optimize database queries in product controller"
```

---

**Your repository is now ready for collaboration! 🚀**

For deployment instructions, see DEPLOYMENT.md
For running locally, see HOW_TO_RUN.md
