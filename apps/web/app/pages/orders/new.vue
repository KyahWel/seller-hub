<script setup lang="ts">
import type {
  Buyer,
  CreateBuyerPayload,
  CreateProductPayload,
  Order,
  Product,
  UpdateBuyerPayload,
  UpdateProductPayload,
} from '@org/contracts';
import type { OrderFormValue } from '~/components/OrderForm.vue';

useHead({ title: 'New order' });

const all = { limit: 100 };
const products = useCrud<Product, CreateProductPayload, UpdateProductPayload>(
  'products',
  all,
);
const buyers = useCrud<Buyer, CreateBuyerPayload, UpdateBuyerPayload>(
  'buyers',
  all,
);

const submitError = ref<string | null>(null);

async function onSubmit(value: OrderFormValue) {
  submitError.value = null;
  try {
    const order = await $fetch<Order>('/api/orders', {
      method: 'POST',
      body: value,
    });
    await navigateTo(`/orders/${order.id}`);
  } catch (error) {
    submitError.value = apiErrorMessage(error, 'Could not save the order.');
  }
}
</script>

<template>
  <section class="page">
    <div class="page-header">
      <h1>New order</h1>
      <NuxtLink to="/orders" class="muted">Back to orders</NuxtLink>
    </div>
    <OrderForm
      :products="products.items.value"
      :buyers="buyers.items.value"
      @submit="onSubmit"
    />
    <p v-if="submitError" class="error" role="alert">{{ submitError }}</p>
  </section>
</template>
