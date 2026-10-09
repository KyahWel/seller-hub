<script setup lang="ts">
import { NuxtLink } from '#components';

export type StatTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    icon: string;
    hint?: string;
    tone?: StatTone;
    to?: string;
  }>(),
  { tone: 'primary' },
);

// Full class names so Tailwind picks them up.
const TONES: Record<StatTone, string> = {
  primary: 'bg-primary/10 text-primary ring-primary/20',
  success: 'bg-success/10 text-success ring-success/20',
  warning: 'bg-warning/10 text-warning ring-warning/20',
  error: 'bg-error/10 text-error ring-error/20',
  info: 'bg-info/10 text-info ring-info/20',
};
</script>

<template>
  <UCard
    :as="to ? NuxtLink : 'div'"
    :to="to"
    :ui="{
      body: 'flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5',
    }"
    :class="to && 'transition-colors hover:bg-elevated/50'"
  >
    <span :class="['self-start rounded-lg p-2.5 ring ring-inset', TONES[tone]]">
      <UIcon :name="icon" class="block size-5" />
    </span>
    <div class="min-w-0">
      <p class="text-sm text-muted">{{ label }}</p>
      <p
        class="mt-1 truncate text-xl font-semibold text-highlighted tabular-nums sm:text-2xl"
        data-testid="stat-value"
      >
        {{ value }}
      </p>
      <p v-if="hint" class="mt-1 hidden text-xs text-dimmed sm:block">
        {{ hint }}
      </p>
    </div>
  </UCard>
</template>
