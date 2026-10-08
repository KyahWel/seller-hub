<script setup lang="ts">
const { seller } = useActiveSeller();
const route = useRoute();

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/orders', label: 'Orders' },
  { to: '/products', label: 'Products' },
  { to: '/buyers', label: 'Buyers' },
  { to: '/sellers', label: 'Sellers' },
];

const isActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path.startsWith(to);
</script>

<template>
  <div class="layout">
    <header>
      <div class="top">
        <NuxtLink to="/" class="brand">Seller Hub</NuxtLink>
        <NuxtLink
          to="/sellers"
          class="active-seller"
          data-testid="active-seller"
        >
          {{ seller ? seller.name : 'Choose seller' }}
        </NuxtLink>
      </div>
      <nav aria-label="Main">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="{ active: isActive(link.to) }"
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.layout {
  max-width: 56rem;
  margin: 0 auto;
  padding: 0 1rem 3rem;
}

header {
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem 0 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  font-weight: 700;
  font-size: 1.125rem;
}

.active-seller {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.875rem;
}

nav {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
}

nav a {
  padding-bottom: 0.625rem;
  border-bottom: 2px solid transparent;
  color: var(--muted);
  white-space: nowrap;
}

nav a.active {
  border-color: var(--accent);
  color: inherit;
  font-weight: 600;
}
</style>
