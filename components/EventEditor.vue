<template>
  <div class="editor-overlay" @click.self="$emit('close')">
    <div class="editor-card">
      <div class="editor-header">
        <h3>{{ isNew ? '新增行程' : '編輯行程' }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="editor-body">
        <div class="input-group">
          <label>行程名稱</label>
          <input v-model="localEvent.title" placeholder="例如：博多運河城" />
        </div>

        <div class="option-row">
          <label class="checkbox-label">
            <input type="checkbox" v-model="localEvent.isAtAccommodation" />
            📍 此行程位於當日住宿點
          </label>
        </div>

        <div class="input-group">
          <label>地點</label>
          <input 
            v-model="localEvent.location" 
            :disabled="localEvent.isAtAccommodation"
            :placeholder="localEvent.isAtAccommodation ? '已自動連動住宿點' : '輸入地點'" 
          />
        </div>

        <div class="time-row">
          <div class="input-group">
            <label>開始時間</label>
            <div class="time-picker">
              <input type="number" v-model="localEvent.hour" min="0" max="23" /> :
              <input type="number" v-model="localEvent.minute" min="0" max="59" />
            </div>
          </div>
          <div class="input-group">
            <label>結束時間</label>
            <div class="time-picker">
              <input type="number" v-model="localEvent.endHour" min="0" max="23" /> :
              <input type="number" v-model="localEvent.endMinute" min="0" max="59" />
            </div>
          </div>
        </div>

        <div class="input-group">
          <label>預算 (JPY)</label>
          <input type="number" v-model="localEvent.budget" />
        </div>

        <div class="input-group">
          <label>分類</label>
          <select v-model="localEvent.category">
            <option>景點</option>
            <option>美食</option>
            <option>交通</option>
            <option>購物</option>
            <option>飯店</option>
            <option>其他</option>
          </select>
        </div>

        <div class="input-group">
          <label>備註</label>
          <textarea v-model="localEvent.note" rows="3"></textarea>
        </div>
      </div>

      <div class="editor-footer">
        <button v-if="!isNew" class="delete-btn" @click="$emit('delete')">刪除</button>
        <button class="save-btn" @click="handleSave">儲存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TripEvent } from '../types'
import { useTripStore } from '../stores/useTripStore'

const props = defineProps<{
  event: TripEvent
  isNew: boolean
}>()

const emit = defineEmits(['save', 'close', 'delete'])
const tripStore = useTripStore()

// 建立本地副本，避免直接修改 props
const localEvent = ref<TripEvent>({ ...props.event })

// 💡 核心邏輯：當勾選「位於住宿點」時，自動填入飯店名稱
watch(() => localEvent.value.isAtAccommodation, (newVal) => {
  if (newVal) {
    const hotel = tripStore.lodging[localEvent.value.dateIndex]
    if (hotel) {
      localEvent.value.location = hotel.name
    }
  }
})

const handleSave = () => {
  if (!localEvent.value.title) {
    alert('請輸入行程名稱')
    return
  }
  emit('save', { ...localEvent.value })
}
</script>

<style scoped>
.editor-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px; box-sizing: border-box;
}
.editor-card {
  background: white; width: 100%; max-width: 400px; border-radius: 24px;
  max-height: 90vh; overflow-y: auto; padding: 25px;
}
.editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.close-btn { background: none; border: none; font-size: 28px; color: var(--rt-muted); cursor: pointer; }
.input-group { margin-bottom: 15px; }
.input-group label { display: block; font-size: 13px; font-weight: 700; color: var(--rt-muted); margin-bottom: 6px; }
.input-group input, .input-group select, .input-group textarea {
  width: 100%; padding: 12px; border: 1px solid #eee; border-radius: 12px; font-size: 15px; box-sizing: border-box;
}
.option-row { margin-bottom: 15px; background: var(--rt-bg); padding: 10px; border-radius: 12px; }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--rt-primary); cursor: pointer; }
.time-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.time-picker { display: flex; align-items: center; gap: 5px; }
.time-picker input { text-align: center; }
.editor-footer { display: flex; gap: 10px; margin-top: 20px; }
.save-btn { flex: 2; background: var(--rt-primary); color: white; border: none; padding: 15px; border-radius: 15px; font-weight: 700; cursor: pointer; }
.delete-btn { flex: 1; background: #fff; color: #ff4d4f; border: 1px solid #ff4d4f; padding: 15px; border-radius: 15px; font-weight: 700; cursor: pointer; }
</style>