import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useListStore } from '../stores/useListStore'

export type ListTabId = 'todo' | 'shop' | 'packing'

export const LIST_TABS: ReadonlyArray<{ id: ListTabId; name: string; icon: string }> = [
  { id: 'todo', name: '待辦', icon: '✅' },
  { id: 'shop', name: '採購', icon: '🛍' },
  { id: 'packing', name: '行李', icon: '🧳' }
]

export const useListCounts = () => {
  const listStore = useListStore()
  const { todos, shoppingList, packingList } = storeToRefs(listStore)

  const pendingCounts = computed<Record<ListTabId, number>>(() => ({
    todo: todos.value.filter((item) => !item.completed).length,
    shop: shoppingList.value.filter((item) => !item.completed).length,
    packing: packingList.value.filter((item) => !item.completed).length
  }))

  return { pendingCounts }
}
