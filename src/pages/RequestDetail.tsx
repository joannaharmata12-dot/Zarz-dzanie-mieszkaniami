import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore, notify } from "@/lib/store";
import type { RequestStatus, Profile } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUSES: RequestStatus[] = ["nowe", "przyjęte", "przypisane", "zaplanowane", "w realizacji", "oczekuje na mieszkańca", "zakończone", "anulowane", "archiwalne"];

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

  const [statusVal, setStatusVal] = useState(req.status);
  const [companyId, setCompanyId] = useState<string>(req.assigned_company_id || "");
  const [scheduled, setScheduled] = useState(req.scheduled_date?.slice(0, 10) || "");
  const [note, setNote] = useState(req.tech_note || "");

  const canManage = role === "manager";
  const canTech = role === "technical" && req.assigned_company_id === userId;

  const updateRequest = (patch: Partial<typeof req>, message: string) => {
    setState(s => ({
      ...s,
      requests: s.requests.map(r => r.id === req.id ? { ...r, ...patch, updated_at: new Date().toISOString() } : r),
    }));
    notify(setState, req.resident_id, "Aktualizacja zgłoszenia", `${req.number}: ${message}`, "request");
    toast.success("Zapisano");
  };

  const saveManager = () => {
    const patch: any = { status: statusVal, assigned_company_id: companyId || null };
    if (companyId && companyId !== req.assigned_company_id) {
      const comp = companies.find(c => c.id === companyId);
      if (comp) {
        notify(setState, comp.id, "Przypisano zgłoszenie", `Przypisano zgłoszenie ${req.number}: ${req.title}`, "assignment");
        if (statusVal === "nowe") patch.status = "przypisane";
      }
    }
    updateRequest(patch, `status: ${patch.status}`);
  };

  const saveTech = () => {
    updateRequest({
      status: statusVal,
      scheduled_date: scheduled ? new Date(scheduled).toISOString() : null,
      tech_note: note || null,
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
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Wróć</Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-mono text-muted-foreground">{req.number}</div>
          <h1 className="text-3xl font-bold">{req.title}</h1>
          <div className="text-sm text-muted-foreground mt-1">
            Utworzono {new Date(req.created_at).toLocaleString("pl-PL")} · źródło: {req.source === "resident" ? "mieszkaniec" : "zarządca"}
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
          {req.tech_note && (
            <div className="rounded-lg bg-accent-soft p-4">
              <div className="text-xs text-accent font-semibold uppercase mb-1">Notatka techniczna</div>
              <p className="text-sm">{req.tech_note}</p>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-3 text-sm">
          <div className="font-semibold mb-2">Powiązane</div>
          <Detail label="Mieszkanie" value={apt ? `${apt.address}/${apt.apartment_number}, ${apt.city}` : "—"} />
          <Detail label="Mieszkaniec" value={resident?.full_name || "—"} />
          <Detail label="Kontakt" value={resident?.email || "—"} />
          <Detail label="Firma techniczna" value={company?.full_name || "—"} />
        </Card>
      </div>

      {canManage && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold">Akcje zarządcy</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusVal} onValueChange={v => setStatusVal(v as RequestStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
          <Button onClick={saveManager}>Zapisz zmiany</Button>
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
          <Button onClick={saveTech}>Zapisz</Button>
        </Card>
      )}
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
