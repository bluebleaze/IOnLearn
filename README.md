# IOnLearn — Smart Study Companion

Auto-sync Google Classroom → to-do list + AI resources + chatbot.

## Setup

1. **Firebase**: Create a project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable **Authentication** → Google sign-in provider
   - Enable **Cloud Firestore** (start in test mode)
   - Copy your web app config

2. **Google Cloud**: In your Firebase project's [Google Cloud Console](https://console.cloud.google.com)
   - Enable **Google Classroom API**
   - Add your domain to OAuth consent screen authorized domains

3. **Gemini AI**: Get an API key at [aistudio.google.com](https://aistudio.google.com/apikey)

4. **Environment**: Copy `.env.local.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.local.example .env.local
   ```

5. **Run**:
   ```bash
   npm install
   npm run dev
   ```

## How It Works

1. Sign in with Google (grants Classroom read access)
2. Click "Sync Classroom" to pull assignments
3. Tasks appear as a to-do list — click any task to see AI-generated study resources
4. Use the 💬 chatbot (bottom-right) for follow-up questions about your tasks

## Tech Stack

Next.js 14 · TypeScript · Tailwind CSS · Firebase Auth + Firestore · Gemini AI

## Firestore Rules (production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## halo
## halo juga
```bash
halo juga juga
```