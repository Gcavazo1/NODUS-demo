'use client';

import { useState, useEffect } from 'react';
// Removed Firestore imports
// import { db } from '@/lib/firebase';
// import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { QuoteRequest } from '@/lib/definitions'; // Import the QuoteRequest type
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

// --- DEMO MODE: Fake Data Generation ---
const generateFakeQuotes = (count = 15): QuoteRequest[] => {
  const quotes: QuoteRequest[] = [];
  const statuses: QuoteRequest['status'][] = ['new', 'viewed', 'in-progress', 'completed', 'rejected'];
  const projectTypes = ['web-design', 'seo', 'app-dev', 'marketing', 'consulting', 'other'];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(now.getTime() - i * Math.random() * 10 * 24 * 60 * 60 * 1000); // Within last ~100 days
    quotes.push({
      id: `qt_demo_${Math.random().toString(36).substring(2, 10)}`,
      name: `Demo User ${i + 1}`,
      email: `user${i + 1}@demo.com`,
      projectType: projectTypes[Math.floor(Math.random() * projectTypes.length)],
      description: `This is a simulated quote request description for demo purposes. Request number ${i + 1}.`,
      status: status,
      createdAt: createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24), // Updated within a day
      // Add other optional fields like budget, timeline if needed
    });
  }
  return quotes.sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime());
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

// Helper function to get Badge variant based on status (remains the same)
const getStatusVariant = (status: QuoteRequest['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
        case 'new': return 'success';
        case 'viewed': return 'default';
        case 'in-progress': return 'secondary';
        case 'completed': return 'outline';
        case 'rejected': return 'destructive';
        default: return 'secondary';
    }
}

export default function AdminQuotes({ demoMode = false }: { demoMode?: boolean }) {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Removed error state: const [error, setError] = useState<string | null>(null);

  // Load fake data if in demo mode
  useEffect(() => {
    if (demoMode) {
      setIsLoading(true);
      // Simulate async loading slightly
      setTimeout(() => {
         setQuotes(generateFakeQuotes());
         setIsLoading(false);
      }, 150);
    } else {
        // TODO: Implement non-demo mode loading
        console.warn("AdminQuotes: Non-demo mode not implemented.");
        setIsLoading(false);
    }
  }, [demoMode]);

  // Removed original Firestore fetching useEffect

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Recent Quote Requests (Demo)</h1>
      
      {isLoading && <p>Loading demo quotes...</p>}
      {/* Removed error display */}

      {!isLoading && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Project Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                {/* Add more columns if needed, e.g., Budget, Timeline */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No demo quote requests generated.
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.name}</TableCell>
                    <TableCell>{quote.email}</TableCell>
                    <TableCell className="capitalize">{quote.projectType}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(quote.status)}
                        className="capitalize"
                      >
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTimestamp(quote.createdAt)}</TableCell>
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