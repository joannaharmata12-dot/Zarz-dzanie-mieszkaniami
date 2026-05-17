import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, uid, notify } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function VisitForm() {
  const { state, setState, userId } = useStore();
  const nav = useNavigate();
  const me = state.profiles.find(p => p.id === userId);
  const [apartmentId, setApartmentId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [purpose, setPurpose] = useState("");
  const [inspector, setInspector] = useState(me?.full_name || "");
  const [phone, setPhone] = useState(me?.phone || "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const apt = state.apartments.find(a => a.id === apartmentId);
    if (!apt || !date || !purpose || !inspector) { toast.error("Uzupełnij wymagane pola"); return; }
    const now = new Date().toISOString();
    setState(s => ({
      ...s,
      visits: [{
        id: uid(), apartment_id: apt.id, manager_id: userId!, resident_id: apt.resident_id || "",
        date, time, purpose, inspector, contact_phone: phone, status: "zaplanowana", alternative_date: null,
        status_history: [{ at: now, from: null, to: "zaplanowana", by_role: "manager", by_name: me?.full_name || "Zarządca" }],
        created_at: now,
      }, ...s.visits],
    }));
    if (apt.resident_id) notify(setState, apt.resident_id, "Wizyta kontrolna", `Zaplanowano wizytę: ${purpose} (${new Date(date).toLocaleDateString("pl-PL")} ${time})`, "visit");
    toast.success("Zaplanowano wizytę");
    nav("/manager/visits");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Wróć</Button>
      <h1 className="text-3xl font-bold">Zaplanuj wizytę</h1>
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Mieszkanie *</Label>
            <Select value={apartmentId} onValueChange={setApartmentId}>
              <SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger>
              <SelectContent>
                {state.apartments.map(a => <SelectItem key={a.id} value={a.id}>{a.address}/{a.apartment_number}, {a.city}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Data *</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Godzina</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Cel wizyty *</Label><Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="np. Przegląd techniczny" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Osoba kontrolująca *</Label><Input value={inspector} onChange={e => setInspector(e.target.value)} /></div>
            <div className="space-y-2"><Label>Telefon kontaktowy</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+48 …" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">Zapisz</Button>
            <Button type="button" variant="outline" onClick={() => nav(-1)}>Anuluj</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
