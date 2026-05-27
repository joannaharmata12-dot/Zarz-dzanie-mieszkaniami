import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge, PaymentBadge, VisitBadge, LeaseRequestBadge } from "@/components/Badges";
import { Building2, AlertTriangle, CreditCard, ClipboardList, Plus, ArrowRight, BellRing } from "lucide-react";

export default function ManagerDashboard() {
  const { state, userId } = useStore();
  const me = state.profiles.find(p => p.id === userId);
  const apts = state.apartments.filter(a => a.manager_id === userId);
  const newReq = state.requests.filter(r => r.status === "nowe");
  const critical = state.requests.filter(r => r.priority === "krytyczny" && r.status !== "zakończone" && r.status !== "anulowane" && r.status !== "archiwalne");
  const overdue = state.payments.filter(p => p.status === "zaległa");
  const visitProposals = state.visits.filter(v => v.status === "propozycja zmiany");
  const cleaningProposals = state.cleaning.filter(c => c.status === "propozycja zmiany");
  const leaseRequests = state.leases.filter(l => l.request_status === "nowy" || l.request_status === "w analizie");
  const recent = [...state.requests].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);

  const stats = [
    { label: "Mieszkania", value: apts.length, icon: Building2, color: "text-accent" },
    { label: "Nowe zgłoszenia", value: newReq.length, icon: ClipboardList, color: "text-info" },
    { label: "Krytyczne", value: critical.length, icon: AlertTriangle, color: "text-destructive" },
    { label: "Zaległe płatności", value: overdue.length, icon: CreditCard, color: "text-warning" },
  ];

  const actionItems = [
    ...newReq.map(r => ({ key: `req-${r.id}`, label: `Nowe zgłoszenie ${r.number}: ${r.title}`, to: `/manager/requests/${r.id}`, badge: <StatusBadge value={r.status} /> })),
    ...critical.map(r => ({ key: `crit-${r.id}`, label: `Krytyczne: ${r.title}`, to: `/manager/requests/${r.id}`, badge: <PriorityBadge value={r.priority} /> })),
    ...overdue.map(p => ({ key: `pay-${p.id}`, label: `Zaległa płatność: ${p.description} (${p.amount.toFixed(2)} zł)`, to: `/manager/payments`, badge: <PaymentBadge value={p.status} /> })),
    ...visitProposals.map(v => ({ key: `vis-${v.id}`, label: `Propozycja zmiany terminu wizyty (${v.purpose})`, to: `/manager/visits`, badge: <VisitBadge value={v.status} /> })),
    ...cleaningProposals.map(c => ({ key: `cln-${c.id}`, label: `Propozycja zmiany terminu sprzątania`, to: `/cleaning`, badge: null })),
    ...leaseRequests.map(l => ({ key: `lse-${l.id}`, label: `Wniosek najmu: ${l.request_type}`, to: `/manager/apartments/${l.apartment_id}`, badge: <LeaseRequestBadge value={l.request_status} /> })),
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Panel zarządcy</p>
          <h1 className="text-3xl font-bold">Witaj, {me?.full_name || "Zarządca"}</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild><Link to="/manager/requests/new"><Plus className="h-4 w-4 mr-2" />Nowe zgłoszenie</Link></Button>
          <Button variant="outline" asChild><Link to="/manager/apartments/new"><Plus className="h-4 w-4 mr-2" />Dodaj mieszkanie</Link></Button>
          <Button variant="outline" asChild><Link to="/manager/residents"><Plus className="h-4 w-4 mr-2" />Mieszkańcy</Link></Button>
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

      <Card className="p-6 border-warning/40">
        <div className="flex items-center gap-2 mb-4">
          <BellRing className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-bold">Wymaga reakcji</h2>
          <span className="ml-auto text-sm text-muted-foreground">{actionItems.length} pozycji</span>
        </div>
        {actionItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Wszystko pod kontrolą.</p>
        ) : (
          <div className="divide-y">
            {actionItems.slice(0, 10).map(a => (
              <Link key={a.key} to={a.to} className="flex items-center gap-3 py-2.5 hover:bg-muted/40 -mx-2 px-2 rounded">
                <div className="flex-1 text-sm truncate">{a.label}</div>
                {a.badge}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </Card>

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
