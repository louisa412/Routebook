<template>
  <div class="list-view">
    <div class="list-header">
      <h2 class="list-title">{{ title }}</h2>
      <div class="add-controls">
        <input 
          v-model="newItemTitle" 
          :placeholder="placeholder" 
          @keyup.enter="addItem" 
        />
        <select v-model="selectedCategory">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <button @click="addItem" class="add-btn">+</button>
      </div>
    </div>

    <div class="items-container">
      <div v-for="item in items" :key="item.id" class="list-item" :class="{ done: item.completed }">
        <input type="checkbox" v-model="item.completed" />
        <div class="item-info">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-tags">
            <span class="tag">{{ item.category }}</span>
          </div>
        </div>
        <button @click="$emit('delete', item.id)" class="del-item-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ListItem } from '../types'

const props = defineProps<{
  title: string
  placeholder: string
  items: ListItem[]
  categories: string[]
}>()

// 💡 定義模板需要的變數
const newItemTitle = ref('')
const selectedCategory = ref(props.categories[0] || '')

// 💡 定義發送給 App.vue 的事件
const emit = defineEmits(['add', 'delete'])

// 💡 補上 addItem 函式，消滅紅點
const addItem = () => {
  if (!newItemTitle.value.trim()) return
  emit('add', {
    title: newItemTitle.value,
    category: selectedCategory.value
  })
  newItemTitle.value = '' // 清空輸入框
}
</script>

<style scoped>
.list-view { padding: 20px; animation: fadeIn 0.4s ease; }
.list-title { font-weight: 800; color: var(--rt-primary); margin-bottom: 20px; font-size: 20px; }
.add-controls { display: flex; gap: 8px; margin-bottom: 25px; background: white; padding: 8px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.add-controls input { flex: 1; border: none; padding: 10px; outline: none; font-size: 14px; }
.add-controls select { border: none; background: var(--rt-bg); padding: 5px 10px; border-radius: 10px; font-size: 12px; color: var(--rt-primary); font-weight: 700; outline: none; }
.add-btn { background: var(--rt-primary); color: white; border: none; width: 38px; height: 38px; border-radius: 12px; font-size: 20px; font-weight: 800; cursor: pointer; }

.items-container { display: flex; flex-direction: column; gap: 12px; }
.list-item { background: white; padding: 16px; border-radius: 20px; display: flex; align-items: center; gap: 12px; transition: 0.3s; border: 1px solid transparent; }
.list-item.done { opacity: 0.6; background: var(--rt-bg); }
.list-item.done .item-title { text-decoration: line-through; }
.item-info { flex: 1; }
.item-title { font-weight: 700; color: var(--rt-text); margin-bottom: 4px; }
.tag { font-size: 10px; background: var(--rt-secondary); color: var(--rt-primary); padding: 2px 8px; border-radius: 6px; font-weight: 800; }
.del-item-btn { background: transparent; border: none; color: #ff4d4f; font-size: 20px; cursor: pointer; padding: 5px; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>