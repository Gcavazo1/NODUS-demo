'use client';

import { useState, useEffect } from 'react';
// Removed Firestore imports
// import { db } from '@/lib/firebase';
// import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { Order } from '@/lib/definitions'; // Import the Order type
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns'; // For date formatting
import { CreditCard, Bitcoin } from 'lucide-react'; // Import icons for payment methods

// --- DEMO MODE: Fake Data Generation ---
const generateFakeOrders = (count = 20): Order[] => {
  const orders: Order[] = [];
  const statuses: Order['status'][] = ['completed', 'completed', 'pending', 'processing', 'canceled', 'refunded'];
  const providers = ['stripe', 'coinbase'];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(now.getTime() - i * Math.random() * 5 * 24 * 60 * 60 * 1000); // Within last ~50 days

    orders.push({
      id: `ord_demo_${Math.random().toString(36).substring(2, 10)}`,
      customerId: `cust_demo_${Math.random().toString(36).substring(2, 8)}`,
      status: status,
      provider: provider,
      totalAmount: Math.floor(Math.random() * 30000) + 2000, // 20 - 320 USD
      createdAt: createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60), // Updated within an hour
      items: [{ id: `prod_demo_${i}`, quantity: 1 }], // Simple item
      // Add other optional fields if needed by the table
    });
  }
  return orders.sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime());
};
// --- End DEMO MODE ---

// Helper function to format Date (removed Timestamp logic)
const formatTimestamp = (timestamp: Date | string | undefined): string => {
   // ... (simplified formatting logic for Date)
   if (!timestamp) return 'N/A';
    let date: Date;
    if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        return 'Invalid Date';
    }
    if (isNaN(date.getTime())) return 'Invalid Date';
    try {
        return format(date, 'PPpp');
    } catch (error) {
        return 'Invalid Date';
    }
};

// Helper to format currency (remains the same)
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'N/A';
  return `$${(amount / 100).toFixed(2)}`;
};

// Helper to get provider icon and display name (remains the same)
const getProviderDisplay = (provider: string | undefined) => {
  if (!provider) return { name: 'Unknown', icon: null };
  
  switch (provider.toLowerCase()) {
    case 'stripe':
      return { name: 'Stripe', icon: <CreditCard className="h-4 w-4" /> };
    case 'coinbase':
      return { name: 'Coinbase', icon: <Bitcoin className="h-4 w-4" /> };
    default:
      return { name: provider, icon: <CreditCard className="h-4 w-4" /> };
  }
};

export default function AdminOrders({ demoMode = false }: { demoMode?: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Removed error state: const [error, setError] = useState<string | null>(null);

  // Load fake data if in demo mode
  useEffect(() => {
    if (demoMode) {
      setIsLoading(true);
      // Simulate async loading slightly
      setTimeout(() => {
         setOrders(generateFakeOrders());
         setIsLoading(false);
      }, 200);
    } else {
        // TODO: Implement non-demo mode loading
        console.warn("AdminOrders: Non-demo mode not implemented.");
        setIsLoading(false);
    }
  }, [demoMode]);

  // Removed original Firestore fetching useEffect

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Recent Orders (Demo)</h1>
      
      {isLoading && <p>Loading demo orders...</p>}
      {/* Removed error display */}

      {!isLoading && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No demo orders generated.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium truncate max-w-xs">{order.id}</TableCell>
                    <TableCell className="truncate max-w-xs">{order.customerId || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={order.status === 'completed' ? 'success' : (order.status === 'canceled' || order.status === 'refunded' ? 'destructive' : 'secondary')}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.provider && (
                        <div className="flex items-center gap-1.5">
                          {getProviderDisplay(order.provider).icon}
                          <span>{getProviderDisplay(order.provider).name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>{formatTimestamp(order.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 