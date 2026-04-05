import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ListItem } from '../types'
import {
  DEFAULT_TODO_CATEGORIES,
  DEFAULT_SHOPPING_CATEGORIES,
  DEFAULT_PACKING_CATEGORIES,
  normalizeListItem,
  buildCategoryList
} from './helpers'

// ── 通用：分類管理 factory ────────────────────────────────────
function useCategoryManager(
  categories: ReturnType<typeof ref<string[]>>,
  items: ReturnType<typeof ref<ListItem[]>>,
  onChanged: () => void
) {
  const add = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || categories.value.includes(trimmed)) return
    categories.value.push(trimmed)
    onChanged()
  }

  const rename = (from: string, to: string) => {
    const trimmed = to.trim()
    if (!trimmed || from === trimmed || categories.value.includes(trimmed)) return
    categories.value = categories.value.map((cat) => (cat === from ? trimmed : cat))
    items.value = items.value.map((item) =>
      item.category === from ? { ...item, category: trimmed } : item
    )
    onChanged()
  }

  const remove = (name: string) => {
    categories.value = categories.value.filter((cat) => cat !== name)
    if (!categories.value.includes('未分類')) categories.value.push('未分類')
    items.value = items.value.map((item) =>
      item.category === name ? { ...item, category: '未分類' } : item
    )
    onChanged()
  }

  return { add, rename, remove }
}

// ── 通用：清單 CRUD factory ───────────────────────────────────
function useListCrud(
  prefix: string,
  items: ReturnType<typeof ref<ListItem[]>>,
  categories: ReturnType<typeof ref<string[]>>,
  onChanged: () => void
) {
  const categorized = computed(() =>
    items.value.reduce((acc, item) => {
      const cat = item.category || '未分類'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ListItem[]>)
  )

  const addItem = (title: string, category: string) => {
    const cat = category || '未分類'
    if (!categories.value.includes(cat)) categories.value.push(cat)
    items.value.push({ id: `${prefix}-${Date.now()}`, title, category: cat, completed: false })
    onChanged()
  }

  const updateItem = (updated: ListItem) => {
    const index = items.value.findIndex((item) => item.id === updated.id)
    if (index === -1) return
    const cat = updated.category || '未分類'
    if (!categories.value.includes(cat)) categories.value.push(cat)
    items.value[index] = normalizeListItem({ ...updated, category: cat }, updated.id)
    onChanged()
  }

  const deleteItem = (id: string) => {
    items.value = items.value.filter((item) => item.id !== id)
    onChanged()
  }

  return { categorized, addItem, updateItem, deleteItem }
}

// ── Store ─────────────────────────────────────────────────────
export const useListStore = defineStore('list', () => {
  // 待辦清單
  const todos = ref<ListItem[]>([])
  const todoCategories = ref<string[]>([...DEFAULT_TODO_CATEGORIES])

  // 購物清單
  const shoppingList = ref<ListItem[]>([])
  const shoppingCategories = ref<string[]>([...DEFAULT_SHOPPING_CATEGORIES])

  // 行李清單
  const packingList = ref<ListItem[]>([])
  const packingCategories = ref<string[]>([...DEFAULT_PACKING_CATEGORIES])

  // 呼叫同步（由 useFirebaseSync 注入，預設 no-op）
  let _saveToCloud: () => void = () => {}
  const setSaveToCloud = (fn: () => void) => { _saveToCloud = fn }

  // ── 各清單 CRUD ──────────────────────────────────────────────
  const {
    categorized: categorizedTodos,
    addItem: addTodo,
    updateItem: updateTodo,
    deleteItem: deleteTodo
  } = useListCrud('todo', todos, todoCategories, () => _saveToCloud())

  const {
    categorized: categorizedShopping,
    addItem: addShoppingItem,
    updateItem: updateShoppingItem,
    deleteItem: deleteShoppingItem
  } = useListCrud('shop', shoppingList, shoppingCategories, () => _saveToCloud())

  const {
    categorized: categorizedPacking,
    addItem: addPackingItem,
    updateItem: updatePackingItem,
    deleteItem: deletePackingItem
  } = useListCrud('pack', packingList, packingCategories, () => _saveToCloud())

  // ── 分類管理 ────────────────────────────────────────────────
  const {
    add: addTodoCategory,
    rename: renameTodoCategory,
    remove: deleteTodoCategory
  } = useCategoryManager(todoCategories, todos, () => _saveToCloud())

  const {
    add: addShoppingCategory,
    rename: renameShoppingCategory,
    remove: deleteShoppingCategory
  } = useCategoryManager(shoppingCategories, shoppingList, () => _saveToCloud())

  const {
    add: addPackingCategory,
    rename: renamePackingCategory,
    remove: deletePackingCategory
  } = useCategoryManager(packingCategories, packingList, () => _saveToCloud())

  // ── 從雲端載入（由 useFirebaseSync 呼叫）─────────────────────
  const loadFromCloud = (data: Record<string, any>) => {
    if (Array.isArray(data.todos)) {
      todos.value = data.todos.map((item: any, i: number) =>
        normalizeListItem(item, `todo-${Date.now()}-${i}`)
      )
    }
    if (Array.isArray(data.shoppingList)) {
      shoppingList.value = data.shoppingList.map((item: any, i: number) =>
        normalizeListItem(item, `shop-${Date.now()}-${i}`)
      )
    }
    if (Array.isArray(data.packingList)) {
      packingList.value = data.packingList.map((item: any, i: number) =>
        normalizeListItem(item, `pack-${Date.now()}-${i}`)
      )
    }

    todoCategories.value = buildCategoryList(
      Array.isArray(data.todoCategories) && data.todoCategories.length > 0
        ? data.todoCategories
        : DEFAULT_TODO_CATEGORIES,
      todos.value
    )
    shoppingCategories.value = buildCategoryList(
      Array.isArray(data.shoppingCategories) && data.shoppingCategories.length > 0
        ? data.shoppingCategories
        : DEFAULT_SHOPPING_CATEGORIES,
      shoppingList.value
    )
    packingCategories.value = buildCategoryList(
      Array.isArray(data.packingCategories) && data.packingCategories.length > 0
        ? data.packingCategories
        : DEFAULT_PACKING_CATEGORIES,
      packingList.value
    )
  }

  return {
    // 待辦
    todos, todoCategories, categorizedTodos,
    addTodo, updateTodo, deleteTodo,
    addTodoCategory, renameTodoCategory, deleteTodoCategory,
    // 購物
    shoppingList, shoppingCategories, categorizedShopping,
    addShoppingItem, updateShoppingItem, deleteShoppingItem,
    addShoppingCategory, renameShoppingCategory, deleteShoppingCategory,
    // 行李
    packingList, packingCategories, categorizedPacking,
    addPackingItem, updatePackingItem, deletePackingItem,
    addPackingCategory, renamePackingCategory, deletePackingCategory,
    // 內部
    loadFromCloud,
    setSaveToCloud
  }
}, { persist: true })
