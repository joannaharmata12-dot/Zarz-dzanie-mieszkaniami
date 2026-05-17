import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Wrench, Sparkles, User2, CheckCircle2, Target, Layers, PlayCircle, Rocket, ShieldCheck } from "lucide-react";

const roles = [
  { icon: User2, name: "Mieszkaniec", desc: "Zgłasza usterki, śledzi status, opłaca czynsz, podgląda umowę i wizyty." },
  { icon: Building2, name: "Zarządca", desc: "Zarządza mieszkaniami, przypisuje zgłoszenia firmom, prowadzi płatności i wizyty." },
  { icon: Wrench, name: "Firma techniczna", desc: "Realizuje przypisane zgłoszenia, planuje terminy, dodaje notatki techniczne." },
  { icon: Sparkles, name: "Firma sprzątająca", desc: "Obsługuje zlecenia sprzątania mieszkań i części wspólnych." },
];

type Perm = "C" | "R" | "U" | "—";
const matrix: { feature: string; cells: Record<string, Perm[]> }[] = [
  { feature: "Mieszkania", cells: { Mieszkaniec: ["—", "R", "—"], Zarządca: ["C", "R", "U"], "Firma techniczna": ["—", "R", "—"], "Firma sprzątająca": ["—", "R", "—"] } },
  { feature: "Zgłoszenia usterek", cells: { Mieszkaniec: ["C", "R", "—"], Zarządca: ["C", "R", "U"], "Firma techniczna": ["—", "R", "U"], "Firma sprzątająca": ["—", "—", "—"] } },
  { feature: "Płatności", cells: { Mieszkaniec: ["—", "R", "—"], Zarządca: ["C", "R", "U"], "Firma techniczna": ["—", "—", "—"], "Firma sprzątająca": ["—", "—", "—"] } },
  { feature: "Umowy najmu", cells: { Mieszkaniec: ["—", "R", "U"], Zarządca: ["C", "R", "U"], "Firma techniczna": ["—", "—", "—"], "Firma sprzątająca": ["—", "—", "—"] } },
  { feature: "Wizyty kontrolne", cells: { Mieszkaniec: ["—", "R", "—"], Zarządca: ["C", "R", "U"], "Firma techniczna": ["—", "—", "—"], "Firma sprzątająca": ["—", "—", "—"] } },
  { feature: "Zlecenia sprzątania", cells: { Mieszkaniec: ["—", "—", "—"], Zarządca: ["C", "R", "U"], "Firma techniczna": ["—", "—", "—"], "Firma sprzątająca": ["—", "R", "U"] } },
  { feature: "Powiadomienia", cells: { Mieszkaniec: ["—", "R", "—"], Zarządca: ["—", "R", "—"], "Firma techniczna": ["—", "R", "—"], "Firma sprzątająca": ["—", "R", "—"] } },
];

const cols = ["Mieszkaniec", "Zarządca", "Firma techniczna", "Firma sprzątająca"];

const PermCell = ({ values }: { values: Perm[] }) => (
  <div className="flex gap-1 justify-center">
    {values.map((v, i) => (
      <span key={i} className={`inline-flex items-center justify-center h-6 w-6 rounded text-[10px] font-bold ${
        v === "—" ? "bg-muted text-muted-foreground" :
        v === "C" ? "bg-success/15 text-success" :
        v === "R" ? "bg-info/15 text-info" : "bg-warning/15 text-warning"
      }`} title={v === "C" ? "Create" : v === "R" ? "Read" : v === "U" ? "Update" : "brak"}>{v}</span>
    ))}
  </div>
);

