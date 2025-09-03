<template>
    <div>
        <LocalNavbar />

        <div class="container mx-auto px-4 py-8">
            <!-- Filter Section -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                <div class="flex items-center gap-2 mb-4">
                    <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-gray-600" />
                    <h2 class="text-lg font-medium text-gray-900">{{ t('filter') }}</h2>
                    <UButton 
                        v-if="hasActiveFilters"
                        variant="ghost" 
                        color="red" 
                        size="sm"
                        @click="clearFilters"
                        class="ml-auto"
                    >
                        {{ t('clear_filters') }}
                    </UButton>
                </div>
                
                <div class="max-w-md">
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('search_meals') }}</label>
                    <UInput 
                        v-model="filters.search"
                        :placeholder="t('search_placeholder')"
                        icon="i-heroicons-magnifying-glass"
                        class="w-full"
                    />
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="flex justify-center items-center py-12">
                <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-400" />
                <span class="ml-2 text-gray-600">{{ t('loading') }}</span>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400 mr-2" />
                    <span class="text-red-800">{{ error }}</span>
                </div>
            </div>

            <!-- Meals by Date -->
            <div v-else-if="mealsByDate && Object.keys(mealsByDate).length > 0" class="space-y-8">
                <div 
                    v-for="(meals, date) in mealsByDate" 
                    :key="date"
                    class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                    <!-- Date Header -->
                    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h2 class="text-lg font-semibold text-gray-900 highlightable" 
                            :id="`meals-date-${date}`"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(`meals-date-${date}`, $event)">
                            {{ formatDate(date) }}
                        </h2>
                        <p class="text-sm text-gray-600 mt-1">
                            {{ meals.length }} {{ meals.length === 1 ? t('meal') : t('meals') }}
                            <span v-if="hasActiveFilters" class="text-blue-600">
                                ({{ t('filtered') }})
                            </span>
                        </p>
                    </div>

                    <!-- Meals Grid -->
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div 
                                v-for="meal in meals" 
                                :key="`${date}-${meal.meal_id}`"
                                class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                            >
                                <!-- Meal Name -->
                                <h3 class="font-semibold text-gray-900 mb-2 highlightable" 
                                    :id="`meal-name-${meal.meal_id}-${date}`"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(`meal-name-${meal.meal_id}-${date}`, $event)">
                                    {{ meal.name }}
                                </h3>

                                <!-- When Served -->
                                <div class="flex items-center gap-2 mb-3">
                                    <UIcon name="i-heroicons-clock" class="w-4 h-4 text-gray-500" />
                                    <span class="text-sm text-gray-600 highlightable" 
                                          :id="`meal-when-${meal.meal_id}-${date}`"
                                          @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(`meal-when-${meal.meal_id}-${date}`, $event)">
                                        {{ meal.when_served }}
                                    </span>
                                </div>

                                <!-- Allergens -->
                                <div class="space-y-2">
                                    <div class="flex items-center gap-2">
                                        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-amber-500" />
                                        <span class="text-sm font-medium text-gray-700">{{ t('allergens') }}:</span>
                                    </div>
                                    
                                    <div v-if="meal.allergens && meal.allergens.length > 0" 
                                         class="flex flex-wrap gap-1">
                                        <UBadge 
                                            v-for="allergen in meal.allergens" 
                                            :key="allergen.allergen_id"
                                            color="yellow" 
                                            variant="soft" 
                                            size="sm"
                                            class="highlightable"
                                            :id="`allergen-${allergen.allergen_id}-${meal.meal_id}-${date}`"
                                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(`allergen-${allergen.allergen_id}-${meal.meal_id}-${date}`, $event)"
                                        >
                                            {{ allergen.name }}
                                        </UBadge>
                                    </div>
                                    
                                    <div v-else class="text-sm text-gray-500 italic highlightable"
                                         :id="`no-allergens-${meal.meal_id}-${date}`"
                                         @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(`no-allergens-${meal.meal_id}-${date}`, $event)">
                                        {{ t('no_allergens') }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
                <UIcon name="i-heroicons-square-3-stack-3d" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('no_meals_found') }}</h3>
                <p class="text-gray-600">{{ t('no_meals_description') }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import { useHighlightStore } from '~/stores/useHighlightStore'

const route = useRoute()
const { t } = useI18n()
const systemStore = useSelectedSystemStore()
const highlightStore = useHighlightStore()

// Reactive data
const isLoading = ref(true)
const error = ref<string | null>(null)
const allMealsData = ref<Record<string, any[]>>({})
const mealsByDate = ref<Record<string, any[]>>({})
const dateRange = ref<{ start: string; end: string } | null>(null)

// Filter state
const filters = ref({
    search: ''
})

// Filter options
// Removed - using unified search instead

// Computed properties
const systemId = computed(() => parseInt(route.params.id as string))

const hasActiveFilters = computed(() => {
    return filters.value.search !== ''
})

// Methods
const loadMeals = async () => {
    try {
        isLoading.value = true
        error.value = null

        if (!systemStore.selectedSystem?.db) {
            error.value = t('database_not_initialized')
            return
        }

        // Query to get meals grouped by date with allergens
        const query = `
            SELECT 
                mb.date,
                m.meal_id,
                m.name,
                m.when_served,
                GROUP_CONCAT(a.allergen_id || ':' || a.name, '|') as allergens_data
            FROM ${systemStore.selectedSystem.db.getTableName('meals_book')} mb
            JOIN ${systemStore.selectedSystem.db.getTableName('meals')} m ON mb.meal_id = m.meal_id
            LEFT JOIN ${systemStore.selectedSystem.db.getTableName('allergens_meals')} am ON m.meal_id = am.meal_id
            LEFT JOIN ${systemStore.selectedSystem.db.getTableName('allergens')} a ON am.allergen_id = a.allergen_id
            GROUP BY mb.date, m.meal_id, m.name, m.when_served
            ORDER BY mb.date ASC, m.meal_id ASC
        `

        const result = systemStore.selectedSystem.db.query(query)
        
        if (!result.success) {
            error.value = t('failed_to_load_meals')
            return
        }

        // Process the results and group by date
        const grouped: Record<string, any[]> = {}
        let minDate: string | null = null
        let maxDate: string | null = null

        result.results.forEach((row: any) => {
            const date = row.date
            
            if (!minDate || date < minDate) minDate = date
            if (!maxDate || date > maxDate) maxDate = date

            if (!grouped[date]) {
                grouped[date] = []
            }

            // Parse allergens data
            const allergens: any[] = []
            if (row.allergens_data) {
                const allergenItems = row.allergens_data.split('|')
                allergenItems.forEach((item: string) => {
                    const [allergen_id, name] = item.split(':')
                    if (allergen_id && name) {
                        allergens.push({
                            allergen_id: parseInt(allergen_id),
                            name: name
                        })
                    }
                })
            }

            grouped[date].push({
                meal_id: row.meal_id,
                name: row.name,
                when_served: row.when_served,
                allergens: allergens
            })
        })

        allMealsData.value = grouped
        mealsByDate.value = grouped
        
        if (minDate && maxDate) {
            dateRange.value = { start: minDate, end: maxDate }
        }

        // Build filter options - not needed for unified search
        // buildFilterOptions()

    } catch (err) {
        console.error('Error loading meals:', err)
        error.value = t('error_loading_data')
    } finally {
        isLoading.value = false
    }
}

const applyFilters = () => {
    if (!hasActiveFilters.value) {
        mealsByDate.value = { ...allMealsData.value }
        return
    }

    const searchTerm = filters.value.search.toLowerCase()
    const filtered: Record<string, any[]> = {}

    Object.keys(allMealsData.value).forEach(date => {
        const filteredMeals = allMealsData.value[date].filter(meal => {
            // Search in meal name
            if (meal.name.toLowerCase().includes(searchTerm)) {
                return true
            }

            // Search in when served
            if (meal.when_served.toLowerCase().includes(searchTerm)) {
                return true
            }

            // Search in allergens
            if (meal.allergens.some((allergen: any) => 
                allergen.name.toLowerCase().includes(searchTerm)
            )) {
                return true
            }

            // Search in date (formatted)
            if (formatDate(date).toLowerCase().includes(searchTerm)) {
                return true
            }

            return false
        })

        if (filteredMeals.length > 0) {
            filtered[date] = filteredMeals
        }
    })

    mealsByDate.value = filtered
}

const clearFilters = () => {
    filters.value = {
        search: ''
    }
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('cs-CZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Watch for filter changes
watch(filters, () => {
    applyFilters()
}, { deep: true })

// Lifecycle
onMounted(async () => {
    if (systemStore.selectedSystem) {
        await loadMeals()
    } else {
        error.value = t('system_not_selected')
        isLoading.value = false
    }
})
</script>