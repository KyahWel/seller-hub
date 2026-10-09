<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import type { Product } from '@org/contracts';
import {
  productSchema,
  type ProductFormState,
  type ProductFormValue,
} from '~/utils/schemas';

const props = defineProps<{
  initial?: Product;
  submitLabel?: string;
  loading?: boolean;
}>();
const emit = defineEmits<{ submit: [value: ProductFormValue]; cancel: [] }>();

const state = reactive<ProductFormState>({
  name: props.initial?.name ?? '',
  sku: props.initial?.sku ?? '',
  price: props.initial ? String(toPesos(props.initial.price)) : '',
  cost:
    props.initial?.cost === undefined
      ? ''
      : String(toPesos(props.initial.cost)),
  stock: String(props.initial?.stock ?? 0),
});

// Live preview of the margin once price and cost are valid.
const margin = computed(() => {
  const price = Number(state.price);
  const cost = Number(state.cost);
  if (!state.price || !state.cost || !(price > 0) || Number.isNaN(cost)) {
    return null;
  }
  return Math.round(((price - cost) / price) * 100);
});

function onSubmit(event: FormSubmitEvent<ProductFormValue>) {
  emit('submit', event.data);
}
</script>

<template>
  <UForm
    :schema="productSchema"
    :validate-on="FORM_VALIDATE_ON"
    :state="state"
    class="space-y-5"
    @submit="onSubmit"
  >
    <UFormField label="Product name" name="name" required>
      <UInput
        v-model="state.name"
        placeholder="e.g. Oversized cotton tee"
        class="w-full"
      />
    </UFormField>

    <UFormField label="SKU" name="sku" hint="Optional">
      <UInput v-model="state.sku" placeholder="TEE-BLK-L" class="w-full" />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Price" name="price" required>
        <MoneyInput v-model="state.price" class="w-full" />
      </UFormField>
      <UFormField label="Cost" name="cost" hint="Optional">
        <MoneyInput v-model="state.cost" class="w-full" />
      </UFormField>
    </div>

    <UFormField
      label="Stock"
      name="stock"
      :help="margin === null ? undefined : `${margin}% margin per sale`"
    >
      <UInput
        v-model="state.stock"
        inputmode="numeric"
        autocomplete="off"
        class="w-full"
      />
    </UFormField>

    <div class="flex justify-end gap-2 pt-2">
      <UButton
        v-if="initial"
        label="Cancel"
        color="neutral"
        variant="outline"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        :label="submitLabel ?? 'Add product'"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
