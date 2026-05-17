import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { PaymentBadge } from "@/components/Badges";

export default function ResidentPayments() {
  const { state, userId } = useStore();
  const mine = state.payments.filter(p => p.resident_id === userId).sort((a, b) => b.due_date.localeCompare(a.due_date));
  const due = mine.filter(p => p.status === "nierozliczona" || p.status === "zaległa").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moje płatności</h1>
        <p className="text-muted-foreground">Do zapłaty: <span className="font-bold text-foreground">{due.toFixed(2)} zł</span></p>
      </div>
      <Card>
        <div className="divide-y">
          {mine.map(p => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-medium">{p.description}</div>
                <div className="text-xs text-muted-foreground">Termin: {new Date(p.due_date).toLocaleDateString("pl-PL")}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{p.amount.toFixed(2)} zł</div>
                <PaymentBadge value={p.status} />
              </div>
            </div>
          ))}
          {mine.length === 0 && <div className="p-8 text-center text-muted-foreground">Brak płatności.</div>}
        </div>
      </Card>
    </div>
  );
}
