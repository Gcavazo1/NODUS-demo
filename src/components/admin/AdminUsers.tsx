'use client';

import { useState, useEffect } from 'react';
// Removed Firestore imports
// import { db } from '@/lib/firebase';
// import { collection, query, getDocs } from 'firebase/firestore';
import { AdminUser } from '@/lib/definitions'; // Import the AdminUser type
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// --- DEMO MODE: Fake Data Generation ---
const generateFakeUsers = (count = 2): AdminUser[] => {
  const users: AdminUser[] = [
      {
          id: 'auth_demo_admin', // Simulate the main admin
          name: 'Demo Admin',
          email: 'admin@demo.com',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
      }
  ];
  
  for (let i = 1; i < count; i++) {
      users.push({
          id: `auth_demo_user${i}`,
          name: `Demo Viewer ${i}`,
          email: `viewer${i}@demo.com`,
          role: 'viewer',
          createdAt: new Date(),
          updatedAt: new Date(),
      });
  }
  return users;
};
// --- End DEMO MODE ---

export default function AdminUsers({ demoMode = false }: { demoMode?: boolean }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Removed error state: const [error, setError] = useState<string | null>(null);

  // Load fake data if in demo mode
  useEffect(() => {
    if (demoMode) {
      setIsLoading(true);
      // Simulate async loading slightly
      setTimeout(() => {
         setUsers(generateFakeUsers());
         setIsLoading(false);
      }, 100);
    } else {
        // TODO: Implement non-demo mode loading
        console.warn("AdminUsers: Non-demo mode not implemented.");
        setIsLoading(false);
    }
  }, [demoMode]);

  // Removed original Firestore fetching useEffect

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin Users (Demo)</h1>
      <p className="text-muted-foreground mb-6">
        Manage simulated users who have access to this admin panel.
      </p>
      
      {isLoading && <p>Loading demo users...</p>}
      {/* Removed error display */}

      {!isLoading && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>User ID (Auth UID)</TableHead>
                {/* Add actions column later if needed (e.g., edit role, delete) */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No demo admin users generated.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Add Invite User Button/Functionality later if needed */}
    </div>
  );
} 