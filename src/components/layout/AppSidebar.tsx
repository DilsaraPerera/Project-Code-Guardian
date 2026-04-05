import {
  Shield,
  Scan,
  Package,
  AlertTriangle,
  FileText,
  Settings,
  History,
  BarChart3,
  Network
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/",
  },
  {
    title: "New Scan",
    icon: Scan,
    href: "/scan",
  },
  {
    title: "Dependencies",
    icon: Package,
    href: "/dependencies",
  },
  {
    title: "Vulnerabilities",
    icon: AlertTriangle,
    href: "/vulnerabilities",
  },
  {
    title: "Dependency Graph",
    icon: Network,
    href: "/graph",
  },
];

const secondaryItems = [
  {
    title: "Scan History",
    icon: History,
    href: "/history",
  },
  {
    title: "Reports",
    icon: FileText,
    href: "/reports",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-scan/10 glow-scan">
            <Shield className="h-6 w-6 text-scan" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">CODE GUARDIAN</h1>
            <p className="text-xs text-primary/70">Scan Your Code Here !!</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-primary/70">
            Analysis
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    className="transition-all hover:bg-scan"
                  >
                    <NavLink to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-primary/70">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    className="transition-all hover:bg-scan"
                  >
                    <NavLink to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-2 text-xs text-primary/70">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>All systems operational</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
