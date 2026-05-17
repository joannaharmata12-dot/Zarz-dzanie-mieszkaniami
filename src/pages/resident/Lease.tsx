import { useStore, notify } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeaseRequestBadge } from "@/components/Badges";
import { toast } from "sonner";

export default function ResidentLease() {
  const { state, setState, userId } = useStore();
  const lease = state.leases.find(l => l.resident_id === userId);
  const apt = state.apartments.find(a => a.id === lease?.apartment_id);
  const manager = state.profiles.find(p => p.role === "manager");

  if (!lease) return <div className="p-6">Brak aktywnej umowy.</div>;

  const submit = (type: "przedłużenie" | "rezygnacja") => {
    setState(s => ({
      ...s,
      leases: s.leases.map(l => l.id === lease.id ? { ...l, request_status: "nowy", request_type: type } : l),
    }));
    if (manager) notify(setState, manager.id, "Nowy wniosek najmu", `Mieszkaniec złożył wniosek o ${type}.`, "lease");
    toast.success(`Wniosek o ${type} został wysłany`);
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
            <div className="text-sm mb-3">Typ wniosku: <span className="font-medium">{lease.request_type}</span></div>
          )}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => submit("przedłużenie")} disabled={lease.request_status === "nowy" || lease.request_status === "w analizie"}>
              Wniosek o przedłużenie
            </Button>
            <Button variant="outline" onClick={() => submit("rezygnacja")} disabled={lease.request_status === "nowy" || lease.request_status === "w analizie"}>
              Wniosek o rezygnację
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);
