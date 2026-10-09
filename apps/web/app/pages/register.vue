<script setup lang="ts">
import type { RegisterPayload } from '@org/contracts';

definePageMeta({ layout: 'auth' });
useHead({ title: 'Create account' });

const route = useRoute();
const { register } = useSession();
const loading = ref(false);
const submitError = ref<string | null>(null);

async function onSubmit(payload: RegisterPayload) {
  loading.value = true;
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
    loading.value = false;
  }
}
</script>

<template>
  <AuthForm mode="register" :loading="loading" @submit="onSubmit">
    <template v-if="submitError" #validation>
      <UAlert
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="submitError"
      />
    </template>
    <template #footer>
      Already have an account?
      <ULink
        :to="{ path: '/login', query: route.query }"
        class="font-medium text-primary"
      >
        Sign in
      </ULink>
    </template>
  </AuthForm>
</template>
