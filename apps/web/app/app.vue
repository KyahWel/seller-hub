<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title ? `${title} · Seller Hub` : 'Seller Hub'),
});
</script>

<template>
  <UApp :toaster="{ position: 'top-right' }">
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
