<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
    <div class="absolute inset-0 bg-[#231F40]/40 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative bg-[#EFEEF7] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
      <div class="p-6 overflow-y-auto max-h-[85vh]">

        <div class="flex justify-between items-center mb-5">
          <div>
            <h2 class="text-[#231F40] text-xl font-black">匯入內容</h2>
            <p class="text-[11px] text-[#757199] mt-0.5">貼上文字，解析後確認再匯入</p>
          </div>
          <button @click="$emit('close')" class="text-[#757199] text-2xl leading-none">×</button>
        </div>

        <!-- 類型選擇 -->
        <div class="grid grid-cols-2 gap-3 mb-5">
          <button v-for="t in importTypes" :key="t.id" @click="importType = t.id"
            class="type-btn" :class="importType === t.id ? 'type-btn--active' : 'type-btn--inactive'">
            <span class="text-xl mb-1">{{ t.icon }}</span>
            <span class="font-black text-xs">{{ t.name }}</span>
            <span class="text-[10px] opacity-70 text-center leading-tight">{{ t.hint }}</span>
          </button>
        </div>

        <!-- 輸入 -->
        <div v-if="step === 'input'" class="space-y-4">
          <div>
            <label class="text-[11px] font-black uppercase tracking-widest text-[#757199] mb-2 block">
              {{ importType === 'list' ? '貼上清單文字' : '貼上行程文字' }}
            </label>
            <textarea v-model="rawText" rows="9"
              :placeholder="placeholder"
              class="w-full bg-white rounded-[18px] border-none p-4 text-sm text-[#231F40] shadow-sm outline-none resize-none font-mono leading-relaxed">
            </textarea>
          </div>

          <!-- 清單目標 -->
          <div v-if="importType === 'list'">
            <label class="text-[11px] font-black uppercase tracking-widest text-[#757199] mb-2 block">匯入到哪個清單</label>
            <div class="flex gap-2">
              <button v-for="t in listTargets" :key="t.id" @click="listTarget = t.id"
                class="flex-1 py-2.5 rounded-[12px] text-xs font-black border-2 transition-all"
                :class="listTarget === t.id ? 'bg-[#6D5FB1] text-white border-[#6D5FB1]' : 'bg-white text-[#757199] border-transparent'">
                {{ t.name }}
              </button>
            </div>
          </div>

          <button @click="parseInput" :disabled="!rawText.trim()"
            class="w-full py-4 rounded-[20px] bg-[#6D5FB1] text-white font-black text-sm shadow-lg shadow-[#6D5FB1]/20 disabled:opacity-40 active:scale-95 transition-all">
            解析預覽 →
          </button>
        </div>

        <!-- 預覽 -->
        <div v-if="step === 'preview'" class="space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-[13px] font-black text-[#231F40]">解析結果預覽</p>
            <button @click="step = 'input'" class="text-[11px] text-[#6D5FB1] font-bold">← 重新輸入</button>
          </div>

          <!-- 清單預覽 -->
          <div v-if="importType === 'list'" class="space-y-3">
            <div v-for="(group, gi) in parsedListGroups" :key="gi" class="bg-white rounded-[18px] p-4">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-1.5 h-4 bg-[#6D5FB1] rounded-full"></div>
                <input v-model="group.category" class="flex-1 text-sm font-black text-[#6D5FB1] bg-transparent outline-none" />
              </div>
              <div class="space-y-2">
                <div v-for="(item, ii) in group.items" :key="ii" class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-[#DEDAF4] flex-shrink-0"></div>
                  <input v-model="item.title" class="flex-1 text-sm text-[#231F40] font-bold bg-transparent outline-none border-b border-transparent focus:border-[#6D5FB1]" />
                  <button @click="group.items.splice(ii, 1)" class="text-[#ccc] text-xs hover:text-red-400">✕</button>
                </div>
              </div>
            </div>
            <p class="text-[11px] text-[#757199] text-center">可以直接在上面編輯，再點確認匯入</p>
          </div>

          <!-- 行程預覽 -->
          <div v-if="importType === 'schedule'" class="space-y-2">
            <div v-for="(event, ei) in parsedEvents" :key="ei"
              class="bg-white rounded-[18px] p-3 flex items-start gap-3">

              <!-- 天數 -->
              <div class="flex-shrink-0 text-center min-w-[52px]">
                <select v-model="event.day"
                  class="text-[11px] font-black text-[#6D5FB1] bg-[#EFEEF7] rounded-[8px] px-2 py-1 outline-none border-none w-full">
                  <option v-for="(d, i) in tripStore.days" :key="i" :value="i">
                    {{ d.dayTitle }}
                  </option>
                </select>
                <!-- 點狀/區段切換 -->
                <div
                  class="mt-1 text-[10px] font-black px-2 py-0.5 rounded-full cursor-pointer text-center"
                  :class="event.eventType === 'point' ? 'bg-[#FFF0E0] text-[#FFB067]' : 'bg-[#EFEEF7] text-[#6D5FB1]'"
                  @click="event.eventType = event.eventType === 'point' ? 'range' : 'point'"
                >{{ event.eventType === 'point' ? '點狀' : '區段' }}</div>
              </div>

              <!-- 時間 + 內容 -->
              <div class="flex-1 min-w-0 space-y-1.5">
                <div class="flex items-center gap-1.5">
                  <input v-model="event.startTime" type="time"
                    class="text-[12px] font-black text-[#6D5FB1] bg-transparent outline-none w-20" />
                  <template v-if="event.eventType !== 'point'">
                    <span class="text-[#DEDAF4]">–</span>
                    <input v-model="event.endTime" type="time"
                      class="text-[12px] font-black text-[#757199] bg-transparent outline-none w-20" />
                  </template>
                </div>
                <input v-model="event.title"
                  class="w-full text-sm font-black text-[#231F40] bg-transparent outline-none border-b border-transparent focus:border-[#6D5FB1]"
                  placeholder="行程名稱" />
                <input v-model="event.location"
                  class="w-full text-xs text-[#757199] bg-transparent outline-none border-b border-transparent focus:border-[#6D5FB1]"
                  placeholder="地點（可留空）" />
              </div>

              <button @click="parsedEvents.splice(ei, 1)" class="text-[#ccc] text-xs hover:text-red-400 flex-shrink-0 mt-1">✕</button>
            </div>
            <p class="text-[11px] text-[#757199] text-center">點「點狀／區段」可切換類型，所有欄位均可直接編輯</p>
          </div>

          <!-- 確認 -->
          <div class="flex gap-3 pt-2">
            <button @click="$emit('close')" class="flex-1 py-4 rounded-[20px] bg-white text-[#757199] font-bold active:scale-95 transition-transform">取消</button>
            <button @click="confirmImport" class="flex-1 py-4 rounded-[20px] bg-[#6D5FB1] text-white font-black shadow-lg shadow-[#6D5FB1]/20 active:scale-95 transition-transform">
              確認匯入 ({{ importType === 'list' ? totalListItems : parsedEvents.length }} 筆)
            </button>
          </div>
        </div>

        <!-- 完成 -->
        <div v-if="step === 'done'" class="py-10 flex flex-col items-center gap-3">
          <div class="text-5xl">✅</div>
          <p class="text-[#231F40] font-black text-lg">匯入完成！</p>
          <button @click="reset" class="mt-2 text-sm text-[#6D5FB1] font-bold">繼續匯入</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useListStore } from '../stores/useListStore'
import { useTripStore } from '../stores/useTripStore'
import type { EventType } from '../types'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

const listStore = useListStore()
const tripStore = useTripStore()

type ImportType = 'list' | 'schedule'
type ListTarget = 'todo' | 'shop' | 'packing'
type Step = 'input' | 'preview' | 'done'

const importType = ref<ImportType>('list')
const listTarget = ref<ListTarget>('todo')
const step = ref<Step>('input')
const rawText = ref('')

const importTypes = [
  { id: 'list'     as ImportType, icon: '📋', name: '清單匯入',  hint: '待辦 / 採購 / 行李' },
  { id: 'schedule' as ImportType, icon: '🗓',  name: '行程匯入',  hint: '貼上時間表自動解析' }
]
const listTargets = [
  { id: 'todo'    as ListTarget, name: '待辦' },
  { id: 'shop'    as ListTarget, name: '採購' },
  { id: 'packing' as ListTarget, name: '行李' }
]

interface ParsedGroup { category: string; items: { title: string }[] }
interface ParsedEvent {
  startTime: string; endTime: string; title: string
  location: string; eventType: EventType; day: number
}

const parsedListGroups = ref<ParsedGroup[]>([])
const parsedEvents = ref<ParsedEvent[]>([])

const totalListItems = computed(() =>
  parsedListGroups.value.reduce((sum, g) => sum + g.items.length, 0)
)

const placeholder = computed(() =>
  importType.value === 'list'
    ? '行前\n- 保險\n- eSIM\n\n衣物\n- 外套\n- 睡衣'
    : '4/8\n14:30 抵達桃機\n16:40-20:00 飛機上\n\n4/9\n09:00-10:30 博多運河城 (博多車站附近)\n11:00 退房'
)

// ── 日期行 → dayIndex ─────────────────────────────────────────
const parseDateToDayIndex = (line: string): number => {
  // 支援 4/8, 04/08, 4月8日
  const m = line.match(/(\d{1,2})[\/月](\d{1,2})/)
  if (!m) return -1
  const month = m[1].padStart(2, '0')
  const day = m[2].padStart(2, '0')
  // 嘗試各年份
  for (const year of [2026, 2025, 2027]) {
    const target = `${year}-${month}-${day}`
    const idx = tripStore.days.findIndex(d => d.date === target)
    if (idx !== -1) return idx
  }
  return -1
}

// ── 是否為日期行（不含時間的純日期） ──────────────────────────
const isDateLine = (line: string): boolean =>
  /^\d{1,2}[\/月]\d{1,2}/.test(line) && !/^\d{1,2}:\d{2}/.test(line)

// ── 解析「標題 (地點)」或「標題　地點」 ───────────────────────
const parseTitleLocation = (raw: string): { title: string; location: string } => {
  // 括號內視為地點
  const parenMatch = raw.match(/^(.+?)\s*[（(](.+?)[）)]\s*$/)
  if (parenMatch) return { title: parenMatch[1].trim(), location: parenMatch[2].trim() }
  // 以全形空格或多個空格分隔
  const spaceMatch = raw.match(/^(.+?)\s{2,}(.+)$/)
  if (spaceMatch) return { title: spaceMatch[1].trim(), location: spaceMatch[2].trim() }
  return { title: raw.trim(), location: '' }
}

// ── 行程解析器 ────────────────────────────────────────────────
const parseScheduleText = (text: string): ParsedEvent[] => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const results: ParsedEvent[] = []
  let currentDay = 0  // 預設 Day 0

  const rangeRe = /^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s+(.+)$/
  const pointRe = /^(\d{1,2}:\d{2})\s+(.+)$/

  for (const line of lines) {
    // 日期行
    if (isDateLine(line)) {
      const idx = parseDateToDayIndex(line)
      if (idx !== -1) currentDay = idx
      continue
    }

    // 區段
    const rMatch = line.match(rangeRe)
    if (rMatch) {
      const { title, location } = parseTitleLocation(rMatch[3])
      results.push({
        startTime: rMatch[1], endTime: rMatch[2],
        title, location, eventType: 'range', day: currentDay
      })
      continue
    }

    // 點狀（啟發式：含交通關鍵字 → point，否則也 point，因為只有一個時間點）
    const pMatch = line.match(pointRe)
    if (pMatch) {
      const { title, location } = parseTitleLocation(pMatch[2])
      const startH = parseInt(pMatch[1].split(':')[0])
      const endH = Math.min(startH + 1, 23)
      results.push({
        startTime: pMatch[1],
        endTime: `${String(endH).padStart(2, '0')}:00`,
        title, location,
        eventType: 'point',
        day: currentDay
      })
    }
  }

  return results
}

