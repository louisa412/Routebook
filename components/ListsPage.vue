<template>
  <div class="lists-page">
    <div class="sticky top-0 z-20 bg-[#EFEEF7]/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-[#6D5FB1]/5">
      <div class="flex gap-2 bg-white/70 p-1.5 rounded-[18px]">
        <button
          v-for="tab in listTabs" :key="tab.id"
          @click="currentList = tab.id"
          class="flex-1 py-2.5 rounded-[13px] text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5"
          :class="currentList === tab.id ? 'bg-[#6D5FB1] text-white shadow-md' : 'text-[#757199]'"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.name }}</span>
          <span
            v-if="getCount(tab.id) > 0"
            class="text-[10px] font-black px-1.5 py-0.5 rounded-full"
            :class="currentList === tab.id ? 'bg-white/30 text-white' : 'bg-[#EFEEF7] text-[#6D5FB1]'"
          >{{ getCount(tab.id) }}</span>
        </button>
      </div>
    </div>

    <ListView
      v-if="currentList === 'todo'"
      title="待辦清單" placeholder="需要準備什麼..."
      :items="listStore.todos" :categories="listStore.todoCategories"
      @add="(d: any) => listStore.addTodo(d.title, d.category)"
      @update="listStore.updateTodo" @delete="listStore.deleteTodo"
      @addCategory="listStore.addTodoCategory"
      @renameCategory="({ from, to }: any) => listStore.renameTodoCategory(from, to)"
      @deleteCategory="listStore.deleteTodoCategory"
    />

    <ListView
      v-if="currentList === 'shop'"
      title="採買清單" placeholder="想買什麼東西..."
      :items="listStore.shoppingList" :categories="listStore.shoppingCategories"
      :show-price="true"
      @add="(d: any) => listStore.addShoppingItem(d.title, d.category, { price: d.price, budgetCategory: d.budgetCategory })"
      @update="listStore.updateShoppingItem" @delete="listStore.deleteShoppingItem"
      @addCategory="listStore.addShoppingCategory"
      @renameCategory="({ from, to }: any) => listStore.renameShoppingCategory(from, to)"
      @deleteCategory="listStore.deleteShoppingCategory"
    />

    <ListView
      v-if="currentList === 'packing'"
      title="行李清單" placeholder="還要帶什麼..."
      :items="listStore.packingList" :categories="listStore.packingCategories"
      @add="(d: any) => listStore.addPackingItem(d.title, d.category)"
      @update="listStore.updatePackingItem" @delete="listStore.deletePackingItem"
      @addCategory="listStore.addPackingCategory"
      @renameCategory="({ from, to }: any) => listStore.renamePackingCategory(from, to)"
      @deleteCategory="listStore.deletePackingCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListStore } from '../stores/useListStore'
import ListView from './ListView.vue'

const listStore = useListStore()
const currentList = ref<'todo' | 'shop' | 'packing'>('todo')

const listTabs = [
  { id: 'todo',    name: '待辦', icon: '✅' },
  { id: 'shop',    name: '採購', icon: '🛍' },
  { id: 'packing', name: '行李', icon: '🧳' }
] as const

const getCount = (id: string) => {
  if (id === 'todo')    return listStore.todos.filter(i => !i.completed).length
  if (id === 'shop')    return listStore.shoppingList.filter(i => !i.completed).length
  if (id === 'packing') return listStore.packingList.filter(i => !i.completed).length
  return 0
}
</script>
