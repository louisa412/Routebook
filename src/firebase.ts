// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage' // 1. 引入 Storage 模組

// 💡 這裡請貼上妳在 Firebase Console 「專案設定」裡看到的 config
const firebaseConfig = {
  apiKey: "AIzaSyCiR6TSVErD5XYrOqof7MtuiEpt-0cFFIk",
  authDomain: "routebook-d21c6.firebaseapp.com",
  projectId: "routebook-d21c6",
  storageBucket: "routebook-d21c6.firebasestorage.app",
  messagingSenderId: "823246840230",
  appId: "1:823246840230:web:db5193097e09b14b8d6f67",
  measurementId: "G-TTTK0P10GZ"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig)

// 2. 定義並導出服務實例
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app) // 3. 正式導出 storage 供彈窗使用

export default app