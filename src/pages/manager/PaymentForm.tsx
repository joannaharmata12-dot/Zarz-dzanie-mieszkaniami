import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, uid, notify } from "@/lib/store";
import type { PaymentStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const STATUSES: PaymentStatus[] = ["nierozliczona", "opłacona", "zaległa", "anulowana", "archiwalna"];

export default function PaymentForm() {
  const { state, setState } = useStore();
  const nav = useNavigate();
  const [apartmentId, setApartmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("nierozliczona");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const apt = state.apartments.find(a => a.id === apartmentId);
    const errs: string[] = [];
    if (!apt) errs.push("mieszkanie");
    else if (!apt.resident_id) errs.push("mieszkaniec (przypisz go do mieszkania)");
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) errs.push("kwota");
    if (!dueDate) errs.push("termin");
    if (!description.trim()) errs.push("opis");
    if (errs.length || !apt || !apt.resident_id) { toast.error("Uzupełnij wymagane pola: " + errs.join(", ")); return; }
    setState(s => ({
      ...s,
      payments: [{
        id: uid(), apartment_id: apt.id, resident_id: apt.resident_id!,
        amount: amt, due_date: dueDate, status, description,
        created_at: new Date().toISOString(),
      }, ...s.payments],
    }));
    notify(setState, apt.resident_id, "Nowa płatność", `Dodano płatność: ${description} (${amt} zł)`, "payment");
    toast.success("Dodano płatność");
    nav("/manager/payments");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Wróć</Button>
      <h1 className="text-3xl font-bold">Dodaj płatność</h1>
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Mieszkanie *</Label>
            <Select value={apartmentId} onValueChange={setApartmentId}>
              <SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger>
              <SelectContent>
                {state.apartments.filter(a => a.resident_id).map(a => {
                  const r = state.profiles.find(p => p.id === a.resident_id);
                  return <SelectItem key={a.id} value={a.id}>{a.address}/{a.apartment_number} — {r?.full_name}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Kwota (zł) *</Label><Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></div>
            <div className="space-y-2"><Label>Termin *</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Opis *</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="np. Czynsz – listopad" /></div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as PaymentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">Dodaj</Button>
            <Button type="button" variant="outline" onClick={() => nav(-1)}>Anuluj</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
