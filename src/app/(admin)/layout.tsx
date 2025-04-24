'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Optional: Import a Loading component if you have one
// import { LoadingSpinner } from '@/components/ui/loading-spinner'; 

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  // State to track if auth check is complete and if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    // Check Local Storage for the demo auth flag
    const demoAuthFlag = localStorage.getItem('isAdminDemoAuthenticated');
    
    if (demoAuthFlag === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Redirect to login only if not already on the login page
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
    setIsLoading(false); // Auth check complete

    // No cleanup needed for local storage check
  }, [router, pathname]); // Re-run check if path changes

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* <LoadingSpinner /> */}
        <p>Checking admin access...</p> 
      </div>
    );
  }

  // If authenticated, render the admin page content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not loading (and not on login page), 
  // the redirect should have happened. 
  // If somehow we are here and not authenticated (e.g., on login page), render nothing or minimal layout.
  // If children include the login page, we might render it here.
  // For safety, let's render children if on login page, otherwise null.
  if (pathname === '/admin/login') {
      return <>{children}</>;
  }
  
  return null; // Or a minimal non-authed layout
} 