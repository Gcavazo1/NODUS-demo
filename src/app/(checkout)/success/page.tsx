export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import SuccessContent from './success-content';

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-2xl py-12 px-4 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
} 