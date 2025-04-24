'use client'; // Needs context

import { useState, useEffect } from 'react';
import { usePaymentConfig } from '@/context/PaymentConfigContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CreditCard, Bitcoin, RefreshCw, XCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';

// --- DEMO MODE: Local Storage Key and Defaults ---
// Use the same key as AdminAppearance to store all settings
const LOCAL_STORAGE_KEY = 'demoAdminSettings'; 

// Define structure for consistency, though we only modify enableCoinbase here
const defaultSettings = {
    theme: { /* ... from AdminAppearance ... */ },
    socialLinks: [ /* ... from AdminAppearance ... */ ],
    payments: {
        enableCoinbase: false, // Default value
    }
};

// Interface for payment data
interface Payment {
  id: string;
  customerId: string;
  orderId?: string;
  quoteId?: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  provider: string;
  providerPaymentId: string;
  createdAt: Date; // Use Date for simplicity in demo
}

// --- DEMO MODE: Fake Data Generation ---
const generateFakePayments = (count = 10): Payment[] => {
  const payments: Payment[] = [];
  const statuses: Payment['status'][] = ['succeeded', 'succeeded', 'succeeded', 'failed', 'pending', 'refunded'];
  const providers = ['stripe', 'coinbase'];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    payments.push({
      id: `demo_pay_${Math.random().toString(36).substring(2, 10)}`,
      customerId: `cust_demo_${Math.random().toString(36).substring(2, 8)}`,
      amount: Math.floor(Math.random() * 20000) + 1000, // 10 - 210 USD
      status: status,
      provider: provider,
      providerPaymentId: `${provider === 'stripe' ? 'pi' : 'ch'}_demo_${Math.random().toString(36).substring(2, 12)}`,
      createdAt: new Date(now.getTime() - i * Math.random() * 3 * 24 * 60 * 60 * 1000), // Within last ~30 days
      orderId: status === 'succeeded' ? `ord_demo_${Math.random().toString(36).substring(2, 8)}` : undefined,
    });
  }
  return payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
// --- End DEMO MODE ---

