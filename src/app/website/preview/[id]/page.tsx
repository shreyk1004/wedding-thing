import { PreviewPageClient } from './PreviewPageClient';

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <PreviewPageClient weddingId={id} />;
} 