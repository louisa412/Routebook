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

      <div class="category-manager mt-3 bg-white rounded-[18px] border border-[#6D5FB1]/5 p-3">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[11px] font-black uppercase tracking-widest text-[#757199]">分類管理</p>
          <button class="text-[11px] font-bold text-[#6D5FB1]" @click="isCategoryPanelOpen = !isCategoryPanelOpen">
            {{ isCategoryPanelOpen ? '收合' : '展開' }}
          </button>
        </div>

        <div v-if="isCategoryPanelOpen" class="space-y-2">
          <div class="flex gap-2">
            <input
              v-model="newCategory"
              class="flex-1 bg-[#F8F7FF] border border-[#E5E0FF] rounded-[10px] px-3 py-2 text-sm outline-none"
              placeholder="新增分類..."
              @keyup.enter="handleAddCategory"
            />
            <button class="mini-btn" @click="handleAddCategory">新增</button>
          </div>

          <div class="flex flex-wrap gap-2">
            <div v-for="cat in categories" :key="cat" class="cat-chip">
              <template v-if="editingCategoryName === cat">
                <input
                  v-model="editCategoryBuffer"
                  class="chip-input"
                  @keyup.enter="saveCategoryRename(cat)"
                  @blur="saveCategoryRename(cat)"
                />
              </template>
              <template v-else>
                <span class="cat-text">{{ cat }}</span>
                <button class="chip-icon" @click="startRenameCategory(cat)">✏️</button>
                <button class="chip-icon" @click="deleteCategory(cat)">❌</button>
              </template>
            </div>
          </div>
        </div>
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

            <div class="flex-1 min-w-0 flex items-center gap-2">
              <template v-if="editingId === item.id">
                <input
                  v-model="editBuffer"
                  @keyup.enter="saveEdit(item)"
                  @keyup.esc="cancelEdit"
                  v-focus
                  class="flex-1 bg-[#EFEEF7] border-none rounded-lg px-2 py-1 text-[#231F40] font-bold text-[14px] outline-none"
                />
                <select v-model="editCategoryBuffer" class="edit-cat-select">
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </template>
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
                v-if="editingId === item.id"
                @click="saveEdit(item)"
                class="icon-btn text-[#6D5FB1]"
                aria-label="save item"
              >
                ✅
              </button>
              <button
                v-else
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

const emit = defineEmits(['add', 'delete', 'update', 'addCategory', 'renameCategory', 'deleteCategory'])

const newItemTitle = ref('')
const selectedCategory = ref('')

const editingId = ref<string | null>(null)
const editBuffer = ref('')
const editCategoryBuffer = ref('')

const isCategoryPanelOpen = ref(false)
const newCategory = ref('')
const editingCategoryName = ref<string | null>(null)

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
    const cat = item.category || '未分類'
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

const handleAddCategory = () => {
  const trimmed = newCategory.value.trim()
  if (!trimmed) return
  emit('addCategory', trimmed)
  newCategory.value = ''
}

const startRenameCategory = (category: string) => {
  editingCategoryName.value = category
  editCategoryBuffer.value = category
}

const saveCategoryRename = (from: string) => {
  if (editingCategoryName.value !== from) return
  const to = editCategoryBuffer.value.trim()
  editingCategoryName.value = null
  if (!to || to === from) return
  emit('renameCategory', { from, to })
}

const deleteCategory = (category: string) => {
  emit('deleteCategory', category)
}

const startEdit = (item: ListItem) => {
  if (item.completed) return
  editingId.value = item.id
  editBuffer.value = item.title
  editCategoryBuffer.value = item.category || (props.categories[0] || '未分類')
}

const saveEdit = (item: ListItem) => {
  if (editingId.value === null) return
  const trimmed = editBuffer.value.trim()

  if (trimmed && (trimmed !== item.title || editCategoryBuffer.value !== item.category)) {
    emit('update', {
      ...item,
      title: trimmed,
      category: editCategoryBuffer.value || '未分類'
    })
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
.icon-btn:active,
.mini-btn:active {
  transform: scale(0.93);
}

.line-through {
  text-decoration-thickness: 2px;
  text-decoration-color: rgba(109, 95, 177, 0.35);
}

.row-completed {
  background: #FCFBFF;
}

.mini-btn {
  background: #6D5FB1;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
}

.cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #F8F7FF;
  border: 1px solid #E7E3FA;
  border-radius: 999px;
  padding: 4px 8px;
}

.cat-text {
  font-size: 12px;
  color: #5F5A83;
  font-weight: 700;
}

.chip-icon {
  border: none;
  background: transparent;
  font-size: 11px;
  padding: 0;
  line-height: 1;
}

.chip-input {
  border: none;
  background: transparent;
  font-size: 12px;
  min-width: 72px;
  outline: none;
  color: #5F5A83;
}

.edit-cat-select {
  border: 1px solid #E3DFFD;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 12px;
  color: #6D5FB1;
  background: #fff;
}
</style>
