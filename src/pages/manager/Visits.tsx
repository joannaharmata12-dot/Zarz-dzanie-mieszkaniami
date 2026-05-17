import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VisitBadge } from "@/components/Badges";
import { Plus } from "lucide-react";

export default function ManagerVisits() {
  const { state } = useStore();
  const list = [...state.visits].sort((a, b) => b.date.localeCompare(a.date));
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
            <div key={v.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{v.purpose}</div>
                <div className="text-xs text-muted-foreground">{apt?.address}/{apt?.apartment_number} · {new Date(v.date).toLocaleDateString("pl-PL")} {v.time} · {v.inspector}</div>
              </div>
              <VisitBadge value={v.status} />
            </div>
          );
        })}
        {list.length === 0 && <div className="p-8 text-center text-muted-foreground">Brak wizyt.</div>}
      </div></Card>
    </div>
  );
}
