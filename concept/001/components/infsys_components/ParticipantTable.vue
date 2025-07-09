<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import { ref, computed, toValue, h, resolveComponent } from 'vue'
import type { Column } from '@tanstack/vue-table'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const toast = useToast()
const { copy } = useClipboard()

const props = defineProps<{
  items?: any[] | Ref<any[]>,
  columns?: TableColumn<any>[]
  tableName?: string
}>()

const globalFilter = ref('')
const sorting = ref([])

const data = computed(() => {
  if (!props.items) return []
  return Array.isArray(props.items) ? props.items : toValue(props.items)
})

// Generate columns with sorting header for each key if not provided
function getHeader(column: Column<any>, label: string) {
  const isSorted = column.getIsSorted()
  return h(
    UDropdownMenu,
    {
      content: { align: 'start' },
      'aria-label': 'Actions dropdown',
      items: [
        {
          label: 'Asc',
          type: 'checkbox',
          icon: 'i-lucide-arrow-up-narrow-wide',
          checked: isSorted === 'asc',
          onSelect: () => {
            if (isSorted === 'asc') {
              column.clearSorting()
            } else {
              column.toggleSorting(false)
            }
          }
        },
        {
          label: 'Desc',
          icon: 'i-lucide-arrow-down-wide-narrow',
          type: 'checkbox',
          checked: isSorted === 'desc',
          onSelect: () => {
            if (isSorted === 'desc') {
              column.clearSorting()
            } else {
              column.toggleSorting(true)
            }
          }
        }
      ]
    },
    () =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5 data-[state=open]:bg-elevated',
        'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`
      })
  )
}

const autoColumns = computed<TableColumn<any>[]>(() => {
  const d = data.value
  if (props.columns && props.columns.length > 0) return props.columns
  if (!d.length) return []
  return Object.keys(d[0]).map(key => ({
    accessorKey: key,
    header: ({ column }: { column: Column<any> }) => getHeader(column, key.charAt(0).toUpperCase() + key.slice(1))
  }))
})

function getDropdownActions(row: any): DropdownMenuItem[][] {
  return [
    [
      {
        label: `Copy ID`,
        icon: 'i-lucide-copy',
        onSelect: () => {
          if (row.id !== undefined) {
            copy(row.id.toString())
            toast.add({
              title: 'ID copied to clipboard!',
              color: 'success',
              icon: 'i-lucide-circle-check'
            })
          }
        }
      }
    ],
    [
      { label: 'Edit', icon: 'i-lucide-edit' },
      { label: 'Delete', icon: 'i-lucide-trash', color: 'error' }
    ]
  ]
}
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <div class="flex px-4 py-3.5 border-b border-accented">
      <UInput v-model="globalFilter" class="max-w-sm" :placeholder="`Filter ${props.tableName || 'items'}...`" />
    </div>
    <UTable
      v-model:global-filter="globalFilter"
      v-model:sorting="sorting"
      :data="data"
      :columns="autoColumns"
      class="flex-1"
    >
      <template #name-cell="{ row }" v-if="autoColumns.some(col => (col as any)?.accessorKey === 'name')">
        <div class="flex items-center gap-3">
          <UAvatar v-if="row.original.id" :src="`https://i.pravatar.cc/120?img=${row.original.id}`" size="lg"
            :alt="`${row.original.name || row.original.id} avatar`" />
          <div>
            <p class="font-medium text-highlighted">
              {{ row.original.name }}
            </p>
            <p v-if="row.original.age">
              {{ row.original.age }}
            </p>
          </div>
        </div>
      </template>
      <template #action-cell="{ row }">
        <UDropdownMenu :items="getDropdownActions(row.original)">
          <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Actions" />
        </UDropdownMenu>
      </template>
    </UTable>
  </div>
</template>