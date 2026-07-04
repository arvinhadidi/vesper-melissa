import LegalPage from '@/components/legal/LegalPage';
import { TERMS_MD } from '@/lib/legal/content';

export const metadata = {
  title: 'Terms of Service — Vesper',
};

export default function TermsOfServicePage() {
  return <LegalPage markdown={TERMS_MD} />;
}
