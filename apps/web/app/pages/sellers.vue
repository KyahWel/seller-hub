<script setup lang="ts">
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from '@org/contracts';

useHead({ title: 'Sellers' });

const { sellerId, select } = useActiveSeller();
const sellers = useCrud<User, CreateUserPayload, UpdateUserPayload>('users');
const submitError = ref<string | null>(null);

async function onSubmit(payload: CreateUserPayload) {
  submitError.value = null;
  try {
    const seller = await sellers.create(payload);
    if (!sellerId.value) select(seller.id);
  } catch (error) {
    submitError.value = apiErrorMessage(
      error,
      'Could not create the seller. Is the API running?',
    );
  }
}
</script>

<template>
  <section class="page">
    <h1>Sellers</h1>
    <p class="lead">Pick the seller to manage. Login replaces this later.</p>

    <UserForm @submit="onSubmit" />
    <p v-if="submitError" class="error" role="alert">{{ submitError }}</p>

    <p v-if="sellers.status.value === 'pending'">Loading…</p>
    <p v-else-if="sellers.error.value" class="error" role="alert">
      Could not reach the API. Start the backend with
      <code>npm run start:api</code>.
    </p>
    <p v-else-if="sellers.items.value.length === 0" class="muted">
      No sellers yet. Add one to get started.
    </p>
    <ul v-else class="list">
      <li v-for="user in sellers.items.value" :key="user.id" class="seller">
        <UserCard :user="user" />
        <span v-if="user.id === sellerId" class="current">Active</span>
        <button
          v-else
          type="button"
          class="btn btn-secondary btn-sm"
          @click="select(user.id)"
        >
          Use this seller
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.seller {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.seller > :first-child {
  flex: 1;
}

.current {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
