import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApartmentStatusBadge } from "@/components/Badges";
import { Plus, Search, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Apartments() {
  const { state, userId } = useStore();
  const [q, setQ] = useState("");
  const list = state.apartments
    .filter(a => a.manager_id === userId)
    .filter(a => !q || (a.address + a.apartment_number + a.city).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Mieszkania</h1>
          <p className="text-muted-foreground">{list.length} mieszkań</p>
        </div>
        <Button asChild><Link to="/manager/apartments/new"><Plus className="h-4 w-4 mr-2" />Dodaj mieszkanie</Link></Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Szukaj po adresie, mieście…" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(a => {
          const res = state.profiles.find(p => p.id === a.resident_id);
          const active = state.requests.filter(r => r.apartment_id === a.id && r.status !== "zakończone" && r.status !== "anulowane" && r.status !== "archiwalne").length;
          return (
            <Link key={a.id} to={`/manager/apartments/${a.id}`} className="stat-card group hover:border-accent">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold">{a.address}/{a.apartment_number}</div>
                  <div className="text-xs text-muted-foreground">{a.city}</div>
                </div>
                <ApartmentStatusBadge value={a.status} />
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Mieszkaniec</span><span className="font-medium">{res?.full_name || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Aktywne zgłoszenia</span><span className="font-medium">{active}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-end text-accent text-sm font-medium">
                Karta techniczna <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
