import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentBadge } from "@/components/Badges";
import { Plus } from "lucide-react";

export default function ManagerPayments() {
  const { state } = useStore();
  const list = [...state.payments].sort((a, b) => b.due_date.localeCompare(a.due_date));
  const overdue = list.filter(p => p.status === "zaległa").reduce((s, p) => s + p.amount, 0);
  const pending = list.filter(p => p.status === "nierozliczona").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Płatności</h1>
          <p className="text-muted-foreground">Zaległe: <span className="font-bold text-destructive">{overdue.toFixed(2)} zł</span> · Nierozliczone: <span className="font-bold">{pending.toFixed(2)} zł</span></p>
        </div>
        <Button asChild><Link to="/manager/payments/new"><Plus className="h-4 w-4 mr-2" />Dodaj płatność</Link></Button>
      </div>
      <Card>
        <div className="divide-y">
          {list.map(p => {
            const apt = state.apartments.find(a => a.id === p.apartment_id);
            const res = state.profiles.find(x => x.id === p.resident_id);
            return (
              <div key={p.id} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.description}</div>
                  <div className="text-xs text-muted-foreground">{apt?.address}/{apt?.apartment_number} · {res?.full_name} · termin {new Date(p.due_date).toLocaleDateString("pl-PL")}</div>
                </div>
                <div className="font-bold">{p.amount.toFixed(2)} zł</div>
                <PaymentBadge value={p.status} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
