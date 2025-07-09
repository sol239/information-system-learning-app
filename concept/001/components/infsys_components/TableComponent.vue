<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import { ref, computed, toValue, h, resolveComponent, watch } from 'vue'
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
  onSortChange?: (sortField: string, sortOrder: 'asc' | 'desc' | null) => void
  onFilterChange?: (filter: string) => void
}>()

const globalFilter = ref('')
const currentSort = ref<{
  field: string | null
  order: 'asc' | 'desc' | null
}>({
  field: null,
  order: null
})

const data = computed(() => {
  if (!props.items) return []
  return Array.isArray(props.items) ? props.items : toValue(props.items)
})

// Watch for filter changes and emit to parent
watch(globalFilter, (newFilter) => {
  if (props.onFilterChange) {
    props.onFilterChange(newFilter)
  }
}, { debounce: 300 })

// Generate SQL ORDER BY clause
const generateSqlOrderBy = (field: string, order: 'asc' | 'desc') => {
  const sanitizedField = field.replace(/[^a-zA-Z0-9_]/g, '')
  return `ORDER BY ${sanitizedField} ${order.toUpperCase()}`
}

// Generate SQL WHERE clause for filtering
const generateSqlWhere = (filter: string, columns: string[]) => {
  if (!filter.trim()) return ''
  
  const sanitizedFilter = filter.replace(/'/g, "''") // Escape single quotes
  const conditions = columns.map(col => {
    const sanitizedCol = col.replace(/[^a-zA-Z0-9_]/g, '')
    return `${sanitizedCol} LIKE '%${sanitizedFilter}%'`
  }).join(' OR ')
  
  return `WHERE (${conditions})`
}

// Handle sorting
const handleSort = (field: string) => {
  let newOrder: 'asc' | 'desc' | null = 'asc'
  
  if (currentSort.value.field === field) {
    // Cycle through: asc -> desc -> null
    if (currentSort.value.order === 'asc') {
      newOrder = 'desc'
    } else if (currentSort.value.order === 'desc') {
      newOrder = null
    }
  }
  
  currentSort.value = {
    field: newOrder ? field : null,
    order: newOrder
  }
  
  if (props.onSortChange) {
    props.onSortChange(field, newOrder)
  }
  
  // Generate SQL for debugging/logging
  if (newOrder) {
    const sqlOrderBy = generateSqlOrderBy(field, newOrder)
    console.log('Generated SQL ORDER BY:', sqlOrderBy)
  }
}

// Generate columns with clickable sorting header for each key if not provided
function getHeader(label: string, field: string) {
  const isCurrentField = currentSort.value.field === field
  const currentOrder = isCurrentField ? currentSort.value.order : null
  return h(
    'button',
    {
      class: [
        'sort-header',
        isCurrentField ? 'active' : '',
        currentOrder === 'asc' ? 'asc' : '',
        currentOrder === 'desc' ? 'desc' : ''
      ],
      onClick: () => handleSort(field),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontWeight: isCurrentField ? 'bold' : 'normal',
        color: isCurrentField ? '#2563EB' : 'inherit',
        outline: 'none',
        padding: '0',
      }
    },
    [
      label,
      currentOrder === 'asc' ? ' \u25B2' : currentOrder === 'desc' ? ' \u25BC' : ''
    ]
  )
}

const autoColumns = computed<TableColumn<any>[]>(() => {
  const d = data.value
  if (props.columns && props.columns.length > 0) return props.columns
  if (!d.length) return []
  return Object.keys(d[0]).map(key => ({
    accessorKey: key,
    header: () => getHeader(key.charAt(0).toUpperCase() + key.slice(1), key)
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

// Utility functions for parent components
const getSqlQuery = (baseQuery: string, columns: string[]) => {
  let query = baseQuery
  
  // Add WHERE clause for filtering
  if (globalFilter.value.trim()) {
    const whereClause = generateSqlWhere(globalFilter.value, columns)
    if (whereClause) {
      query += ` ${whereClause}`
    }
  }
  
  // Add ORDER BY clause for sorting
  if (currentSort.value.field && currentSort.value.order) {
    const orderClause = generateSqlOrderBy(currentSort.value.field, currentSort.value.order)
    query += ` ${orderClause}`
  }
  
  return query
}

// Computed property to sort the data array based on currentSort
const sortedData = computed(() => {
  let d = [...data.value]
  if (currentSort.value.field && currentSort.value.order) {
    d.sort((a, b) => {
      const field = currentSort.value.field!
      const aValue = a[field]
      const bValue = b[field]
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return currentSort.value.order === 'asc' ? aValue - bValue : bValue - aValue
      }
      return currentSort.value.order === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    })
  }
  return d
})

// Expose utility functions
defineExpose({
  getSqlQuery,
  currentSort: readonly(currentSort),
  globalFilter: readonly(globalFilter)
})
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <div class="flex px-4 py-3.5 border-b border-accented">
      <UInput 
        v-model="globalFilter" 
        class="max-w-sm" 
        :placeholder="`Filter ${props.tableName || 'items'}...`" 
      />
      <!-- SQL Query Display (always visible) -->
      <div class="ml-auto text-sm text-gray-500 font-mono flex items-center">
        <span>SQL Query:</span>
        <span class="ml-2 p-2 bg-gray-100 rounded text-xs">
          {{ getSqlQuery(`SELECT * FROM ${props.tableName || 'table'}`, autoColumns.map(col => (col as any)?.accessorKey || '').filter(Boolean)) }}
        </span>
      </div>
    </div>
    <UTable
      :data="sortedData"
      :columns="autoColumns"
      class="flex-1"
      :sort="false"
    >
      <template #name-cell="{ row }" v-if="autoColumns.some(col => (col as any)?.accessorKey === 'name')">
        <div class="flex items-center gap-3">
          <UAvatar v-if="row.original.id" size="lg"
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

<style scoped>
.sort-header {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s;
}
.sort-header.active {
  color: #2563EB;
  font-weight: bold;
}
.sort-header.asc:after {
  content: ' \25B2';
}
.sort-header.desc:after {
  content: ' \25BC';
}
</style>