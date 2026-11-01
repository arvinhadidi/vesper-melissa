import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { PRIVACY_MD } from '@/lib/legal/content';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPolicyPage() {
  return <LegalPage markdown={PRIVACY_MD} />;
}
