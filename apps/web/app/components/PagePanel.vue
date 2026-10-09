<script setup lang="ts">
/**
 * Page shell inside the dashboard layout: a navbar with the title and
 * `#actions`, an optional `#toolbar` row (filters, tabs), and the body.
 * `back` shows a back button to that route.
 */
defineProps<{ title: string; id?: string; back?: string }>();
</script>

<template>
  <UDashboardPanel :id="id">
    <template #header>
      <UDashboardNavbar :title="title">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton
            v-if="back"
            :to="back"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            square
            aria-label="Back"
          />
        </template>
        <template #right>
          <slot name="actions" />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar v-if="$slots.toolbar">
        <slot name="toolbar" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <slot />
    </template>
  </UDashboardPanel>
</template>