export default function AdminPayments({ demoMode = false }: { demoMode?: boolean }) {
  const { isStripeConfigured, isCoinbaseConfigured } = usePaymentConfig();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enableCoinbase, setEnableCoinbase] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load initial state (fake payments and enableCoinbase setting from LS)
  useEffect(() => {
    if (demoMode) {
      setIsLoading(true);
      // Load fake payments
      setPayments(generateFakePayments());

      // Load enableCoinbase setting from local storage
      try {
        const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          // Check if payments settings exist, otherwise use default
          if (parsedSettings.payments && typeof parsedSettings.payments.enableCoinbase === 'boolean') {
             setEnableCoinbase(parsedSettings.payments.enableCoinbase);
          } else {
              console.warn("[Demo Payments] No payments settings in Local Storage, using default.");
              setEnableCoinbase(defaultSettings.payments.enableCoinbase);
          }
        } else {
          console.warn("[Demo Payments] No settings in Local Storage, using default.");
          setEnableCoinbase(defaultSettings.payments.enableCoinbase);
        }
      } catch (err) {
         console.error("[Demo Payments] Error loading settings from Local Storage:", err);
         setEnableCoinbase(defaultSettings.payments.enableCoinbase);
      } finally {
         setIsLoading(false);
         setHasChanges(false); // Reset changes flag after loading
      }
    } else {
        // TODO: Implement non-demo mode loading if needed
        console.warn("AdminPayments: Non-demo mode not fully implemented for loading.");
        setIsLoading(false);
    }
  }, [demoMode]);

  // Check for changes against the loaded state
  useEffect(() => {
    if (!isLoading && demoMode) {
      // Need to reload from LS to compare accurately in case another tab changed it
      let currentStoredValue = defaultSettings.payments.enableCoinbase;
      try {
          const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (storedSettings) {
              const parsedSettings = JSON.parse(storedSettings);
              if (parsedSettings.payments && typeof parsedSettings.payments.enableCoinbase === 'boolean') {
                  currentStoredValue = parsedSettings.payments.enableCoinbase;
              }
          }
      } catch {} // Ignore errors reading LS for comparison

      setHasChanges(enableCoinbase !== currentStoredValue);
    }
  }, [enableCoinbase, isLoading, demoMode]);

  const handleToggleCoinbase = (checked: boolean) => {
      setEnableCoinbase(checked);
      // Don't set hasChanges immediately, wait for useEffect comparison
  };

  // --- DEMO MODE: Save settings to Local Storage ---
  const savePaymentSettings = async () => {
    setIsSaving(true);

    try {
      // 1. Read current full settings from Local Storage
      let currentSettings = { ...defaultSettings }; // Start with defaults
      try {
        const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          // Basic validation
          if (parsed.theme && parsed.socialLinks && parsed.payments) {
             currentSettings = parsed;
          } else {
              console.warn("[Demo Payments Save] Invalid data in LS, merging with defaults.");
              // Merge carefully if needed, or just overwrite payments part
          }
        }
      } catch (err) {
          console.error("[Demo Payments Save] Error reading LS, will overwrite payment settings:", err);
      }

      // 2. Update the payments part
      const updatedSettings = {
        ...currentSettings,
        payments: {
          ...currentSettings.payments, // Keep other potential payment settings
          enableCoinbase: enableCoinbase,
        },
      };

      // 3. Write updated settings back to Local Storage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSettings));
      
      toast.success('Payment settings saved to browser storage.');
      setHasChanges(false); // Reset changes flag

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings.';
      console.error("[Demo Payments Save] Error:", errorMessage);
      toast.error('Failed to save payment settings to browser storage.');
    } finally {
      setIsSaving(false);
    }
  };
  // --- End DEMO MODE Save ---

  // Format Date (Simplified)
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'N/A';
    try {
      return format(date, 'PPp'); // Mar 15, 2023, 3:25 PM
    } catch {
       return 'Invalid Date';
    }
  };

  // Format currency (remains the same)
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100); // Convert cents to dollars
  };

  // Get status badge variant (remains the same)
  const getStatusBadgeVariant = (status: Payment['status']) => {
    switch (status) {
      case 'succeeded': return 'success';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'refunded': return 'outline';
      default: return 'secondary';
    }
  };

  // Get payment method icon (remains the same)
  const getPaymentIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'stripe': return <CreditCard className="h-4 w-4" />;
      case 'coinbase': return <Bitcoin className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />; // Default icon
    }
  };

  // Removed combined loading skeleton logic
  if (isLoading && demoMode) {
       return <p>Loading demo payments...</p>; // Simple loader
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Payment Settings (Demo)</h1>
      
      {/* Payment Gateway Status Cards (using usePaymentConfig context) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Stripe</span>
              <Badge variant={isStripeConfigured ? 'success' : 'destructive'}>
                {isStripeConfigured ? 'Configured' : 'Not Configured'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Handles credit card, debit card, Apple Pay, and Google Pay payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isStripeConfigured ? (
              <p className="text-sm text-muted-foreground">
                Stripe integration is active.
              </p>
            ) : (
              <p className="text-sm text-destructive">
                Stripe environment variables (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY) are missing or incorrect.
              </p>
            )}
            <Link href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="mt-4">
                Go to Stripe Dashboard <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Coinbase Commerce</span>
              <Badge variant={isCoinbaseConfigured ? 'success' : 'destructive'}>
                {isCoinbaseConfigured ? 'Configured' : 'Not Configured'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Handles cryptocurrency payments (e.g., BTC, ETH).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCoinbaseConfigured ? (
              <p className="text-sm text-muted-foreground">
                Coinbase Commerce integration is active.
              </p>
            ) : (
              <p className="text-sm text-destructive">
                Coinbase Commerce environment variables (COINBASE_COMMERCE_API_KEY, COINBASE_COMMERCE_WEBHOOK_SECRET) are missing or incorrect.
              </p>
            )}
            <Link href="https://commerce.coinbase.com/dashboard" target="_blank" rel="noopener noreferrer">
               <Button variant="outline" size="sm" className="mt-4">
                 Go to Coinbase Dashboard <ExternalLink className="ml-2 h-4 w-4" />
               </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateway Enable/Disable Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Configuration</CardTitle>
          <CardDescription>
            Enable or disable specific payment providers for checkout (Demo Mode - Saves to Browser).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {/* Removed Error Alert */}

          {/* Coinbase Commerce Section */}
          <div className="space-y-4 rounded-md border p-4">
               <h3 className="font-medium leading-none">Coinbase Commerce (Crypto)</h3>
               <div className="flex items-center justify-between space-x-2 pt-2">
                   <Label htmlFor="enable-coinbase" className="flex flex-col space-y-1 cursor-pointer">
                       <span>Enable Crypto Payments</span>
                       <span className="font-normal leading-snug text-muted-foreground">
                          Allow customers to pay with cryptocurrencies like BTC and ETH.
                       </span>
                  </Label>
                  <Switch
                      id="enable-coinbase"
                      checked={enableCoinbase}
                      onCheckedChange={handleToggleCoinbase}
                      disabled={isSaving || isLoading} // Also disable if context is loading
                      aria-labelledby="enable-coinbase-label"
                  />
              </div>
               {/* Vulnerability Warning */}
               {enableCoinbase && (
                  <Alert variant="default" className="mt-4 border-yellow-500/50 text-yellow-700 dark:border-yellow-500/30 dark:text-yellow-300 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-yellow-800 dark:text-yellow-200">Security Notice</AlertTitle>
                      <AlertDescription>
                          The currently used Coinbase Commerce SDK (`coinbase-commerce-node`) has known vulnerabilities in its dependencies (e.g., `lodash`, `request`). While the risk might be low for standard use, please review the details in the{' '}
                          <Link href="https://github.com/advisories/GHSA-29mw-wpgm-hmr9" className="font-medium underline underline-offset-4 text-yellow-800 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100" target="_blank" rel="noopener noreferrer">
                              GitHub Advisory <ExternalLink className="inline-block h-3 w-3 ml-0.5"/>
                          </Link>{' '}
                          and enable at your own discretion. Consider alternative libraries if concerned.
                      </AlertDescription>
                  </Alert>
              )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={savePaymentSettings}
            disabled={isLoading || isSaving || !hasChanges} 
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Payment Settings'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Recent Payment Transactions Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Payment Transactions (Demo)</h2>
          {/* Removed Refresh Button as data is static for demo */}
        </div>

        {/* Removed payment-specific error display */}

         <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Order/Quote</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No demo payment transactions generated.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.providerPaymentId?.substring(0, 12) || 'N/A'}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getPaymentIcon(payment.provider)}
                          <span className="ml-2 capitalize">{payment.provider}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(payment.status)}
                          className="capitalize"
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.orderId 
                          ? `Order: ${payment.orderId.substring(0, 8)}...` 
                          : payment.quoteId 
                          ? `Quote: ${payment.quoteId.substring(0, 8)}...` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

    </div>
  );
} 