<script setup lang="ts">
import type {
  Buyer,
  CreateBuyerPayload,
  UpdateBuyerPayload,
} from '@org/contracts';
import type { BuyerFormValue } from '~/components/BuyerForm.vue';

useHead({ title: 'Buyers' });

const phoneSearch = ref('');
const buyers = useCrud<
  Buyer,
  Omit<CreateBuyerPayload, 'sellerId'>,
  UpdateBuyerPayload
>('buyers', () => ({
  phone: phoneSearch.value.trim() || undefined,
  limit: 100,
}));
const actionError = ref<string | null>(null);

async function onCreate(value: BuyerFormValue) {
  actionError.value = null;
  try {
    await buyers.create(value);
  } catch (error) {
    actionError.value = apiErrorMessage(error, 'Could not add the buyer.');
  }
}

async function onRemove(buyer: Buyer) {
  if (!confirm(`Delete ${buyer.name}?`)) return;
  actionError.value = null;
  try {
    await buyers.remove(buyer.id);
  } catch (error) {
    actionError.value = apiErrorMessage(error, 'Could not delete the buyer.');
  }
}
</script>

<template>
  <section class="page">
    <h1>Buyers</h1>

    <div class="card">
      <BuyerForm @submit="onCreate" />
    </div>
    <p v-if="actionError" class="error" role="alert">{{ actionError }}</p>

    <label class="field search">
      Find by mobile number
      <input
        v-model="phoneSearch"
        type="search"
        inputmode="tel"
        placeholder="09171234567"
      />
    </label>

    <p v-if="buyers.status.value === 'pending'">Loading…</p>
    <p v-else-if="buyers.error.value" class="error" role="alert">
      Could not load buyers. Is the API running?
    </p>
    <p v-else-if="buyers.items.value.length === 0" class="muted">
      {{ phoneSearch ? 'No buyer with that number.' : 'No buyers yet.' }}
    </p>
    <ul v-else class="list">
      <li
        v-for="buyer in buyers.items.value"
        :key="buyer.id"
        class="card buyer"
      >
        <div>
          <h3>{{ buyer.name }}</h3>
          <p class="muted">
            {{ buyer.phone
            }}<template v-if="buyer.address"> · {{ buyer.address }}</template>
          </p>
          <p v-if="buyer.notes" class="notes">{{ buyer.notes }}</p>
        </div>
        <button
          type="button"
          class="btn btn-danger btn-sm"
          @click="onRemove(buyer)"
        >
          Delete
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.search {
  max-width: 20rem;
}

.buyer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

h3 {
  font-weight: 600;
}

.notes {
  font-size: 0.875rem;
}
</style>
