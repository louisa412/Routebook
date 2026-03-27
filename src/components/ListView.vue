<template>
  <div class="list-view px-5 py-2">
    <div class="list-header mb-6">
      <h2 class="text-[#231F40] text-2xl font-black mb-4">{{ title }}</h2>
      
      <div class="add-controls bg-white p-2 rounded-[22px] shadow-sm flex items-center gap-2 border border-[#6D5FB1]/5">
        <input 
          v-model="newItemTitle" 
          :placeholder="placeholder" 
          class="flex-1 bg-transparent border-none p-3 outline-none text-[#231F40] text-sm font-medium"
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

    <div class="groups-container space-y-8">
      <div v-for="(groupItems, categoryName) in groupedItems" :key="categoryName" class="category-group">
        <div class="flex items-center mb-3 px-1">
          <div class="w-1.5 h-4 bg-[#6D5FB1] rounded-full mr-2"></div>
          <h3 class="text-[#757199] text-[11px] font-black uppercase tracking-widest">{{ categoryName }}</h3>
          <span class="ml-2 text-[10px] bg-[#DEDAF4] text-[#6D5FB1] px-2 py-0.5 rounded-full font-black">
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
              class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all"
              :class="item.completed ? 'bg-[#6D5FB1] border-[#6D5FB1]' : 'border-[#DEDAF4]'"
            >
              <svg v-if="item.completed" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <div class="flex-1" @click="toggleItem(item)">
              <div class="text-[#231F40] font-bold text-[15px]" :class="{ 'line-through decoration-[#6D5FB1]/30': item.completed }">
                {{ item.title }}
              </div>
            </div>

            <button @click="$emit('delete', item.id)" class="text-[#757199]/40 hover:text-red-400 text-xl px-2 transition-colors">
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="items.length === 0" class="py-20 flex flex-col items-center justify-center text-[#757199]/40 animate-fade-in">
      <div class="text-4xl mb-3">📝</div>
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

// 初始與監聽：確保分類選擇器隨時有預設值
watch(() => props.categories, (newCats) => {
  if (newCats.length > 0 && !selectedCategory.value) {
    selectedCategory.value = newCats[0]
  }
}, { immediate: true })

/**
 * 💡 關鍵修復：嚴謹的分類邏輯
 * 將傳入的 items 根據 category 進行分組
 */
const groupedItems = computed(() => {
  if (!props.items) return {}
  
  return props.items.reduce((acc, item) => {
    // 優先使用項目自帶分類，若無則標記為「其他」
    const cat = item.category || '其他'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, ListItem[]>)
})

const handleAddItem = () => {
  if (!newItemTitle.value.trim()) return
  
  // 向父組件拋出新增事件
  emit('add', {
    title: newItemTitle.value,
    category: selectedCategory.value || '未分類'
  })
  
  // 清空輸入框，保持介面乾淨
  newItemTitle.value = ''
}

const toggleItem = (item: ListItem) => {
  // 透過解構確保不直接污染 Props 資料流 (雖然 Vue 不建議改 Prop，但這裡我們會 emit update)
  const updatedItem = { ...item, completed: !item.completed }
  emit('update', updatedItem)
}
</script>

<style scoped>
.list-view {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 移除原生 Select 的生硬感 */
select {
  -webkit-appearance: none;
  appearance: none;
}
</style>
