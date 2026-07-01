import { OpportunitiesWorkspace } from '../../../../components/opportunities-workspace';

interface OpportunityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  const { id } = await params;
  return <OpportunitiesWorkspace selectedOpportunityId={id} />;
}
