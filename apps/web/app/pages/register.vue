<script setup lang="ts">
import type { RegisterPayload } from '@org/contracts';

useHead({ title: 'Create account' });

const route = useRoute();
const { register } = useSession();
const pending = ref(false);
const submitError = ref<string | null>(null);

async function onSubmit(payload: RegisterPayload) {
  pending.value = true;
  submitError.value = null;
  try {
    await register(payload);
    await navigateTo(safeRedirect(route.query.redirect));
  } catch (error) {
    submitError.value = apiErrorMessage(
      error,
      'Could not create the account. Is the API running?',
    );
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <section class="page auth">
    <h1>Create your account</h1>
    <div class="card">
      <AuthForm mode="register" :pending="pending" @submit="onSubmit" />
    </div>
    <p v-if="submitError" class="error" role="alert">{{ submitError }}</p>
    <p class="muted">
      Already have an account?
      <NuxtLink :to="{ path: '/login', query: route.query }">Sign in</NuxtLink>
    </p>
  </section>
</template>

<style scoped>
.auth {
  max-width: 24rem;
  margin: 2rem auto 0;
}
</style>
