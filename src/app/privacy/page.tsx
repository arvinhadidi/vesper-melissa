import LegalPage from '@/components/legal/LegalPage';
import { PRIVACY_MD } from '@/lib/legal/content';

export const metadata = {
  title: 'Privacy Policy — Vesper',
};

export default function PrivacyPolicyPage() {
  return <LegalPage markdown={PRIVACY_MD} />;
}
