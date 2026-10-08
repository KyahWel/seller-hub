<script setup lang="ts">
import type { UpdateBuyerPayload } from '@org/contracts';

export type BuyerFormValue = Required<
  Pick<UpdateBuyerPayload, 'name' | 'phone'>
> &
  Pick<UpdateBuyerPayload, 'address' | 'notes'>;

/** Philippine mobile number, same rule as the gateway. */
const PH_MOBILE = /^(09|\+639)\d{9}$/;

const emit = defineEmits<{ submit: [value: BuyerFormValue] }>();

const name = ref('');
const phone = ref('');
const address = ref('');
const notes = ref('');

const phoneValid = computed(() => PH_MOBILE.test(phone.value.trim()));
const canSubmit = computed(
  () => name.value.trim().length > 0 && phoneValid.value,
);

function onSubmit() {
  if (!canSubmit.value) return;
  emit('submit', {
    name: name.value.trim(),
    phone: phone.value.trim(),
    address: address.value.trim() || undefined,
    notes: notes.value.trim() || undefined,
  });
  name.value = '';
  phone.value = '';
  address.value = '';
  notes.value = '';
}
</script>

<template>
  <form class="form" @submit.prevent="onSubmit">
    <div class="form-row">
      <label class="field">
        Name
        <input v-model="name" name="name" required autocomplete="off" />
      </label>
      <label class="field">
        Mobile number
        <input
          v-model="phone"
          name="phone"
          type="tel"
          inputmode="tel"
          placeholder="09171234567"
          required
        />
        <span v-if="phone && !phoneValid" class="error">
          Use 09XXXXXXXXX or +639XXXXXXXXX
        </span>
      </label>
    </div>
    <label class="field">
      Address <span class="muted">(optional)</span>
      <input v-model="address" name="address" />
    </label>
    <label class="field">
      Notes <span class="muted">(optional)</span>
      <input v-model="notes" name="notes" />
    </label>
    <div>
      <button type="submit" class="btn" :disabled="!canSubmit">
        Add buyer
      </button>
    </div>
  </form>
</template>
