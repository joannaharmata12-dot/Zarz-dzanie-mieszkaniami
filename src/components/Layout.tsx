import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { ROLE_LABEL } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Home, ClipboardList, Building2, Wrench, CreditCard, FileText, CalendarCheck,
  Bell, Sparkles, LogOut, Plus, Info, User2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const aboutItem = { to: "/about", icon: Info, label: "O systemie" };

const navByRole = {
  resident: [
    { to: "/resident", icon: Home, label: "Dashboard" },
    { to: "/resident/requests", icon: ClipboardList, label: "Moje zgłoszenia" },
    { to: "/resident/new-request", icon: Plus, label: "Zgłoś usterkę" },
    { to: "/resident/payments", icon: CreditCard, label: "Płatności" },
    { to: "/resident/lease", icon: FileText, label: "Umowa najmu" },
    { to: "/resident/visits", icon: CalendarCheck, label: "Wizyty" },
    { to: "/notifications", icon: Bell, label: "Powiadomienia" },
    aboutItem,
  ],
  manager: [
    { to: "/manager", icon: Home, label: "Dashboard" },
    { to: "/manager/apartments", icon: Building2, label: "Mieszkania" },
    { to: "/manager/residents", icon: User2, label: "Mieszkańcy" },
    { to: "/manager/requests", icon: ClipboardList, label: "Zgłoszenia" },
    { to: "/manager/payments", icon: CreditCard, label: "Płatności" },
    { to: "/manager/visits", icon: CalendarCheck, label: "Wizyty kontrolne" },
    { to: "/notifications", icon: Bell, label: "Powiadomienia" },
    aboutItem,
  ],
  technical: [
    { to: "/technical", icon: Wrench, label: "Przypisane zgłoszenia" },
    { to: "/notifications", icon: Bell, label: "Powiadomienia" },
    aboutItem,
  ],
  cleaning: [
    { to: "/cleaning", icon: Sparkles, label: "Zlecenia sprzątania" },
    { to: "/notifications", icon: Bell, label: "Powiadomienia" },
    aboutItem,
  ],
} as const;

export default function Layout() {
  const { role, userId, state, logout, resetData } = useStore();
  const navigate = useNavigate();

  if (!role || !userId) { navigate("/"); return null; }
  const user = state.profiles.find(p => p.id === userId);
  const items = navByRole[role];
  const unread = state.notifications.filter(n => n.user_id === userId && !n.is_read).length;
  const initials = user?.full_name.split(" ").map(s => s[0]).slice(0, 2).join("") ?? "?";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-6 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg gradient-hero flex items-center justify-center font-bold text-white">P</div>
            <div>
              <div className="font-bold tracking-tight">PropertyCare</div>
              <div className="text-xs text-sidebar-foreground/60">{ROLE_LABEL[role]}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(item => (
            <NavLink key={item.to} to={item.to} end
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50",
              )}>
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.to === "/notifications" && unread > 0 && (
                <Badge className="bg-sidebar-primary text-sidebar-primary-foreground border-0 h-5 px-1.5">{unread}</Badge>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-2 px-2 py-2">
            <Avatar className="h-8 w-8"><AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">{initials}</AvatarFallback></Avatar>
            <div className="text-xs flex-1 min-w-0">
              <div className="font-medium truncate">{user?.full_name}</div>
              <div className="text-sidebar-foreground/60 truncate">{user?.email}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="h-4 w-4 mr-2" /> Wyloguj
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden border-b bg-card px-4 py-3 flex items-center justify-between">
          <div className="font-bold">PropertyCare</div>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
