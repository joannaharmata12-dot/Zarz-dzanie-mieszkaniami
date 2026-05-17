import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority, RequestStatus, PaymentStatus, ApartmentStatus, VisitStatus, CleaningStatus, LeaseRequestStatus } from "@/lib/types";

export const PriorityBadge = ({ value }: { value: Priority }) => {
  const map: Record<Priority, string> = {
    krytyczny: "bg-destructive text-destructive-foreground border-destructive",
    wysoki: "bg-warning text-warning-foreground border-warning",
    średni: "bg-info/15 text-info border-info/40",
    niski: "bg-muted text-muted-foreground border-border",
  };
  return <Badge variant="outline" className={cn("font-medium uppercase tracking-wide text-[10px]", map[value])}>{value}</Badge>;
};

export const StatusBadge = ({ value }: { value: RequestStatus }) => {
  const map: Partial<Record<RequestStatus, string>> = {
    "nowe": "bg-info/10 text-info border-info/30",
    "przyjęte": "bg-info/10 text-info border-info/30",
    "przypisane": "bg-accent/10 text-accent border-accent/30",
    "zaplanowane": "bg-accent/10 text-accent border-accent/30",
    "w realizacji": "bg-warning/15 text-warning border-warning/40",
    "oczekuje na mieszkańca": "bg-muted text-muted-foreground border-border",
    "zakończone": "bg-success/15 text-success border-success/40",
    "anulowane": "bg-destructive/10 text-destructive border-destructive/30",
    "archiwalne": "bg-muted text-muted-foreground border-border",
  };
  return <Badge variant="outline" className={cn("font-medium", map[value])}>{value}</Badge>;
};

export const PaymentBadge = ({ value }: { value: PaymentStatus }) => {
  const map: Record<PaymentStatus, string> = {
    "opłacona": "bg-success/15 text-success border-success/40",
    "nierozliczona": "bg-info/10 text-info border-info/30",
    "zaległa": "bg-destructive/10 text-destructive border-destructive/30",
    "anulowana": "bg-muted text-muted-foreground border-border",
    "archiwalna": "bg-muted text-muted-foreground border-border",
  };
  return <Badge variant="outline" className={cn("font-medium", map[value])}>{value}</Badge>;
};

export const ApartmentStatusBadge = ({ value }: { value: ApartmentStatus }) => {
  const map: Record<ApartmentStatus, string> = {
    "aktywne": "bg-success/15 text-success border-success/40",
    "wynajęte": "bg-accent/15 text-accent border-accent/40",
    "dostępne": "bg-info/10 text-info border-info/30",
    "wyłączone z użytku": "bg-destructive/10 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={cn("font-medium", map[value])}>{value}</Badge>;
};

export const VisitBadge = ({ value }: { value: VisitStatus }) => {
  const map: Record<VisitStatus, string> = {
    "zaplanowana": "bg-info/10 text-info border-info/30",
    "przełożona": "bg-warning/15 text-warning border-warning/40",
    "zrealizowana": "bg-success/15 text-success border-success/40",
    "anulowana": "bg-destructive/10 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={cn("font-medium", map[value])}>{value}</Badge>;
};

export const CleaningBadge = ({ value }: { value: CleaningStatus }) => {
  const map: Record<CleaningStatus, string> = {
    "nowe": "bg-info/10 text-info border-info/30",
    "zaplanowane": "bg-accent/10 text-accent border-accent/30",
    "w realizacji": "bg-warning/15 text-warning border-warning/40",
    "zakończone": "bg-success/15 text-success border-success/40",
    "anulowane": "bg-destructive/10 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={cn("font-medium", map[value])}>{value}</Badge>;
};

export const LeaseRequestBadge = ({ value }: { value: LeaseRequestStatus }) => {
  if (value === "brak") return <Badge variant="outline" className="text-muted-foreground">brak wniosku</Badge>;
  const map: Record<LeaseRequestStatus, string> = {
    "brak": "",
    "nowy": "bg-info/10 text-info border-info/30",
    "w analizie": "bg-warning/15 text-warning border-warning/40",
    "zaakceptowany": "bg-success/15 text-success border-success/40",
    "odrzucony": "bg-destructive/10 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={cn("font-medium", map[value])}>{value}</Badge>;
};
