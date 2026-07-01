'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { OpportunityDetailView } from './opportunity-detail-view';
import { OpportunityListView } from './opportunity-list-view';
import { SlideOver } from './slide-over';

interface OpportunitiesWorkspaceProps {
  selectedOpportunityId?: string | null;
}

export function OpportunitiesWorkspace({
  selectedOpportunityId = null,
}: OpportunitiesWorkspaceProps) {
  const router = useRouter();
  const [detailTitle, setDetailTitle] = useState<string | undefined>();

  const openOpportunity = useCallback(
    (id: string) => {
      router.push(`/opportunities/${id}`, { scroll: false });
    },
    [router],
  );

  const closeOpportunity = useCallback(() => {
    router.push('/opportunities', { scroll: false });
  }, [router]);

  return (
    <>
      <OpportunityListView
        onSelectOpportunity={openOpportunity}
        selectedOpportunityId={selectedOpportunityId}
      />

      <SlideOver
        open={Boolean(selectedOpportunityId)}
        title={detailTitle ?? 'Fırsat Detayı'}
        onClose={closeOpportunity}
        testId="opportunity-slide-over"
      >
        {selectedOpportunityId ? (
          <OpportunityDetailView
            opportunityId={selectedOpportunityId}
            onClose={closeOpportunity}
            onLoaded={(opportunity) => setDetailTitle(opportunity.title)}
          />
        ) : null}
      </SlideOver>
    </>
  );
}
