<template>
  <div class="list-view px-5 py-2">
    <div class="mb-6">
      <h2 class="text-[#231F40] text-2xl font-black mb-4">{{ title }}</h2>

      <ListAddBar
        :placeholder="placeholder"
        :categories="categories"
        @add="$emit('add', $event)"
      />

      <CategoryManager
        :categories="categories"
        @add="$emit('addCategory', $event)"
        @rename="$emit('renameCategory', $event)"
        @delete="$emit('deleteCategory', $event)"
      />
    </div>

    <div class="space-y-7">
      <div v-for="(groupItems, categoryName) in groupedItems" :key="categoryName">
        <!-- 分類標題 -->
        <div class="flex items-center mb-2 px-1">
          <div class="w-1.5 h-4 bg-[#6D5FB1] rounded-full mr-2"></div>
          <h3 class="text-[#757199] text-[11px] font-black uppercase tracking-widest">{{ categoryName }}</h3>
          <span class="ml-2 text-[10px] bg-[#DEDAF4] text-[#6D5FB1] px-2 py-0.5 rounded-full font-black">
            {{ groupItems.length }}
          </span>
        </div>

        <!-- 清單 -->
        <div class="bg-white rounded-[18px] border border-[#6D5FB1]/5 overflow-hidden">
          <ListRow
            v-for="(item, index) in groupItems"
            :key="item.id"
            :item="item"
            :categories="categories"
            :has-border="index !== groupItems.length - 1"
            @toggle="$emit('update', { ...$event, completed: !$event.completed })"
            @update="$emit('update', $event)"
            @delete="$emit('delete', $event)"
          />
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
import { computed } from 'vue'
import type { ListItem } from '../types'
import ListAddBar from './list/ListAddBar.vue'
import CategoryManager from './list/CategoryManager.vue'
import ListRow from './list/ListRow.vue'

const props = defineProps<{
  title: string
  placeholder: string
  items: ListItem[]
  categories: string[]
}>()

defineEmits(['add', 'delete', 'update', 'addCategory', 'renameCategory', 'deleteCategory'])

const groupedItems = computed(() => {
  return props.items.reduce((acc, item) => {
    const cat = item.category || '未分類'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, ListItem[]>)
})
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
select, input { -webkit-appearance: none; appearance: none; }
</style>
