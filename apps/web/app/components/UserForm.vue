<script setup lang="ts">
import type { CreateUserPayload } from '@org/contracts';

const emit = defineEmits<{ submit: [payload: CreateUserPayload] }>();

const name = ref('');
const email = ref('');
const canSubmit = computed(
  () => name.value.trim().length > 0 && email.value.includes('@'),
);

function onSubmit() {
  if (!canSubmit.value) return;
  emit('submit', { name: name.value.trim(), email: email.value.trim() });
  name.value = '';
  email.value = '';
}
</script>

<template>
  <form class="form-row user-form" @submit.prevent="onSubmit">
    <label class="field">
      Name
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
    <button type="submit" class="btn" :disabled="!canSubmit">Add seller</button>
  </form>
</template>

<style scoped>
.user-form {
  align-items: end;
}
</style>
