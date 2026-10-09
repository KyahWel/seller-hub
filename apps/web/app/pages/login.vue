<script setup lang="ts">
import type { RegisterPayload } from '@org/contracts';

definePageMeta({ layout: 'auth' });
useHead({ title: 'Sign in' });

const route = useRoute();
const { login } = useSession();
const loading = ref(false);
const submitError = ref<string | null>(null);

async function onSubmit({ email, password }: RegisterPayload) {
  loading.value = true;
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
    loading.value = false;
  }
}
</script>

<template>
  <AuthForm mode="login" :loading="loading" @submit="onSubmit">
    <template v-if="submitError" #validation>
      <UAlert
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="submitError"
      />
    </template>
    <template #footer>
      New to Seller Hub?
      <ULink
        :to="{ path: '/register', query: route.query }"
        class="font-medium text-primary"
      >
        Create an account
      </ULink>
    </template>
  </AuthForm>
</template>
