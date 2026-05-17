import type {
  Apartment, CleaningOrder, Lease, MaintenanceRequest, Notification,
  Payment, Profile, TechnicalEntry, Visit,
} from "./types";

const today = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export const seedProfiles: Profile[] = [
  { id: "u-res-1", full_name: "Anna Kowalska", email: "anna@test.pl", role: "resident", created_at: daysAgo(120) },
  { id: "u-res-2", full_name: "Piotr Nowak", email: "piotr@test.pl", role: "resident", created_at: daysAgo(80) },
  { id: "u-res-3", full_name: "Magdalena Zielińska", email: "magda@test.pl", role: "resident", created_at: daysAgo(60) },
  { id: "u-mgr-1", full_name: "Jan Nowak", email: "jan.nowak@propertycare.pl", role: "manager", created_at: daysAgo(300) },
  { id: "u-tech-1", full_name: "TechFix", email: "kontakt@techfix.pl", role: "technical", created_at: daysAgo(200) },
  { id: "u-clean-1", full_name: "CleanHome", email: "biuro@cleanhome.pl", role: "cleaning", created_at: daysAgo(200) },
];

export const seedApartments: Apartment[] = [
  { id: "a-1", address: "ul. Kwiatowa 12", apartment_number: "5", city: "Kraków", status: "wynajęte", resident_id: "u-res-1", manager_id: "u-mgr-1", created_at: daysAgo(300) },
  { id: "a-2", address: "ul. Krakowskie Przedmieście 5", apartment_number: "3A", city: "Warszawa", status: "wynajęte", resident_id: "u-res-2", manager_id: "u-mgr-1", created_at: daysAgo(250) },
  { id: "a-3", address: "ul. Floriańska 22", apartment_number: "7", city: "Kraków", status: "wynajęte", resident_id: "u-res-3", manager_id: "u-mgr-1", created_at: daysAgo(180) },
  { id: "a-4", address: "ul. Długa 44", apartment_number: "11", city: "Gdańsk", status: "dostępne", resident_id: null, manager_id: "u-mgr-1", created_at: daysAgo(90) },
  { id: "a-5", address: "ul. Piotrkowska 100", apartment_number: "25", city: "Łódź", status: "wyłączone z użytku", resident_id: null, manager_id: "u-mgr-1", created_at: daysAgo(60) },
];

export const seedRequests: MaintenanceRequest[] = [
  {
    id: "r-1", number: "ZG-2025-001", apartment_id: "a-1", resident_id: "u-res-1",
    assigned_company_id: "u-tech-1", title: "Zalanie łazienki", description: "Cieknie syfon pod umywalką, woda na podłodze.",
    category: "hydraulika", priority: "krytyczny", status: "w realizacji", location: "Łazienka",
    availability: "Pon-Pt po 16:00", source: "resident", scheduled_date: daysAhead(1),
    tech_note: "Wymiana syfonu zaplanowana.", created_at: daysAgo(3), updated_at: daysAgo(1),
    status_history: [
      { at: daysAgo(3), from: null, to: "nowe", by_role: "resident", by_name: "Anna Kowalska" },
      { at: daysAgo(2), from: "nowe", to: "przypisane", by_role: "manager", by_name: "Jan Nowak", note: "Przypisano TechFix" },
      { at: daysAgo(1), from: "przypisane", to: "w realizacji", by_role: "technical", by_name: "TechFix" },
    ],
  },
  {
    id: "r-2", number: "ZG-2025-002", apartment_id: "a-2", resident_id: "u-res-2",
    assigned_company_id: null, title: "Nie działa gniazdko w kuchni", description: "Po włączeniu czajnika wyłącza się bezpiecznik.",
    category: "elektryka", priority: "wysoki", status: "nowe", location: "Kuchnia",
    availability: "Cały tydzień", source: "resident", scheduled_date: null, tech_note: null,
    created_at: daysAgo(1), updated_at: daysAgo(1),
    status_history: [{ at: daysAgo(1), from: null, to: "nowe", by_role: "resident", by_name: "Piotr Nowak" }],
  },
  {
    id: "r-3", number: "ZG-2025-003", apartment_id: "a-3", resident_id: "u-res-3",
    assigned_company_id: "u-tech-1", title: "Skrzypią drzwi balkonowe", description: "Trudno otworzyć, skrzypią zawiasy.",
    category: "drzwi/okna", priority: "średni", status: "zaplanowane", location: "Salon",
    availability: "Weekendy", source: "resident", scheduled_date: daysAhead(4), tech_note: null,
    created_at: daysAgo(7), updated_at: daysAgo(2),
    status_history: [
      { at: daysAgo(7), from: null, to: "nowe", by_role: "resident", by_name: "Magdalena Zielińska" },
      { at: daysAgo(5), from: "nowe", to: "przypisane", by_role: "manager", by_name: "Jan Nowak" },
      { at: daysAgo(2), from: "przypisane", to: "zaplanowane", by_role: "technical", by_name: "TechFix" },
    ],
  },
  {
    id: "r-4", number: "ZG-2025-004", apartment_id: "a-1", resident_id: "u-res-1",
    assigned_company_id: "u-tech-1", title: "Przegląd kotła gazowego", description: "Coroczny przegląd techniczny.",
    category: "ogrzewanie", priority: "wysoki", status: "zakończone", location: "Łazienka",
    availability: "Pon-Pt", source: "manual_manager", scheduled_date: daysAgo(20), tech_note: "Wymieniono filtr, ciśnienie OK.",
    created_at: daysAgo(30), updated_at: daysAgo(20),
    status_history: [
      { at: daysAgo(30), from: null, to: "nowe", by_role: "manager", by_name: "Jan Nowak", note: "Dodane ręcznie" },
      { at: daysAgo(28), from: "nowe", to: "przypisane", by_role: "manager", by_name: "Jan Nowak" },
      { at: daysAgo(20), from: "przypisane", to: "zakończone", by_role: "technical", by_name: "TechFix" },
    ],
  },
];

