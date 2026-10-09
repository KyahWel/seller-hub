<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import type { Buyer } from '@org/contracts';
import {
  buyerSchema,
  type BuyerFormState,
  type BuyerFormValue,
} from '~/utils/schemas';

const props = defineProps<{
  initial?: Buyer;
  submitLabel?: string;
  loading?: boolean;
}>();
const emit = defineEmits<{ submit: [value: BuyerFormValue]; cancel: [] }>();

const state = reactive<BuyerFormState>({
  name: props.initial?.name ?? '',
  phone: props.initial?.phone ?? '',
  address: props.initial?.address ?? '',
  notes: props.initial?.notes ?? '',
});

function onSubmit(event: FormSubmitEvent<BuyerFormValue>) {
  emit('submit', event.data);
}
</script>

<template>
  <UForm
    :schema="buyerSchema"
    :state="state"
    :validate-on="FORM_VALIDATE_ON"
    class="space-y-5"
    @submit="onSubmit"
  >
    <UFormField label="Name" name="name" required>
      <UInput
        v-model="state.name"
        placeholder="Juan dela Cruz"
        autocomplete="off"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Mobile number" name="phone" required>
      <UInput
        v-model="state.phone"
        type="tel"
        inputmode="tel"
        placeholder="09171234567"
        icon="i-lucide-phone"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Delivery address" name="address" hint="Optional">
      <UTextarea
        v-model="state.address"
        :rows="2"
        autoresize
        placeholder="House no., street, barangay, city"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Notes" name="notes" hint="Optional">
      <UTextarea
        v-model="state.notes"
        :rows="2"
        autoresize
        placeholder="e.g. Prefers delivery after 5pm"
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
        :label="submitLabel ?? 'Add buyer'"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
