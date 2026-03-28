// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCiR6TSVErD5XYrOqof7MtuiEpt-0cFFIk',
  authDomain: 'routebook-d21c6.firebaseapp.com',
  projectId: 'routebook-d21c6',
  storageBucket: 'routebook-d21c6.firebasestorage.app',
  messagingSenderId: '823246840230',
  appId: '1:823246840230:web:db5193097e09b14b8d6f67',
  measurementId: 'G-TTTK0P10GZ'
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
enableIndexedDbPersistence(db).catch((error) => {
  if (error.code === 'failed-precondition') {
    console.warn('Firestore offline persistence 啟用失敗：目前已有其他分頁使用中。')
  } else if (error.code === 'unimplemented') {
    console.warn('Firestore offline persistence 不支援目前瀏覽器。')
  } else {
    console.warn('Firestore offline persistence 啟用失敗。', error)
  }
})

export const auth = getAuth(app)
export const storage = getStorage(app)

export default app
