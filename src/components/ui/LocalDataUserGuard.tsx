'use client';

import { useEffect } from 'react';
import { ensureLocalDataMatchesUser } from '@/lib/clearLocalData';

// Runs the account-switch check (see ensureLocalDataMatchesUser) on every app mount.
export default function LocalDataUserGuard() {
  useEffect(() => {
    ensureLocalDataMatchesUser();
  }, []);

  return null;
}
