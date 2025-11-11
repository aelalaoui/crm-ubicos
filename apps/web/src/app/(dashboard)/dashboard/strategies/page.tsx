'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardStrategiesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/strategies');
  }, [router]);

  return null;
}
