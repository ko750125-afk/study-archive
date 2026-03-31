import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase 설정 (하드코딩으로 Vercel 환경변수 문제 원천 차단)
// TODO: 아래 값들을 Firebase Console에서 가져온 실제 값으로 교체하세요
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let app: ReturnType<typeof initializeApp> | undefined;
let db: ReturnType<typeof getFirestore> | undefined;
let storage: ReturnType<typeof getStorage> | undefined;

const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

if (hasConfig) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.error("Firebase 초기화 실패:", err);
  }
} else {
  console.warn("Firebase 설정이 없습니다. 로컬 저장 모드로 동작합니다.");
}

export { app, db, storage };
export const isFirebaseConnected = !!db;
