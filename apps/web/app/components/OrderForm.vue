<script setup lang="ts">
import type { FormSubmitEvent, SelectItem } from '@nuxt/ui';
import {
  PAYMENT_METHODS,
  SALES_CHANNELS,
  type Buyer,
  type Product,
} from '@org/contracts';
import {
  orderSchema,
  type OrderFormState,
  type OrderFormValue,
  type OrderItemFormState,
} from '~/utils/schemas';

const props = defineProps<{
  products: Product[];
  buyers: Buyer[];
  loading?: boolean;
}>();
const emit = defineEmits<{ submit: [value: OrderFormValue] }>();

const state = reactive<OrderFormState>({
  channel: 'facebook',
  paymentMethod: 'cod',
  buyerId: undefined,
  items: [emptyItem()],
  shippingFee: '',
  notes: '',
});

function emptyItem(): OrderItemFormState {
  return { productId: '', name: '', quantity: '1', unitPrice: '' };
}

const channelItems: SelectItem[] = SALES_CHANNELS.map((value) => ({
  value,
  label: CHANNEL_LABELS[value],
  icon: CHANNEL_ICONS[value],
}));
const paymentItems: SelectItem[] = PAYMENT_METHODS.map((value) => ({
  value,
  label: PAYMENT_LABELS[value],
}));
const buyerItems = computed(() =>
  props.buyers.map((b) => ({
    value: b.id,
    label: b.name,
    description: b.phone,
  })),
);
const productItems = computed(() =>
  props.products.map((p) => ({
    id: p.id,
    label: p.name,
    description: `${formatPeso(p.price)} · ${p.stock} in stock`,
    disabled: p.stock === 0,
  })),
);

/** Adds a product as a new line, or fills the blank first line. */
function addProduct(product: Product) {
  const item: OrderItemFormState = {
    productId: product.id,
    name: product.name,
    quantity: '1',
    unitPrice: String(toPesos(product.price)),
  };
  const [first] = state.items;
  if (state.items.length === 1 && first && !first.name && !first.unitPrice) {
    state.items[0] = item;
  } else {
    state.items.push(item);
  }
}

// The picker only adds lines; it resets after each pick.
const picked = ref<string>();
watch(picked, async (id) => {
  if (!id) return;
  const product = props.products.find((p) => p.id === id);
  if (product) addProduct(product);
  await nextTick();
  picked.value = undefined;
});

function removeItem(index: number) {
  state.items.splice(index, 1);
  if (state.items.length === 0) state.items.push(emptyItem());
}

/** Centavos for a line while typing; 0 until the inputs are valid. */
function lineTotal(item: OrderItemFormState): number {
  const quantity = Number(item.quantity);
  const price = Number(item.unitPrice);
  if (!Number.isInteger(quantity) || Number.isNaN(price)) return 0;
  return quantity * toCentavos(price);
}

const subtotal = computed(() =>
  state.items.reduce((sum, item) => sum + lineTotal(item), 0),
);
const shipping = computed(() => toCentavos(Number(state.shippingFee) || 0));
const total = computed(() => subtotal.value + shipping.value);

function onSubmit(event: FormSubmitEvent<OrderFormValue>) {
  emit('submit', event.data);
}

defineExpose({ addProduct });
</script>

<template>
  <UForm
    :schema="orderSchema"
    :validate-on="FORM_VALIDATE_ON"
    :state="state"
    class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
    @submit="onSubmit"
  >
    <div class="space-y-6">
      <UCard>
        <template #header>
          <h2 class="font-semibold text-highlighted">Details</h2>
        </template>
        <div class="grid gap-4 sm:grid-cols-3">
          <UFormField label="Channel" name="channel">
            <USelect
              v-model="state.channel"
              :items="channelItems"
              :icon="CHANNEL_ICONS[state.channel]"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Payment" name="paymentMethod">
            <USelect
              v-model="state.paymentMethod"
              :items="paymentItems"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Buyer" name="buyerId">
            <USelectMenu
              v-model="state.buyerId"
              :items="buyerItems"
              value-key="value"
              placeholder="No buyer"
              :search-input="{ placeholder: 'Search buyers…' }"
              clear
              class="w-full"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-semibold text-highlighted">Items</h2>
            <USelectMenu
              v-if="products.length"
              v-model="picked"
              :items="productItems"
              value-key="id"
              placeholder="Add a product"
              icon="i-lucide-search"
              :search-input="{ placeholder: 'Search products…' }"
              class="w-56"
            />
          </div>
        </template>

        <ul class="divide-y divide-default">
          <li
            v-for="(item, index) in state.items"
            :key="index"
            class="grid grid-cols-[1fr_auto] items-start gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_5rem_8rem_6rem_auto] sm:px-6"
          >
            <UFormField
              :name="`items.${index}.name`"
              :label="index === 0 ? 'Item' : undefined"
              class="col-span-2 sm:col-span-1"
            >
              <UInput
                v-model="item.name"
                placeholder="Item name"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :name="`items.${index}.quantity`"
              :label="index === 0 ? 'Qty' : undefined"
            >
              <UInput
                v-model="item.quantity"
                inputmode="numeric"
                autocomplete="off"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :name="`items.${index}.unitPrice`"
              :label="index === 0 ? 'Unit price' : undefined"
            >
              <MoneyInput v-model="item.unitPrice" class="w-full" />
            </UFormField>
            <p
              class="hidden pt-1.5 text-right text-sm font-medium text-highlighted tabular-nums sm:block"
              :class="index === 0 && 'sm:pt-8'"
            >
              {{ formatPeso(lineTotal(item)) }}
            </p>
            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              :aria-label="`Remove item ${index + 1}`"
              :class="index === 0 && 'sm:mt-6'"
              @click="removeItem(index)"
            />
          </li>
        </ul>

        <template #footer>
          <UButton
            label="Add custom item"
            icon="i-lucide-plus"
            color="neutral"
            variant="soft"
            size="sm"
            @click="state.items.push(emptyItem())"
          />
        </template>
      </UCard>

      <UCard>
        <UFormField label="Notes" name="notes" hint="Optional">
          <UTextarea
            v-model="state.notes"
            :rows="2"
            autoresize
            placeholder="Anything to remember about this order"
            class="w-full"
          />
        </UFormField>
      </UCard>
    </div>

    <aside class="lg:sticky lg:top-0 lg:self-start">
      <UCard>
        <template #header>
          <h2 class="font-semibold text-highlighted">Summary</h2>
        </template>
        <div class="space-y-4">
          <UFormField label="Shipping fee" name="shippingFee">
            <MoneyInput v-model="state.shippingFee" class="w-full" />
          </UFormField>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd class="tabular-nums">{{ formatPeso(subtotal) }}</dd>
            </div>
            <div class="flex justify-between text-muted">
              <dt>Shipping</dt>
              <dd class="tabular-nums">{{ formatPeso(shipping) }}</dd>
            </div>
            <USeparator />
            <div
              class="flex justify-between text-base font-semibold text-highlighted"
            >
              <dt>Total</dt>
              <dd class="tabular-nums" data-testid="order-total">
                {{ formatPeso(total) }}
              </dd>
            </div>
          </dl>
        </div>
        <template #footer>
          <UButton
            type="submit"
            label="Save order"
            icon="i-lucide-check"
            block
            size="lg"
            :loading="loading"
          />
        </template>
      </UCard>
    </aside>
  </UForm>
</template>
