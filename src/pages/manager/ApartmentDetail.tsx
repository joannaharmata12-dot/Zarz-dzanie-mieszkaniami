import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useStore, uid } from "@/lib/store";
import type { TechEntryType } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApartmentStatusBadge, PriorityBadge, StatusBadge } from "@/components/Badges";
import { ArrowLeft, AlertTriangle, Pencil } from "lucide-react";
import { toast } from "sonner";

const TYPES: TechEntryType[] = ["usterka", "naprawa", "przegląd", "notatka"];

export default function ApartmentDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state, setState } = useStore();
  const apt = state.apartments.find(a => a.id === id);
  if (!apt) return <div className="p-6">Nie znaleziono.</div>;

  const resident = state.profiles.find(p => p.id === apt.resident_id);
  const requests = state.requests.filter(r => r.apartment_id === apt.id);
  const active = requests.filter(r => !["zakończone", "anulowane", "archiwalne"].includes(r.status));
  const history = state.techEntries.filter(e => e.apartment_id === apt.id);

  const [type, setType] = useState<TechEntryType>("notatka");
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const addEntry = () => {
    if (!desc.trim()) { toast.error("Wpisz treść notatki"); return; }
    setState(s => ({
      ...s,
      techEntries: [{
        id: uid(), apartment_id: apt.id, request_id: null, type,
        description: desc, status: "info", assigned_person: null, created_at: new Date().toISOString(),
      }, ...s.techEntries],
    }));
    setDesc("");
    toast.success("Dodano wpis do historii");
  };

  const filteredHistory = filter === "all" ? history : history.filter(h => h.type === filter);

  const isOverdue = (createdAt: string) => (Date.now() - new Date(createdAt).getTime()) > 7 * 86400000;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Wróć</Button>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">{apt.address}/{apt.apartment_number}</h1>
          <p className="text-muted-foreground">{apt.city} · mieszkaniec: {resident?.full_name || "—"}</p>
        </div>
        <div className="flex gap-2">
          <ApartmentStatusBadge value={apt.status} />
          <Button variant="outline" size="sm" asChild><Link to={`/manager/apartments/${apt.id}/edit`}><Pencil className="h-4 w-4 mr-2" />Edytuj</Link></Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="font-bold mb-3">Aktywne usterki ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak aktywnych zgłoszeń.</p>
        ) : (
          <div className="divide-y">
            {active.map(r => (
              <Link key={r.id} to={`/manager/requests/${r.id}`} className="flex items-center gap-3 py-3 hover:bg-muted/40 -mx-2 px-2 rounded">
                <div className="font-mono text-xs text-muted-foreground w-24">{r.number}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate flex items-center gap-2">
                    {r.title}
                    {isOverdue(r.created_at) && <span className="inline-flex items-center text-xs text-destructive gap-1"><AlertTriangle className="h-3 w-3" />opóźnione</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{r.category}</div>
                </div>
                <PriorityBadge value={r.priority} />
                <StatusBadge value={r.status} />
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-bold">Historia techniczna</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie typy</SelectItem>
              {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3 mb-6">
          {filteredHistory.map(h => (
            <div key={h.id} className="border-l-2 border-accent pl-4 py-1">
              <div className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("pl-PL")} · {h.type}{h.assigned_person ? ` · ${h.assigned_person}` : ""}</div>
              <div className="text-sm">{h.description}</div>
            </div>
          ))}
          {filteredHistory.length === 0 && <p className="text-sm text-muted-foreground">Brak wpisów.</p>}
        </div>

        <div className="border-t pt-4 space-y-3">
          <h3 className="font-medium">Dodaj wpis do historii</h3>
          <div className="grid md:grid-cols-[160px,1fr,auto] gap-3 items-start">
            <Select value={type} onValueChange={v => setType(v as TechEntryType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Opis…" />
            <Button onClick={addEntry}>Dodaj</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
