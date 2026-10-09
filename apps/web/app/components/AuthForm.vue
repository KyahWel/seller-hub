<script setup lang="ts">
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  type RegisterPayload,
} from '@org/contracts';

/** Sign-in asks for email and password; sign-up also asks for a name. */
const props = defineProps<{ mode: 'login' | 'register'; pending?: boolean }>();
const emit = defineEmits<{ submit: [payload: RegisterPayload] }>();

const isRegister = computed(() => props.mode === 'register');
const name = ref('');
const email = ref('');
const password = ref('');

const canSubmit = computed(
  () =>
    !props.pending &&
    email.value.includes('@') &&
    (isRegister.value
      ? name.value.trim().length > 0 &&
        password.value.length >= PASSWORD_MIN_LENGTH
      : password.value.length > 0),
);

function onSubmit() {
  if (!canSubmit.value) return;
  // Passwords are sent as typed: spaces may be part of them.
  emit('submit', {
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
  });
}
</script>

<template>
  <form class="form" @submit.prevent="onSubmit">
    <label v-if="isRegister" class="field">
      Store or seller name
      <input v-model="name" name="name" required autocomplete="name" />
    </label>
    <label class="field">
      Email
      <input
        v-model="email"
        name="email"
        type="email"
        required
        autocomplete="email"
      />
    </label>
    <label class="field">
      Password
      <input
        v-model="password"
        name="password"
        type="password"
        required
        :minlength="isRegister ? PASSWORD_MIN_LENGTH : undefined"
        :maxlength="PASSWORD_MAX_LENGTH"
        :autocomplete="isRegister ? 'new-password' : 'current-password'"
      />
      <span v-if="isRegister" class="muted">
        At least {{ PASSWORD_MIN_LENGTH }} characters.
      </span>
    </label>
    <button type="submit" class="btn" :disabled="!canSubmit">
      {{ isRegister ? 'Create account' : 'Sign in' }}
    </button>
  </form>
</template>
