import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore, uid } from "@/lib/store";
import type { Payment, PaymentStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { PaymentBadge } from "@/components/Badges";
import HistoryTimeline from "@/components/HistoryTimeline";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Plus, Repeat } from "lucide-react";
import { toast } from "sonner";

const STATUSES: PaymentStatus[] = ["nierozliczona", "opłacona", "zaległa", "anulowana", "archiwalna"];
const MONTHS = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"];

export default function ManagerPayments() {
  const { state, setState, userId } = useStore();
  const me = state.profiles.find(p => p.id === userId);
  const list = [...state.payments].sort((a, b) => b.due_date.localeCompare(a.due_date));

  const [fRes, setFRes] = useState("all");
  const [fApt, setFApt] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [selected, setSelected] = useState<Payment | null>(null);
  const [newStatus, setNewStatus] = useState<PaymentStatus>("nierozliczona");
  const [confirmChange, setConfirmChange] = useState(false);

  const [recOpen, setRecOpen] = useState(false);
  const [recApt, setRecApt] = useState("");
  const [recAmount, setRecAmount] = useState("2800");
  const [recMonths, setRecMonths] = useState("3");

  const filtered = useMemo(() => list.filter(p =>
    (fRes === "all" || p.resident_id === fRes) &&
    (fApt === "all" || p.apartment_id === fApt) &&
    (fStatus === "all" || p.status === fStatus)
  ), [list, fRes, fApt, fStatus]);

  const overdue = filtered.filter(p => p.status === "zaległa").reduce((s, p) => s + p.amount, 0);
  const pending = filtered.filter(p => p.status === "nierozliczona").reduce((s, p) => s + p.amount, 0);

  const residents = state.profiles.filter(p => p.role === "resident");
  const apartments = state.apartments;

  const changeStatus = () => {
    if (!selected) return;
    const now = new Date().toISOString();
    setState(s => ({
      ...s,
      payments: s.payments.map(x => x.id === selected.id ? {
        ...x, status: newStatus,
        status_history: [...(x.status_history || []), {
          at: now, from: x.status, to: newStatus,
          by_role: "manager", by_name: me?.full_name || "Zarządca",
        }],
      } : x),
    }));
    toast.success(`Status zmieniony na "${newStatus}"`);
    setConfirmChange(false);
    setSelected(null);
  };

  const generateRecurring = () => {
    const apt = state.apartments.find(a => a.id === recApt);
    const n = parseInt(recMonths);
    const amt = parseFloat(recAmount);
    if (!apt || !apt.resident_id || !n || !amt) { toast.error("Uzupełnij dane"); return; }
    const now = new Date().toISOString();
    const today = new Date();
    const newPayments: Payment[] = [];
    for (let i = 1; i <= n; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 10);
      newPayments.push({
        id: uid(), apartment_id: apt.id, resident_id: apt.resident_id!,
        amount: amt, due_date: d.toISOString().slice(0, 10),
        status: "nierozliczona", description: `Czynsz – ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        recurring: true, created_at: now,
        status_history: [{ at: now, from: null, to: "nierozliczona", by_role: "manager", by_name: me?.full_name || "Zarządca", note: "Wygenerowano cyklicznie" }],
      });
    }
    setState(s => ({ ...s, payments: [...newPayments, ...s.payments] }));
    toast.success(`Wygenerowano ${n} płatności`);
    setRecOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Płatności</h1>
          <p className="text-muted-foreground">Zaległe: <span className="font-bold text-destructive">{overdue.toFixed(2)} zł</span> · Nierozliczone: <span className="font-bold">{pending.toFixed(2)} zł</span></p>
        </div>
        <div className="flex gap-2">
          <Dialog open={recOpen} onOpenChange={setRecOpen}>
            <DialogTrigger asChild><Button variant="outline"><Repeat className="h-4 w-4 mr-2" />Czynsz cykliczny</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generuj czynsz miesięczny</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2"><Label>Mieszkanie *</Label>
                  <Select value={recApt} onValueChange={setRecApt}>
                    <SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger>
                    <SelectContent>{apartments.filter(a => a.resident_id).map(a => <SelectItem key={a.id} value={a.id}>{a.address}/{a.apartment_number}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Kwota miesięczna *</Label><Input type="number" value={recAmount} onChange={e => setRecAmount(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Liczba miesięcy *</Label><Input type="number" min="1" max="24" value={recMonths} onChange={e => setRecMonths(e.target.value)} /></div>
                </div>
                <p className="text-xs text-muted-foreground">Termin każdej płatności: 10. dzień miesiąca.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRecOpen(false)}>Anuluj</Button>
                <Button onClick={generateRecurring}>Wygeneruj</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild><Link to="/manager/payments/new"><Plus className="h-4 w-4 mr-2" />Dodaj płatność</Link></Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div><Label className="text-xs">Mieszkaniec</Label>
            <Select value={fRes} onValueChange={setFRes}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="all">Wszyscy</SelectItem>{residents.map(r => <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div><Label className="text-xs">Mieszkanie</Label>
            <Select value={fApt} onValueChange={setFApt}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>{apartments.map(a => <SelectItem key={a.id} value={a.id}>{a.address}/{a.apartment_number}</SelectItem>)}</SelectContent></Select>
          </div>
          <div><Label className="text-xs">Status</Label>
            <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="divide-y">
          {filtered.map(p => {
            const apt = state.apartments.find(a => a.id === p.apartment_id);
            const res = state.profiles.find(x => x.id === p.resident_id);
            return (
              <button key={p.id} onClick={() => { setSelected(p); setNewStatus(p.status); }} className="w-full text-left p-4 flex items-center gap-4 hover:bg-muted/40 transition">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate flex items-center gap-2">{p.description}{p.recurring && <Repeat className="h-3 w-3 text-muted-foreground" />}</div>
                  <div className="text-xs text-muted-foreground">{apt?.address}/{apt?.apartment_number} · {res?.full_name} · termin {new Date(p.due_date).toLocaleDateString("pl-PL")}</div>
                </div>
                <div className="font-bold">{p.amount.toFixed(2)} zł</div>
                <PaymentBadge value={p.status} />
              </button>
            );
          })}
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">Brak płatności pasujących do filtrów.</div>}
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
              </div>
              <div className="space-y-2 pt-3 border-t">
                <Label>Zmień status</Label>
                <div className="flex gap-2">
                  <Select value={newStatus} onValueChange={v => setNewStatus(v as PaymentStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button onClick={() => setConfirmChange(true)} disabled={newStatus === selected.status}>Zapisz</Button>
                </div>
              </div>
              <div className="pt-3 border-t">
                <HistoryTimeline title="Historia statusu" history={selected.status_history || []} renderBadge={(v) => <PaymentBadge value={v as PaymentStatus} />} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmChange}
        onOpenChange={setConfirmChange}
        title="Zmienić status płatności?"
        description={`Nowy status: "${newStatus}". Poprzednie statusy zostaną zachowane w historii.`}
        onConfirm={changeStatus}
      />
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);
