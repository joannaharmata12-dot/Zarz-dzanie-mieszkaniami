import { useState } from "react";
import { useStore, uid, notify } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function ManagerResidents() {
  const { state, setState, userId } = useStore();
  const residents = state.profiles.filter(p => p.role === "resident");
  const apartments = state.apartments.filter(a => a.manager_id === userId);

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [assignAptId, setAssignAptId] = useState("");

  const createResident = () => {
    if (!name.trim() || !email.trim()) { toast.error("Imię i email są wymagane"); return; }
    const id = "u-res-" + uid();
    setState(s => ({ ...s, profiles: [...s.profiles, { id, full_name: name, email, phone, role: "resident", created_at: new Date().toISOString() }] }));
    toast.success("Utworzono profil mieszkańca");
    setCreateOpen(false); setName(""); setEmail(""); setPhone("");
  };

  const assign = () => {
    if (!assignFor || !assignAptId) { toast.error("Wybierz mieszkanie"); return; }
    setState(s => ({
      ...s,
      apartments: s.apartments.map(a => {
        if (a.id === assignAptId) return { ...a, resident_id: assignFor, status: "wynajęte" };
        if (a.resident_id === assignFor) return { ...a, resident_id: null };
        return a;
      }),
    }));
    notify(setState, assignFor, "Przypisano mieszkanie", "Zarządca przypisał Cię do mieszkania.", "system");
    toast.success("Przypisano mieszkanie");
    setAssignFor(null); setAssignAptId("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-3xl font-bold">Mieszkańcy</h1><p className="text-muted-foreground">{residents.length} profili</p></div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nowy mieszkaniec</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Utwórz profil mieszkańca</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2"><Label>Imię i nazwisko *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Telefon</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+48 …" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Anuluj</Button>
              <Button onClick={createResident}>Utwórz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {residents.map(r => {
          const apt = state.apartments.find(a => a.resident_id === r.id);
          return (
            <Card key={r.id} className="p-5 space-y-3">
              <div>
                <div className="font-bold">{r.full_name}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
                {r.phone && <div className="text-xs text-muted-foreground">{r.phone}</div>}
              </div>
              <div className="text-sm pt-3 border-t">
                <div className="text-xs text-muted-foreground uppercase mb-1">Mieszkanie</div>
                <div className="font-medium">{apt ? `${apt.address}/${apt.apartment_number}, ${apt.city}` : "— nieprzypisany —"}</div>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => { setAssignFor(r.id); setAssignAptId(apt?.id || ""); }}>
                <UserPlus className="h-4 w-4 mr-2" />{apt ? "Zmień mieszkanie" : "Przypisz mieszkanie"}
              </Button>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!assignFor} onOpenChange={v => !v && setAssignFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Przypisz mieszkanie</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Mieszkanie *</Label>
            <Select value={assignAptId} onValueChange={setAssignAptId}>
              <SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger>
              <SelectContent>
                {apartments.map(a => <SelectItem key={a.id} value={a.id}>{a.address}/{a.apartment_number}, {a.city} {a.resident_id && a.resident_id !== assignFor ? "(zajęte)" : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignFor(null)}>Anuluj</Button>
            <Button onClick={assign}>Przypisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
