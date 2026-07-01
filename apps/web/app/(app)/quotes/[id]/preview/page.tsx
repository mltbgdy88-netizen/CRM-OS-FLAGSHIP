import { QuotePdfPreviewView } from '../../../../../components/quote-pdf-preview-view';

interface QuotePdfPreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotePdfPreviewPage({ params }: QuotePdfPreviewPageProps) {
  const { id } = await params;
  return <QuotePdfPreviewView quoteId={id} />;
}
