<template>
    <div class="max-w-4xl mx-auto py-8 px-4">
        <div class="mb-2 rounded-xl shadow p-6">
            <h1 class="text-3xl font-bold mb-2 text-[#7c86ff]">Development of the application</h1>
            <p class="note text-lg mb-2">This page is available only in english and will not be available in a final release.</p>
        </div>

        <USeparator />

        <div class="mb-2 rounded-xl shadow p-6">
            <h2 class="text-2xl font-bold mb-4 text-[#7c86ff]">Issues</h2>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">1. Database does survive page reload</h3>
            <p class="mb-4">
                Since rehydrate method uses original config.json's data database changes are not persisted.
            </p>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">2. Allergen visualization in forms</h3>
            <p class="mb-4">
                The visualization of allergens has to be redone in the future.
            </p>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">3. Keydown events</h3>
            <p>
                All keydown events are not working correctly on every page.
            </p>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">4. Missing translations</h3>
            <p>
                Some translations are missing.
            </p>
        </div>

        <USeparator />

        <div class="mb-2 rounded-xl shadow p-6">
            <h2 class="text-2xl font-bold mb-4 text-[#7c86ff]">To be implemented</h2>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">1. UI overhaul</h3>
            <p class="mb-4">
                Some important UI elements need to be redesigned for better usability.
            </p>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">2. Highlighting and Editing of more elements</h3>
            <p class="mb-4">
                More elements need to support highlighting and editing.
            </p>
        </div>

        <USeparator />

    </div>
</template>

<script setup lang="ts">

// ISSUES:
// TODO: Remove this page from production/end result.
// TODO: Since rehydrate method uses original config.json's data database changes are not persisted.
// TODO: The visualization of allergens has to be redone in the future.
// TODO: All keydown events are not working correctly on every page.
// TODO: Some translations are missing. 

// TO BE IMPLEMENTED:
// TODO: Some important UI elements need to be redesigned for better usability.
// TODO: More elements need to support highlighting and editing.

</script>