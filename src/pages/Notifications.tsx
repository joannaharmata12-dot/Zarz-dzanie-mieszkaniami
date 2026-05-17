import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import type { Notification } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Bell, Check } from "lucide-react";

export default function Notifications() {
  const { state, setState, userId } = useStore();
  const nav = useNavigate();
  const mine = state.notifications.filter(n => n.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const unread = mine.filter(n => !n.is_read);
  const [selected, setSelected] = useState<Notification | null>(null);

  const markRead = (id: string) => setState(s => ({ ...s, notifications: s.notifications.map(n => n.id === id ? { ...n, is_read: true } : n) }));
  const markAll = () => setState(s => ({ ...s, notifications: s.notifications.map(n => n.user_id === userId ? { ...n, is_read: true } : n) }));

  const open = (n: Notification) => {
    setSelected(n);
    if (!n.is_read) markRead(n.id);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Powiadomienia</h1>
          <p className="text-muted-foreground">{unread.length} nieprzeczytanych</p>
        </div>
        {unread.length > 0 && <Button variant="outline" onClick={markAll}>Oznacz wszystkie jako przeczytane</Button>}
      </div>
      <Card>
        <div className="divide-y">
          {mine.map(n => (
            <button key={n.id} onClick={() => open(n)} className={`w-full text-left p-4 flex items-start gap-4 hover:bg-muted/40 transition ${!n.is_read ? "bg-accent-soft/40" : ""}`}>
              <div className="h-9 w-9 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0"><Bell className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-muted-foreground truncate">{n.message}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("pl-PL")}</div>
              </div>
              {!n.is_read && <Check className="h-4 w-4 text-accent shrink-0 mt-1" />}
            </button>
          ))}
          {mine.length === 0 && <div className="p-12 text-center text-muted-foreground">Brak powiadomień.</div>}
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p>{selected.message}</p>
              {selected.details && <p className="text-muted-foreground">{selected.details}</p>}
              <p className="text-xs text-muted-foreground">{new Date(selected.created_at).toLocaleString("pl-PL")}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Zamknij</Button>
            {selected?.link && <Button onClick={() => { const l = selected.link!; setSelected(null); nav(l); }}>Przejdź</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
