// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
const app = initializeApp(firebaseConfig);

// 💡 匯出資料庫與驗證工具，讓其他檔案可以 import
export const db = getFirestore(app);
export const auth = getAuth(app);