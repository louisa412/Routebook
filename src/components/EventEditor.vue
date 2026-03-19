<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="modal-title">{{ isNew ? '新增行程' : '修改行程細節' }}</h3>
      
      <div class="form-group"><label>行程名稱</label><input v-model="localEvent.title" placeholder="要做什麼？"></div>
      <div class="form-group"><label>地點</label><input v-model="localEvent.location" placeholder="地點名稱"></div>
      
      <div class="form-group">
        <label>備註小撇步</label>
        <textarea v-model="localEvent.note" rows="2" placeholder="記下月台、預約號碼..."></textarea>
      </div>

      <div class="form-row">
        <div class="form-group flex-1"><label>預算 (¥)</label><input v-model.number="localEvent.budget" type="number"></div>
        <div class="form-group flex-1">
          <label>分類</label>
          <select v-model="localEvent.category">
            <option v-for="c in ['餐飲','交通','住宿','購物','景點','其他']" :key="c">{{c}}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>圖片附件 (點擊 + 上傳)</label>
        <div class="upload-container">
          <div class="img-previews">
            <div v-for="(img, idx) in localEvent.images" :key="idx" class="thumb-wrapper">
              <img :src="img" class="mini-thumb" />
              <button class="delete-img-btn" @click.stop="removeImage(idx)">×</button>
            </div>
            
            <div class="plus-box">
              <input type="file" @change="handleFileUpload" accept="image/*" multiple class="file-input">
              <span>+</span>
            </div>
          </div>
        </div>
      </div>

      <div class="time-edit-row">
        <div class="time-col">
          <label>開始</label>
          <div class="time-inputs"><input v-model.number="localEvent.hour" type="number"> : <input v-model.number="localEvent.minute" type="number"></div>
        </div>
        <div class="time-col">
          <label>結束</label>
          <div class="time-inputs"><input v-model.number="localEvent.endHour" type="number"> : <input v-model.number="localEvent.endMinute" type="number"></div>
        </div>
      </div>

      <div class="modal-actions">
        <button v-if="!isNew" @click="$emit('delete')" class="btn-delete">刪除行程</button>
        <div class="action-row">
          <button @click="$emit('close')" class="btn-cancel">取消</button>
          <button @click="$emit('save', localEvent)" class="btn-primary">儲存行程</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TripEvent } from '../types'

const props = defineProps<{
  event: Partial<TripEvent>,
  isNew: boolean
}>()

const emit = defineEmits(['close', 'save', 'delete'])

// 複製一份本地資料，避免直接更動父元件
const localEvent = ref({ ...props.event })

// 當傳入的 event 改變時，同步更新本地資料
watch(() => props.event, (newVal) => {
  localEvent.value = { ...newVal }
}, { deep: true })

// 💡 刪除圖片邏輯
const removeImage = (index: number) => {
  localEvent.value.images?.splice(index, 1)
}

const handleFileUpload = (e: any) => {
  const files = e.target.files
  if (!files) return
  if (!localEvent.value.images) localEvent.value.images = []

  Array.from(files).forEach((file: any) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      localEvent.value.images?.push(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(35, 31, 64, 0.4); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 2000; padding: 20px; }
.modal-card { background: white; padding: 30px; border-radius: 28px; width: 100%; max-width: 450px; box-shadow: 0 15px 40px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto; }
.modal-title { margin-top: 0; color: var(--rt-primary); font-size: 20px; font-weight: 800; margin-bottom: 20px; }
.form-row { display: flex; gap: 15px; }
.flex-1 { flex: 1; }
.form-group { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; color: var(--rt-muted); font-weight: 700; padding-left: 4px;}
.form-group input, .form-group select, .form-group textarea { padding: 14px; border: 2px solid var(--rt-bg); border-radius: 14px; font-size: 16px; outline: none; font-family: inherit; transition: 0.2s; }
.form-group input:focus { border-color: var(--rt-secondary); }

.time-edit-row { display: flex; gap: 15px; background: var(--rt-bg); padding: 18px; border-radius: 18px; margin-bottom: 24px; }
.time-inputs { display: flex; align-items: center; justify-content: center; gap: 5px; font-weight: 800; font-size: 18px; color: var(--rt-primary); }
.time-inputs input { width: 50px; border: none; background: transparent; text-align: center; font-size: 18px; color: var(--rt-primary); font-weight: 800; }

/* 💡 圖片上傳區美化 */
.img-previews { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-top: 5px; }

.thumb-wrapper { position: relative; width: 60px; height: 60px; }
.mini-thumb { width: 100%; height: 100%; border-radius: 12px; object-fit: cover; border: 2px solid var(--rt-bg); }

/* 💡 刪除按鈕樣式 */
.delete-img-btn {
  position: absolute; top: -5px; right: -5px; 
  width: 20px; height: 20px; border-radius: 10px; 
  background: #FF4D4D; color: white; border: none; 
  font-size: 14px; font-weight: 800; line-height: 1;
  display: flex; justify-content: center; align-items: center;
  cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.plus-box { 
  position: relative; width: 60px; height: 60px; border-radius: 12px; 
  border: 2px dashed var(--rt-muted); display: flex; justify-content: center; 
  align-items: center; color: var(--rt-muted); font-size: 24px; background: #F8F7FF; 
}
.file-input { position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 2; }

.modal-actions { display: flex; flex-direction: column; gap: 10px; }
.action-row { display: flex; gap: 10px; width: 100%; }
.btn-primary { flex: 1; padding: 16px; border-radius: 16px; border: none; background: var(--rt-primary); color: white; font-weight: 700; cursor: pointer; }
.btn-cancel { flex: 1; padding: 16px; border-radius: 16px; border: none; background: var(--rt-bg); color: var(--rt-primary); font-weight: 700; cursor: pointer; }
.btn-delete { width: 100%; padding: 12px; border: 1px solid #D65D5D; color: #D65D5D; background: transparent; border-radius: 14px; cursor: pointer; margin-bottom: 5px; }
</style>