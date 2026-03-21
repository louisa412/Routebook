<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth } from '../firebase'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { useTripStore } from '../stores/tripStore'

const tripStore = useTripStore()
const user = ref<User | null>(null)

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
  })
})

const handleLogin = async () => {
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
    tripStore.saveToCloud() // 登入後立即備份一次
  } catch (error) {
    console.error("登入失敗", error)
  }
}

const handleLogout = () => signOut(auth)
</script>

<template>
  <div class="profile-view">
    <div class="profile-card" v-if="user">
      <img :src="user?.photoURL || 'https://via.placeholder.com/80'" class="avatar" />
      <h2 class="user-name">{{ user?.displayName || '旅行者' }}</h2>
      <p class="user-email">{{ user?.email }}</p>
      
      <div class="sync-status">
        <span class="status-dot" :class="{ active: tripStore.isSyncing }"></span>
        {{ tripStore.isSyncing ? '同步中...' : '雲端已就緒' }}
      </div>
      <button @click="handleLogout" class="logout-btn">登出帳號</button>
    </div>

    <div class="login-card" v-else>
      <div class="icon-box">✈️</div>
      <h2>福岡路書雲端版</h2>
      <p>登入 Google 帳號，跨裝置同步行程</p>
      <button @click="handleLogin" class="login-btn">
        使用 Google 登入
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-view { padding: 20px; }
.profile-card, .login-card { 
  background: white; padding: 40px 20px; border-radius: 24px; text-align: center;
  box-shadow: 0 10px 30px rgba(109,95,177,0.05);
}
.avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--rt-secondary); margin-bottom: 15px; }
.sync-status { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--rt-muted); background: var(--rt-bg); padding: 8px 16px; border-radius: 20px; }
.status-dot { width: 8px; height: 8px; background: #ccc; border-radius: 50%; }
.status-dot.active { background: #6D5FB1; box-shadow: 0 0 8px #6D5FB1; }
.login-btn { background: #6D5FB1; color: white; border: none; padding: 12px 30px; border-radius: 12px; font-weight: 700; margin-top: 20px; width: 100%; }
.logout-btn { background: transparent; color: #ff4d4f; border: 1px solid #ff4d4f; padding: 10px; border-radius: 12px; margin-top: 30px; width: 100%; }
</style>