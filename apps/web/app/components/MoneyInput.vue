<script setup lang="ts">
/**
 * Peso amount field. Holds the text as typed (`"199.50"`); convert with the
 * `pesos` / `optionalPesos` schemas. Other attributes go to `UInput`.
 */
defineOptions({ inheritAttrs: false });
const model = defineModel<string>({ required: true });
</script>

<template>
  <UInput
    v-model="model"
    inputmode="decimal"
    autocomplete="off"
    placeholder="0.00"
    v-bind="$attrs"
    :ui="{ base: 'tabular-nums' }"
  >
    <template #leading>
      <span class="text-sm text-muted">₱</span>
    </template>
  </UInput>
</template>