export default function About() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">O systemie PropertyCare</h1>
        <p className="text-muted-foreground mt-1">Prototyp aplikacji webowej do zarządzania najmem i obsługą mieszkań.</p>
      </div>

      <Section icon={Target} title="Cel aplikacji">
        <p>
          PropertyCare wspiera <strong>zarządcę nieruchomości</strong> w codziennej obsłudze mieszkań,
          przyspiesza zgłaszanie i obsługę usterek, prowadzi historię techniczną mieszkań, ewidencjonuje
          płatności i wizyty oraz usprawnia komunikację z mieszkańcami i firmami zewnętrznymi.
          Mieszkańcom daje przejrzysty kanał kontaktu, a firmom serwisowym — uporządkowaną listę zadań.
        </p>
      </Section>

      <Section icon={User2} title="Role użytkowników">
        <div className="grid sm:grid-cols-2 gap-3">
          {roles.map(r => (
            <div key={r.name} className="flex gap-3 p-4 border rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <r.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-sm text-muted-foreground">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Layers} title="Zakres MVP">
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 list-none">
          {[
            "Logowanie demo wg roli",
            "Lista i karta mieszkania",
            "Zgłaszanie usterek przez mieszkańca",
            "Automatyczny priorytet wg kategorii",
            "Przypisanie firmy technicznej",
            "Zmiana statusu z historią zmian",
            "Notatki techniczne i terminy",
            "Historia techniczna mieszkania",
            "Płatności i wizyty kontrolne",
            "Zlecenia firmy sprzątającej",
            "Umowy najmu z wnioskami",
            "Powiadomienia w aplikacji",
          ].map(t => (
            <li key={t} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={PlayCircle} title="Główny scenariusz demonstracyjny">
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Zaloguj się jako <Badge variant="outline">Mieszkaniec</Badge> (Anna Kowalska) i kliknij <em>„Zgłoś usterkę”</em>.</li>
          <li>Wpisz tytuł, kategorię (np. <em>hydraulika</em> → priorytet <strong>krytyczny</strong>), lokalizację i opis.</li>
          <li>Przełącz rolę na <Badge variant="outline">Zarządca</Badge> (Jan Nowak) — zobaczysz nowe zgłoszenie i powiadomienie.</li>
          <li>Otwórz zgłoszenie i przypisz firmę <strong>TechFix</strong> — status zmieni się na <em>przypisane</em>.</li>
          <li>Zaloguj się jako <Badge variant="outline">Firma techniczna</Badge>, ustaw termin i status <em>w realizacji</em>, potem <em>zakończone</em>.</li>
          <li>Wróć do mieszkańca — zobaczy aktualizację i powiadomienia. Zgłoszenie trafia do <em>historii technicznej mieszkania</em>.</li>
        </ol>
      </Section>

      <Section icon={ShieldCheck} title="Macierz ról i uprawnień">
        <p className="text-sm text-muted-foreground mb-3">
          <strong>C</strong> – tworzenie, <strong>R</strong> – odczyt, <strong>U</strong> – edycja, <strong>—</strong> – brak dostępu.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funkcja</TableHead>
                {cols.map(c => <TableHead key={c} className="text-center">{c}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.map(row => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  {cols.map(c => <TableCell key={c}><PermCell values={row.cells[c]} /></TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section icon={Rocket} title="Planowane funkcje przyszłe">
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 list-disc pl-5 text-sm">
          <li>Pełna autentykacja (e-mail + SSO)</li>
          <li>Załączniki zdjęciowe do zgłoszeń</li>
          <li>Integracja płatności online (BLIK / przelew)</li>
          <li>Powiadomienia push i e-mail</li>
          <li>Mobilna aplikacja dla firm serwisowych</li>
          <li>Generowanie raportów PDF i eksport CSV</li>
          <li>Kalendarz wizyt z synchronizacją iCal</li>
          <li>API dla firm zewnętrznych</li>
          <li>Moduł rozliczeń mediów (woda, prąd, gaz)</li>
          <li>Czat mieszkaniec ↔ zarządca</li>
        </ul>
      </Section>
    </div>
  );
}

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <Card className="p-6">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-5 w-5 text-accent" />
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    <div className="text-sm leading-relaxed">{children}</div>
  </Card>
);
