import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Wrench, Sparkles, User2, ArrowRight } from "lucide-react";

const roles: { role: Role; userId: string; name: string; profile: string; icon: any; desc: string }[] = [
  { role: "resident", userId: "u-res-1", name: "Mieszkaniec", profile: "Anna Kowalska", icon: User2, desc: "Zgłaszanie usterek, śledzenie statusów, płatności, umowa." },
  { role: "manager", userId: "u-mgr-1", name: "Zarządca", profile: "Jan Nowak", icon: Building2, desc: "Zarządzanie mieszkaniami, zgłoszeniami, płatnościami i wizytami." },
  { role: "technical", userId: "u-tech-1", name: "Firma techniczna", profile: "TechFix", icon: Wrench, desc: "Obsługa przypisanych napraw, terminy i notatki techniczne." },
  { role: "cleaning", userId: "u-clean-1", name: "Firma sprzątająca", profile: "CleanHome", icon: Sparkles, desc: "Lista zleceń sprzątania i ich realizacja." },
];

export default function Login() {
  const { setSession } = useStore();
  const navigate = useNavigate();

  const pick = (r: Role, uid: string) => {
    setSession(r, uid);
    const path = r === "resident" ? "/resident" : r === "manager" ? "/manager" : r === "technical" ? "/technical" : "/cleaning";
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="gradient-hero text-white">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-32">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold text-2xl">P</div>
            <span className="font-bold text-xl tracking-tight">PropertyCare</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mb-4">
            Inteligentne zarządzanie najmem i obsługą mieszkań
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Jeden system dla zarządcy, mieszkańców i firm zewnętrznych. Zgłoszenia, płatności,
            historia techniczna i wizyty — w jednym miejscu.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 pb-20 w-full">
        <Card className="p-8 shadow-[var(--shadow-elevated)]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Wybierz rolę demonstracyjną</h2>
            <p className="text-muted-foreground">Prototyp z przykładowymi danymi. W produkcji zastąp prawdziwą autoryzacją.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {roles.map(r => (
              <button
                key={r.role}
                onClick={() => pick(r.role, r.userId)}
                className="group text-left p-5 rounded-xl border bg-card hover:border-accent hover:shadow-[var(--shadow-elevated)] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                    <r.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg flex items-center gap-2">
                      {r.name}
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <div className="text-xs text-accent font-medium mt-0.5">Profil testowy: {r.profile}</div>
                    <div className="text-sm text-muted-foreground mt-1">{r.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>Dane przechowywane lokalnie w przeglądarce — wszystkie zmiany działają end-to-end.</span>
            <Button variant="outline" size="sm" onClick={() => { localStorage.clear(); location.reload(); }}>
              Wyczyść i przeładuj
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
