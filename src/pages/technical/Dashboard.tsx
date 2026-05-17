import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { Wrench, ArrowRight } from "lucide-react";

export default function TechnicalDashboard() {
  const { state, userId } = useStore();
  const mine = state.requests.filter(r => r.assigned_company_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const active = mine.filter(r => !["zakończone", "anulowane"].includes(r.status));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Panel firmy technicznej</p>
        <h1 className="text-3xl font-bold">Przypisane zgłoszenia</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><Wrench className="h-5 w-5 text-accent mb-2" /><div className="text-2xl font-bold">{active.length}</div><div className="text-xs text-muted-foreground">Aktywne</div></div>
        <div className="stat-card"><div className="text-2xl font-bold">{mine.filter(r => r.priority === "krytyczny" && r.status !== "zakończone").length}</div><div className="text-xs text-muted-foreground">Krytyczne</div></div>
        <div className="stat-card"><div className="text-2xl font-bold">{mine.filter(r => r.status === "zakończone").length}</div><div className="text-xs text-muted-foreground">Zakończone</div></div>
      </div>

      <Card>
        {mine.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Brak przypisanych zgłoszeń.</div>
        ) : (
          <div className="divide-y">
            {mine.map(r => {
              const apt = state.apartments.find(a => a.id === r.apartment_id);
              const res = state.profiles.find(p => p.id === r.resident_id);
              return (
                <Link key={r.id} to={`/technical/${r.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40">
                  <div className="font-mono text-xs text-muted-foreground w-28">{r.number}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{apt?.address}/{apt?.apartment_number}, {apt?.city} · {res?.full_name}</div>
                  </div>
                  <PriorityBadge value={r.priority} />
                  <StatusBadge value={r.status} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
