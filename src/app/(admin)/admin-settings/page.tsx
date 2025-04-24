'use client'; // Needed for onClick handler and useRouter

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // Import from next/navigation for App Router
import { LayoutDashboard, Palette, CreditCard, FileText, ShoppingCart, Users, Menu } from 'lucide-react';
import { cn } from "@/lib/utils";

// Import placeholder components (we will create these next)
import AdminOverview from '@/components/admin/AdminOverview';
import AdminPayments from '@/components/admin/AdminPayments';
import AdminQuotes from '@/components/admin/AdminQuotes';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminAppearance from '@/components/admin/AdminAppearance';

type AdminSection = 'overview' | 'payments' | 'quotes' | 'orders' | 'users' | 'appearance';

interface NavItemProps {
  section: AdminSection;
  label: string;
  icon: ReactNode;
  currentSection: AdminSection;
  setSection: (section: AdminSection) => void;
  onClick?: () => void; // Optional: for closing sidebar on mobile
}

const NavItem = ({ section, label, icon, currentSection, setSection, onClick }: NavItemProps) => (
  <Button
    variant={currentSection === section ? 'secondary' : 'ghost'}
    className="w-full justify-start"
    onClick={() => {
      setSection(section);
      onClick?.(); // Close sidebar if function provided
    }}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </Button>
);

export default function AdminSettingsPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<AdminSection>('appearance'); // Default to appearance for demo
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // --- DEMO LOGOUT --- 
  const handleLogout = async () => {
    try {
      // Remove the demo auth flag from local storage
      localStorage.removeItem('isAdminDemoAuthenticated');
      console.log('Demo admin logout successful.');
      router.push('/admin/login'); // Redirect to login after clearing flag
    } catch (error) {
      console.error("Demo Logout Error:", error);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'overview': return <AdminOverview demoMode={true} />; // Pass demoMode prop
      case 'payments': return <AdminPayments demoMode={true} />; // Pass demoMode prop
      case 'quotes': return <AdminQuotes demoMode={true} />; // Pass demoMode prop
      case 'orders': return <AdminOrders demoMode={true} />; // Pass demoMode prop
      case 'users': return <AdminUsers demoMode={true} />; // Pass demoMode prop
      // Pass demoMode prop to AdminAppearance
      case 'appearance': return <AdminAppearance demoMode={true} />; 
      default: return <AdminOverview demoMode={true} />; // Pass demoMode prop
    }
  };

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="flex min-h-screen">
      {/* Overlay for mobile sidebar */} 
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r p-4 flex flex-col bg-background transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <h2 className="text-xl font-semibold mb-6">Admin Settings (Demo)</h2>
        
        {/* Updated Auth Status Display for Demo */}
        <div className="mb-4 p-2 bg-muted rounded text-xs">
          <p>Auth Status: Signed In (Demo)</p>
          <p>User: admin@demo</p>
        </div>
        
        <nav className="flex flex-col space-y-2 flex-grow">
          <NavItem section="overview" label="Overview (Demo)" icon={<LayoutDashboard size={18} />} currentSection={currentSection} setSection={setCurrentSection} onClick={closeMobileSidebar} />
          <NavItem section="payments" label="Payments (Demo)" icon={<CreditCard size={18} />} currentSection={currentSection} setSection={setCurrentSection} onClick={closeMobileSidebar} />
          <NavItem section="quotes" label="Quotes (Demo)" icon={<FileText size={18} />} currentSection={currentSection} setSection={setCurrentSection} onClick={closeMobileSidebar} />
          <NavItem section="orders" label="Orders (Demo)" icon={<ShoppingCart size={18} />} currentSection={currentSection} setSection={setCurrentSection} onClick={closeMobileSidebar} />
          <NavItem section="users" label="Users (Demo)" icon={<Users size={18} />} currentSection={currentSection} setSection={setCurrentSection} onClick={closeMobileSidebar} />
          <NavItem section="appearance" label="Appearance" icon={<Palette size={18} />} currentSection={currentSection} setSection={setCurrentSection} onClick={closeMobileSidebar} />
        </nav>
        <div className="mt-auto">
          <Button onClick={handleLogout} variant="outline" className="w-full">Logout (Demo Admin)</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 bg-muted/30">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
           <Button 
             variant="ghost" 
             size="icon"
             onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
           >
            <Menu className="h-6 w-6" />
           </Button>
           <h1 className="text-lg font-semibold capitalize">{currentSection}</h1>
           {/* Placeholder for potential right-side icons/actions */}
           <div className="w-8"></div> 
        </div>
        
        {renderSection()}
      </main>
    </div>
  );
} 