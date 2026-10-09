<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';

const route = useRoute();
const colorMode = useColorMode();
const toast = useToast();
const { seller, logout } = useSession();

const links = computed<NavigationMenuItem[]>(() => [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/' },
  {
    label: 'Orders',
    icon: 'i-lucide-shopping-bag',
    to: '/orders',
    // Keep "Orders" highlighted on /orders/new and /orders/:id.
    active: route.path.startsWith('/orders'),
  },
  { label: 'Products', icon: 'i-lucide-package', to: '/products' },
  { label: 'Buyers', icon: 'i-lucide-users', to: '/buyers' },
]);

const accountMenu = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: seller.value?.name,
      description: seller.value?.email,
      avatar: { alt: seller.value?.name },
    },
  ],
  [
    {
      label: 'Appearance',
      icon: 'i-lucide-sun-moon',
      children: (['light', 'dark', 'system'] as const).map((mode) => ({
        label: mode[0]!.toUpperCase() + mode.slice(1),
        icon: {
          light: 'i-lucide-sun',
          dark: 'i-lucide-moon',
          system: 'i-lucide-monitor',
        }[mode],
        type: 'checkbox' as const,
        checked: colorMode.preference === mode,
        onSelect: (event: Event) => {
          event.preventDefault();
          colorMode.preference = mode;
        },
      })),
    },
  ],
  [{ label: 'Sign out', icon: 'i-lucide-log-out', onSelect: onLogout }],
]);

async function onLogout() {
  try {
    await logout();
  } catch {
    toast.add({
      title: 'Could not sign out',
      description: 'Check your connection and try again.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    });
  }
}
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <AppLogo :collapsed="collapsed" class="px-1" />
      </template>

      <template #default="{ collapsed }">
        <UButton
          to="/orders/new"
          icon="i-lucide-plus"
          :label="collapsed ? undefined : 'New order'"
          :square="collapsed"
          block
          class="mb-2"
        />
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links"
          orientation="vertical"
          tooltip
        />
      </template>

      <template #footer="{ collapsed }">
        <UDropdownMenu
          :items="accountMenu"
          :content="{ align: 'center', collisionPadding: 12 }"
          :ui="{
            content: collapsed
              ? 'w-56'
              : 'w-(--reka-dropdown-menu-trigger-width)',
          }"
        >
          <UButton
            :avatar="{ alt: seller?.name }"
            :label="collapsed ? undefined : seller?.name"
            :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
            color="neutral"
            variant="ghost"
            block
            :square="collapsed"
            class="data-[state=open]:bg-elevated"
            :ui="{ trailingIcon: 'text-dimmed' }"
            data-testid="account-menu"
          />
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
