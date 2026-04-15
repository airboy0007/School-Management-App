import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Receipt, 
  GraduationCap, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'finance', label: 'Fee Ledger', icon: Wallet },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'staff', label: 'Staff & Payroll', icon: GraduationCap },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#151619] text-white transition-transform duration-300 lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-[#151619] font-black text-xs">PS</span>
                </div>
                Parwaaz e Shaheen
              </h1>
              <button 
                className="lg:hidden p-1 text-gray-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1 font-mono">Academy Operations</p>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "flex items-center w-full gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-white text-[#151619] shadow-lg" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-400/10 transition-colors">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <button 
            className="lg:hidden p-2 -ml-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">Administrator</p>
              <p className="text-xs text-gray-500">Academy Owner</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
              <img 
                src="https://picsum.photos/seed/admin/100/100" 
                alt="Admin" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
