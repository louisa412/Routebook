<template>
  <div class="more-page space-y-4 p-5 pb-32">
    <button @click="$emit('openNewTrip')" class="w-full bg-white rounded-[22px] p-5 flex items-center gap-4 border border-[#6D5FB1]/10 active:scale-[0.98] transition-transform">
      <div class="w-12 h-12 bg-[#EFEEF7] rounded-[15px] flex items-center justify-center text-2xl flex-shrink-0">✈️</div>
      <div class="text-left">
        <p class="font-black text-base text-[#231F40]">規劃新旅行</p>
        <p class="text-xs text-[#757199] mt-0.5">清空行程，開始新的路書</p>
      </div>
      <span class="ml-auto text-[#DEDAF4] text-xl">›</span>
    </button>
    <button @click="$emit('openImport')" class="w-full bg-gradient-to-r from-[#6D5FB1] to-[#8E82D6] text-white rounded-[22px] p-5 flex items-center gap-4 shadow-lg shadow-[#6D5FB1]/20 active:scale-[0.98] transition-transform">
      <div class="w-12 h-12 bg-white/20 rounded-[15px] flex items-center justify-center text-2xl flex-shrink-0">📥</div>
      <div class="text-left">
        <p class="font-black text-base">匯入內容</p>
        <p class="text-xs opacity-80 mt-0.5">把整理好的清單或行程一鍵帶進來</p>
      </div>
      <span class="ml-auto text-white/60 text-xl">›</span>
    </button>
    <ProfileCard
      :user="user"
      :sync-status="syncStatus"
      :sync-error="syncError"
      @login-success="saveToCloud()"
    />
    <LodgingSettings />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth } from '../firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useFirebaseSync } from '../stores/useFirebaseSync'
import type { SyncStatus } from '../types'
import ProfileCard from './profile/ProfileCard.vue'
import LodgingSettings from './profile/LodgingSettings.vue'

defineProps<{ syncStatus: SyncStatus; syncError: string }>()
defineEmits(['openImport', 'openNewTrip'])

const { saveToCloud } = useFirebaseSync()
const user = ref<User | null>(null)
onMounted(() => { onAuthStateChanged(auth, (u) => { user.value = u }) })
</script>
