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

handler.printDirectories();

// get config.json files of information systems

const configFiles = import.meta.glob('~/assets/data/*/config.json', { eager: true });
console.log('Config files:', configFiles);



</script>