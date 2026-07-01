'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { getMockLead } from '../lib/mock/leads-mock';
import { LeadDetailView } from './lead-detail-view';
import { LeadListView } from './lead-list-view';
import { SlideOver } from './slide-over';

interface LeadsWorkspaceProps {
  selectedLeadId?: string | null;
}

export function LeadsWorkspace({ selectedLeadId = null }: LeadsWorkspaceProps) {
  const router = useRouter();
  const [detailTitle, setDetailTitle] = useState<string | undefined>();

  const openLead = useCallback(
    (id: string) => {
      const lead = getMockLead(id);
      setDetailTitle(lead?.displayName);
      router.push(`/leads/${id}`, { scroll: false });
    },
    [router],
  );

  const closeLead = useCallback(() => {
    router.push('/leads', { scroll: false });
  }, [router]);

  return (
    <>
      <LeadListView onSelectLead={openLead} selectedLeadId={selectedLeadId} />

      <SlideOver
        open={Boolean(selectedLeadId)}
        title={detailTitle ?? 'Lead Detayı'}
        onClose={closeLead}
        testId="lead-slide-over"
      >
        {selectedLeadId ? (
          <LeadDetailView leadId={selectedLeadId} onClose={closeLead} />
        ) : null}
      </SlideOver>
    </>
  );
}
