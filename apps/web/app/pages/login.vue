<script setup lang="ts">
import type { RegisterPayload } from '@org/contracts';

useHead({ title: 'Sign in' });

const route = useRoute();
const { login } = useSession();
const pending = ref(false);
const submitError = ref<string | null>(null);

async function onSubmit({ email, password }: RegisterPayload) {
  pending.value = true;
  submitError.value = null;
  try {
    await login({ email, password });
    await navigateTo(safeRedirect(route.query.redirect));
  } catch (error) {
    submitError.value = apiErrorMessage(
      error,
      'Could not sign in. Is the API running?',
    );
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <section class="page auth">
    <h1>Sign in</h1>
    <div class="card">
      <AuthForm mode="login" :pending="pending" @submit="onSubmit" />
    </div>
    <p v-if="submitError" class="error" role="alert">{{ submitError }}</p>
    <p class="muted">
      New to Seller Hub?
      <NuxtLink :to="{ path: '/register', query: route.query }">
        Create an account
      </NuxtLink>
    </p>
  </section>
</template>

<style scoped>
.auth {
  max-width: 24rem;
  margin: 2rem auto 0;
}
</style>
