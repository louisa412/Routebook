<template>
  <div class="list-view px-5 py-2">
    <div class="list-header mb-6">
      <h2 class="text-[#231F40] text-2xl font-black mb-4">{{ title }}</h2>

      <div class="add-controls bg-white p-2 rounded-[22px] shadow-sm flex items-center gap-2 border border-[#6D5FB1]/5">
        <input
          v-model="newItemTitle"
          :placeholder="placeholder"
          class="flex-1 bg-transparent border-none p-3 outline-none text-[#231F40] text-sm font-bold placeholder:text-[#757199]/40"
          @keyup.enter="handleAddItem"
        />

        <select v-model="selectedCategory" class="bg-[#EFEEF7] text-[#6D5FB1] text-xs font-bold py-2 px-3 rounded-[12px] outline-none border-none cursor-pointer">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>

        <button @click="handleAddItem" class="bg-[#6D5FB1] text-white w-10 h-10 rounded-[15px] font-bold text-xl flex items-center justify-center active:scale-90 transition-all shadow-md shadow-[#6D5FB1]/20">
          +
        </button>
      </div>
    </div>

    <div class="groups-container space-y-7">
      <div v-for="(groupItems, categoryName) in groupedItems" :key="categoryName" class="category-group">
        <div class="flex items-center mb-2 px-1">
          <div class="w-1.5 h-4 bg-[#6D5FB1] rounded-full mr-2"></div>
          <h3 class="text-[#757199] text-[11px] font-black uppercase tracking-widest">{{ categoryName }}</h3>
          <span class="ml-2 text-[10px] bg-[#DEDAF4] text-[#6D5FB1] px-2 py-0.5 rounded-full font-black">
            {{ groupItems.length }}
          </span>
        </div>

        <div class="list-box bg-white rounded-[18px] border border-[#6D5FB1]/5 overflow-hidden">
          <div
            v-for="(item, index) in groupItems"
            :key="item.id"
            class="list-row px-3 flex items-center gap-3 transition-colors"
            :class="[
              editingId === item.id ? 'bg-[#F7F5FF]' : 'bg-white',
              item.completed ? 'row-completed' : '',
              index !== groupItems.length - 1 ? 'border-b border-[#EFEEF7]' : ''
            ]"
          >
            <button
              type="button"
              @click="toggleItem(item)"
              class="check-btn w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
              :class="item.completed ? 'bg-[#6D5FB1] border-[#6D5FB1]' : 'border-[#DEDAF4] bg-white'"
            >
              <svg v-if="item.completed" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div class="flex-1 min-w-0 flex items-center">
              <input
                v-if="editingId === item.id"
                v-model="editBuffer"
                @blur="saveEdit(item)"
                @keyup.enter="saveEdit(item)"
                @keyup.esc="cancelEdit"
                v-focus
                class="w-full bg-[#EFEEF7] border-none rounded-lg px-2 py-1 text-[#231F40] font-bold text-[14px] outline-none"
              />
              <button
                v-else
                type="button"
                @click="startEdit(item)"
                class="item-title text-left w-full truncate text-[#231F40] font-bold text-[14px]"
                :class="{ 'line-through text-[#9A96B8]': item.completed }"
              >
                {{ item.title }}
              </button>
            </div>

            <div class="flex items-center gap-1 flex-shrink-0">
              <button
                v-if="editingId !== item.id"
                @click="startEdit(item)"
                class="icon-btn text-[#757199]"
                aria-label="edit item"
              >
                ✏️
              </button>
              <button
                @click="$emit('delete', item.id)"
                class="icon-btn text-[#757199] hover:text-red-400"
                aria-label="delete item"
              >
                ❌
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="items.length === 0" class="py-20 flex flex-col items-center justify-center text-[#757199]/40">
      <div class="text-4xl mb-3 opacity-20">📝</div>
      <p class="text-xs font-bold tracking-widest uppercase">目前沒有計畫項目</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ListItem } from '../types'

const props = defineProps<{
  title: string
  placeholder: string
  items: ListItem[]
  categories: string[]
}>()

const emit = defineEmits(['add', 'delete', 'update'])

const newItemTitle = ref('')
const selectedCategory = ref('')

const editingId = ref<string | null>(null)
const editBuffer = ref('')

const vFocus = {
  mounted: (el: HTMLInputElement) => el.focus()
}

watch(() => props.categories, (newCats) => {
  if (newCats.length > 0 && !selectedCategory.value) {
    selectedCategory.value = newCats[0]
  }
}, { immediate: true })

const groupedItems = computed(() => {
  if (!props.items) return {}
  return props.items.reduce((acc, item) => {
    const cat = item.category || '其他'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, ListItem[]>)
})

const handleAddItem = () => {
  if (!newItemTitle.value.trim()) return
  emit('add', { title: newItemTitle.value, category: selectedCategory.value || '未分類' })
  newItemTitle.value = ''
}

const startEdit = (item: ListItem) => {
  if (item.completed) return
  editingId.value = item.id
  editBuffer.value = item.title
}

const saveEdit = (item: ListItem) => {
  if (editingId.value === null) return
  const trimmed = editBuffer.value.trim()

  if (trimmed && trimmed !== item.title) {
    emit('update', { ...item, title: trimmed })
  }
  editingId.value = null
}

const cancelEdit = () => {
  editingId.value = null
}

const toggleItem = (item: ListItem) => {
  emit('update', { ...item, completed: !item.completed })
}
</script>

<style scoped>
.list-view {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

select, input {
  -webkit-appearance: none;
  appearance: none;
}

.list-row {
  min-height: 52px;
}

.item-title {
  line-height: 1.2;
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.icon-btn:hover {
  background: #F4F2FF;
}

.check-btn:active,
.icon-btn:active {
  transform: scale(0.93);
}

.line-through {
  text-decoration-thickness: 2px;
  text-decoration-color: rgba(109, 95, 177, 0.35);
}

.row-completed {
  background: #FCFBFF;
}
</style>
