<script setup lang="ts">
import type {
  Buyer,
  CreateBuyerPayload,
  CreateOrderPayload,
  CreateProductPayload,
  Order,
  Product,
  UpdateBuyerPayload,
  UpdateProductPayload,
} from '@org/contracts';
import type { OrderFormValue } from '~/components/OrderForm.vue';

definePageMeta({ middleware: 'seller' });
useHead({ title: 'New order' });

const { sellerId } = useActiveSeller();
const bySeller = () => ({ sellerId: sellerId.value ?? undefined, limit: 100 });
const products = useCrud<Product, CreateProductPayload, UpdateProductPayload>(
  'products',
  bySeller,
);
const buyers = useCrud<Buyer, CreateBuyerPayload, UpdateBuyerPayload>(
  'buyers',
  bySeller,
);

const submitError = ref<string | null>(null);

async function onSubmit(value: OrderFormValue) {
  if (!sellerId.value) return;
  submitError.value = null;
  try {
    const order = await $fetch<Order>('/api/orders', {
      method: 'POST',
      body: { ...value, sellerId: sellerId.value } satisfies CreateOrderPayload,
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
