<script setup lang="ts">
import type { User } from '@org/contracts';

const props = defineProps<{ user: User }>();
const avatar = computed(() => initials(props.user.name));
</script>

<template>
  <article class="user-card">
    <span class="avatar" aria-hidden="true">{{ avatar }}</span>
    <div>
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
  </article>
</template>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
}

.avatar {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 600;
}

h3 {
  font-weight: 600;
}

p {
  color: var(--muted);
  font-size: 0.875rem;
}
</style>
