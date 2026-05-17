import { useState } from "react";
import { useStore, notify } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { LeaseRequestBadge } from "@/components/Badges";
import HistoryTimeline from "@/components/HistoryTimeline";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";

export default function ResidentLease() {
  const { state, setState, userId } = useStore();
  const lease = state.leases.find(l => l.resident_id === userId);
  const apt = state.apartments.find(a => a.id === lease?.apartment_id);
  const manager = state.profiles.find(p => p.role === "manager");
  const me = state.profiles.find(p => p.id === userId);

  const [extOpen, setExtOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<null | "przedłużenie" | "rezygnacja">(null);

  const [newEnd, setNewEnd] = useState("");
  const [extComment, setExtComment] = useState("");
  const [resignDate, setResignDate] = useState("");
  const [resignReason, setResignReason] = useState("");
  const [resignComment, setResignComment] = useState("");

  if (!lease) return <div className="p-6">Brak aktywnej umowy.</div>;

  const busy = lease.request_status === "nowy" || lease.request_status === "w analizie";

  const submit = () => {
    if (!confirmType) return;
    const now = new Date().toISOString();
    const patch: any = { request_status: "nowy", request_type: confirmType };
    if (confirmType === "przedłużenie") {
      patch.request_proposed_new_end = newEnd;
      patch.request_comment = extComment;
      patch.request_proposed_end_date = null;
      patch.request_reason = null;
    } else {
      patch.request_proposed_end_date = resignDate;
      patch.request_reason = resignReason;
      patch.request_comment = resignComment;
      patch.request_proposed_new_end = null;
    }
    setState(s => ({
      ...s,
      leases: s.leases.map(l => l.id === lease.id ? {
        ...l, ...patch,
        request_history: [...(l.request_history || []), {
          at: now, from: l.request_status, to: "nowy",
          by_role: "resident", by_name: me?.full_name || "Mieszkaniec",
          note: `Wniosek: ${confirmType}`,
        }],
      } : l),
    }));
    if (manager) notify(setState, manager.id, "Nowy wniosek najmu", `Mieszkaniec złożył wniosek o ${confirmType}.`, "lease");
    toast.success(`Wniosek o ${confirmType} został wysłany`);
    setConfirmType(null);
    setExtOpen(false);
    setEndOpen(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Moja umowa najmu</h1>
      <Card className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Detail label="Mieszkanie" value={apt ? `${apt.address}/${apt.apartment_number}, ${apt.city}` : "—"} />
          <Detail label="Status umowy" value={lease.status} />
          <Detail label="Data rozpoczęcia" value={new Date(lease.start_date).toLocaleDateString("pl-PL")} />
          <Detail label="Data zakończenia" value={new Date(lease.end_date).toLocaleDateString("pl-PL")} />
        </div>
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground">Status wniosku</div>
            <LeaseRequestBadge value={lease.request_status} />
          </div>
          {lease.request_type !== "brak" && (
            <div className="text-sm mb-3 space-y-1">
              <div>Typ wniosku: <span className="font-medium">{lease.request_type}</span></div>
              {lease.request_proposed_new_end && <div>Proponowany nowy koniec: <span className="font-medium">{new Date(lease.request_proposed_new_end).toLocaleDateString("pl-PL")}</span></div>}
              {lease.request_proposed_end_date && <div>Proponowana data zakończenia: <span className="font-medium">{new Date(lease.request_proposed_end_date).toLocaleDateString("pl-PL")}</span></div>}
              {lease.request_reason && <div>Powód: <span className="font-medium">{lease.request_reason}</span></div>}
              {lease.request_comment && <div className="text-muted-foreground">„{lease.request_comment}”</div>}
            </div>
          )}
          <div className="flex gap-3 flex-wrap">
            <Dialog open={extOpen} onOpenChange={setExtOpen}>
              <DialogTrigger asChild><Button disabled={busy}>Wniosek o przedłużenie</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Wniosek o przedłużenie umowy</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Detail label="Aktualna data końca umowy" value={new Date(lease.end_date).toLocaleDateString("pl-PL")} />
                  <div className="space-y-2"><Label>Proponowana nowa data końca *</Label><Input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Komentarz</Label><Textarea rows={3} value={extComment} onChange={e => setExtComment(e.target.value)} placeholder="np. Chciałbym przedłużyć o rok…" /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setExtOpen(false)}>Anuluj</Button>
                  <Button onClick={() => { if (!newEnd) { toast.error("Podaj nową datę końca"); return; } setConfirmType("przedłużenie"); }}>Wyślij wniosek</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={endOpen} onOpenChange={setEndOpen}>
              <DialogTrigger asChild><Button variant="outline" disabled={busy}>Wniosek o rezygnację</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Wniosek o rezygnację z najmu</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2"><Label>Proponowana data zakończenia *</Label><Input type="date" value={resignDate} onChange={e => setResignDate(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Powód rezygnacji *</Label><Input value={resignReason} onChange={e => setResignReason(e.target.value)} placeholder="np. Zmiana miejsca pracy" /></div>
                  <div className="space-y-2"><Label>Komentarz</Label><Textarea rows={3} value={resignComment} onChange={e => setResignComment(e.target.value)} /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEndOpen(false)}>Anuluj</Button>
                  <Button onClick={() => { if (!resignDate || !resignReason.trim()) { toast.error("Uzupełnij datę i powód"); return; } setConfirmType("rezygnacja"); }}>Wyślij wniosek</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {(lease.request_history || []).length > 0 && (
        <Card className="p-6">
          <HistoryTimeline title="Historia wniosków" history={lease.request_history} />
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmType}
        onOpenChange={(v) => !v && setConfirmType(null)}
        title="Czy na pewno chcesz wysłać wniosek?"
        description={`Wniosek o ${confirmType} zostanie przekazany zarządcy. Nie będziesz mógł złożyć kolejnego, dopóki ten nie zostanie rozpatrzony.`}
        confirmLabel="Wyślij"
        onConfirm={submit}
      />
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);
