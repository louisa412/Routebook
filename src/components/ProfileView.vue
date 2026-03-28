<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { auth } from '../firebase'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { useTripStore } from '../stores/tripStore'

const tripStore = useTripStore()
const user = ref<User | null>(null)
const lodgingDraft = ref<Record<number, { name: string; address: string }>>({})

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
  })
})

watch(
  () => tripStore.lodging,
  (newLodging) => {
    lodgingDraft.value = JSON.parse(JSON.stringify(newLodging || {}))
  },
  { immediate: true, deep: true }
)

const syncStatusText = computed(() => {
  const textMap = {
    'local-only': '僅本機（未登入或離線）',
    syncing: '同步中…',
    synced: '已同步',
    'sync-failed': '同步失敗（仍保留本機資料）'
  }
  return textMap[tripStore.syncStatus]
})

const sortedLodgingDays = computed(() => {
  return Object.keys(lodgingDraft.value)
    .map(Number)
    .sort((a, b) => a - b)
})

const dayLabel = (day: number) => {
  const dayInfo = tripStore.days[day]
  if (!dayInfo) return `Day ${day + 1}`
  return `${dayInfo.dayTitle} · ${dayInfo.displayLabel}`
}

const ensureDayDraft = (day: number) => {
  if (!lodgingDraft.value[day]) {
    lodgingDraft.value[day] = { name: '', address: '' }
  }
}

const saveLodging = (day: number) => {
  ensureDayDraft(day)
  tripStore.updateLodging(day, {
    name: lodgingDraft.value[day].name,
    address: lodgingDraft.value[day].address
  })
}

const handleLogin = async () => {
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
    tripStore.saveToCloud()
  } catch (error) {
    console.error('登入失敗', error)
  }
}

const handleLogout = () => signOut(auth)
</script>

<template>
  <div class="profile-view space-y-4">
    <div class="profile-card" v-if="user">
      <img :src="user?.photoURL || 'https://via.placeholder.com/80'" class="avatar" />
      <h2 class="user-name">{{ user?.displayName || '旅行者' }}</h2>
      <p class="user-email">{{ user?.email }}</p>

      <div class="sync-status">
        <span class="status-dot" :class="tripStore.syncStatus"></span>
        {{ syncStatusText }}
      </div>
      <p v-if="tripStore.lastSyncError" class="sync-error">{{ tripStore.lastSyncError }}</p>
      <button @click="handleLogout" class="logout-btn">登出帳號</button>
    </div>

    <div class="login-card" v-else>
      <div class="icon-box">✈️</div>
      <h2>福岡路書雲端版</h2>
      <p>登入 Google 帳號，跨裝置同步行程</p>
      <button @click="handleLogin" class="login-btn">
        使用 Google 登入
      </button>
      <div class="sync-status mt-3">
        <span class="status-dot" :class="tripStore.syncStatus"></span>
        {{ syncStatusText }}
      </div>
    </div>

    <section class="lodging-card">
      <div class="lodging-header">
        <h3>住宿設定</h3>
        <span class="text-xs text-[#757199]">修改後會同步到使用「當日住宿」的行程</span>
      </div>

      <div class="lodging-list">
        <div v-for="day in sortedLodgingDays" :key="day" class="lodging-item">
          <p class="lodging-day">{{ dayLabel(day) }}</p>

          <label class="field-label">住宿名稱</label>
          <input
            v-model="lodgingDraft[day].name"
            class="field-input"
            placeholder="例如：福岡皇家花園酒店"
          />

          <label class="field-label">住宿地址</label>
          <input
            v-model="lodgingDraft[day].address"
            class="field-input"
            placeholder="例如：福岡市博多區..."
          />

          <button @click="saveLodging(day)" class="save-btn">儲存 Day {{ day + 1 }} 住宿</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-view { padding: 20px; }
.profile-card, .login-card, .lodging-card {
  background: white; padding: 24px 20px; border-radius: 24px; text-align: center;
  box-shadow: 0 10px 30px rgba(109,95,177,0.05);
}
.avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--rt-secondary); margin-bottom: 15px; }
.sync-status { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--rt-muted); background: var(--rt-bg); padding: 8px 16px; border-radius: 20px; }
.status-dot { width: 8px; height: 8px; background: #ccc; border-radius: 50%; }
.status-dot.syncing { background: #6D5FB1; box-shadow: 0 0 8px #6D5FB1; }
.status-dot.synced { background: #2fad4a; }
.status-dot.local-only { background: #a0a0a0; }
.status-dot.sync-failed { background: #ff4d4f; }
.sync-error { margin-top: 8px; color: #ff4d4f; font-size: 12px; }
.login-btn { background: #6D5FB1; color: white; border: none; padding: 12px 30px; border-radius: 12px; font-weight: 700; margin-top: 20px; width: 100%; }
.logout-btn { background: transparent; color: #ff4d4f; border: 1px solid #ff4d4f; padding: 10px; border-radius: 12px; margin-top: 30px; width: 100%; }

.lodging-header { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 16px; text-align: left; }
.lodging-header h3 { margin: 0; color: #231F40; }
.lodging-list { display: grid; gap: 14px; }
.lodging-item { border: 1px solid #ece9ff; border-radius: 16px; padding: 14px; text-align: left; background: #faf9ff; }
.lodging-day { font-size: 12px; color: #6D5FB1; font-weight: 800; margin-bottom: 8px; }
.field-label { display: block; font-size: 11px; color: #757199; margin: 8px 0 4px; }
.field-input {
  width: 100%; border: 1px solid #e6e3f7; border-radius: 10px; padding: 10px 12px; font-size: 14px;
  box-sizing: border-box; background: white; color: #231F40;
}
.save-btn {
  margin-top: 12px; width: 100%; background: #6D5FB1; color: white; border: none;
  border-radius: 10px; padding: 10px; font-weight: 700;
}
</style>
