<script setup lang="ts">
import type { Product, UpdateProductPayload } from '@org/contracts';

/** What the form produces. Amounts are integer centavos. */
export type ProductFormValue = Required<
  Pick<UpdateProductPayload, 'name' | 'price' | 'stock'>
> &
  Pick<UpdateProductPayload, 'sku' | 'cost'>;

const props = defineProps<{ initial?: Product; submitLabel?: string }>();
const emit = defineEmits<{
  submit: [value: ProductFormValue];
  cancel: [];
}>();

const name = ref(props.initial?.name ?? '');
const sku = ref(props.initial?.sku ?? '');
const price = ref<number | null>(
  props.initial ? toPesos(props.initial.price) : null,
);
const cost = ref<number | null>(
  props.initial?.cost === undefined ? null : toPesos(props.initial.cost),
);
const stock = ref<number>(props.initial?.stock ?? 0);

const canSubmit = computed(
  () =>
    name.value.trim().length > 0 && price.value !== null && price.value >= 0,
);

function onSubmit() {
  if (!canSubmit.value || price.value === null) return;
  emit('submit', {
    name: name.value.trim(),
    sku: sku.value.trim() || undefined,
    price: toCentavos(price.value),
    cost: cost.value === null ? undefined : toCentavos(cost.value),
    stock: Math.max(0, Math.floor(stock.value)),
  });
  if (!props.initial) {
    name.value = '';
    sku.value = '';
    price.value = null;
    cost.value = null;
    stock.value = 0;
  }
}
</script>

<template>
  <form class="form" @submit.prevent="onSubmit">
    <div class="form-row">
      <label class="field">
        Name
        <input v-model="name" name="name" required />
      </label>
      <label class="field">
        SKU <span class="muted">(optional)</span>
        <input v-model="sku" name="sku" />
      </label>
    </div>
    <div class="form-row">
      <label class="field">
        Price (₱)
        <input
          v-model.number="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          required
        />
      </label>
      <label class="field">
        Cost (₱) <span class="muted">(optional)</span>
        <input
          v-model.number="cost"
          name="cost"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
        />
      </label>
      <label class="field">
        Stock
        <input
          v-model.number="stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          inputmode="numeric"
        />
      </label>
    </div>
    <div class="form-row">
      <button type="submit" class="btn" :disabled="!canSubmit">
        {{ submitLabel ?? 'Add product' }}
      </button>
      <button
        v-if="initial"
        type="button"
        class="btn btn-secondary"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
