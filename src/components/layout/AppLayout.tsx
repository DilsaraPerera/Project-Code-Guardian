import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full min-w-0 bg-gradient-dark">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1" />
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-grid-pattern">
            <div className="mx-auto w-full max-w-[1920px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 2xl:px-10">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