export const seedTechEntries: TechnicalEntry[] = [
  { id: "t-1", apartment_id: "a-1", request_id: "r-4", type: "przegląd", description: "Roczny przegląd kotła – sprawny.", status: "zakończone", assigned_person: "FixIT Serwis", created_at: daysAgo(20) },
  { id: "t-2", apartment_id: "a-1", request_id: null, type: "notatka", description: "Mieszkanie po remoncie kuchni w 2024.", status: "info", assigned_person: null, created_at: daysAgo(180) },
  { id: "t-3", apartment_id: "a-3", request_id: null, type: "naprawa", description: "Wymiana baterii kuchennej.", status: "zakończone", assigned_person: "FixIT Serwis", created_at: daysAgo(60) },
];

export const seedPayments: Payment[] = [
  { id: "p-1", apartment_id: "a-1", resident_id: "u-res-1", amount: 2800, due_date: daysAhead(-8), status: "zaległa", description: "Czynsz – październik", created_at: daysAgo(35) },
  { id: "p-2", apartment_id: "a-1", resident_id: "u-res-1", amount: 2800, due_date: daysAhead(5), status: "nierozliczona", description: "Czynsz – listopad", created_at: daysAgo(2) },
  { id: "p-3", apartment_id: "a-2", resident_id: "u-res-2", amount: 3200, due_date: daysAhead(-10), status: "zaległa", description: "Czynsz – październik", created_at: daysAgo(40) },
  { id: "p-4", apartment_id: "a-3", resident_id: "u-res-3", amount: 2500, due_date: daysAhead(7), status: "nierozliczona", description: "Czynsz – listopad", created_at: daysAgo(1) },
];

export const seedLeases: Lease[] = [
  { id: "l-1", apartment_id: "a-1", resident_id: "u-res-1", start_date: "2024-01-01", end_date: "2025-12-31", status: "aktywna", request_status: "brak", request_type: "brak", created_at: daysAgo(300) },
  { id: "l-2", apartment_id: "a-2", resident_id: "u-res-2", start_date: "2024-03-15", end_date: "2026-03-14", status: "aktywna", request_status: "brak", request_type: "brak", created_at: daysAgo(250) },
  { id: "l-3", apartment_id: "a-3", resident_id: "u-res-3", start_date: "2024-06-01", end_date: "2025-05-31", status: "aktywna", request_status: "brak", request_type: "brak", created_at: daysAgo(180) },
];

export const seedVisits: Visit[] = [
  { id: "v-1", apartment_id: "a-1", manager_id: "u-mgr-1", resident_id: "u-res-1", date: daysAhead(10), time: "10:00", purpose: "Przegląd techniczny", inspector: "Tomasz Wiśniewski", status: "zaplanowana", alternative_date: null, created_at: daysAgo(2) },
  { id: "v-2", apartment_id: "a-2", manager_id: "u-mgr-1", resident_id: "u-res-2", date: daysAhead(-5), time: "14:00", purpose: "Kontrola stanu mieszkania", inspector: "Tomasz Wiśniewski", status: "zrealizowana", alternative_date: null, created_at: daysAgo(20) },
];

export const seedCleaning: CleaningOrder[] = [
  { id: "c-1", apartment_id: "a-4", cleaning_company_id: "u-clean-1", description: "Sprzątanie po wyprowadzce – kompleksowe.", planned_date: daysAhead(2), status: "zaplanowane", note: null, created_at: daysAgo(1) },
  { id: "c-2", apartment_id: "a-5", cleaning_company_id: "u-clean-1", description: "Mycie okien i pranie wykładziny.", planned_date: daysAhead(-3), status: "zakończone", note: "Wykonano w komplecie.", created_at: daysAgo(10) },
  { id: "c-3", apartment_id: "a-2", cleaning_company_id: "u-clean-1", description: "Sprzątanie cykliczne klatki schodowej.", planned_date: daysAhead(1), status: "nowe", note: null, created_at: today() },
];

export const seedNotifications: Notification[] = [
  { id: "n-1", user_id: "u-res-1", title: "Aktualizacja zgłoszenia", message: "Zgłoszenie ZG-2025-001 zostało przyjęte do realizacji.", type: "request", is_read: false, created_at: daysAgo(1) },
  { id: "n-2", user_id: "u-mgr-1", title: "Nowe zgłoszenie", message: "Mieszkaniec utworzył zgłoszenie ZG-2025-002.", type: "request", is_read: false, created_at: daysAgo(1) },
  { id: "n-3", user_id: "u-tech-1", title: "Przypisano zgłoszenie", message: "Przypisano nowe zgłoszenie ZG-2025-001.", type: "assignment", is_read: false, created_at: daysAgo(2) },
  { id: "n-4", user_id: "u-res-1", title: "Płatność", message: "Naliczono nowy czynsz – listopad.", type: "payment", is_read: true, created_at: daysAgo(2) },
];
