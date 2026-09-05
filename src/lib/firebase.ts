import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

export interface FirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

/**
 * Resolves Firebase configuration from environment variables.
 * Supports:
 * 1. NEXT_PUBLIC_FIREBASE_CONFIG (single JSON string)
 * 2. Individual NEXT_PUBLIC_FIREBASE_* environment variables
 * 3. Fallback defaults for seamless development
 */
export function getFirebaseConfig(): FirebaseConfig {
  let jsonConfig: Partial<FirebaseConfig> = {};

  if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    try {
      jsonConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
    } catch (e) {
      console.warn("Gagal mem-parse NEXT_PUBLIC_FIREBASE_CONFIG:", e);
    }
  }

  return {
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      jsonConfig.projectId ||
      process.env.FIREBASE_PROJECT_ID ||
      "uburubur-85adc",
    appId:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
      jsonConfig.appId ||
      process.env.FIREBASE_APP_ID ||
      "1:758029660631:web:951aa8ee9c158f864f5b92",
    apiKey:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      jsonConfig.apiKey ||
      process.env.FIREBASE_API_KEY ||
      "AIzaSyAuDhbs1XLP1k_DpTY0G51BP1oN7KK4Tv4",
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      jsonConfig.authDomain ||
      process.env.FIREBASE_AUTH_DOMAIN ||
      "uburubur-85adc.firebaseapp.com",
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      jsonConfig.storageBucket ||
      process.env.FIREBASE_STORAGE_BUCKET ||
      "uburubur-85adc.firebasestorage.app",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      jsonConfig.messagingSenderId ||
      process.env.FIREBASE_MESSAGING_SENDER_ID ||
      "758029660631",
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
      jsonConfig.measurementId ||
      "",
    oAuthClientId:
      process.env.NEXT_PUBLIC_FIREBASE_OAUTH_CLIENT_ID ||
      jsonConfig.oAuthClientId ||
      "40137024075-ogj1uhhc1ah4v8rmrgr6ahvpnseqgcvb.apps.googleusercontent.com",
    recaptchaSiteKey:
      process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITE_KEY ||
      jsonConfig.recaptchaSiteKey ||
      "",
  };
}

export const firebaseConfig = getFirebaseConfig();

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApp();
    return _app;
  }
  _app = initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  const app = getFirebaseApp();
  _auth = getAuth(app);
  return _auth;
}

export function getFirebaseFirestore(): Firestore {
  if (_db) return _db;
  const app = getFirebaseApp();
  _db = getFirestore(app);
  return _db;
}

export function getGoogleAuthProvider(): GoogleAuthProvider {
  if (_googleProvider) return _googleProvider;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  provider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
  provider.addScope("https://www.googleapis.com/auth/classroom.coursework.me.readonly");
  provider.addScope("https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly");
  provider.addScope("https://www.googleapis.com/auth/classroom.student-submissions.me.readonly");
  provider.addScope("https://www.googleapis.com/auth/drive.readonly");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  _googleProvider = provider;
  return _googleProvider;
}

// Default export instances for drop-in compatibility
export const app = getFirebaseApp();
export const auth = getFirebaseAuth();
export const db = getFirebaseFirestore();
export const googleProvider = getGoogleAuthProvider();
