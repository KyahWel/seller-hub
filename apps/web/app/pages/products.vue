<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui';
import type { Product, UpdateProductPayload } from '@org/contracts';
import type { ProductFormValue } from '~/utils/schemas';

useHead({ title: 'Products' });

const products = useCrud<Product, ProductFormValue, UpdateProductPayload>(
  'products',
  { limit: 100 },
);
const run = useApiAction();
const confirm = useConfirm();

const search = ref('');
const filtered = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return products.items.value;
  return products.items.value.filter((p) =>
    [p.name, p.sku ?? ''].some((text) => text.toLowerCase().includes(query)),
  );
});

// One slideover for both adding and editing.
const editorOpen = ref(false);
const editing = ref<Product | undefined>();
const saving = ref(false);

function openEditor(product?: Product) {
  editing.value = product;
  editorOpen.value = true;
}

async function onSave(value: ProductFormValue) {
  saving.value = true;
  const product = editing.value;
  const ok = product
    ? await run(() => products.update(product.id, value), {
        success: 'Product saved',
        error: 'Could not save the product',
      })
    : await run(() => products.create(value), {
        success: 'Product added',
        error: 'Could not add the product',
      });
  saving.value = false;
  if (ok) editorOpen.value = false;
}

async function onRemove(product: Product) {
  const confirmed = await confirm({
    title: `Delete ${product.name}?`,
    description: 'Past orders keep their item names and prices.',
    confirmLabel: 'Delete',
    danger: true,
  });
  if (!confirmed) return;
  await run(() => products.remove(product.id), {
    success: 'Product deleted',
    error: 'Could not delete the product',
  });
}

function margin(product: Product): number | null {
  if (product.cost === undefined || product.price === 0) return null;
  return Math.round(((product.price - product.cost) / product.price) * 100);
}

function rowActions(product: Product): DropdownMenuItem[] {
  return [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect: () => openEditor(product),
    },
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: () => onRemove(product),
    },
  ];
}

const columns: TableColumn<Product>[] = [
  { accessorKey: 'name', header: 'Product' },
  { accessorKey: 'price', header: 'Price' },
  {
    accessorKey: 'cost',
    header: 'Margin',
    meta: { class: { th: 'hidden sm:table-cell', td: 'hidden sm:table-cell' } },
  },
  { accessorKey: 'stock', header: 'Stock' },
  { id: 'actions' },
];
</script>

<template>
  <PagePanel id="products" title="Products">
    <template #actions>
      <UButton icon="i-lucide-plus" label="Add product" @click="openEditor()" />
    </template>

    <template #toolbar>
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search name or SKU…"
        class="w-full max-w-xs"
      />
      <p class="ml-auto text-sm text-muted">
        {{ filtered.length }} of {{ products.page.value.total }}
      </p>
    </template>

    <UAlert
      v-if="products.error.value"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not load products"
      description="Check that the API is running, then refresh."
    />

    <UTable
      v-else
      :data="filtered"
      :columns="columns"
      :loading="products.status.value === 'pending'"
    >
      <template #name-cell="{ row }">
        <p class="font-medium text-highlighted">{{ row.original.name }}</p>
        <p v-if="row.original.sku" class="text-xs text-muted">
          {{ row.original.sku }}
        </p>
      </template>
      <template #price-cell="{ row }">
        <span class="tabular-nums">{{ formatPeso(row.original.price) }}</span>
      </template>
      <template #cost-cell="{ row }">
        <span v-if="margin(row.original) !== null" class="text-muted">
          {{ margin(row.original) }}%
        </span>
        <span v-else class="text-dimmed">—</span>
      </template>
      <template #stock-cell="{ row }">
        <UBadge
          v-if="row.original.stock <= 3"
          :color="row.original.stock === 0 ? 'error' : 'warning'"
          variant="subtle"
          :label="
            row.original.stock === 0 ? 'Sold out' : `${row.original.stock} left`
          "
        />
        <span v-else class="tabular-nums">{{ row.original.stock }}</span>
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
          title="No matching products"
          :description="`Nothing matches “${search}”.`"
        />
        <EmptyState
          v-else
          icon="i-lucide-package"
          title="No products yet"
          description="Add what you sell so orders fill in names and prices for you."
        >
          <UButton
            icon="i-lucide-plus"
            label="Add product"
            @click="openEditor()"
          />
        </EmptyState>
      </template>
    </UTable>

    <USlideover
      v-model:open="editorOpen"
      :title="editing ? 'Edit product' : 'Add product'"
      :description="editing ? editing.name : 'Prices are in pesos.'"
    >
      <template #body>
        <ProductForm
          :key="editing?.id ?? 'new'"
          :initial="editing"
          :submit-label="editing ? 'Save changes' : 'Add product'"
          :loading="saving"
          @submit="onSave"
          @cancel="editorOpen = false"
        />
      </template>
    </USlideover>
  </PagePanel>
</template>
