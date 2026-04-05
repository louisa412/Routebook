<template>
  <div
    class="list-row px-3 flex items-center gap-3 transition-colors"
    :class="[isEditing ? 'bg-[#F7F5FF]' : 'bg-white', item.completed ? 'row-completed' : '', hasBorder ? 'border-b border-[#EFEEF7]' : '']"
  >
    <!-- 勾選 -->
    <button type="button" @click="$emit('toggle', item)"
      class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
      :class="item.completed ? 'bg-[#6D5FB1] border-[#6D5FB1]' : 'border-[#DEDAF4] bg-white'">
      <svg v-if="item.completed" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6L5 9L10 3" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- 內容 -->
    <div class="flex-1 min-w-0">
      <template v-if="isEditing">
        <div class="flex items-center gap-2 mb-1.5">
          <input v-model="editTitle" @keyup.enter="saveEdit" @keyup.esc="isEditing = false" v-focus
            class="flex-1 bg-[#EFEEF7] border-none rounded-lg px-2 py-1 text-[#231F40] font-bold text-[14px] outline-none" />
          <select v-model="editCategory" class="edit-select">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div v-if="showPrice" class="flex items-center gap-2">
          <!-- 幣別 -->
          <div class="flex bg-[#EFEEF7] rounded-[8px] overflow-hidden flex-shrink-0">
            <button type="button" class="px-2 py-1 text-[10px] font-black transition-all"
              :class="editCurrency === 'JPY' ? 'bg-[#6D5FB1] text-white' : 'text-[#757199]'"
              @click="editCurrency = 'JPY'">¥</button>
            <button type="button" class="px-2 py-1 text-[10px] font-black transition-all"
              :class="editCurrency === 'TWD' ? 'bg-[#6D5FB1] text-white' : 'text-[#757199]'"
              @click="editCurrency = 'TWD'">NT$</button>
          </div>
          <input v-model.number="editPrice" type="number" placeholder="金額"
            class="w-24 bg-[#EFEEF7] border-none rounded-lg px-2 py-1 text-[#6D5FB1] font-bold text-[13px] outline-none" />
          <select v-model="editBudgetCategory" class="edit-select text-[11px] flex-1">
            <option v-for="bc in mozeCats" :key="bc" :value="bc">{{ bc }}</option>
          </select>
        </div>
      </template>

      <div v-else class="flex items-center gap-2">
        <button type="button" @click="startEdit"
          class="flex-1 text-left truncate text-[#231F40] font-bold text-[14px]"
          :class="{ 'line-through text-[#9A96B8]': item.completed }">{{ item.title }}</button>
        <!-- 金額顯示 -->
        <span v-if="showPrice && item.price" class="text-[12px] font-black text-[#6D5FB1] flex-shrink-0">
          {{ item.currency === 'TWD' ? 'NT$' : '¥' }}{{ item.price.toLocaleString() }}
        </span>
      </div>
    </div>

    <!-- 操作 -->
    <div class="flex items-center gap-1 flex-shrink-0">
      <button v-if="isEditing" @click="saveEdit" class="icon-btn text-[#6D5FB1]">✅</button>
      <button v-else @click="startEdit" class="icon-btn text-[#757199]">✏️</button>
      <button @click="$emit('delete', item.id)" class="icon-btn text-[#757199] hover:text-red-400">❌</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ListItem, MozeCategory, Currency } from '../../types'
import { MOZE_CATEGORIES } from '../../types'

const props = defineProps<{ item: ListItem; categories: string[]; hasBorder?: boolean; showPrice?: boolean }>()
const emit = defineEmits<{ toggle: [ListItem]; update: [ListItem]; delete: [string] }>()

const mozeCats = MOZE_CATEGORIES
const isEditing = ref(false)
const editTitle = ref('')
const editCategory = ref('')
const editPrice = ref(0)
const editCurrency = ref<Currency>('JPY')
const editBudgetCategory = ref<MozeCategory>('購物')

const vFocus = { mounted: (el: HTMLInputElement) => el.focus() }

const startEdit = () => {
  if (props.item.completed) return
  isEditing.value = true
  editTitle.value = props.item.title
  editCategory.value = props.item.category || (props.categories[0] ?? '未分類')
  editPrice.value = props.item.price || 0
  editCurrency.value = props.item.currency ?? 'JPY'
  editBudgetCategory.value = props.item.budgetCategory || '購物'
}

const saveEdit = () => {
  const trimmed = editTitle.value.trim()
  if (trimmed) {
    emit('update', {
      ...props.item,
      title: trimmed,
      category: editCategory.value || '未分類',
      price: props.showPrice ? (editPrice.value || 0) : (props.item.price || 0),
      currency: editCurrency.value,
      budgetCategory: editBudgetCategory.value
    })
  }
  isEditing.value = false
}
</script>

<style scoped>
.list-row { min-height: 52px; }
.icon-btn { width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; transition: background-color 0.2s; }
.icon-btn:hover { background: #F4F2FF; }
.icon-btn:active { transform: scale(0.93); }
.line-through { text-decoration-line: line-through; text-decoration-thickness: 2px; text-decoration-color: rgba(109,95,177,.35); }
.row-completed { background: #FCFBFF; }
.edit-select { border: 1px solid #E3DFFD; border-radius: 8px; padding: 4px 6px; font-size: 12px; color: #6D5FB1; background: #fff; outline: none; }
</style>
