<template>
  <div class="lists-page">
    <div class="sticky top-0 z-20 bg-[#EFEEF7]/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-[#6D5FB1]/5">
      <div class="flex gap-2 bg-white/70 p-1.5 rounded-[18px]">
        <button
          v-for="tab in LIST_TABS" :key="tab.id"
          @click="currentList = tab.id"
          class="flex-1 py-2.5 rounded-[13px] text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5"
          :class="currentList === tab.id ? 'bg-[#6D5FB1] text-white shadow-md' : 'text-[#757199]'"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.name }}</span>
          <span
            v-if="pendingCounts[tab.id] > 0"
            class="text-[10px] font-black px-1.5 py-0.5 rounded-full"
            :class="currentList === tab.id ? 'bg-white/30 text-white' : 'bg-[#EFEEF7] text-[#6D5FB1]'"
          >
            {{ pendingCounts[tab.id] }}
          </span>
        </button>
      </div>
    </div>

    <ListView
      v-if="currentList === 'todo'"
      title="待辦清單"
      placeholder="需要準備什麼..."
      :items="listStore.todos"
      :grouped-items="listStore.categorizedTodos"
      :categories="listStore.todoCategories"
      :show-price="true"
      @add="handleAddTodo"
      @update="listStore.updateTodo"
      @delete="listStore.deleteTodo"
      @addCategory="listStore.addTodoCategory"
      @renameCategory="handleRenameTodoCategory"
      @deleteCategory="listStore.deleteTodoCategory"
    />

    <ListView
      v-if="currentList === 'shop'"
      title="採買清單"
      placeholder="想買什麼東西..."
      :items="listStore.shoppingList"
      :grouped-items="listStore.categorizedShopping"
      :categories="listStore.shoppingCategories"
      :show-price="true"
      @add="handleAddShopping"
      @update="listStore.updateShoppingItem"
      @delete="listStore.deleteShoppingItem"
      @addCategory="listStore.addShoppingCategory"
      @renameCategory="handleRenameShoppingCategory"
      @deleteCategory="listStore.deleteShoppingCategory"
    />

    <ListView
      v-if="currentList === 'packing'"
      title="行李清單"
      placeholder="還要帶什麼..."
      :items="listStore.packingList"
      :grouped-items="listStore.categorizedPacking"
      :categories="listStore.packingCategories"
      @add="handleAddPacking"
      @update="listStore.updatePackingItem"
      @delete="listStore.deletePackingItem"
      @addCategory="listStore.addPackingCategory"
      @renameCategory="handleRenamePackingCategory"
      @deleteCategory="listStore.deletePackingCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListStore } from '../stores/useListStore'
import ListView from './ListView.vue'
import { LIST_TABS, type ListTabId, useListCounts } from '../composables/useListCounts'
import type { Currency, MozeCategory } from '../types'

interface ListAddPayload {
  title: string
  category: string
  price?: number
  currency?: Currency
  budgetCategory?: MozeCategory
}

interface RenamePayload {
  from: string
  to: string
}

const listStore = useListStore()
const currentList = ref<ListTabId>('todo')
const { pendingCounts } = useListCounts()

const handleAddTodo = (payload: ListAddPayload) => {
  listStore.addTodo(payload.title, payload.category, {
    price: payload.price,
    budgetCategory: payload.budgetCategory
  })
}

const handleAddShopping = (payload: ListAddPayload) => {
  listStore.addShoppingItem(payload.title, payload.category, {
    price: payload.price,
    budgetCategory: payload.budgetCategory
  })
}

const handleAddPacking = (payload: ListAddPayload) => {
  listStore.addPackingItem(payload.title, payload.category)
}

const handleRenameTodoCategory = ({ from, to }: RenamePayload) => {
  listStore.renameTodoCategory(from, to)
}

const handleRenameShoppingCategory = ({ from, to }: RenamePayload) => {
  listStore.renameShoppingCategory(from, to)
}

const handleRenamePackingCategory = ({ from, to }: RenamePayload) => {
  listStore.renamePackingCategory(from, to)
}
</script>
