<template>
  <div v-if="user" class="profile-card">
    <img :src="user.photoURL || 'https://via.placeholder.com/80'" class="avatar" />
    <h2 class="user-name">{{ user.displayName || '旅行者' }}</h2>
    <p class="user-email">{{ user.email }}</p>
    <div class="sync-status">
      <span class="status-dot" :class="syncStatus"></span>
      {{ statusText }}
    </div>
    <p v-if="syncError" class="sync-error">{{ syncError }}</p>
    <button @click="handleLogout" class="logout-btn">登出帳號</button>
  </div>
  <div v-else class="login-card">
    <div class="icon-box">✈️</div>
    <h2>福岡路書雲端版</h2>
    <p>登入 Google 帳號，跨裝置同步行程</p>
    <button @click="handleLogin" class="login-btn">使用 Google 登入</button>
    <div class="sync-status mt-3">
      <span class="status-dot" :class="syncStatus"></span>
      {{ statusText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { auth } from '../../firebase'
import { GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth'
import type { SyncStatus } from '../../types'
const props = defineProps<{ user: User | null; syncStatus: SyncStatus; syncError: string }>()
const emit = defineEmits<{ loginSuccess: [] }>()
const STATUS_TEXT: Record<SyncStatus, string> = { 'local-only': '僅本機（未登入或離線）', syncing: '同步中…', synced: '已同步', 'sync-failed': '同步失敗（仍保留本機資料）' }
const statusText = computed(() => STATUS_TEXT[props.syncStatus])
const handleLogin = async () => { try { await signInWithPopup(auth, new GoogleAuthProvider()); emit('loginSuccess') } catch (e) { console.error(e) } }
const handleLogout = () => signOut(auth)
</script>

<style scoped>
.profile-card, .login-card { background: white; padding: 24px 20px; border-radius: 24px; text-align: center; box-shadow: 0 10px 30px rgba(109,95,177,0.05); }
.avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #DEDAF4; margin-bottom: 15px; }
.user-name { font-size: 18px; font-weight: 800; color: #231F40; margin: 0 0 4px; }
.user-email { font-size: 13px; color: #757199; margin: 0 0 16px; }
.icon-box { font-size: 48px; margin-bottom: 12px; }
.sync-status { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #757199; background: #EFEEF7; padding: 8px 16px; border-radius: 20px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ccc; }
.status-dot.syncing { background: #6D5FB1; box-shadow: 0 0 8px #6D5FB1; }
.status-dot.synced { background: #2fad4a; }
.status-dot.local-only { background: #a0a0a0; }
.status-dot.sync-failed { background: #ff4d4f; }
.sync-error { margin-top: 8px; color: #ff4d4f; font-size: 12px; }
.login-btn { background: #6D5FB1; color: white; border: none; padding: 12px 30px; border-radius: 12px; font-weight: 700; margin-top: 20px; width: 100%; }
.logout-btn { background: transparent; color: #ff4d4f; border: 1px solid #ff4d4f; padding: 10px; border-radius: 12px; margin-top: 20px; width: 100%; }
</style>
