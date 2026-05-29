import { useState } from "react";
import { useStore, notify } from "@/lib/store";
import type { Visit, VisitStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { VisitBadge } from "@/components/Badges";
import HistoryTimeline from "@/components/HistoryTimeline";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";

export default function ResidentVisits() {
  const { state, setState, userId } = useStore();
  const me = state.profiles.find(p => p.id === userId);
  const manager = state.profiles.find(p => p.role === "manager");
  const mine = state.visits.filter(v => v.resident_id === userId).sort((a, b) => b.date.localeCompare(a.date));
  const [selected, setSelected] = useState<Visit | null>(null);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [altDate, setAltDate] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [acceptConfirm, setAcceptConfirm] = useState(false);

  const apt = selected ? state.apartments.find(a => a.id === selected.apartment_id) : null;

  const updateVisit = (v: Visit, patch: Partial<Visit>, toStatus: VisitStatus, note?: string) => {
    const now = new Date().toISOString();
    setState(s => ({
      ...s,
      visits: s.visits.map(x => x.id === v.id ? {
        ...x, ...patch,
        status_history: [...(x.status_history || []), {
          at: now, from: x.status, to: toStatus,
          by_role: "resident", by_name: me?.full_name || "Mieszkaniec", note,
        }],
      } : x),
    }));
    if (manager) notify(setState, manager.id, "Aktualizacja wizyty", `Mieszkaniec: ${note || toStatus}`, "visit");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wizyty kontrolne</h1>
      <Card>
        <div className="divide-y">
          {mine.map(v => (
            <button key={v.id} onClick={() => setSelected(v)} className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-muted/40 transition">
              <div>
                <div className="font-medium">{v.purpose}</div>
                <div className="text-xs text-muted-foreground">{new Date(v.date).toLocaleDateString("pl-PL")} o {v.time} · {v.inspector}</div>
              </div>
              <VisitBadge value={v.status} />
            </button>
          ))}
          {mine.length === 0 && <div className="p-8 text-center text-muted-foreground">Brak zaplanowanych wizyt.</div>}
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Szczegóły wizyty</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Cel" value={selected.purpose} />
                <Detail label="Status" value={<VisitBadge value={selected.status} />} />
                <Detail label="Data" value={new Date(selected.date).toLocaleDateString("pl-PL")} />
                <Detail label="Godzina" value={selected.time} />
                <Detail label="Osoba kontaktowa" value={selected.inspector} />
                <Detail label="Telefon" value={selected.contact_phone || "—"} />
                <Detail label="Mieszkanie" value={apt ? `${apt.address}/${apt.apartment_number}` : "—"} />
              </div>

              {selected.status === "propozycja zmiany" && selected.alternative_date && !selected.proposed_by_resident && (
                <Card className="p-3 border-warning/40 bg-warning/10 space-y-2">
                  <div>Zarządca proponuje termin: <span className="font-bold">{new Date(selected.alternative_date).toLocaleDateString("pl-PL")}</span></div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => setAcceptConfirm(true)}>Zaakceptuj</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      updateVisit(selected, { status: "zaplanowana", alternative_date: null }, "zaplanowana", "Mieszkaniec odrzucił propozycję zarządcy");
                      toast.success("Propozycja odrzucona");
                      setSelected(null);
                    }}>Odrzuć</Button>
                    <Button size="sm" variant="outline" onClick={() => setProposeOpen(true)}>Zaproponuj inny termin</Button>
                  </div>
                </Card>
              )}

              {selected.status === "propozycja zmiany" && selected.proposed_by_resident && (
                <Card className="p-3 border-info/40 bg-info/10 space-y-1">
                  <div>Twoja propozycja terminu: <span className="font-bold">{new Date(selected.proposed_by_resident).toLocaleDateString("pl-PL")}</span></div>
                  <div className="text-xs text-muted-foreground">Oczekiwanie na decyzję zarządcy.</div>
                </Card>
              )}

              {(selected.status === "zaplanowana" || selected.status === "przełożona") && (
                <div className="flex gap-2 flex-wrap pt-3 border-t">
                  <Button size="sm" onClick={() => setAcceptConfirm(true)}>Potwierdź termin</Button>
                  <Button size="sm" variant="outline" onClick={() => setProposeOpen(true)}>Zaproponuj inny termin</Button>
                  <Button size="sm" variant="outline" onClick={() => setCancelConfirm(true)}>Anuluj wizytę</Button>
                </div>
              )}
              {selected.status === "propozycja zmiany" && (
                <div className="pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => setCancelConfirm(true)}>Anuluj wizytę</Button>
                </div>
              )}
              <div className="pt-3 border-t">
                <HistoryTimeline history={selected.status_history || []} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={proposeOpen} onOpenChange={setProposeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Zaproponuj inny termin</DialogTitle></DialogHeader>
          <div className="space-y-2"><Label>Nowa proponowana data *</Label><Input type="date" value={altDate} onChange={e => setAltDate(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProposeOpen(false)}>Anuluj</Button>
            <Button onClick={() => {
              if (!altDate || !selected) { toast.error("Wybierz datę"); return; }
              updateVisit(selected, { status: "propozycja zmiany", alternative_date: altDate, proposed_by_resident: altDate }, "propozycja zmiany", `Mieszkaniec proponuje ${new Date(altDate).toLocaleDateString("pl-PL")}`);
              toast.success("Propozycja wysłana");
              setProposeOpen(false); setSelected(null); setAltDate("");
            }}>Wyślij propozycję</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={acceptConfirm}
        onOpenChange={setAcceptConfirm}
        title="Zaakceptować termin wizyty?"
        confirmLabel="Akceptuję"
        onConfirm={() => {
          if (!selected) return;
          updateVisit(selected, { status: "zaplanowana", alternative_date: null }, "zaplanowana", "Mieszkaniec zaakceptował termin");
          toast.success("Termin zaakceptowany");
          setAcceptConfirm(false); setSelected(null);
        }}
      />

      <ConfirmDialog
        open={cancelConfirm}
        onOpenChange={setCancelConfirm}
        title="Anulować wizytę?"
        description="Zarządca otrzyma powiadomienie."
        destructive
        confirmLabel="Anuluj wizytę"
        onConfirm={() => {
          if (!selected) return;
          updateVisit(selected, { status: "anulowana" }, "anulowana", "Anulowane przez mieszkańca");
          toast.success("Wizyta anulowana");
          setCancelConfirm(false); setSelected(null);
        }}
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
