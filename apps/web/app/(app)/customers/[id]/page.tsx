import { CustomersWorkspace } from '../../../../components/customers-workspace';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  return <CustomersWorkspace selectedCustomerId={id} />;
}
