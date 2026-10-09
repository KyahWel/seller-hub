<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui';
import { PASSWORD_MAX_LENGTH, type RegisterPayload } from '@org/contracts';
import { loginSchema, registerSchema } from '~/utils/schemas';

/** Sign-in asks for email and password; sign-up also asks for a name. */
const props = defineProps<{ mode: 'login' | 'register'; loading?: boolean }>();
const emit = defineEmits<{ submit: [payload: RegisterPayload] }>();

const isRegister = computed(() => props.mode === 'register');

const fields = computed<AuthFormField[]>(() => [
  ...(isRegister.value
    ? [
        {
          name: 'name',
          type: 'text' as const,
          label: 'Store or seller name',
          placeholder: 'Ada’s Closet',
          autocomplete: 'organization',
          required: true,
        },
      ]
    : []),
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    autocomplete: 'email',
    required: true,
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: isRegister.value ? 'At least 8 characters' : undefined,
    autocomplete: isRegister.value ? 'new-password' : 'current-password',
    maxlength: PASSWORD_MAX_LENGTH,
    required: true,
  },
]);

function onSubmit(
  event: FormSubmitEvent<{ name?: string; email: string; password: string }>,
) {
  // Passwords are sent as typed: spaces may be part of them.
  emit('submit', {
    name: event.data.name ?? '',
    email: event.data.email.trim(),
    password: event.data.password,
  });
}
</script>

<template>
  <UAuthForm
    :validate-on="FORM_VALIDATE_ON"
    :schema="isRegister ? registerSchema : loginSchema"
    :fields="fields"
    :title="isRegister ? 'Create your account' : 'Welcome back'"
    :description="
      isRegister
        ? 'Start tracking your orders in a minute.'
        : 'Sign in to your Seller Hub account.'
    "
    :submit="{
      label: isRegister ? 'Create account' : 'Sign in',
      block: true,
    }"
    :loading="loading"
    :ui="{ header: 'text-left', title: 'text-2xl', leading: 'hidden' }"
    @submit="onSubmit"
  >
    <!-- The page's heading (UAuthForm renders the title in a <div>). -->
    <template #title>
      <h1>{{ isRegister ? 'Create your account' : 'Welcome back' }}</h1>
    </template>
    <template v-if="$slots.validation" #validation>
      <slot name="validation" />
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
  </UAuthForm>
</template>
