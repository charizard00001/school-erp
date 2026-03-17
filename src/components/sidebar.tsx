"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Students", href: "/admin/students", icon: <Users className="w-5 h-5" /> },
  { label: "Teachers", href: "/admin/teachers", icon: <UserCheck className="w-5 h-5" /> },
  { label: "Classes", href: "/admin/classes", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Exams", href: "/admin/exams", icon: <ClipboardList className="w-5 h-5" /> },
];

const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/teacher", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Attendance", href: "/teacher/attendance", icon: <CalendarCheck className="w-5 h-5" /> },
  { label: "Marks", href: "/teacher/marks", icon: <FileText className="w-5 h-5" /> },
];

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "My Attendance", href: "/student/attendance", icon: <CalendarCheck className="w-5 h-5" /> },
  { label: "My Marks", href: "/student/marks", icon: <FileText className="w-5 h-5" /> },
];

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case "ADMIN": return adminNav;
    case "TEACHER": return teacherNav;
    case "STUDENT": return studentNav;
    default: return [];
  }
}

interface SidebarProps {
  user: { name: string; email: string; role: string };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = getNavItems(user.role);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">School ERP</h1>
            <span className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()} Portal</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== `/${user.role.toLowerCase()}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t space-y-3">
        <div className="px-3">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 md:translate-x-0 md:static md:z-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
