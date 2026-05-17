import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { VisitBadge } from "@/components/Badges";

export default function ResidentVisits() {
  const { state, userId } = useStore();
  const mine = state.visits.filter(v => v.resident_id === userId).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wizyty kontrolne</h1>
      <Card>
        <div className="divide-y">
          {mine.map(v => (
            <div key={v.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{v.purpose}</div>
                <div className="text-xs text-muted-foreground">{new Date(v.date).toLocaleDateString("pl-PL")} o {v.time} · {v.inspector}</div>
              </div>
              <VisitBadge value={v.status} />
            </div>
          ))}
          {mine.length === 0 && <div className="p-8 text-center text-muted-foreground">Brak zaplanowanych wizyt.</div>}
        </div>
      </Card>
    </div>
  );
}
