import { useState } from "react";
import { useStore } from "@/lib/store";
import type { CleaningStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CleaningBadge } from "@/components/Badges";
import { toast } from "sonner";

const STATUSES: CleaningStatus[] = ["nowe", "zaplanowane", "w realizacji", "zakończone", "anulowane"];

export default function CleaningPanel() {
  const { state, setState, userId } = useStore();
  const mine = state.cleaning.filter(c => c.cleaning_company_id === userId).sort((a, b) => b.planned_date.localeCompare(a.planned_date));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Panel firmy sprzątającej</p>
        <h1 className="text-3xl font-bold">Zlecenia sprzątania</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {mine.map(c => <Order key={c.id} order={c} />)}
        {mine.length === 0 && <div className="col-span-2 p-12 text-center text-muted-foreground">Brak zleceń.</div>}
      </div>
    </div>
  );
}

const Order = ({ order }: { order: any }) => {
  const { state, setState } = useStore();
  const apt = state.apartments.find(a => a.id === order.apartment_id);
  const [status, setStatus] = useState<CleaningStatus>(order.status);
  const [note, setNote] = useState(order.note || "");

  const save = () => {
    setState(s => ({ ...s, cleaning: s.cleaning.map(c => c.id === order.id ? { ...c, status, note: note || null } : c) }));
    toast.success("Zaktualizowano zlecenie");
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold">{apt?.address}/{apt?.apartment_number}</div>
          <div className="text-xs text-muted-foreground">{apt?.city}</div>
        </div>
        <CleaningBadge value={order.status} />
      </div>
      <p className="text-sm">{order.description}</p>
      <div className="text-xs text-muted-foreground">Preferowany termin: {new Date(order.planned_date).toLocaleDateString("pl-PL")}</div>
      <div className="grid gap-2 pt-2 border-t">
        <Select value={status} onValueChange={v => setStatus(v as CleaningStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Notatka po wykonaniu…" />
        <Button onClick={save} size="sm">Zapisz</Button>
      </div>
    </Card>
  );
};
