<template>
  <div class="space-y-4 p-5">
    <ProfileCard
      :user="user"
      :sync-status="syncStatus"
      :sync-error="tripStore.lastSyncError"
      @login-success="tripStore.saveToCloud()"
    />
    <LodgingSettings />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth } from '../firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useTripStore } from '../stores/useTripStore'
import { useFirebaseSync } from '../stores/useFirebaseSync'
import ProfileCard from './profile/ProfileCard.vue'
import LodgingSettings from './profile/LodgingSettings.vue'

const tripStore = useTripStore()
const { syncStatus } = useFirebaseSync()
const user = ref<User | null>(null)

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => { user.value = currentUser })
})
</script>
