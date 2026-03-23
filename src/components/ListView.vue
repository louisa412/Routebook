<template>
  <div class="list-view px-5 py-2">
    <div class="list-header mb-6">
      <h2 class="text-[#231F40] text-2xl font-extrabold mb-4">{{ title }}</h2>
      
      <div class="add-controls bg-white p-2 rounded-[20px] shadow-sm flex items-center gap-2 border border-[#DEDAF4]/50">
        <input 
          v-model="newItemTitle" 
          :placeholder="placeholder" 
          class="flex-1 bg-transparent border-none p-3 outline-none text-[#231F40] text-sm"
          @keyup.enter="addItem" 
        />
        <select v-model="selectedCategory" class="bg-[#EFEEF7] text-[#6D5FB1] text-xs font-bold py-2 px-3 rounded-[12px] outline-none border-none">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <button @click="addItem" class="bg-[#6D5FB1] text-white w-10 h-10 rounded-[15px] font-bold text-xl flex items-center justify-center active:scale-90 transition-transform">
          +
        </button>
      </div>
    </div>

    <div class="groups-container space-y-8">
      <div v-for="(groupItems, categoryName) in groupedItems" :key="categoryName" class="category-group">
        <div class="flex items-center mb-3">
          <div class="w-1.5 h-4 bg-[#6D5FB1] rounded-full mr-2"></div>
          <h3 class="text-[#757199] text-xs font-bold uppercase tracking-widest">{{ categoryName }}</h3>
          <span class="ml-2 text-[10px] bg-[#DEDAF4] text-[#6D5FB1] px-2 py-0.5 rounded-full font-bold">
            {{ groupItems.length }}
          </span>
        </div>

        <div class="grid gap-3">
          <div 
            v-for="item in groupItems" 
            :key="item.id" 
            class="list-item bg-white p-4 rounded-[24px] flex items-center gap-4 shadow-sm border border-transparent transition-all"
            :class="{ 'opacity-50 grayscale-[0.5]': item.completed }"
          >
            <div 
              @click="toggleItem(item)"
              class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors"
              :class="item.completed ? 'bg-[#6D5FB1] border-[#6D5FB1]' : 'border-[#DEDAF4]'"
            >
              <svg v-if="item.completed" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <div class="flex-1" @click="toggleItem(item)">
              <div class="text-[#231F40] font-bold text-[15px]" :class="{ 'line-through': item.completed }">
                {{ item.title }}
              </div>
            </div>

            <button @click="$emit('delete', item.id)" class="text-[#757199]/40 hover:text-red-400 text-xl px-2">
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="items.length === 0" class="py-20 text-center text-[#757199]/50 text-sm">
      目前沒有項目，開始規劃吧！
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ListItem } from '../types'

const props = defineProps<{
  title: string
  placeholder: string
  items: ListItem[]
  categories: string[]
}>()

const emit = defineEmits(['add', 'delete', 'update'])

const newItemTitle = ref('')
const selectedCategory = ref(props.categories[0] || '未分類')

// 💡 核心邏輯：將扁平陣列轉換成「分類物件」
const groupedItems = computed(() => {
  return props.items.reduce((acc, item) => {
    const cat = item.category || '其他'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, ListItem[]>)
})

const addItem = () => {
  if (!newItemTitle.value.trim()) return
  emit('add', {
    title: newItemTitle.value,
    category: selectedCategory.value
  })
  newItemTitle.value = ''
}

const toggleItem = (item: ListItem) => {
  item.completed = !item.completed
  emit('update', item)
}
</script>

<style scoped>
.list-view {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

input, select {
  -webkit-appearance: none; /* 針對 Safari/Chrome */
  appearance: none;         /* 標準屬性：消除這條警告 */
  background-image: none;
}
</style>