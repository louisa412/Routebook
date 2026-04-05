<template>
  <div
    class="list-row px-3 flex items-center gap-3 transition-colors"
    :class="[
      isEditing ? 'bg-[#F7F5FF]' : 'bg-white',
      item.completed ? 'row-completed' : '',
      hasBorder ? 'border-b border-[#EFEEF7]' : ''
    ]"
  >
    <!-- 勾選 -->
    <button
      type="button"
      @click="$emit('toggle', item)"
      class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
      :class="item.completed ? 'bg-[#6D5FB1] border-[#6D5FB1]' : 'border-[#DEDAF4] bg-white'"
    >
      <svg v-if="item.completed" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6L5 9L10 3" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- 標題 / 編輯 -->
    <div class="flex-1 min-w-0 flex items-center gap-2">
      <template v-if="isEditing">
        <input
          v-model="editTitle"
          @keyup.enter="saveEdit"
          @keyup.esc="$emit('cancelEdit')"
          v-focus
          class="flex-1 bg-[#EFEEF7] border-none rounded-lg px-2 py-1 text-[#231F40] font-bold text-[14px] outline-none"
        />
        <select v-model="editCategory" class="edit-cat-select">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </template>
      <button
        v-else
        type="button"
        @click="startEdit"
        class="item-title text-left w-full truncate text-[#231F40] font-bold text-[14px]"
        :class="{ 'line-through text-[#9A96B8]': item.completed }"
      >
        {{ item.title }}
      </button>
    </div>

    <!-- 操作按鈕 -->
    <div class="flex items-center gap-1 flex-shrink-0">
      <button
        v-if="isEditing"
        @click="saveEdit"
        class="icon-btn text-[#6D5FB1]"
        aria-label="save"
      >✅</button>
      <button
        v-else
        @click="startEdit"
        class="icon-btn text-[#757199]"
        aria-label="edit"
      >✏️</button>
      <button
        @click="$emit('delete', item.id)"
        class="icon-btn text-[#757199] hover:text-red-400"
        aria-label="delete"
      >❌</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ListItem } from '../../types'

const props = defineProps<{
  item: ListItem
  categories: string[]
  hasBorder?: boolean
}>()

const emit = defineEmits<{
  toggle: [ListItem]
  update: [ListItem]
  delete: [string]
  cancelEdit: []
}>()

const isEditing = ref(false)
const editTitle = ref('')
const editCategory = ref('')

const vFocus = { mounted: (el: HTMLInputElement) => el.focus() }

// 外部取消時同步
watch(() => props.item, () => { isEditing.value = false })

const startEdit = () => {
  if (props.item.completed) return
  isEditing.value = true
  editTitle.value = props.item.title
  editCategory.value = props.item.category || (props.categories[0] ?? '未分類')
}

const saveEdit = () => {
  const trimmed = editTitle.value.trim()
  if (trimmed && (trimmed !== props.item.title || editCategory.value !== props.item.category)) {
    emit('update', { ...props.item, title: trimmed, category: editCategory.value || '未分類' })
  }
  isEditing.value = false
}
</script>

<style scoped>
.list-row { min-height: 52px; }
.icon-btn {
  width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: background-color 0.2s ease;
}
.icon-btn:hover { background: #F4F2FF; }
.icon-btn:active { transform: scale(0.93); }
.line-through { text-decoration-thickness: 2px; text-decoration-color: rgba(109,95,177,.35); }
.row-completed { background: #FCFBFF; }
.edit-cat-select { border: 1px solid #E3DFFD; border-radius: 8px; padding: 4px 8px; font-size: 12px; color: #6D5FB1; background: #fff; }
</style>
