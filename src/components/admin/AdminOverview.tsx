'use client';

import { useState, useEffect } from 'react';
// Removed Firestore imports
// import { db } from '@/lib/firebase';
// import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, FileText, Users, AlertCircle, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import RevenueChart from '@/components/admin/charts/RevenueChart'; // Keep chart import

interface StatsData {
  totalOrders: number;
  totalQuotes: number;
  newQuotes: number;
  totalAdminUsers: number;
  recentOrders?: { id: string; createdAt: Date; totalAmount: number }[]; // Use Date for simplicity
  loading: boolean;
  // Removed error state
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendValue,
  loading,
  className = '', 
  iconClassName = ''
}: { 
  title: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading: boolean;
  className?: string;
  iconClassName?: string;
}) => {
  const trendIcon = trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> : 
                   trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-500" /> : null;

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full bg-muted ${iconClassName}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
          ) : (
            value
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      {trendValue && (
        <CardFooter className="p-2">
          <div className="flex items-center text-xs">
            {trendIcon}
            <span className={`ml-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : ''}`}>
              {trendValue}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

// --- DEMO MODE: Fake Data Generation ---
const generateFakeOverviewData = (): StatsData => {
  const now = new Date();
  const fakeRecentOrders = [
    { id: `demo_${Math.random().toString(36).substring(2, 10)}`, createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), totalAmount: Math.floor(Math.random() * 10000) + 5000 }, // 1 day ago
    { id: `demo_${Math.random().toString(36).substring(2, 10)}`, createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), totalAmount: Math.floor(Math.random() * 20000) + 10000 }, // 3 days ago
    { id: `demo_${Math.random().toString(36).substring(2, 10)}`, createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), totalAmount: Math.floor(Math.random() * 5000) + 2000 }, // 5 days ago
  ];
  
  return {
    totalOrders: Math.floor(Math.random() * 500) + 200, // 200-700 orders
    totalQuotes: Math.floor(Math.random() * 100) + 50, // 50-150 quotes
    newQuotes: Math.floor(Math.random() * 10) + 1, // 1-10 new quotes
    totalAdminUsers: Math.floor(Math.random() * 3) + 1, // 1-3 admin users
    recentOrders: fakeRecentOrders,
    loading: false, // Data is ready immediately
  };
};
// --- End DEMO MODE ---

export default function AdminOverview({ demoMode = false }: { demoMode?: boolean }) { // Added demoMode prop
  // Initialize state with fake data
  const [stats, setStats] = useState<StatsData>(generateFakeOverviewData());

  // Removed useEffect hook for fetching Firestore data

  // Format Date (Simplified for demo)
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  // Format currency (remains the same)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100); // Assuming amount is in cents
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to the demo admin panel.</p>
      </div>

      {/* Removed error display */}
      
      {/* Stats Cards Grid - Uses state initialized with fake data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <StatCard
          title="Total Orders (Demo)"
          value={stats.totalOrders}
          description="Simulated order count"
          icon={ShoppingCart}
          loading={stats.loading} // Will be false
          iconClassName="bg-blue-500/10 text-blue-600"
        />
        
        <StatCard
          title="Quote Requests (Demo)"
          value={stats.totalQuotes}
          description="Simulated quote requests"
          icon={FileText}
          loading={stats.loading}
          iconClassName="bg-yellow-500/10 text-yellow-600"
        />
        
        <StatCard
          title="New Quotes (Demo)"
          value={stats.newQuotes}
          description="Simulated pending review"
          icon={AlertCircle}
          trend={stats.newQuotes > 0 ? 'up' : 'neutral'}
          trendValue={stats.newQuotes > 0 ? `${stats.newQuotes} new (simulated)` : 'None pending'}
          loading={stats.loading}
          iconClassName="bg-green-500/10 text-green-600"
        />
        
        <StatCard
          title="Admin Users (Demo)"
          value={stats.totalAdminUsers}
          description="Simulated admin users"
          icon={Users}
          loading={stats.loading}
          iconClassName="bg-purple-500/10 text-purple-600"
        />
      </div>

      {/* Revenue Chart - Pass demoMode prop */}
      <div className="mt-8">
        <RevenueChart demoMode={true} /> 
      </div>

      {/* Recent Orders Section - Uses fake data */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders (Demo)</h2>
        
        {stats.loading ? (
          /* ... loading skeleton ... */
          <p>Loading...</p> 
        ) : stats.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <Card key={order.id} className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-muted">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    {/* Use fake ID directly */}
                    <p className="font-medium">Order #{order.id.substring(0, 12)}</p> 
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            <p>No recent orders found.</p>
          </Card>
        )}
      </div>

      {/* Quick Tips Section (remains mostly the same) */}
      <div className="mt-6">
         {/* ... existing Quick Tips card ... */} 
      </div>
    </div>
  );
} 