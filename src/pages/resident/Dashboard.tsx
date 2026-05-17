import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { ClipboardList, Plus, CreditCard, FileText, Bell, ArrowRight } from "lucide-react";

export default function ResidentDashboard() {
  const { state, userId } = useStore();
  const myRequests = state.requests.filter(r => r.resident_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const myPayments = state.payments.filter(p => p.resident_id === userId);
  const unreadNotif = state.notifications.filter(n => n.user_id === userId && !n.is_read).length;
  const myLease = state.leases.find(l => l.resident_id === userId);
  const profile = state.profiles.find(p => p.id === userId);

  const tiles = [
    { to: "/resident/requests", icon: ClipboardList, label: "Moje zgłoszenia", value: myRequests.length },
    { to: "/resident/new-request", icon: Plus, label: "Nowe zgłoszenie", value: "+" },
    { to: "/resident/payments", icon: CreditCard, label: "Moje płatności", value: myPayments.filter(p => p.status !== "opłacona").length },
    { to: "/resident/lease", icon: FileText, label: "Moja umowa", value: myLease ? "aktywna" : "—" },
    { to: "/notifications", icon: Bell, label: "Powiadomienia", value: unreadNotif },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Witaj ponownie</p>
        <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tiles.map(t => (
          <Link key={t.label} to={t.to} className="stat-card group">
            <t.icon className="h-5 w-5 text-accent mb-3" />
            <div className="text-2xl font-bold">{t.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{t.label}</div>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Ostatnie zgłoszenia</h2>
          <Button asChild><Link to="/resident/new-request"><Plus className="h-4 w-4 mr-2" />Zgłoś usterkę</Link></Button>
        </div>
        {myRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Brak zgłoszeń. Zgłoś usterkę, jeśli coś wymaga naprawy.</p>
        ) : (
          <div className="divide-y">
            {myRequests.slice(0, 5).map(r => (
              <Link key={r.id} to={`/resident/requests/${r.id}`} className="flex items-center gap-4 py-3 hover:bg-muted/50 -mx-2 px-2 rounded">
                <div className="text-xs font-mono text-muted-foreground w-28">{r.number}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.category} · {new Date(r.created_at).toLocaleDateString("pl-PL")}</div>
                </div>
                <PriorityBadge value={r.priority} />
                <StatusBadge value={r.status} />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
