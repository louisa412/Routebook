<template>
  <div class="bg-white rounded-[18px] border border-[#6D5FB1]/5 p-3 mt-3">
    <div class="flex items-center justify-between mb-2">
      <p class="text-[11px] font-black uppercase tracking-widest text-[#757199]">分類管理</p>
      <button class="text-[11px] font-bold text-[#6D5FB1]" @click="isOpen = !isOpen">
        {{ isOpen ? '收合' : '展開' }}
      </button>
    </div>
    <div v-if="isOpen" class="space-y-2">
      <div class="flex gap-2">
        <input
          v-model="newCategory"
          class="flex-1 bg-[#F8F7FF] border border-[#E5E0FF] rounded-[10px] px-3 py-2 text-sm outline-none"
          placeholder="新增分類..."
          @keyup.enter="handleAdd"
        />
        <button class="mini-btn" @click="handleAdd">新增</button>
      </div>
      <div class="flex flex-wrap gap-2">
        <div v-for="cat in categories" :key="cat" class="cat-chip">
          <template v-if="editingName === cat">
            <input v-model="editBuffer" class="chip-input" @keyup.enter="saveRename(cat)" @blur="saveRename(cat)" />
          </template>
          <template v-else>
            <span class="cat-text">{{ cat }}</span>
            <button class="chip-icon" @click="startRename(cat)">✏️</button>
            <button class="chip-icon" @click="$emit('delete', cat)">❌</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ categories: string[] }>()
const emit = defineEmits<{ add: [string]; rename: [{ from: string; to: string }]; delete: [string] }>()
const isOpen = ref(false)
const newCategory = ref('')
const editingName = ref<string | null>(null)
const editBuffer = ref('')
const handleAdd = () => { const t = newCategory.value.trim(); if (!t) return; emit('add', t); newCategory.value = '' }
const startRename = (cat: string) => { editingName.value = cat; editBuffer.value = cat }
const saveRename = (from: string) => { if (editingName.value !== from) return; const to = editBuffer.value.trim(); editingName.value = null; if (!to || to === from) return; emit('rename', { from, to }) }
</script>

<style scoped>
.mini-btn { background: #6D5FB1; color: white; border: none; border-radius: 10px; padding: 0 12px; font-size: 12px; font-weight: 700; }
.cat-chip { display: inline-flex; align-items: center; gap: 4px; background: #F8F7FF; border: 1px solid #E7E3FA; border-radius: 999px; padding: 4px 8px; }
.cat-text { font-size: 12px; color: #5F5A83; font-weight: 700; }
.chip-icon { border: none; background: transparent; font-size: 11px; padding: 0; line-height: 1; }
.chip-input { border: none; background: transparent; font-size: 12px; min-width: 72px; outline: none; color: #5F5A83; }
</style>
