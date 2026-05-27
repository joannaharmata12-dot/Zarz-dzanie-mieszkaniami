import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, uid, nextRequestNumber, notify } from "@/lib/store";
import { PRIORITY_BY_CATEGORY, type Attachment, type Category } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PriorityBadge } from "@/components/Badges";
import { Paperclip, X, FileIcon } from "lucide-react";

const categories: Category[] = ["hydraulika", "elektryka", "ogrzewanie", "drzwi/okna", "sprzęt AGD", "inne"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const readFile = (f: File): Promise<Attachment> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve({ name: f.name, type: f.type, size: f.size, dataUrl: r.result as string });
    r.onerror = reject;
    r.readAsDataURL(f);
  });

export default function NewRequest() {
  const { state, setState, userId } = useStore();
  const nav = useNavigate();
  const apartment = state.apartments.find(a => a.resident_id === userId);
  const manager = state.profiles.find(p => p.role === "manager");
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("hydraulika");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const priority = PRIORITY_BY_CATEGORY[category];

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const ok: Attachment[] = [];
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`Plik ${f.name} przekracza 5 MB`);
        continue;
      }
      ok.push(await readFile(f));
    }
    setAttachments(a => [...a, ...ok]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!apartment) errs.push("brak przypisanego mieszkania");
    if (!title.trim()) errs.push("tytuł");
    if (!description.trim()) errs.push("opis");
    if (!location.trim()) errs.push("lokalizacja");
    if (errs.length || !apartment || !userId) {
      toast.error("Uzupełnij wymagane pola: " + errs.join(", "));
      return;
    }
    const number = nextRequestNumber(state.requests);
    const id = uid();
    const now = new Date().toISOString();
    const resName = state.profiles.find(p => p.id === userId)?.full_name || "Mieszkaniec";
    setState(s => ({
      ...s,
      requests: [{
        id, number, apartment_id: apartment.id, resident_id: userId, assigned_company_id: null,
        title, description, category, priority, status: "nowe", location, availability,
        source: "resident", scheduled_date: null, tech_note: null,
        attachments, settlement: null, reminders: [],
        created_at: now, updated_at: now,
        status_history: [{ at: now, from: null, to: "nowe", by_role: "resident", by_name: resName }],
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
            <Label>Załączniki</Label>
            <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" onChange={onPick} className="hidden" />
            <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
              <Paperclip className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Dodaj zdjęcia lub dokumenty (maks. 5 MB każdy).</p>
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                Wybierz pliki
              </Button>
              {attachments.length > 0 && (
                <ul className="text-xs text-left mt-2 space-y-1">
                  {attachments.map((a, i) => (
                    <li key={i} className="flex items-center justify-between bg-muted/40 rounded px-2 py-1.5">
                      <span className="flex items-center gap-2 truncate"><FileIcon className="h-3 w-3 shrink-0" />{a.name} <span className="text-muted-foreground">({Math.round(a.size / 1024)} KB)</span></span>
                      <button type="button" className="text-destructive shrink-0" onClick={() => setAttachments(p => p.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
                    </li>
                  ))}
                </ul>
              )}
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
