<script setup lang="ts">
const highlights = [
  {
    icon: 'i-lucide-messages-square',
    title: 'Every channel, one list',
    text: 'Facebook, Instagram, TikTok, Shopee and Lazada orders in one place.',
  },
  {
    icon: 'i-lucide-truck',
    title: 'Know your COD',
    text: 'See what is still out for delivery and what came back.',
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Fewer bogus buyers',
    text: 'Keep a record of every buyer and their past orders.',
  },
];
</script>

<template>
  <div class="grid min-h-dvh lg:grid-cols-2">
    <aside
      class="relative hidden overflow-hidden bg-primary-950 p-12 text-white lg:flex lg:flex-col lg:justify-between"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--color-primary-500)_0%,transparent_60%)] opacity-40"
        aria-hidden="true"
      />
      <div class="relative flex items-center gap-2.5 text-lg font-semibold">
        <span
          class="flex size-9 items-center justify-center rounded-lg bg-white/10 ring ring-white/20"
        >
          <UIcon name="i-lucide-store" class="size-5" />
        </span>
        Seller Hub
      </div>

      <div class="relative max-w-md space-y-8">
        <h2 class="text-4xl font-semibold tracking-tight text-balance">
          Run your online store without the spreadsheet.
        </h2>
        <ul class="space-y-5">
          <li v-for="item in highlights" :key="item.title" class="flex gap-4">
            <UIcon
              :name="item.icon"
              class="mt-0.5 size-5 shrink-0 text-primary-300"
            />
            <div>
              <p class="font-medium">{{ item.title }}</p>
              <p class="text-sm text-white/70">{{ item.text }}</p>
            </div>
          </li>
        </ul>
      </div>

      <p class="relative text-sm text-white/50">
        Made for Filipino online sellers.
      </p>
    </aside>

    <main class="relative flex items-center justify-center px-4 py-12 sm:px-8">
      <UColorModeButton class="absolute top-4 right-4" />
      <div class="w-full max-w-sm">
        <AppLogo class="mb-8 lg:hidden" />
        <slot />
      </div>
    </main>
  </div>
</template>
