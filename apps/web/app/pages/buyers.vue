<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui';
import type { Buyer, UpdateBuyerPayload } from '@org/contracts';
import type { BuyerFormValue } from '~/utils/schemas';

useHead({ title: 'Buyers' });

const buyers = useCrud<Buyer, BuyerFormValue, UpdateBuyerPayload>('buyers', {
  limit: 100,
});
const run = useApiAction();
const confirm = useConfirm();

const search = ref('');
const filtered = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return buyers.items.value;
  return buyers.items.value.filter((b) =>
    [b.name, b.phone].some((text) => text.toLowerCase().includes(query)),
  );
});

const editorOpen = ref(false);
const editing = ref<Buyer | undefined>();
const saving = ref(false);

function openEditor(buyer?: Buyer) {
  editing.value = buyer;
  editorOpen.value = true;
}

async function onSave(value: BuyerFormValue) {
  saving.value = true;
  const buyer = editing.value;
  const ok = buyer
    ? await run(() => buyers.update(buyer.id, value), {
        success: 'Buyer saved',
        error: 'Could not save the buyer',
      })
    : await run(() => buyers.create(value), {
        success: 'Buyer added',
        error: 'Could not add the buyer',
      });
  saving.value = false;
  if (ok) editorOpen.value = false;
}

async function onRemove(buyer: Buyer) {
  const confirmed = await confirm({
    title: `Delete ${buyer.name}?`,
    description: 'Their past orders are kept.',
    confirmLabel: 'Delete',
    danger: true,
  });
  if (!confirmed) return;
  await run(() => buyers.remove(buyer.id), {
    success: 'Buyer deleted',
    error: 'Could not delete the buyer',
  });
}

function rowActions(buyer: Buyer): DropdownMenuItem[] {
  return [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect: () => openEditor(buyer),
    },
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: () => onRemove(buyer),
    },
  ];
}

const columns: TableColumn<Buyer>[] = [
  { accessorKey: 'name', header: 'Buyer' },
  {
    accessorKey: 'phone',
    header: 'Mobile',
    meta: { class: { th: 'hidden sm:table-cell', td: 'hidden sm:table-cell' } },
  },
  {
    accessorKey: 'address',
    header: 'Address',
    meta: { class: { th: 'hidden md:table-cell', td: 'hidden md:table-cell' } },
  },
  { id: 'actions' },
];
</script>

<template>
  <PagePanel id="buyers" title="Buyers">
    <template #actions>
      <UButton icon="i-lucide-plus" label="Add buyer" @click="openEditor()" />
    </template>

    <template #toolbar>
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search name or mobile…"
        class="w-full max-w-xs"
      />
      <p class="ml-auto text-sm text-muted">
        {{ filtered.length }} of {{ buyers.page.value.total }}
      </p>
    </template>

    <UAlert
      v-if="buyers.error.value"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not load buyers"
      description="Check that the API is running, then refresh."
    />

    <UTable
      v-else
      :data="filtered"
      :columns="columns"
      :loading="buyers.status.value === 'pending'"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar :alt="row.original.name" size="sm" />
          <div class="min-w-0">
            <p class="font-medium text-highlighted">{{ row.original.name }}</p>
            <p class="text-xs text-muted tabular-nums sm:hidden">
              {{ row.original.phone }}
            </p>
            <p
              v-if="row.original.notes"
              class="max-w-xs truncate text-xs text-muted"
            >
              {{ row.original.notes }}
            </p>
          </div>
        </div>
      </template>
      <template #phone-cell="{ row }">
        <a
          :href="`tel:${row.original.phone}`"
          class="tabular-nums hover:underline"
        >
          {{ row.original.phone }}
        </a>
      </template>
      <template #address-cell="{ row }">
        <span
          v-if="row.original.address"
          class="block max-w-xs truncate text-muted"
        >
          {{ row.original.address }}
        </span>
        <span v-else class="text-dimmed">—</span>
      </template>
      <template #actions-cell="{ row }">
        <div class="text-right">
          <UDropdownMenu
            :items="rowActions(row.original)"
            :content="{ align: 'end' }"
          >
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              :aria-label="`Actions for ${row.original.name}`"
            />
          </UDropdownMenu>
        </div>
      </template>
      <template #empty>
        <EmptyState
          v-if="search"
          icon="i-lucide-search-x"
          title="No matching buyers"
          :description="`Nothing matches “${search}”.`"
        />
        <EmptyState
          v-else
          icon="i-lucide-users"
          title="No buyers yet"
          description="Save buyers to reuse their details and spot repeat customers."
        >
          <UButton
            icon="i-lucide-plus"
            label="Add buyer"
            @click="openEditor()"
          />
        </EmptyState>
      </template>
    </UTable>

    <USlideover
      v-model:open="editorOpen"
      :title="editing ? 'Edit buyer' : 'Add buyer'"
      :description="
        editing ? editing.name : 'Saved buyers can be picked on new orders.'
      "
    >
      <template #body>
        <BuyerForm
          :key="editing?.id ?? 'new'"
          :initial="editing"
          :submit-label="editing ? 'Save changes' : 'Add buyer'"
          :loading="saving"
          @submit="onSave"
          @cancel="editorOpen = false"
        />
      </template>
    </USlideover>
  </PagePanel>
</template>
