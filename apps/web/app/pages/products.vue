<script setup lang="ts">
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '@org/contracts';
import type { ProductFormValue } from '~/components/ProductForm.vue';

definePageMeta({ middleware: 'seller' });
useHead({ title: 'Products' });

const { sellerId } = useActiveSeller();
const products = useCrud<Product, CreateProductPayload, UpdateProductPayload>(
  'products',
  () => ({ sellerId: sellerId.value ?? undefined, limit: 100 }),
);
const editingId = ref<string | null>(null);
const actionError = ref<string | null>(null);

async function run(action: () => Promise<unknown>, fallback: string) {
  actionError.value = null;
  try {
    await action();
    return true;
  } catch (error) {
    actionError.value = apiErrorMessage(error, fallback);
    return false;
  }
}

function onCreate(value: ProductFormValue) {
  if (!sellerId.value) return;
  const seller = sellerId.value;
  run(
    () => products.create({ ...value, sellerId: seller }),
    'Could not add the product.',
  );
}

async function onUpdate(id: string, value: ProductFormValue) {
  const ok = await run(
    () => products.update(id, value),
    'Could not save the product.',
  );
  if (ok) editingId.value = null;
}

function onRemove(product: Product) {
  if (!confirm(`Delete ${product.name}?`)) return;
  run(() => products.remove(product.id), 'Could not delete the product.');
}

function margin(product: Product): string | null {
  if (product.cost === undefined || product.price === 0) return null;
  const percent = ((product.price - product.cost) / product.price) * 100;
  return `${percent.toFixed(0)}% margin`;
}
</script>

<template>
  <section class="page">
    <h1>Products</h1>

    <div class="card">
      <ProductForm @submit="onCreate" />
    </div>
    <p v-if="actionError" class="error" role="alert">{{ actionError }}</p>

    <p v-if="products.status.value === 'pending'">Loading…</p>
    <p v-else-if="products.error.value" class="error" role="alert">
      Could not load products. Is the API running?
    </p>
    <p v-else-if="products.items.value.length === 0" class="muted">
      No products yet.
    </p>
    <ul v-else class="list">
      <li
        v-for="product in products.items.value"
        :key="product.id"
        class="card"
      >
        <ProductForm
          v-if="editingId === product.id"
          :initial="product"
          submit-label="Save"
          @submit="(value) => onUpdate(product.id, value)"
          @cancel="editingId = null"
        />
        <div v-else class="product">
          <div>
            <h3>
              {{ product.name }}
              <span v-if="product.sku" class="muted">· {{ product.sku }}</span>
            </h3>
            <p class="muted">
              {{ formatPeso(product.price) }}
              <template v-if="margin(product)">
                · {{ margin(product) }}</template
              >
              ·
              <span :class="{ error: product.stock === 0 }">
                {{ product.stock }} in stock
              </span>
            </p>
          </div>
          <div class="actions">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              @click="editingId = product.id"
            >
              Edit
            </button>
            <button
              type="button"
              class="btn btn-danger btn-sm"
              @click="onRemove(product)"
            >
              Delete
            </button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.product {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

h3 {
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.5rem;
}
</style>
