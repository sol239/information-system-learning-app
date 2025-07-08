<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import type { Participant } from '~/model/types/Participant'
import { ref, computed, toValue } from 'vue'

const toast = useToast()
const { copy } = useClipboard()

const props = defineProps<{
  participants?: Participant[] | Ref<Participant[]>
}>()

// Default to empty array if no data is passed
const data = computed(() => {
  if (!props.participants) return []
  return Array.isArray(props.participants) ? props.participants : toValue(props.participants)
})

const columns: TableColumn<Participant>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'personal_number', header: 'Personal Number' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'address', header: 'Address' },
  { accessorKey: 'age', header: 'Age' },
  { id: 'action' }
]

function getDropdownActions(user: Participant): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Copy user Id',
        icon: 'i-lucide-copy',
        onSelect: () => {
          copy(user.id.toString())
          toast.add({
            title: 'User ID copied to clipboard!',
            color: 'success',
            icon: 'i-lucide-circle-check'
          })
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
  <UTable :data="data" :columns="columns" class="flex-1">
    <template #name-cell="{ row }">
      <div class="flex items-center gap-3">
        <UAvatar :src="`https://i.pravatar.cc/120?img=${row.original.id}`" size="lg"
          :alt="`${row.original.name} avatar`" />
        <div>
          <p class="font-medium text-highlighted">
            {{ row.original.name }}
          </p>
          <p>
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
</template>