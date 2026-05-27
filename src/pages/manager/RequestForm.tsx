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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PriorityBadge } from "@/components/Badges";
import { Paperclip, X, FileIcon, ArrowLeft } from "lucide-react";

const techCategories: Category[] = ["hydraulika", "elektryka", "ogrzewanie", "drzwi/okna", "sprzęt AGD", "inne"];
const cleaningCategories = ["Sprzątanie budynku", "Sprzątanie po wyprowadzce"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const readFile = (f: File): Promise<Attachment> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve({ name: f.name, type: f.type, size: f.size, dataUrl: r.result as string });
    r.onerror = reject;
    r.readAsDataURL(f);
  });

export default function ManagerRequestForm() {
  const { state, setState, userId } = useStore();
  const nav = useNavigate();
  const me = state.profiles.find(p => p.id === userId);
  const apartments = state.apartments.filter(a => a.manager_id === userId);
  const techCompanies = state.profiles.filter(p => p.role === "technical");
  const cleaningCompanies = state.profiles.filter(p => p.role === "cleaning");
  const fileRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<"technical" | "cleaning">("technical");
  const [apartmentId, setApartmentId] = useState(apartments[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techCategory, setTechCategory] = useState<Category>("hydraulika");
  const [cleaningCategory, setCleaningCategory] = useState<string>(cleaningCategories[0]);
  const [location, setLocation] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [companyId, setCompanyId] = useState(techCompanies[0]?.id || "");
  const [cleaningCompanyId, setCleaningCompanyId] = useState(cleaningCompanies[0]?.id || "");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const priority = PRIORITY_BY_CATEGORY[techCategory];

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const ok: Attachment[] = [];
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) { toast.error(`Plik ${f.name} przekracza 5 MB`); continue; }
      ok.push(await readFile(f));
    }
    setAttachments(a => [...a, ...ok]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartmentId) return toast.error("Wybierz mieszkanie");
    if (!title.trim()) return toast.error("Podaj tytuł zgłoszenia");
    if (!description.trim()) return toast.error("Podaj opis");
    const apartment = state.apartments.find(a => a.id === apartmentId)!;
    const now = new Date().toISOString();
    const mgrName = me?.full_name || "Zarządca";

    if (type === "technical") {
      if (!companyId) return toast.error("Wybierz firmę techniczną");
      const number = nextRequestNumber(state.requests);
      const id = uid();
      setState(s => ({
        ...s,
        requests: [{
          id, number, apartment_id: apartmentId, resident_id: apartment.resident_id || "",
          assigned_company_id: companyId,
          title, description, category: techCategory, priority,
          status: "przypisane", location: location || "—", availability: "",
          source: "manual_manager",
          scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : null,
          tech_note: null, attachments, settlement: null, reminders: [],
          created_at: now, updated_at: now,
          status_history: [
            { at: now, from: null, to: "nowe", by_role: "manager", by_name: mgrName, note: "Utworzone przez zarządcę" },
            { at: now, from: "nowe", to: "przypisane", by_role: "manager", by_name: mgrName, note: `Przypisano ${techCompanies.find(c => c.id === companyId)?.full_name}` },
          ],
        }, ...s.requests],
      }));
      notify(setState, companyId, "Przypisano zgłoszenie", `Nowe zgłoszenie ${number}: ${title}`, "assignment");
      if (apartment.resident_id) notify(setState, apartment.resident_id, "Nowe zgłoszenie", `Zarządca utworzył zgłoszenie ${number}: ${title}`, "request");
      toast.success(`Zgłoszenie ${number} utworzone`);
      nav(`/manager/requests/${id}`);
    } else {
      if (!cleaningCompanyId) return toast.error("Wybierz firmę sprzątającą");
      const id = uid();
      setState(s => ({
        ...s,
        cleaning: [{
          id, apartment_id: apartmentId, cleaning_company_id: cleaningCompanyId,
          description: `${cleaningCategory}: ${title}\n\n${description}`,
          planned_date: scheduledDate || new Date().toISOString().slice(0, 10),
          status: "nowe", note: null,
          status_history: [{ at: now, from: null, to: "nowe", by_role: "manager", by_name: mgrName, note: cleaningCategory }],
          created_at: now,
        }, ...s.cleaning],
      }));
      notify(setState, cleaningCompanyId, "Nowe zlecenie sprzątania", `${cleaningCategory} — ${apartment.address}/${apartment.apartment_number}`, "cleaning");
      toast.success("Zlecenie sprzątania utworzone");
      nav("/manager/requests");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Wróć</Button>
      <div>
        <h1 className="text-3xl font-bold">Nowe zgłoszenie</h1>
        <p className="text-muted-foreground">Utwórz zgłoszenie dla firmy technicznej lub sprzątającej.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <Tabs value={type} onValueChange={v => setType(v as any)}>
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="technical">Firma techniczna</TabsTrigger>
              <TabsTrigger value="cleaning">Firma sprzątająca</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label>Mieszkanie *</Label>
            <Select value={apartmentId} onValueChange={setApartmentId}>
              <SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger>
              <SelectContent>
                {apartments.map(a => <SelectItem key={a.id} value={a.id}>{a.address}/{a.apartment_number}, {a.city}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tytuł *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={type === "technical" ? "np. Przegląd kotła" : "np. Sprzątanie po lokatorze"} />
          </div>

          {type === "technical" ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Kategoria *</Label>
                <Select value={techCategory} onValueChange={v => setTechCategory(v as Category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{techCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priorytet</Label>
                <div className="flex h-10 items-center"><PriorityBadge value={priority} /></div>
              </div>
              <div className="space-y-2">
                <Label>Firma *</Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{techCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rodzaj zlecenia *</Label>
                <Select value={cleaningCategory} onValueChange={setCleaningCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{cleaningCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Firma sprzątająca *</Label>
                <Select value={cleaningCompanyId} onValueChange={setCleaningCompanyId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{cleaningCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === "technical" && (
            <div className="space-y-2">
              <Label>Lokalizacja w mieszkaniu</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="np. Kuchnia" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Opis *</Label>
            <Textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>{type === "technical" ? "Planowany termin" : "Termin realizacji"}</Label>
            <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Załączniki</Label>
            <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" onChange={onPick} className="hidden" />
            <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
              <Paperclip className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Dodaj zdjęcia lub dokumenty (maks. 5 MB każdy).</p>
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Wybierz pliki</Button>
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
            <Button type="submit">Utwórz zgłoszenie</Button>
            <Button type="button" variant="outline" onClick={() => nav(-1)}>Anuluj</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
