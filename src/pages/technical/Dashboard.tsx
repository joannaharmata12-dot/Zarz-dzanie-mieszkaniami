import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import type { Priority, RequestStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { Wrench, ArrowRight, AlertTriangle } from "lucide-react";

const STATUSES: RequestStatus[] = ["przypisane", "zaplanowane", "w realizacji", "oczekuje na mieszkańca", "zakończone", "anulowane", "archiwalne"];
const PRIORITIES: Priority[] = ["krytyczny", "wysoki", "średni", "niski"];

export default function TechnicalDashboard() {
  const { state, userId } = useStore();
  const mine = state.requests.filter(r => r.assigned_company_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const active = mine.filter(r => !["zakończone", "anulowane", "archiwalne"].includes(r.status));
  const archived = mine.filter(r => ["zakończone", "anulowane", "archiwalne"].includes(r.status));

  const [tab, setTab] = useState<"active" | "archived">("active");
  const [fStatus, setFStatus] = useState("all");
  const [fPriority, setFPriority] = useState("all");

  const source = tab === "active" ? active : archived;
  const filtered = useMemo(() => source.filter(r =>
    (fStatus === "all" || r.status === fStatus) &&
    (fPriority === "all" || r.priority === fPriority)
  ), [source, fStatus, fPriority]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Panel firmy technicznej</p>
        <h1 className="text-3xl font-bold">Przypisane zgłoszenia</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><Wrench className="h-5 w-5 text-accent mb-2" /><div className="text-2xl font-bold">{active.length}</div><div className="text-xs text-muted-foreground">Aktywne</div></div>
        <div className="stat-card"><AlertTriangle className="h-5 w-5 text-destructive mb-2" /><div className="text-2xl font-bold">{active.filter(r => r.priority === "krytyczny").length}</div><div className="text-xs text-muted-foreground">Krytyczne</div></div>
        <div className="stat-card"><div className="text-2xl font-bold">{archived.length}</div><div className="text-xs text-muted-foreground">Zarchiwizowane</div></div>
      </div>

      <Tabs value={tab} onValueChange={v => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="active">Aktywne ({active.length})</TabsTrigger>
          <TabsTrigger value="archived">Zarchiwizowane ({archived.length})</TabsTrigger>
        </TabsList>

        <Card className="p-4 mt-4">
          <div className="grid sm:grid-cols-3 gap-3 items-end">
            <div><Label className="text-xs">Status</Label>
              <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label className="text-xs">Priorytet</Label>
              <Select value={fPriority} onValueChange={setFPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
            </div>
            <div>
              <Button variant={fPriority === "krytyczny" ? "default" : "outline"} size="sm" onClick={() => setFPriority(fPriority === "krytyczny" ? "all" : "krytyczny")}>
                <AlertTriangle className="h-4 w-4 mr-2" />Tylko krytyczne
              </Button>
            </div>
          </div>
        </Card>

        <TabsContent value={tab} className="mt-4">
          <Card>
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">Brak zgłoszeń.</div>
            ) : (
              <div className="divide-y">
                {filtered.map(r => {
                  const apt = state.apartments.find(a => a.id === r.apartment_id);
                  const res = state.profiles.find(p => p.id === r.resident_id);
                  return (
                    <Link key={r.id} to={`/technical/${r.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40">
                      <div className="font-mono text-xs text-muted-foreground w-28">{r.number}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{r.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{apt?.address}/{apt?.apartment_number}, {apt?.city} · {res?.full_name}</div>
                      </div>
                      <PriorityBadge value={r.priority} />
                      <StatusBadge value={r.status} />
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
