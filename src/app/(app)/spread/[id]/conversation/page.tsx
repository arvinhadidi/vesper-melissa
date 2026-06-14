'use client';

import { useParams } from 'next/navigation';
import MelissaChatPage from '@/components/melissa/MelissaChatPage';

export default function SpreadConversationPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <MelissaChatPage
      sessionKey={id}
      backPath={`/spread/${id}`}
    />
  );
}
