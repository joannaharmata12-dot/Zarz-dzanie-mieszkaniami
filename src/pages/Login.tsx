import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Wrench, Sparkles, User, LogIn } from "lucide-react";
import { toast } from "sonner";

const roleMeta: Record<Role, { label: string; icon: any; path: string; hint: string }> = {
  resident:  { label: "Mieszkaniec",        icon: User,       path: "/resident",  hint: "anna@test.pl" },
  manager:   { label: "Zarządca",           icon: Building2,  path: "/manager",   hint: "jan.nowak@propertycare.pl" },
  technical: { label: "Firma techniczna",   icon: Wrench,     path: "/technical", hint: "kontakt@techfix.pl" },
  cleaning:  { label: "Firma sprzątająca",  icon: Sparkles,   path: "/cleaning",  hint: "biuro@cleanhome.pl" },
};

function LoginForm({ role }: { role: Role }) {
  const { state, setSession } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const meta = roleMeta[role];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = state.profiles.find(p => p.role === role && p.email.toLowerCase() === email.trim().toLowerCase());
    if (!profile) { toast.error(`Nie znaleziono konta (${meta.label}) o podanym adresie e-mail.`); return; }
    if (password.length < 4) { toast.error("Hasło jest wymagane."); return; }
    setSession(role, profile.id);
    navigate(meta.path);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label>Adres e-mail</Label>
        <Input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={meta.hint} />
      </div>
      <div className="space-y-2">
        <Label>Hasło</Label>
        <Input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <Button type="submit" className="w-full"><LogIn className="h-4 w-4 mr-2" />Zaloguj się jako {meta.label.toLowerCase()}</Button>
    </form>
  );
}

export default function Login() {
  const [tab, setTab] = useState<Role>("resident");

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
            Jeden system dla zarządcy, mieszkańców i firm zewnętrznych.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-20 pb-20 w-full">
        <Card className="p-8 shadow-[var(--shadow-elevated)]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Logowanie</h2>
            <p className="text-sm text-muted-foreground">Wybierz typ konta i zaloguj się danymi z systemu.</p>
          </div>
          <Tabs value={tab} onValueChange={v => setTab(v as Role)}>
            <TabsList className="grid grid-cols-4 w-full mb-6">
              {(Object.keys(roleMeta) as Role[]).map(r => {
                const Icon = roleMeta[r].icon;
                return (
                  <TabsTrigger key={r} value={r} className="flex flex-col gap-1 py-2 h-auto">
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px]">{roleMeta[r].label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {(Object.keys(roleMeta) as Role[]).map(r => (
              <TabsContent key={r} value={r}>
                <LoginForm role={r} />
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
