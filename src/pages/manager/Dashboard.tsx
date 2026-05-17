import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { Building2, AlertTriangle, CreditCard, ClipboardList, Plus, ArrowRight } from "lucide-react";

export default function ManagerDashboard() {
  const { state, userId } = useStore();
  const apts = state.apartments.filter(a => a.manager_id === userId);
  const newReq = state.requests.filter(r => r.status === "nowe");
  const critical = state.requests.filter(r => r.priority === "krytyczny" && r.status !== "zakończone" && r.status !== "anulowane");
  const overdue = state.payments.filter(p => p.status === "zaległa");
  const recent = [...state.requests].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);

  const stats = [
    { label: "Mieszkania", value: apts.length, icon: Building2, color: "text-accent" },
    { label: "Nowe zgłoszenia", value: newReq.length, icon: ClipboardList, color: "text-info" },
    { label: "Krytyczne", value: critical.length, icon: AlertTriangle, color: "text-destructive" },
    { label: "Zaległe płatności", value: overdue.length, icon: CreditCard, color: "text-warning" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Panel zarządcy</p>
          <h1 className="text-3xl font-bold">Witaj, Tomasz</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild><Link to="/manager/apartments/new"><Plus className="h-4 w-4 mr-2" />Dodaj mieszkanie</Link></Button>
          <Button variant="outline" asChild><Link to="/manager/payments/new"><Plus className="h-4 w-4 mr-2" />Dodaj płatność</Link></Button>
          <Button variant="outline" asChild><Link to="/manager/visits/new"><Plus className="h-4 w-4 mr-2" />Zaplanuj wizytę</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <s.icon className={`h-5 w-5 mb-3 ${s.color}`} />
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Najnowsze zgłoszenia</h2>
          <Button variant="ghost" size="sm" asChild><Link to="/manager/requests">Wszystkie <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
        </div>
        <div className="divide-y">
          {recent.map(r => {
            const apt = state.apartments.find(a => a.id === r.apartment_id);
            return (
              <Link key={r.id} to={`/manager/requests/${r.id}`} className="flex items-center gap-4 py-3 hover:bg-muted/50 -mx-2 px-2 rounded">
                <div className="font-mono text-xs text-muted-foreground w-28">{r.number}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{apt?.address}/{apt?.apartment_number}</div>
                </div>
                <PriorityBadge value={r.priority} />
                <StatusBadge value={r.status} />
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
