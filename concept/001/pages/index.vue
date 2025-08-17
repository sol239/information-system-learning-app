<template>
    <div class="flex justify-center py-16">
        <UCard style="width:90%; border: 2px solid; border-color: #00bcff;">
            <h1 class="text-3xl font-bold mb-4">{{ t('homepage_welcome_message') }}</h1>
            <p class="mb-6 text-lg"> {{ t('homepage_description') }}</p>
            <div class="flex flex-col gap-4">
                <UButton to="https://github.com/sol239/information-system-learing-app" target="_blank"
                    icon="i-simple-icons-github" color="sky" variant="solid" size="lg" class="w-48">
                    {{ t('view_on_github') }}
                </UButton>
            </div>
        </UCard>
    </div>

    <div class="flex justify-center">
        <div class="flex gap-x-8" style="width:90%">
            <UCard class="flex-1" style="border: 2px solid; border-color: #616aca;">
                <h1 class="text-2xl font-bold mb-4">{{ t('im_teacher') }}</h1>
                <div class="flex flex-col gap-4">
                    <UButton @click="navigateTo('/teacher')" target="_blank" color="teacher" variant="solid" size="lg" class="w-48">
                        {{ t('go_to_help') }}
                    </UButton>
                </div>
            </UCard>
            <UCard class="flex-1" style="border: 2px solid; border-color: #04a599;">
                <h1 class="text-2xl font-bold mb-4">{{ t('im_student') }}</h1>
                <div class="flex flex-col gap-4">
                    <UButton @click="navigateTo('/student')" target="_blank" color="student" variant="solid" size="lg" class="w-48">
                        {{ t('go_to_help') }}
                    </UButton>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

</script>