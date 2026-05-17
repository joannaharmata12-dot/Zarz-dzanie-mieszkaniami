import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, uid, nextRequestNumber, notify } from "@/lib/store";
import { PRIORITY_BY_CATEGORY, type Category } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PriorityBadge } from "@/components/Badges";
import { Image as ImageIcon } from "lucide-react";

const categories: Category[] = ["hydraulika", "elektryka", "ogrzewanie", "drzwi/okna", "sprzęt AGD", "inne"];

export default function NewRequest() {
  const { state, setState, userId } = useStore();
  const nav = useNavigate();
  const apartment = state.apartments.find(a => a.resident_id === userId);
  const manager = state.profiles.find(p => p.role === "manager");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("hydraulika");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");

  const priority = PRIORITY_BY_CATEGORY[category];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || !apartment || !userId) {
      toast.error("Uzupełnij wszystkie wymagane pola");
      return;
    }
    const number = nextRequestNumber(state.requests);
    const id = uid();
    setState(s => ({
      ...s,
      requests: [{
        id, number, apartment_id: apartment.id, resident_id: userId, assigned_company_id: null,
        title, description, category, priority, status: "nowe", location, availability,
        source: "resident", scheduled_date: null, tech_note: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }, ...s.requests],
    }));
    if (manager) notify(setState, manager.id, "Nowe zgłoszenie", `Mieszkaniec utworzył zgłoszenie ${number}: ${title}`, "request");
    notify(setState, userId, "Zgłoszenie przyjęte", `Twoje zgłoszenie ${number} zostało zarejestrowane.`, "request");
    toast.success(`Zgłoszenie ${number} zostało utworzone`);
    nav(`/resident/requests/${id}`);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Zgłoś usterkę</h1>
        <p className="text-muted-foreground">Opisz problem — priorytet zostanie nadany automatycznie.</p>
      </div>

      {!apartment && (
        <Card className="p-4 border-warning/40 bg-warning/10 text-warning-foreground">
          Nie masz przypisanego mieszkania. Skontaktuj się z zarządcą.
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł usterki *</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="np. Zalanie łazienki" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategoria *</Label>
              <Select value={category} onValueChange={v => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorytet (automatyczny)</Label>
              <div className="flex h-10 items-center"><PriorityBadge value={priority} /></div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loc">Lokalizacja w mieszkaniu *</Label>
            <Input id="loc" value={location} onChange={e => setLocation(e.target.value)} placeholder="np. Łazienka, kuchnia" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Opis *</Label>
            <Textarea id="desc" rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Co dokładnie się dzieje?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="av">Preferowana dostępność</Label>
            <Input id="av" value={availability} onChange={e => setAvailability(e.target.value)} placeholder="np. Pon-Pt po 17:00" />
          </div>

          <div className="space-y-2">
            <Label>Załącznik (placeholder)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Dodawanie zdjęć w przyszłej wersji</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={!apartment}>Wyślij zgłoszenie</Button>
            <Button type="button" variant="outline" onClick={() => nav(-1)}>Anuluj</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
