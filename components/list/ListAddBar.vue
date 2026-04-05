<template>
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
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  placeholder: string
  categories: string[]
}>()

const emit = defineEmits<{
  add: [{ title: string; category: string }]
}>()

const inputTitle = ref('')
const inputCategory = ref('')

watch(
  () => props.categories,
  (cats) => { if (cats.length > 0 && !inputCategory.value) inputCategory.value = cats[0] },
  { immediate: true }
)

const handleAdd = () => {
  if (!inputTitle.value.trim()) return
  emit('add', { title: inputTitle.value.trim(), category: inputCategory.value || '未分類' })
  inputTitle.value = ''
}
</script>