// ── 清單解析器 ────────────────────────────────────────────────
const parseListText = (text: string): ParsedGroup[] => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const groups: ParsedGroup[] = []
  let current: ParsedGroup | null = null

  for (const line of lines) {
    const isItem = /^[-•*＊・]/.test(line) || /^\d+\./.test(line)
    if (isItem) {
      const title = line.replace(/^[-•*＊・]\s*/, '').replace(/^\d+\.\s*/, '').trim()
      if (!title) continue
      if (!current) { current = { category: '未分類', items: [] }; groups.push(current) }
      current.items.push({ title })
    } else {
      current = { category: line, items: [] }
      groups.push(current)
    }
  }

  return groups.filter(g => g.items.length > 0)
}

const parseInput = () => {
  if (!rawText.value.trim()) return
  if (importType.value === 'list') {
    parsedListGroups.value = parseListText(rawText.value)
    if (!parsedListGroups.value.length) { alert('解析不到任何項目，請確認格式。'); return }
  } else {
    parsedEvents.value = parseScheduleText(rawText.value)
    if (!parsedEvents.value.length) { alert('解析不到任何行程，請確認格式。'); return }
  }
  step.value = 'preview'
}

const confirmImport = () => {
  if (importType.value === 'list') {
    for (const group of parsedListGroups.value) {
      for (const item of group.items) {
        if (!item.title.trim()) continue
        if (listTarget.value === 'todo')    listStore.addTodo(item.title, group.category)
        if (listTarget.value === 'shop')    listStore.addShoppingItem(item.title, group.category)
        if (listTarget.value === 'packing') listStore.addPackingItem(item.title, group.category)
      }
    }
  } else {
    for (const ev of parsedEvents.value) {
      if (!ev.title.trim()) continue
      tripStore.addEvent({
        id: `event-import-${Date.now()}-${Math.random()}`,
        title: ev.title,
        startTime: ev.startTime,
        endTime: ev.endTime,
        eventType: ev.eventType,
        location: ev.location,
        category: 'spot',
        price: 0,
        day: ev.day,
        images: [],
        note: '',
        isHotel: false,
        locationSource: 'manual'
      })
    }
  }
  step.value = 'done'
}

const reset = () => {
  rawText.value = ''
  parsedListGroups.value = []
  parsedEvents.value = []
  step.value = 'input'
}
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.type-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 8px; border-radius: 16px; border: 2px solid transparent; transition: all 0.2s; gap: 2px; }
.type-btn--active { background: #6D5FB1; color: white; border-color: #6D5FB1; }
.type-btn--inactive { background: white; color: #757199; }
</style>
