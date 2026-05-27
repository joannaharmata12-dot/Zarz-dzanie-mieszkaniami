import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Wrench, Sparkles, ArrowRight, LogIn } from "lucide-react";
import { toast } from "sonner";

const staff: { role: Role; userId: string; name: string; profile: string; icon: any; desc: string }[] = [
  { role: "manager", userId: "u-mgr-1", name: "Zarządca", profile: "Jan Nowak", icon: Building2, desc: "Zarządzanie mieszkaniami, zgłoszeniami, płatnościami i wizytami." },
  { role: "technical", userId: "u-tech-1", name: "Firma techniczna", profile: "TechFix", icon: Wrench, desc: "Obsługa przypisanych napraw, terminy i notatki." },
  { role: "cleaning", userId: "u-clean-1", name: "Firma sprzątająca", profile: "CleanHome", icon: Sparkles, desc: "Zlecenia sprzątania i ich realizacja." },
];

export default function Login() {
  const { state, setSession } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showStaff, setShowStaff] = useState(false);

  const loginResident = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = state.profiles.find(p => p.role === "resident" && p.email.toLowerCase() === email.trim().toLowerCase());
    if (!profile) { toast.error("Nie znaleziono konta mieszkańca o podanym adresie e-mail."); return; }
    if (password.length < 4) { toast.error("Hasło jest wymagane."); return; }
    setSession("resident", profile.id);
    navigate("/resident");
  };

  const pickStaff = (r: Role, uid: string) => {
    setSession(r, uid);
    const path = r === "manager" ? "/manager" : r === "technical" ? "/technical" : "/cleaning";
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
            Zarządzanie najmem i obsługą mieszkań
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Jeden system dla zarządcy, mieszkańców i firm zewnętrznych. Zgłoszenia, płatności,
            historia techniczna i wizyty — w jednym miejscu.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-20 pb-20 w-full grid md:grid-cols-2 gap-6">
        <Card className="p-8 shadow-[var(--shadow-elevated)]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Logowanie mieszkańca</h2>
            <p className="text-sm text-muted-foreground">Zaloguj się adresem e-mail podanym w umowie.</p>
          </div>
          <form onSubmit={loginResident} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adres e-mail</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="anna@test.pl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">Hasło</Label>
              <Input id="pass" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full"><LogIn className="h-4 w-4 mr-2" />Zaloguj się</Button>
          </form>
        </Card>

        <Card className="p-8 shadow-[var(--shadow-elevated)]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Panel pracowniczy</h2>
              <p className="text-sm text-muted-foreground">Dostęp dla zarządcy i firm współpracujących.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowStaff(s => !s)}>{showStaff ? "Ukryj" : "Pokaż"}</Button>
          </div>
          {showStaff && (
            <div className="space-y-3">
              {staff.map(r => (
                <button
                  key={r.role}
                  onClick={() => pickStaff(r.role, r.userId)}
                  className="group w-full text-left p-4 rounded-xl border bg-card hover:border-accent hover:shadow-[var(--shadow-elevated)] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
                      <r.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold flex items-center gap-2">
                        {r.name}
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <div className="text-xs text-muted-foreground">{r.profile}</div>
                      <div className="text-sm text-muted-foreground mt-1">{r.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
