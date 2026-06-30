'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { CustomerCreateForm } from './customer-create-form';
import { CustomerDetailView } from './customer-detail';
import { CustomerListView } from './customer-list';
import { GlassModal } from './glass-modal';
import { SlideOver } from './slide-over';

interface CustomersWorkspaceProps {
  selectedCustomerId?: string | null;
}

/** Bitrix24 pattern: list stays mounted; detail slides in from the right. */
export function CustomersWorkspace({ selectedCustomerId = null }: CustomersWorkspaceProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState<string | undefined>();

  const openCustomer = useCallback(
    (id: string) => {
      router.push(`/customers/${id}`, { scroll: false });
    },
    [router],
  );

  const closeCustomer = useCallback(() => {
    router.push('/customers', { scroll: false });
  }, [router]);

  const handleCreated = useCallback(
    (customerId: string) => {
      setCreateOpen(false);
      openCustomer(customerId);
    },
    [openCustomer],
  );

  return (
    <>
      <CustomerListView
        onSelectCustomer={openCustomer}
        onOpenCreate={() => setCreateOpen(true)}
        selectedCustomerId={selectedCustomerId}
      />

      <SlideOver
        open={Boolean(selectedCustomerId)}
        title={detailTitle ?? 'Customer'}
        onClose={closeCustomer}
        testId="customer-slide-over"
      >
        {selectedCustomerId ? (
          <CustomerDetailView
            customerId={selectedCustomerId}
            variant="slide-over"
            onClose={closeCustomer}
            onLoaded={(customer) => setDetailTitle(customer.displayName)}
          />
        ) : null}
      </SlideOver>

      <GlassModal
        open={createOpen}
        title="New customer"
        onClose={() => setCreateOpen(false)}
        testId="customer-create-modal"
      >
        <CustomerCreateForm
          variant="modal"
          onCancel={() => setCreateOpen(false)}
          onSuccess={handleCreated}
        />
      </GlassModal>
    </>
  );
}
