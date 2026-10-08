<script setup lang="ts">
defineProps<{ label: string; value: string | number; hint?: string }>();
</script>

<template>
  <div class="card stat">
    <p class="label">{{ label }}</p>
    <p class="value">{{ value }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.stat {
  display: grid;
  gap: 0.125rem;
}

.label,
.hint {
  color: var(--muted);
  font-size: 0.875rem;
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
}
</style>
