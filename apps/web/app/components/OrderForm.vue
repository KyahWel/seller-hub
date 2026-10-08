<script setup lang="ts">
import {
  PAYMENT_METHODS,
  SALES_CHANNELS,
  type Buyer,
  type CreateOrderPayload,
  type PaymentMethod,
  type Product,
  type SalesChannel,
} from '@org/contracts';

/** The order without `sellerId`, which the page adds. Amounts are centavos. */
export type OrderFormValue = Omit<CreateOrderPayload, 'sellerId'>;

interface ItemRow {
  productId: string;
  name: string;
  quantity: number;
  /** Pesos, as typed. */
  unitPrice: number | null;
}

const props = defineProps<{ products: Product[]; buyers: Buyer[] }>();
const emit = defineEmits<{ submit: [value: OrderFormValue] }>();

const channel = ref<SalesChannel>('facebook');
const paymentMethod = ref<PaymentMethod>('cod');
const buyerId = ref('');
const shippingFee = ref<number | null>(null);
const notes = ref('');
const items = ref<ItemRow[]>([emptyRow()]);

function emptyRow(): ItemRow {
  return { productId: '', name: '', quantity: 1, unitPrice: null };
}

function onProductSelected(row: ItemRow) {
  const product = props.products.find((p) => p.id === row.productId);
  if (!product) return;
  row.name = product.name;
  row.unitPrice = toPesos(product.price);
}

function removeRow(index: number) {
  items.value.splice(index, 1);
  if (items.value.length === 0) items.value.push(emptyRow());
}

const validItems = computed(() =>
  items.value.filter(
    (row) =>
      row.name.trim() &&
      row.quantity >= 1 &&
      row.unitPrice !== null &&
      row.unitPrice >= 0,
  ),
);

const total = computed(
  () =>
    validItems.value.reduce(
      (sum, row) => sum + row.quantity * toCentavos(row.unitPrice ?? 0),
      0,
    ) + toCentavos(shippingFee.value ?? 0),
);

const canSubmit = computed(
  () =>
    validItems.value.length > 0 &&
    validItems.value.length === items.value.length,
);

function onSubmit() {
  if (!canSubmit.value) return;
  emit('submit', {
    channel: channel.value,
    paymentMethod: paymentMethod.value,
    buyerId: buyerId.value || undefined,
    shippingFee: toCentavos(shippingFee.value ?? 0),
    notes: notes.value.trim() || undefined,
    items: validItems.value.map((row) => ({
      productId: row.productId || undefined,
      name: row.name.trim(),
      quantity: Math.floor(row.quantity),
      unitPrice: toCentavos(row.unitPrice ?? 0),
    })),
  });
}
</script>

<template>
  <form class="form" @submit.prevent="onSubmit">
    <div class="form-row">
      <label class="field">
        Channel
        <select v-model="channel" name="channel">
          <option v-for="c in SALES_CHANNELS" :key="c" :value="c">
            {{ CHANNEL_LABELS[c] }}
          </option>
        </select>
      </label>
      <label class="field">
        Payment
        <select v-model="paymentMethod" name="paymentMethod">
          <option v-for="m in PAYMENT_METHODS" :key="m" :value="m">
            {{ PAYMENT_LABELS[m] }}
          </option>
        </select>
      </label>
      <label class="field">
        Buyer
        <select v-model="buyerId" name="buyerId">
          <option value="">No buyer</option>
          <option v-for="b in buyers" :key="b.id" :value="b.id">
            {{ b.name }} ({{ b.phone }})
          </option>
        </select>
      </label>
    </div>

    <fieldset class="card items">
      <legend>Items</legend>
      <div v-for="(row, index) in items" :key="index" class="form-row item">
        <label v-if="products.length" class="field">
          Product
          <select
            v-model="row.productId"
            :name="`items.${index}.productId`"
            @change="onProductSelected(row)"
          >
            <option value="">Custom item</option>
            <option v-for="p in products" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
        </label>
        <label class="field">
          Name
          <input v-model="row.name" :name="`items.${index}.name`" required />
        </label>
        <label class="field qty">
          Qty
          <input
            v-model.number="row.quantity"
            :name="`items.${index}.quantity`"
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
          />
        </label>
        <label class="field">
          Unit price (₱)
          <input
            v-model.number="row.unitPrice"
            :name="`items.${index}.unitPrice`"
            type="number"
            min="0"
            step="0.01"
            inputmode="decimal"
            required
          />
        </label>
        <button
          type="button"
          class="btn btn-danger btn-sm remove"
          :aria-label="`Remove item ${index + 1}`"
          @click="removeRow(index)"
        >
          Remove
        </button>
      </div>
      <div>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="items.push(emptyRow())"
        >
          Add item
        </button>
      </div>
    </fieldset>

    <div class="form-row">
      <label class="field">
        Shipping fee (₱)
        <input
          v-model.number="shippingFee"
          name="shippingFee"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
        />
      </label>
      <label class="field">
        Notes <span class="muted">(optional)</span>
        <input v-model="notes" name="notes" />
      </label>
    </div>

    <div class="footer">
      <p>
        Total:
        <strong data-testid="order-total">{{ formatPeso(total) }}</strong>
      </p>
      <button type="submit" class="btn" :disabled="!canSubmit">
        Save order
      </button>
    </div>
  </form>
</template>

<style scoped>
.items {
  display: grid;
  gap: 0.75rem;
  margin: 0;
}

legend {
  padding: 0 0.25rem;
  font-weight: 600;
}

.item {
  align-items: end;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.qty {
  flex: 0 1 5rem;
}

.remove {
  align-self: end;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
</style>
