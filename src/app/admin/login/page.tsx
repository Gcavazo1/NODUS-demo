'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Removed Firebase imports: signInWithEmailAndPassword, auth
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// --- Hardcoded credentials for Demo --- 
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'demo';

export default function AdminLoginPage() {
  // Changed email state to username
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Redirect if already logged in (e.g., user navigates back to login)
  useEffect(() => {
      if (localStorage.getItem('isAdminDemoAuthenticated') === 'true') {
          router.replace('/admin-settings');
      }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
      // --- DEMO AUTH LOGIC --- 
      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        // Set flag in local storage
        localStorage.setItem('isAdminDemoAuthenticated', 'true');
        console.log('Demo admin login successful.');
        // Redirect to admin settings
        router.push('/admin-settings'); 
      } else {
        setError('Invalid username or password. Use admin / demo');
        setIsLoading(false);
      }
      // --- End DEMO AUTH LOGIC --- 

      /* --- Original Firebase Logic (Commented Out) ---
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin-settings'); 
      */
    } catch (err: unknown) {
      // Keep general error handling in case of unexpected issues
      console.error("Demo Admin Login Error:", err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    } 
    // Don't set isLoading to false on success because we are navigating away
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login (Demo)</CardTitle>
          <CardDescription>
            Use <code className='font-mono bg-muted px-1 rounded'>admin</code> / <code className='font-mono bg-muted px-1 rounded'>demo</code> to access the demo admin panel.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {/* Changed Label and Input for Username */}
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text" // Changed type to text
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="demo" // Added placeholder
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login (Demo)'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 