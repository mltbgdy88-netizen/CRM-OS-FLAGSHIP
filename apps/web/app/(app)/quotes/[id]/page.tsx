import { QuoteBuilderView } from '../../../../components/quote-builder-view';

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = await params;
  return <QuoteBuilderView quoteId={id} />;
}
