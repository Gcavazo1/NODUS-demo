import React from 'react';
import { Button } from '@/components/ui/button';
import { Bitcoin, CreditCard } from "lucide-react";

// Define the expected props
interface PaymentMethodSelectionProps {
  onSelect: (provider: 'stripe' | 'coinbase') => void;
  isLoading: boolean;
  // Add props later to conditionally disable options based on configuration
  // isStripeEnabled?: boolean;
  // isCoinbaseEnabled?: boolean;
}

export function PaymentMethodSelection({ 
  onSelect, 
  isLoading, 
  // isStripeEnabled = true, // Default to true for now
  // isCoinbaseEnabled = true 
}: PaymentMethodSelectionProps) {
  return (
    <div className="space-y-4 border p-4 rounded-lg bg-card">
       <p className="text-sm text-muted-foreground">Payment Method Selection (Placeholder)</p>
       <div className="flex flex-col sm:flex-row gap-4">
         {/* Stripe Button */}
         {/* TODO: Add logic to disable if Stripe isn't configured/enabled */}
          <Button 
            onClick={() => onSelect('stripe')} 
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm md:text-base px-2 sm:px-4 h-auto py-3"
          >
            {isLoading ? 'Processing...' : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                <span className="whitespace-normal">Pay with Card</span>
              </>
            )}
          </Button>

         {/* Coinbase Button */}
         {/* TODO: Add logic to disable if Coinbase isn't configured/enabled */}
          <Button 
            onClick={() => onSelect('coinbase')} 
            disabled={isLoading}
            variant="outline"
            className="flex-1 text-xs sm:text-sm md:text-base px-2 sm:px-4 h-auto py-3"
          >
            {isLoading ? 'Processing...' : (
              <>
                <Bitcoin className="mr-2 h-4 w-4" />
                <span className="whitespace-normal">Pay with Crypto</span>
              </>
            )}
          </Button>
       </div>
    </div>
  );
} 