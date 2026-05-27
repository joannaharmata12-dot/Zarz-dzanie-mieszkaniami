import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore, notify } from "@/lib/store";
import { ROLE_LABEL, type Priority, type RequestStatus, type SettlementPayer, type SettlementStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import HistoryTimeline from "@/components/HistoryTimeline";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ArrowLeft, Archive, Image as ImageIcon, BellRing } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUSES: RequestStatus[] = ["nowe", "przyjęte", "przypisane", "zaplanowane", "w realizacji", "oczekuje na mieszkańca", "zakończone", "anulowane", "archiwalne"];
const PRIORITIES: Priority[] = ["krytyczny", "wysoki", "średni", "niski"];
const PAYERS: SettlementPayer[] = ["zarządca", "mieszkaniec"];
const SET_STATUSES: SettlementStatus[] = ["nieustalone", "do zapłaty", "opłacone", "anulowane"];

export default function RequestDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state, setState, role, userId } = useStore();
  const req = state.requests.find(r => r.id === id);
  if (!req) return <div className="p-8">Nie znaleziono zgłoszenia. <Link to="/" className="underline">Wróć</Link></div>;
  const apt = state.apartments.find(a => a.id === req.apartment_id);
  const resident = state.profiles.find(p => p.id === req.resident_id);
  const company = state.profiles.find(p => p.id === req.assigned_company_id || "");
  const companies = state.profiles.filter(p => p.role === "technical");
  const me = state.profiles.find(p => p.id === userId);

  const [statusVal, setStatusVal] = useState<RequestStatus>(req.status);
  const [priorityVal, setPriorityVal] = useState<Priority>(req.priority);
  const [companyId, setCompanyId] = useState<string>(req.assigned_company_id || "");
  const [scheduled, setScheduled] = useState(req.scheduled_date?.slice(0, 10) || "");
  const [note, setNote] = useState(req.tech_note || "");
  const [setAmount, setSetAmount] = useState(req.settlement?.amount.toString() || "");
  const [setPayer, setSetPayer] = useState<SettlementPayer>(req.settlement?.payer || "do decyzji");
  const [setSettStatus, setSetSettStatus] = useState<SettlementStatus>(req.settlement?.status || "nieustalone");

  const [confirmAction, setConfirmAction] = useState<null | "archive" | "complete" | "cancel" | "reminder">(null);

  const canManage = role === "manager";
  const canTech = role === "technical" && req.assigned_company_id === userId;

  const pushHistory = (history: any[], from: string, to: string, note?: string) => [
    ...history,
    { at: new Date().toISOString(), from, to, by_role: role!, by_name: me?.full_name || ROLE_LABEL[role!], note },
  ];

  const applyChange = (patch: Partial<typeof req>, message: string) => {
    const now = new Date().toISOString();
    setState(s => ({
      ...s,
      requests: s.requests.map(r => r.id === req.id ? { ...r, ...patch, updated_at: now } : r),
    }));
    notify(setState, req.resident_id, "Aktualizacja zgłoszenia", `${req.number}: ${message}`, "request");
    toast.success("Zapisano");
  };

  const saveManager = () => {
    let history = req.status_history || [];
    const patch: any = { assigned_company_id: companyId || null };

    if (priorityVal !== req.priority) {
      history = pushHistory(history, `priorytet: ${req.priority}`, `priorytet: ${priorityVal}`, "Zmiana priorytetu");
      patch.priority = priorityVal;
    }
    let newStatus = statusVal;
    if (companyId && companyId !== req.assigned_company_id) {
      const comp = companies.find(c => c.id === companyId);
      if (comp) {
        notify(setState, comp.id, "Przypisano zgłoszenie", `Przypisano zgłoszenie ${req.number}: ${req.title}`, "assignment");
        if (statusVal === "nowe") newStatus = "przypisane";
        history = pushHistory(history, req.status, newStatus, `Przypisano ${comp.full_name}`);
      }
    } else if (newStatus !== req.status) {
      history = pushHistory(history, req.status, newStatus, "Zmiana statusu");
    }
    patch.status = newStatus;
    patch.status_history = history;
    applyChange(patch, `status: ${newStatus}, priorytet: ${priorityVal}`);
  };

  const saveTech = () => {
    let history = req.status_history || [];
    if (statusVal !== req.status) history = pushHistory(history, req.status, statusVal, note || undefined);
    const settlement = setAmount ? { amount: parseFloat(setAmount) || 0, payer: setPayer, status: setSettStatus } : req.settlement;
    applyChange({
      status: statusVal,
      scheduled_date: scheduled ? new Date(scheduled).toISOString() : null,
      tech_note: note || null,
      status_history: history,
      settlement,
    }, `${statusVal}${scheduled ? ` · termin ${new Date(scheduled).toLocaleDateString("pl-PL")}` : ""}`);
    if (statusVal === "zakończone") {
      setState(s => ({
        ...s,
        techEntries: [{
          id: Math.random().toString(36).slice(2),
          apartment_id: req.apartment_id, request_id: req.id, type: "naprawa",
          description: `${req.title} — ${note || "naprawa zakończona"}`, status: "zakończone",
          assigned_person: company?.full_name || null, created_at: new Date().toISOString(),
        }, ...s.techEntries],
      }));
      toast.success("Wpis dodany do historii technicznej mieszkania");
    }
  };

  const archive = () => {
    const history = pushHistory(req.status_history || [], req.status, "archiwalne", "Archiwizacja");
    applyChange({ status: "archiwalne", status_history: history }, "przeniesiono do archiwum");
  };

  const sendReminder = () => {
    const now = new Date().toISOString();
    const reminders = [...(req.reminders || []), { at: now, by: me?.full_name || "Zarządca", message: "Prosimy o pilną realizację" }];
    setState(s => ({ ...s, requests: s.requests.map(r => r.id === req.id ? { ...r, reminders } : r) }));
    if (req.assigned_company_id) notify(setState, req.assigned_company_id, "Ponaglenie", `Ponaglenie dla zgłoszenia ${req.number}: ${req.title}`, "reminder");
    toast.success("Ponaglenie wysłane");
  };

  const canArchive = canManage && (req.status === "zakończone" || req.status === "anulowane");

  return (
    <div className="space-y-6 max-w-5xl">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Wróć</Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-mono text-muted-foreground">{req.number}</div>
          <h1 className="text-3xl font-bold">{req.title}</h1>
          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
            <span>Utworzono {new Date(req.created_at).toLocaleString("pl-PL")}</span>
            <span>·</span>
            <Badge variant="outline" className="text-xs">Źródło: {req.source === "resident" ? "mieszkaniec" : "ręczne (zarządca)"}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <PriorityBadge value={req.priority} />
          <StatusBadge value={req.status} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2 space-y-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Opis</div>
            <p className="mt-1 whitespace-pre-wrap">{req.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Kategoria" value={req.category} />
            <Info label="Lokalizacja" value={req.location} />
            <Info label="Dostępność" value={req.availability || "—"} />
            <Info label="Planowany termin" value={req.scheduled_date ? new Date(req.scheduled_date).toLocaleDateString("pl-PL") : "—"} />
          </div>
          {req.attachments && req.attachments.length > 0 && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="text-xs uppercase text-muted-foreground">Załączniki ({req.attachments.length})</div>
              <div className="flex flex-wrap gap-2">
                {req.attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded"><ImageIcon className="h-3 w-3" />{a.name}</div>
                ))}
              </div>
            </div>
          )}
          {req.tech_note && (
            <div className="rounded-lg bg-accent-soft p-4">
              <div className="text-xs text-accent font-semibold uppercase mb-1">Notatka techniczna</div>
              <p className="text-sm">{req.tech_note}</p>
            </div>
          )}
          {req.settlement && (
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-muted-foreground mb-1">Rozliczenie naprawy</div>
              <div className="text-sm flex flex-wrap gap-3">
                <span><span className="font-bold">{req.settlement.amount.toFixed(2)} zł</span></span>
                <span>· płaci: <span className="font-medium">{req.settlement.payer}</span></span>
                <span>· status: <Badge variant="outline">{req.settlement.status}</Badge></span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-3 text-sm">
          <div className="font-semibold mb-2">Powiązane</div>
          <Detail label="Mieszkanie" value={apt ? `${apt.address}/${apt.apartment_number}, ${apt.city}` : "—"} />
          <Detail label="Mieszkaniec" value={resident?.full_name || "—"} />
          <Detail label="Email" value={resident?.email || "—"} />
          <Detail label="Telefon" value={resident?.phone || "—"} />
          <div className="pt-2 border-t" />
          <Detail label="Firma techniczna" value={company?.full_name || "—"} />
          <Detail label="Email firmy" value={company?.email || "—"} />
          <Detail label="Telefon firmy" value={company?.phone || "—"} />
        </Card>
      </div>

      <Card className="p-6">
        <HistoryTimeline title="Historia statusów" history={req.status_history || []} renderBadge={(v) => STATUSES.includes(v as RequestStatus) ? <StatusBadge value={v as RequestStatus} /> : <Badge variant="outline" className="text-xs">{v}</Badge>} />
      </Card>

      {req.reminders && req.reminders.length > 0 && (
        <Card className="p-6">
          <div className="font-bold mb-3 flex items-center gap-2"><BellRing className="h-4 w-4 text-warning" />Ponaglenia ({req.reminders.length})</div>
          <ul className="text-sm space-y-2">
            {req.reminders.map((r, i) => <li key={i} className="text-muted-foreground">{new Date(r.at).toLocaleString("pl-PL")} · {r.by}</li>)}
          </ul>
        </Card>
      )}

      {canManage && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold">Akcje zarządcy</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusVal} onValueChange={v => setStatusVal(v as RequestStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorytet</Label>
              <Select value={priorityVal} onValueChange={v => setPriorityVal(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Firma techniczna</Label>
              <Select value={companyId || "none"} onValueChange={v => setCompanyId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— brak —</SelectItem>
                  {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={saveManager}>Zapisz zmiany</Button>
            {req.assigned_company_id && (
              <Button variant="outline" onClick={() => setConfirmAction("reminder")}><BellRing className="h-4 w-4 mr-2" />Wyślij ponaglenie</Button>
            )}
            {canArchive && (
              <Button variant="outline" onClick={() => setConfirmAction("archive")}>
                <Archive className="h-4 w-4 mr-2" />Archiwizuj
              </Button>
            )}
          </div>
        </Card>
      )}

      {canTech && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold">Akcje firmy technicznej</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusVal} onValueChange={v => setStatusVal(v as RequestStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["przypisane", "zaplanowane", "w realizacji", "oczekuje na mieszkańca", "zakończone"].map(s =>
                    <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Planowany termin realizacji</Label>
              <Input type="date" value={scheduled} onChange={e => setScheduled(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notatka techniczna</Label>
            <Textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Opis wykonanych prac, części, uwagi…" />
          </div>
          <div className="space-y-2 pt-3 border-t">
            <Label className="font-semibold">Rozliczenie naprawy</Label>
            <div className="grid md:grid-cols-3 gap-3">
              <div><Label className="text-xs">Kwota (zł)</Label><Input type="number" step="0.01" value={setAmount} onChange={e => setSetAmount(e.target.value)} /></div>
              <div><Label className="text-xs">Płaci</Label>
                <Select value={setPayer} onValueChange={v => setSetPayer(v as SettlementPayer)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Status rozliczenia</Label>
                <Select value={setSettStatus} onValueChange={v => setSetSettStatus(v as SettlementStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SET_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => statusVal === "zakończone" ? setConfirmAction("complete") : saveTech()}>Zapisz</Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirmAction === "archive"}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title="Zarchiwizować zgłoszenie?"
        description="Zgłoszenie zostanie przeniesione do archiwum i nie będzie aktywne."
        onConfirm={() => { archive(); setConfirmAction(null); }}
      />
      <ConfirmDialog
        open={confirmAction === "complete"}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title="Zakończyć zgłoszenie?"
        description="Wpis trafi do historii technicznej mieszkania."
        onConfirm={() => { saveTech(); setConfirmAction(null); }}
      />
      <ConfirmDialog
        open={confirmAction === "reminder"}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title="Wysłać ponaglenie?"
        description="Firma techniczna otrzyma powiadomienie o pilności."
        onConfirm={() => { sendReminder(); setConfirmAction(null); }}
      />
    </div>
  );
}

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);
const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right">{value}</span>
  </div>
);
