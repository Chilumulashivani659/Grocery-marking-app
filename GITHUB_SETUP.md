# GitHub Setup Instructions

## Option 1: Create Repository on GitHub Website

1. Go to https://github.com/new
2. Name your repository: `grocery-marking-app`
3. Select "Public" or "Private"
4. Click "Create repository"

Then push your code:

```bash
cd grocery-marking-app
git init
git add .
git commit -m "Initial commit: Grocery Marking PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/grocery-marking-app.git
git push -u origin main
```

## Option 2: Using GitHub CLI

```bash
# Install gh if not available
npm install -g gh

# Login
gh auth login

# Create repo and push
gh repo create grocery-marking-app --public --push --source=.
```

## After Setup

### Enable GitHub Actions Deployment

1. Go to your repository on GitHub
2. Click "Settings" > "Secrets and variables" > "Actions"
3. Add these secrets:
   - `FIREBASE_TOKEN`: Get from `firebase login:ci`
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID

### Firebase Project Setup

1. Go to https://console.firebase.google.com
2. Create a new project or select existing
3. Enable Hosting under "Build" > "Hosting"
4. Run `firebase init` locally to link the project
5. Copy the project ID to GitHub secrets

## Clone on Android

```bash
# In Termux
pkg update && pkg install git proot
git clone https://github.com/YOUR_USERNAME/grocery-marking-app.git ~/grocery-marking-app

# Run the setup script
bash ~/grocery-marking-app/setup-android.sh

# Launch opencode
~/bin/grocery-dev
```
