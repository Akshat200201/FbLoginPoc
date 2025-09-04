# Facebook Login POC (React Native CLI)

## 📌 Goal
A tiny React Native app that implements **Facebook Login** using `react-native-fbsdk-next`.  
The app performs native/browser login, retrieves an access token, and shows basic profile info.

No backend, no fancy UI — just a **clean, correct auth flow** with proper callback configuration.

---
<p align="center">
  <img src="https://github.com/user-attachments/assets/a9070d6a-4b82-464c-8bd6-b3b7ce36291c" alt="1" width="250"/>
  <img src="https://github.com/user-attachments/assets/068befb7-33c5-411e-9149-ce71d63de3af" alt="2" width="250"/>
  <img src="https://github.com/user-attachments/assets/17111773-26c2-4955-ac16-96ea8e59a099" alt="3" width="250"/>
</p>


## 🚀 Features
- **Continue with Facebook** button.
- **Facebook native login** if the FB app is installed, else secure browser fallback.
- Requests `public_profile` and `email` permissions.
- On success:
  - ✅ Shows access token (masked, last 8 chars only).
  - ✅ Displays token expiry in human-readable format.
  - ✅ Fetches and renders user info (`id`, `name`, `email`) via Graph API.
- **Logout button** that clears token/session and returns to the login state.
- Handles **cancelled login and errors gracefully**.
- Proof the token works:
  - In-app Graph API call → `https://graph.facebook.com/v20.0/me?fields=id,name,email`
  - Can also debug in [Facebook Token Debugger](https://developers.facebook.com/tools/debug/accesstoken).

---

## 🛠️ Tech Stack
- **React Native CLI** (Bare workflow)
- **Facebook Login SDK**: [`react-native-fbsdk-next`](https://github.com/thebergamo/react-native-fbsdk-next)

---



## 🔧 Setup Instructions

### 1. Clone the repo
```sh
git clone https://github.com/Akshat200201/FbLoginPoc.git
cd FbLoginPoc
```
2. Install dependencies
```sh
npm install
# or
yarn install
```
3. Configure environment variables
Create a .env file in the root:
.env
```sh
FB_APP_ID=your_facebook_app_id_here
```
👉 Never commit secrets!
Instead, use .env.example for reference.
.env.example
```
FB_APP_ID=YOUR_FB_APP_ID
```
4. Android setup
Open android/ in Android Studio at least once to sync Gradle.

Run clean if needed:

```sh
cd android
./gradlew clean
cd ..
Start Metro and build:
```
```
npx react-native start
npx react-native run-android
```
5. iOS setup (if testing on macOS)

```
cd ios
pod install
cd ..
npx react-native run-ios
```

⚙️ Meta Developer Setup
Go to Meta for Developers → Create an app.

Add Facebook Login product.

Keep Mode: Development (no review needed).

Note down your App ID (add it to .env).

Configure redirect/callback URLs:

Android: Custom scheme via manifest (e.g., fb<APP_ID>://authorize).

iOS: Add the same scheme in Info.plist.

Add the generated redirect URLs in Valid OAuth Redirect URIs under the Facebook Login settings.

▶️ Demo Flow
Press Continue with Facebook.

If logged in:

✅ See masked access token.

✅ See expiry date/time.

✅ See user JSON (id, name, email).

Logout returns to the initial screen.

(Optional) Open Token Debugger to validate token.

🧹 Security Notes
.env holds sensitive values → not committed.

.env.example provides placeholders for collaborators.

Always keep node_modules and build files ignored via .gitignore.

📹 Walkthrough
Screen-record setup, showing:

Facebook Developer App configuration (App ID, redirect URIs).

Running the app.

Login → token + Graph API response.

Debugging token in Facebook Token Debugger.
