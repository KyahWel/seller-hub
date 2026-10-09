<script setup lang="ts">
const { seller, logout } = useSession();
const route = useRoute();
const logoutError = ref(false);

async function onLogout() {
  logoutError.value = false;
  try {
    await logout();
  } catch {
    logoutError.value = true;
  }
}

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/orders', label: 'Orders' },
  { to: '/products', label: 'Products' },
  { to: '/buyers', label: 'Buyers' },
];

const isActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path.startsWith(to);
</script>

<template>
  <div class="layout">
    <header :class="{ 'signed-out': !seller }">
      <div class="top">
        <NuxtLink to="/" class="brand">Seller Hub</NuxtLink>
        <div v-if="seller" class="account">
          <span class="seller-name" data-testid="seller-name">
            {{ seller.name }}
          </span>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="onLogout"
          >
            Sign out
          </button>
        </div>
      </div>
      <p v-if="logoutError" class="error" role="alert">
        Could not sign out. Try again.
      </p>
      <nav v-if="seller" aria-label="Main">
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

header.signed-out {
  padding-bottom: 1.25rem;
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

.account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.seller-name {
  overflow: hidden;
  font-size: 0.875rem;
  text-overflow: ellipsis;
  white-space: nowrap;
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
