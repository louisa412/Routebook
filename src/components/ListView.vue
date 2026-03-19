<template>
  <div class="list-page">
    <h3 class="page-title">{{ title }}</h3>
    
    <div class="add-bar">
      <select v-model="newItemCategory" class="add-select">
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <input v-model="newItemTitle" @keyup.enter="handleEnter" :placeholder="placeholder" class="add-input" />
      <button @click="handleEnter" class="btn-add">+</button>
    </div>

    <div v-for="(groupItems, category) in groupedItems" :key="category" class="category-section">
      <div class="category-header">{{ category }}</div>
      
      <div v-for="item in groupItems" :key="item.id" 
           class="list-card" :class="{ 'is-completed': item.isCompleted }">
        <input type="checkbox" v-model="item.isCompleted" class="custom-checkbox">
        <div class="list-content">
          <span class="list-title">{{ item.title }}</span>
          <div class="list-details">
            <span class="currency-symbol">¥</span>
            <input type="number" v-model.number="item.budget" class="inline-budget-input">
          </div>
        </div>
        <button @click="$emit('delete', item.id)" class="btn-icon-delete">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ListItem } from '../types'

const props = defineProps<{
  title: string,
  placeholder: string,
  items: ListItem[],
  categories: string[]
}>()

const emit = defineEmits(['add', 'delete'])

const newItemTitle = ref('')
const newItemCategory = ref(props.categories[0])

// 💡 C: 分組邏輯
const groupedItems = computed(() => {
  const groups: Record<string, ListItem[]> = {}
  props.items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  return groups
})

const handleEnter = () => {
  if (!newItemTitle.value.trim()) return
  emit('add', { title: newItemTitle.value, category: newItemCategory.value })
  newItemTitle.value = ''
}
</script>

<style scoped>
.list-page { padding: 25px 20px; }
.page-title { font-size: 20px; font-weight: 800; margin-bottom: 20px; color: var(--rt-primary); }

.category-section { margin-bottom: 24px; }
.category-header { 
  font-size: 12px; font-weight: 900; color: var(--rt-primary); 
  text-transform: uppercase; letter-spacing: 1px;
  margin-bottom: 12px; padding-left: 5px; opacity: 0.6;
}

.add-bar { display: flex; gap: 8px; margin-bottom: 24px; }
.add-select { padding: 0 12px; border-radius: 16px; border: 1px solid white; background: white; color: var(--rt-primary); font-weight: 700; box-shadow: 0 4px 15px rgba(109, 95, 177, 0.05); outline: none; }
.add-input { flex: 1; padding: 16px 20px; border-radius: 16px; border: 1px solid white; background: white; font-size: 15px; box-shadow: 0 4px 15px rgba(109, 95, 177, 0.05); outline: none; }
.btn-add { width: 54px; border-radius: 16px; border: none; background: var(--rt-primary); color: white; font-size: 24px; cursor: pointer; }

.list-card { background: white; padding: 16px; border-radius: 18px; margin-bottom: 8px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 12px rgba(109, 95, 177, 0.05); }
.list-content { flex: 1; display: flex; justify-content: space-between; align-items: center; }
.list-title { font-size: 16px; font-weight: 600; color: var(--rt-text); }
.list-details { display: flex; align-items: center; background: var(--rt-bg); padding: 4px 10px; border-radius: 8px; }
.currency-symbol { font-size: 12px; color: var(--rt-primary); font-weight: 700; margin-right: 4px; }
.inline-budget-input { width: 65px; border: none; background: transparent; font-size: 15px; font-weight: 700; color: var(--rt-primary); text-align: right; outline: none; }
.custom-checkbox { width: 22px; height: 22px; accent-color: var(--rt-primary); cursor: pointer; }
.is-completed { opacity: 0.4; transform: scale(0.98); }
.is-completed .list-title { text-decoration: line-through; }
.btn-icon-delete { background: transparent; border: none; color: var(--rt-muted); font-size: 22px; cursor: pointer; }
</style>