'use client';

import React, { useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Calendar,
  HandCoins,
  Users,
  LogOut,
  LayoutDashboard,
  CreditCard,
  Users2,
  Settings,
  Moon,
  Sun,
  Bell
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { TitleBar } from '@/components/title-bar';
import { AuthContext } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import type { PagePermission } from '@/lib/types';

const navItems: { href: string; label: string; icon: React.ElementType, id: PagePermission }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { href: '/members', label: 'Members', icon: Users, id: 'members' },
  { href: '/events', label: 'Events', icon: Calendar, id: 'events' },
  { href: '/donations', label: 'Giving', icon: HandCoins, id: 'donations' },
  { href: '/expenses', label: 'Expenses', icon: CreditCard, id: 'expenses' },
  { href: '/reports', label: 'Reports', icon: BarChart, id: 'reports' },
  { href: '/users', label: 'User Management', icon: Users2, id: 'users' },
  { href: '/settings', label: 'Settings', icon: Settings, id: 'settings' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { settings, updateSettings } = useSettings();

  if (!authContext) {
    // This can happen if the component is rendered outside of the AuthProvider
    // You might want to redirect to login or show an error.
    // For now, we can prevent rendering the layout.
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  const { user, logout } = authContext;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleThemeToggle = () => {
    updateSettings({
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  const accessibleNavItems = navItems.filter(item => user?.permissions?.[item.id]);

  return (
    <>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar className="app-layout-main">
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {accessibleNavItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={{ children: item.label, side: 'right', align: 'center' }}
                      className="transition-smooth hover-scale"
                    >
                      <Link href={item.href} className={pathname.startsWith(item.href) ? 'bg-gradient-subtle' : ''}>
                        <item.icon className={pathname.startsWith(item.href) ? 'text-primary' : ''} />
                        <span className={pathname.startsWith(item.href) ? 'font-semibold text-primary' : ''}>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="flex flex-col gap-2 px-3 py-2">
                <div className="flex flex-col text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{user?.name}</span>
                  <span className="capitalize">{user?.role}</span>
                </div>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={{ children: "Logout", side: 'right', align: 'center' }}
                      onClick={handleLogout}
                      className="hover:bg-destructive/10 hover:text-destructive transition-smooth"
                    >
                      <LogOut />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </SidebarFooter>
          </Sidebar>
          <main className="flex flex-1 flex-col">
            <header className="app-layout-header sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6 shadow-soft">
              <div className="flex items-center gap-4 md:hidden">
                <SidebarTrigger />
              </div>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover-scale transition-smooth"
                >
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleThemeToggle}
                  className="h-8 w-8 hover-scale transition-smooth"
                >
                  {settings.theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </header>
            <div className="flex-1 overflow-auto p-4 sm:p-6 animate-fade-in">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
