<template>
    <div class="flex justify-center py-16">
        <UCard style="width:90%" >
            <h1 class="text-3xl font-bold mb-4">{{ t('homepage_welcome_message') }}</h1>
            <p class="mb-6 text-lg"> {{ t('homepage_description') }}</p>
            <div class="flex flex-col gap-4">
                <UButton
                    to="https://github.com/sol239/information-system-learing-app"
                    target="_blank"
                    icon="i-simple-icons-github"
                    color="secondary"
                    variant="solid"
                    size="lg"
                    class="w-48"
                >
                   {{  t('view_on_github') }}
                </UButton>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

</script>