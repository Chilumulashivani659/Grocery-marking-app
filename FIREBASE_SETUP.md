# Grocery Marking App - Firebase Hosting Setup

## One-time Firebase Setup

1. Install Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in this project:
   ```bash
   firebase init hosting
   ```
   
   When prompted:
   - Select this directory as project root
   - Set public directory to `.` (current directory)
   - Configure as single-page app: **Yes**
   - Set up automatic builds: **No**

4. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## Your app will be available at:
   ```
   https://your-project-id.web.app
   ```

## Note
Firebase Hosting is now part of Google Cloud. You may need to use the Firebase console at https://console.firebase.google.com to manage your hosting settings.
