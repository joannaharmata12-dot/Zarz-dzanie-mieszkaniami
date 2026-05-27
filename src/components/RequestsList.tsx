import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import type { MaintenanceRequest, Priority, RequestStatus, Category } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { Search, ArrowRight, Plus, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  scope: "resident" | "manager" | "technical";
  basePath: string;
}

const STATUSES: RequestStatus[] = ["nowe", "przyjęte", "przypisane", "zaplanowane", "w realizacji", "oczekuje na mieszkańca", "zakończone", "anulowane", "archiwalne"];
const PRIORITIES: Priority[] = ["krytyczny", "wysoki", "średni", "niski"];
const CATEGORIES: Category[] = ["hydraulika", "elektryka", "ogrzewanie", "drzwi/okna", "sprzęt AGD", "inne"];

export default function RequestsList({ scope, basePath }: Props) {
  const { state, userId } = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const list = useMemo(() => {
    let r = state.requests;
    if (scope === "resident") r = r.filter(x => x.resident_id === userId);
    if (scope === "technical") r = r.filter(x => x.assigned_company_id === userId);
    if (search) r = r.filter(x => (x.title + x.number + x.description).toLowerCase().includes(search.toLowerCase()));
    if (status !== "all") r = r.filter(x => x.status === status);
    if (priority !== "all") r = r.filter(x => x.priority === priority);
    if (category !== "all") r = r.filter(x => x.category === category);
    return r.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [state.requests, scope, userId, search, status, priority, category]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Zgłoszenia</h1>
          <p className="text-muted-foreground">{list.length} zgłoszeń</p>
        </div>
        {scope === "manager" && (
          <Button asChild><Link to="/manager/requests/new"><Plus className="h-4 w-4 mr-2" />Nowe zgłoszenie</Link></Button>
        )}
      </div>

      <Card className="p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="relative md:col-span-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input placeholder="Szukaj…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger><SelectValue placeholder="Priorytet" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Każdy priorytet</SelectItem>
              {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Kategoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Każda kategoria</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        {list.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Brak zgłoszeń pasujących do filtrów.</div>
        ) : (
          <div className="divide-y">
            {list.map(r => <Row key={r.id} r={r} basePath={basePath} />)}
          </div>
        )}
      </Card>
    </div>
  );
}

const Row = ({ r, basePath }: { r: MaintenanceRequest; basePath: string }) => {
  const { state } = useStore();
  const apt = state.apartments.find(a => a.id === r.apartment_id);
  return (
    <Link to={`${basePath}/${r.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition">
      <div className="font-mono text-xs text-muted-foreground w-28">{r.number}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{r.title}</div>
        <div className="text-xs text-muted-foreground">
          {apt ? `${apt.address}/${apt.apartment_number}, ${apt.city}` : ""} · {r.category} · {new Date(r.created_at).toLocaleDateString("pl-PL")}
        </div>
      </div>
      <PriorityBadge value={r.priority} />
      <StatusBadge value={r.status} />
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
};
