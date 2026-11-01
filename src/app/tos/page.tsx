import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { TERMS_MD } from '@/lib/legal/content';

export const metadata: Metadata = {
  title: 'Terms of Service',
  alternates: { canonical: '/tos' },
};

export default function TermsOfServicePage() {
  return <LegalPage markdown={TERMS_MD} />;
}
