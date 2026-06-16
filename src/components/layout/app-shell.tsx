'use client';

import { SidebarNav } from './sidebar-nav';
import { BottomNav } from './bottom-nav';
import { Header } from './header';
import { RouteTracker } from './route-tracker';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <RouteTracker />
      {/* Sidebar Nav (Desktop only) */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header />

        {/* Content Wrapper */}
        <main className="flex-grow p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Bottom Nav (Mobile only) */}
      <BottomNav />
    </div>
  );
}
export default AppShell;
