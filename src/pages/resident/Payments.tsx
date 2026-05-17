import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Payment, PaymentStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentBadge } from "@/components/Badges";
import { Badge } from "@/components/ui/badge";
import HistoryTimeline from "@/components/HistoryTimeline";

export default function ResidentPayments() {
  const { state, userId } = useStore();
  const mine = state.payments.filter(p => p.resident_id === userId).sort((a, b) => b.due_date.localeCompare(a.due_date));
  const due = mine.filter(p => p.status === "nierozliczona" || p.status === "zaległa").reduce((s, p) => s + p.amount, 0);
  const [selected, setSelected] = useState<Payment | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moje płatności</h1>
        <p className="text-muted-foreground">Do zapłaty: <span className="font-bold text-foreground">{due.toFixed(2)} zł</span></p>
      </div>
      <Card>
        <div className="divide-y">
          {mine.map(p => (
            <button key={p.id} onClick={() => setSelected(p)} className="w-full text-left flex items-center justify-between gap-4 p-4 hover:bg-muted/40 transition">
              <div>
                <div className="font-medium">{p.description}</div>
                <div className="text-xs text-muted-foreground">Termin: {new Date(p.due_date).toLocaleDateString("pl-PL")}{p.recurring && <> · <Badge variant="outline" className="text-[10px]">cykliczna</Badge></>}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{p.amount.toFixed(2)} zł</div>
                <PaymentBadge value={p.status} />
              </div>
            </button>
          ))}
          {mine.length === 0 && <div className="p-8 text-center text-muted-foreground">Brak płatności.</div>}
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Szczegóły płatności</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Opis" value={selected.description} />
                <Detail label="Kwota" value={`${selected.amount.toFixed(2)} zł`} />
                <Detail label="Termin" value={new Date(selected.due_date).toLocaleDateString("pl-PL")} />
                <Detail label="Status" value={<PaymentBadge value={selected.status} />} />
                <Detail label="Typ" value={selected.recurring ? "cykliczna" : "jednorazowa"} />
                <Detail label="Utworzono" value={new Date(selected.created_at).toLocaleDateString("pl-PL")} />
              </div>
              <div className="pt-3 border-t">
                <HistoryTimeline title="Historia statusu" history={selected.status_history || []} renderBadge={(v) => <PaymentBadge value={v as PaymentStatus} />} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);
