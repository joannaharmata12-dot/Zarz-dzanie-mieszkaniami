import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore, uid } from "@/lib/store";
import type { ApartmentStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const STATUSES: ApartmentStatus[] = ["aktywne", "wynajęte", "dostępne", "wyłączone z użytku"];

export default function ApartmentForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { state, setState, userId } = useStore();
  const existing = state.apartments.find(a => a.id === id);
  const nav = useNavigate();

  const [address, setAddress] = useState(existing?.address || "");
  const [number, setNumber] = useState(existing?.apartment_number || "");
  const [city, setCity] = useState(existing?.city || "");
  const [status, setStatus] = useState<ApartmentStatus>(existing?.status || "dostępne");
  const [residentId, setResidentId] = useState(existing?.resident_id || "");

  const residents = state.profiles.filter(p => p.role === "resident");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !number.trim() || !city.trim()) { toast.error("Uzupełnij wymagane pola"); return; }
    const dup = state.apartments.some(a => a.id !== id && a.address.toLowerCase() === address.toLowerCase() && a.apartment_number === number);
    if (dup) { toast.error("Mieszkanie o tym adresie i numerze już istnieje"); return; }

    if (isEdit && existing) {
      setState(s => ({
        ...s,
        apartments: s.apartments.map(a => a.id === id ? { ...a, address, apartment_number: number, city, status, resident_id: residentId || null } : a),
      }));
      toast.success("Zapisano zmiany");
    } else {
      setState(s => ({
        ...s,
        apartments: [{
          id: uid(), address, apartment_number: number, city, status,
          resident_id: residentId || null, manager_id: userId, created_at: new Date().toISOString(),
        }, ...s.apartments],
      }));
      toast.success("Dodano mieszkanie");
    }
    nav("/manager/apartments");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Wróć</Button>
      <h1 className="text-3xl font-bold">{isEdit ? "Edytuj mieszkanie" : "Dodaj mieszkanie"}</h1>
      <Card className="p-6">
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2"><Label>Adres *</Label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Numer mieszkania *</Label><Input value={number} onChange={e => setNumber(e.target.value)} /></div>
            <div className="space-y-2"><Label>Miasto *</Label><Input value={city} onChange={e => setCity(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select value={status} onValueChange={v => setStatus(v as ApartmentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Przypisany mieszkaniec</Label>
            <Select value={residentId || "none"} onValueChange={v => setResidentId(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— brak —</SelectItem>
                {residents.map(r => <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">{isEdit ? "Zapisz" : "Dodaj"}</Button>
            <Button type="button" variant="outline" onClick={() => nav(-1)}>Anuluj</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
