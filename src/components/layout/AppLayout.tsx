import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useTemplateStore } from "@/store/useTemplateStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed } = useTemplateStore();

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}