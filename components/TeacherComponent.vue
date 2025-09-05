<template>
    <div class="max-w-4xl mx-auto py-8 px-4">
        <div class="mb-2 rounded-xl shadow p-6">
            <p class="text-lg">
                {{ $t('intro') }}
            </p>
        </div>

        <USeparator />

        <div class="mb-2 rounded-xl shadow p-6">
            <h2 class="text-2xl font-bold mb-4 text-[#7c86ff]">{{ $t('solution_types_title') }}</h2>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">{{ $t('solution_1_title') }}</h3>
            <p class="mb-4">
                {{ $t('solution_1_desc') }}
            </p>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">{{ $t('solution_2_title') }}</h3>
            <p class="mb-4">
                {{ $t('solution_2_desc') }}
            </p>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">{{ $t('solution_3_title') }}</h3>
            <p>
                {{ $t('solution_3_desc') }}
            </p>
        </div>

        <USeparator />

        <div class="rounded-xl shadow p-6">
            <h2 class="text-2xl font-bold mb-4 text-[#7c86ff]">{{ $t('creation_types_title') }}</h2>
            <p class="mb-4">
                {{ $t('creation_intro') }}
                <code class="bg-gray-800 px-1 rounded text-sm font-bold text-red-600">{{ $t('config_path') }}</code>
            </p>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">{{ $t('creation_1_title') }}</h3>
            <p class="mb-4">
                {{ $t('creation_1_desc') }}
            </p>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-[#9ca3ff]">{{ $t('creation_2_title') }}</h3>
            <p>
                {{ $t('creation_2_desc') }}
            </p>
        </div>

        <USeparator />

        <div class="rounded-xl shadow p-6">
            <h2 class="text-2xl font-bold mb-4 text-[#7c86ff]">{{ $t('how_to_title') }}</h2>
            <p class="mb-4">
                {{ $t('how_to_desc') }}
            </p>
        </div>
    </div>
</template>
