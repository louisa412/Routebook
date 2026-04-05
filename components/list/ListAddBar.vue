<template>
  <div class="space-y-2">
    <div class="add-controls bg-white p-2 rounded-[22px] shadow-sm flex items-center gap-2 border border-[#6D5FB1]/5">
      <input
        v-model="inputTitle"
        :placeholder="placeholder"
        class="flex-1 bg-transparent border-none p-3 outline-none text-[#231F40] text-sm font-bold placeholder:text-[#757199]/40"
        @keyup.enter="handleAdd"
      />
      <select
        v-model="inputCategory"
        class="bg-[#EFEEF7] text-[#6D5FB1] text-xs font-bold py-2 px-3 rounded-[12px] outline-none border-none cursor-pointer"
      >
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <button
        @click="handleAdd"
        class="bg-[#6D5FB1] text-white w-10 h-10 rounded-[15px] font-bold text-xl flex items-center justify-center active:scale-90 transition-all shadow-md shadow-[#6D5FB1]/20"
      >+</button>
    </div>

    <!-- 採購清單：金額列 -->
    <div v-if="showPrice" class="flex items-center gap-2 px-2">
      <span class="text-[11px] text-[#757199] font-bold">金額 ¥</span>
      <input
        v-model.number="inputPrice"
        type="number"
        placeholder="0"
        class="w-28 bg-white rounded-[10px] border border-[#EFEEF7] px-3 py-2 text-[#6D5FB1] font-bold text-sm outline-none"
      />
      <select v-model="inputBudgetCategory" class="bg-white border border-[#EFEEF7] text-[#6D5FB1] text-xs font-bold py-2 px-3 rounded-[10px] outline-none cursor-pointer flex-1">
        <option v-for="bc in mozeCats" :key="bc" :value="bc">{{ bc }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { MozeCategory } from '../../types'
import { MOZE_CATEGORIES } from '../../types'

const props = defineProps<{
  placeholder: string
  categories: string[]
  showPrice?: boolean
}>()

const emit = defineEmits<{
  add: [{ title: string; category: string; price?: number; budgetCategory?: MozeCategory }]
}>()

const mozeCats = MOZE_CATEGORIES
const inputTitle = ref('')
const inputCategory = ref('')
const inputPrice = ref(0)
const inputBudgetCategory = ref<MozeCategory>('購物')

watch(() => props.categories, (cats) => {
  if (cats.length > 0 && !inputCategory.value) inputCategory.value = cats[0]
}, { immediate: true })

const handleAdd = () => {
  if (!inputTitle.value.trim()) return
  emit('add', {
    title: inputTitle.value.trim(),
    category: inputCategory.value || '未分類',
    price: props.showPrice ? (inputPrice.value || 0) : undefined,
    budgetCategory: props.showPrice ? inputBudgetCategory.value : undefined
  })
  inputTitle.value = ''
  inputPrice.value = 0
}
</script>
