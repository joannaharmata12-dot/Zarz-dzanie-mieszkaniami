import { useMemo, useState } from "react";
import { useStore, notify } from "@/lib/store";
import type { CleaningOrder, CleaningStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CleaningBadge } from "@/components/Badges";
import HistoryTimeline from "@/components/HistoryTimeline";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";

const STATUSES: CleaningStatus[] = ["nowe", "zaplanowane", "w realizacji", "zakończone", "anulowane", "propozycja zmiany"];

export default function CleaningPanel() {
  const { state, setState, userId } = useStore();
  const me = state.profiles.find(p => p.id === userId);
  const manager = state.profiles.find(p => p.role === "manager");
  const mine = state.cleaning.filter(c => c.cleaning_company_id === userId).sort((a, b) => b.planned_date.localeCompare(a.planned_date));
  const active = mine.filter(c => !["zakończone", "anulowane"].includes(c.status));
  const archived = mine.filter(c => ["zakończone", "anulowane"].includes(c.status));

  const [tab, setTab] = useState<"active" | "archived">("active");
  const [fStatus, setFStatus] = useState("all");
  const [selected, setSelected] = useState<CleaningOrder | null>(null);
  const [editStatus, setEditStatus] = useState<CleaningStatus>("nowe");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [proposeOpen, setProposeOpen] = useState(false);
  const [propDate, setPropDate] = useState("");
  const [acceptConfirm, setAcceptConfirm] = useState(false);
  const [completeConfirm, setCompleteConfirm] = useState(false);

  const source = tab === "active" ? active : archived;
  const filtered = useMemo(() => source.filter(c => fStatus === "all" || c.status === fStatus), [source, fStatus]);

  const open = (c: CleaningOrder) => {
    setSelected(c); setEditStatus(c.status); setEditDate(c.planned_date.slice(0, 10)); setEditNote(c.note || "");
  };

  const apply = (c: CleaningOrder, patch: Partial<CleaningOrder>, toStatus: CleaningStatus, note?: string) => {
    const now = new Date().toISOString();
    setState(s => ({
      ...s,
      cleaning: s.cleaning.map(x => x.id === c.id ? {
        ...x, ...patch,
        status_history: [...(x.status_history || []), { at: now, from: x.status, to: toStatus, by_role: "cleaning", by_name: me?.full_name || "Sprzątanie", note }],
      } : x),
    }));
    if (manager) notify(setState, manager.id, "Sprzątanie", note || `Zmiana statusu: ${toStatus}`, "cleaning");
  };

  const save = () => {
    if (!selected) return;
    apply(selected, { status: editStatus, planned_date: editDate, note: editNote || null }, editStatus, "Edycja zlecenia");
    toast.success("Zapisano");
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Panel firmy sprzątającej</p>
        <h1 className="text-3xl font-bold">Zlecenia sprzątania</h1>
      </div>

      <Tabs value={tab} onValueChange={v => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="active">Aktywne ({active.length})</TabsTrigger>
          <TabsTrigger value="archived">Zarchiwizowane ({archived.length})</TabsTrigger>
        </TabsList>

        <Card className="p-4 mt-4">
          <Label className="text-xs">Status</Label>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </Card>

        <TabsContent value={tab} className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(c => {
              const apt = state.apartments.find(a => a.id === c.apartment_id);
              return (
                <Card key={c.id} className="p-5 space-y-3 hover:border-accent transition cursor-pointer" onClick={() => open(c)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold">{apt?.address}/{apt?.apartment_number}</div>
                      <div className="text-xs text-muted-foreground">{apt?.city}</div>
                    </div>
                    <CleaningBadge value={c.status} />
                  </div>
                  <p className="text-sm">{c.description}</p>
                  <div className="text-xs text-muted-foreground">Termin: {new Date(c.planned_date).toLocaleDateString("pl-PL")}</div>
                  {c.note && <div className="text-xs italic text-muted-foreground">„{c.note}”</div>}
                </Card>
              );
            })}
            {filtered.length === 0 && <div className="col-span-2 p-12 text-center text-muted-foreground">Brak zleceń.</div>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Szczegóły zlecenia</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <p>{selected.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Status</Label>
                  <Select value={editStatus} onValueChange={v => setEditStatus(v as CleaningStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Termin</Label><Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Notatka po wykonaniu</Label><Textarea rows={2} value={editNote} onChange={e => setEditNote(e.target.value)} /></div>

              <div className="flex gap-2 flex-wrap pt-3 border-t">
                {selected.status === "nowe" && <Button size="sm" onClick={() => setAcceptConfirm(true)}>Zaakceptuj termin</Button>}
                <Button size="sm" variant="outline" onClick={() => setProposeOpen(true)}>Poproś o zmianę terminu</Button>
                {selected.status !== "zakończone" && <Button size="sm" variant="outline" onClick={() => setCompleteConfirm(true)}>Oznacz jako zakończone</Button>}
              </div>

              <div className="pt-3 border-t">
                <HistoryTimeline history={selected.status_history || []} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Zamknij</Button>
            <Button onClick={save}>Zapisz zmiany</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={proposeOpen} onOpenChange={setProposeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Zaproponuj nowy termin</DialogTitle></DialogHeader>
          <div className="space-y-2"><Label>Nowy termin *</Label><Input type="date" value={propDate} onChange={e => setPropDate(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProposeOpen(false)}>Anuluj</Button>
            <Button onClick={() => {
              if (!selected || !propDate) { toast.error("Wybierz datę"); return; }
              apply(selected, { status: "propozycja zmiany", proposed_date_by_company: propDate }, "propozycja zmiany", `Firma proponuje ${new Date(propDate).toLocaleDateString("pl-PL")}`);
              toast.success("Propozycja wysłana");
              setProposeOpen(false); setPropDate(""); setSelected(null);
            }}>Wyślij propozycję</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={acceptConfirm} onOpenChange={setAcceptConfirm}
        title="Zaakceptować zlecenie?" confirmLabel="Akceptuję"
        onConfirm={() => { if (selected) { apply(selected, { status: "zaplanowane" }, "zaplanowane", "Firma zaakceptowała termin"); toast.success("Zaakceptowano"); } setAcceptConfirm(false); setSelected(null); }}
      />
      <ConfirmDialog
        open={completeConfirm} onOpenChange={setCompleteConfirm}
        title="Oznaczyć jako zakończone?" description="Zlecenie trafi do archiwum."
        onConfirm={() => { if (selected) { apply(selected, { status: "zakończone", note: editNote || null }, "zakończone", editNote || "Wykonano"); toast.success("Zlecenie zakończone"); } setCompleteConfirm(false); setSelected(null); }}
      />
    </div>
  );
}
