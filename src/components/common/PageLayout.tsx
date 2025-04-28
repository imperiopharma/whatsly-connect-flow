
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
