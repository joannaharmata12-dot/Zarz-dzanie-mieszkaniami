import { ROLE_LABEL, type StatusChange } from "@/lib/types";
import { History } from "lucide-react";

interface Props {
  title?: string;
  history: StatusChange[];
  renderBadge?: (value: string) => React.ReactNode;
}

export default function HistoryTimeline({ title = "Historia zmian", history, renderBadge }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-accent" />
        <h3 className="font-bold">{title}</h3>
      </div>
      <ol className="space-y-3">
        {history.map((h, idx) => (
          <li key={idx} className="flex flex-wrap items-start gap-3 text-sm border-l-2 border-accent/40 pl-4">
            <div className="text-xs text-muted-foreground w-40 shrink-0">
              {new Date(h.at).toLocaleString("pl-PL")}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {h.from && (
                <>
                  {renderBadge ? renderBadge(h.from) : <span className="text-xs">{h.from}</span>}
                  <span className="text-muted-foreground">→</span>
                </>
              )}
              {renderBadge ? renderBadge(h.to) : <span className="text-xs font-medium">{h.to}</span>}
            </div>
            <div className="text-muted-foreground">
              {h.by_name} <span className="text-xs">({ROLE_LABEL[h.by_role]})</span>
              {h.note && <span className="ml-1">· {h.note}</span>}
            </div>
          </li>
        ))}
        {history.length === 0 && <li className="text-sm text-muted-foreground">Brak wpisów.</li>}
      </ol>
    </div>
  );
}
