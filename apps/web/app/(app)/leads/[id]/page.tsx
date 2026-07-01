import { LeadsWorkspace } from '../../../../components/leads-workspace';

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  return <LeadsWorkspace selectedLeadId={id} />;
}
