<template>

    <UContainer>
        <UCard>
            <UCardHeader>
                <h1>Welcome to Nuxt UI</h1>
            </UCardHeader>
            <UCardBody>
                <p>This is a simple example of using Nuxt UI components.</p>
            </UCardBody>
            <UCardFooter>
                <UButton color="primary">Get Started</UButton>
            </UCardFooter>
        </UCard>
        
    </UContainer>
</template>

<script setup lang="ts">

import { FileHandler } from '~/composables/FileHandler';

const handler = new FileHandler();

</script>