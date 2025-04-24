"use client"; // Mark this component as a Client Component

import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // Import client hooks here
import { useEffect } from 'react'; // Import client hooks here
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const isDemo = searchParams.get('demo') === 'true';

  useEffect(() => {
    if (sessionId) {
      console.log("Stripe Checkout Session ID:", sessionId);
      // Example: fetch(`/api/order-details?session_id=${sessionId}`)
    }
  }, [sessionId]);

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit dark:bg-green-900">
             <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold mt-4">
            {isDemo ? 'Demo Payment Successful!' : 'Payment Successful!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {isDemo
              ? 'Thank you for trying the demo. No payment was processed.'
              : 'Thank you for your purchase. Your order is being processed.'}
          </p>
          {!isDemo && (
            <p className="text-sm text-muted-foreground">
              You should receive a confirmation email shortly.
              {sessionId && ` (Session ID: ${sessionId.substring(0, 8)}...)`}
            </p>
          )}
          {isDemo && (
             <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                (Demo Mode)
             </p>
          )}
          {/* Ensure Link is imported above if needed, or keep it simple */}
          <Link href="/">
             {/* Check if this Button needs asChild - if so, remove it */}
            <Button>Return to Homepage</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
} 