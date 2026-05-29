import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore, notify } from "@/lib/store";
import type { Visit, VisitStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { VisitBadge } from "@/components/Badges";
import HistoryTimeline from "@/components/HistoryTimeline";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const STATUSES: VisitStatus[] = ["zaplanowana", "przełożona", "zrealizowana", "anulowana", "propozycja zmiany"];

export default function ManagerVisits() {
  const { state, setState, userId } = useStore();
  const me = state.profiles.find(p => p.id === userId);
  const list = [...state.visits].sort((a, b) => b.date.localeCompare(a.date));
  const [selected, setSelected] = useState<Visit | null>(null);
  const [date, setDate] = useState(""); const [time, setTime] = useState("");
  const [status, setStatus] = useState<VisitStatus>("zaplanowana");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [propDate, setPropDate] = useState("");

  const openVisit = (v: Visit) => {
    setSelected(v); setDate(v.date.slice(0, 10)); setTime(v.time); setStatus(v.status);
  };

  const apply = (patch: Partial<Visit>, toStatus: VisitStatus, note?: string) => {
    if (!selected) return;
    const now = new Date().toISOString();
    setState(s => ({
      ...s,
      visits: s.visits.map(x => x.id === selected.id ? {
        ...x, ...patch,
        status_history: [...(x.status_history || []), { at: now, from: x.status, to: toStatus, by_role: "manager", by_name: me?.full_name || "Zarządca", note }],
      } : x),
    }));
    if (selected.resident_id) notify(setState, selected.resident_id, "Aktualizacja wizyty", note || `Wizyta: ${toStatus}`, "visit");
  };

  const save = () => {
    apply({ date, time, status }, status, "Edycja przez zarządcę");
    toast.success("Zapisano zmiany");
    setSelected(null);
  };

  const acceptProposed = () => {
    if (!selected?.alternative_date) return;
    apply({ date: selected.alternative_date, status: "zaplanowana", alternative_date: null, proposed_by_resident: null }, "zaplanowana", "Zaakceptowano propozycję mieszkańca");
    toast.success("Termin zaakceptowany");
    setSelected(null);
  };

  const rejectProposed = () => {
    apply({ status: "zaplanowana", alternative_date: null, proposed_by_resident: null }, "zaplanowana", "Odrzucono propozycję mieszkańca");
    toast.success("Propozycja odrzucona");
    setSelected(null);
  };

  const sendCounterProposal = () => {
    if (!selected || !propDate) { toast.error("Wybierz datę"); return; }
    apply({ status: "propozycja zmiany", alternative_date: propDate, proposed_by_resident: null }, "propozycja zmiany", `Zarządca proponuje ${new Date(propDate).toLocaleDateString("pl-PL")}`);
    toast.success("Propozycja wysłana do mieszkańca");
    setProposeOpen(false); setPropDate(""); setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-3xl font-bold">Wizyty kontrolne</h1><p className="text-muted-foreground">{list.length} wizyt</p></div>
        <Button asChild><Link to="/manager/visits/new"><Plus className="h-4 w-4 mr-2" />Zaplanuj wizytę</Link></Button>
      </div>
      <Card><div className="divide-y">
        {list.map(v => {
          const apt = state.apartments.find(a => a.id === v.apartment_id);
          return (
            <button key={v.id} onClick={() => openVisit(v)} className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-muted/40 transition">
              <div>
                <div className="font-medium">{v.purpose}</div>
                <div className="text-xs text-muted-foreground">{apt?.address}/{apt?.apartment_number} · {new Date(v.date).toLocaleDateString("pl-PL")} {v.time} · {v.inspector}</div>
              </div>
              <VisitBadge value={v.status} />
            </button>
          );
        })}
        {list.length === 0 && <div className="p-8 text-center text-muted-foreground">Brak wizyt.</div>}
      </div></Card>

      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edycja wizyty</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {selected.status === "propozycja zmiany" && selected.alternative_date && (
                <Card className="p-3 border-warning/40 bg-warning/10 space-y-2">
                  <div>Mieszkaniec proponuje: <span className="font-bold">{new Date(selected.alternative_date).toLocaleDateString("pl-PL")}</span></div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={acceptProposed}>Zaakceptuj</Button>
                    <Button size="sm" variant="outline" onClick={rejectProposed}>Odrzuć</Button>
                  </div>
                </Card>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Data</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>Godzina</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={status} onValueChange={v => setStatus(v as VisitStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="pt-3 border-t">
                <HistoryTimeline history={selected.status_history || []} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelConfirm(true)}>Anuluj wizytę</Button>
            <Button onClick={save}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelConfirm}
        onOpenChange={setCancelConfirm}
        title="Anulować wizytę?"
        destructive
        confirmLabel="Anuluj wizytę"
        onConfirm={() => { apply({ status: "anulowana" }, "anulowana", "Anulowane przez zarządcę"); toast.success("Wizyta anulowana"); setCancelConfirm(false); setSelected(null); }}
      />
    </div>
  );
}
