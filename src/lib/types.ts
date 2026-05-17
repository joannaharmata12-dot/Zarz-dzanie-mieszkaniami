export type Role = "resident" | "manager" | "technical" | "cleaning";

export const ROLE_LABEL: Record<Role, string> = {
  resident: "Mieszkaniec",
  manager: "Zarządca",
  technical: "Firma techniczna",
  cleaning: "Firma sprzątająca",
};

export type Priority = "krytyczny" | "wysoki" | "średni" | "niski";
export type RequestStatus =
  | "nowe" | "przyjęte" | "przypisane" | "zaplanowane"
  | "w realizacji" | "oczekuje na mieszkańca" | "zakończone" | "anulowane" | "archiwalne";
export type Category = "hydraulika" | "elektryka" | "ogrzewanie" | "drzwi/okna" | "sprzęt AGD" | "inne";
export type ApartmentStatus = "aktywne" | "wynajęte" | "dostępne" | "wyłączone z użytku";
export type PaymentStatus = "opłacona" | "nierozliczona" | "zaległa" | "anulowana" | "archiwalna";
export type LeaseRequestStatus = "brak" | "nowy" | "w analizie" | "zaakceptowany" | "odrzucony";
export type VisitStatus = "zaplanowana" | "przełożona" | "zrealizowana" | "anulowana" | "propozycja zmiany";
export type CleaningStatus = "nowe" | "zaplanowane" | "w realizacji" | "zakończone" | "anulowane" | "propozycja zmiany";
export type TechEntryType = "usterka" | "naprawa" | "przegląd" | "notatka";
export type SettlementPayer = "mieszkaniec" | "właściciel" | "zarządca" | "do decyzji";
export type SettlementStatus = "nieustalone" | "do zapłaty" | "opłacone" | "anulowane";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: Role;
  created_at: string;
}

export interface Apartment {
  id: string;
  address: string;
  apartment_number: string;
  city: string;
  status: ApartmentStatus;
  resident_id: string | null;
  manager_id: string | null;
  created_at: string;
}

export interface Attachment {
  name: string;
  placeholder: true;
}

export interface Settlement {
  amount: number;
  payer: SettlementPayer;
  status: SettlementStatus;
}

export interface Reminder {
  at: string;
  by: string;
  message?: string;
}

export interface MaintenanceRequest {
  id: string;
  number: string;
  apartment_id: string;
  resident_id: string;
  assigned_company_id: string | null;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: RequestStatus;
  location: string;
  availability: string;
  source: "resident" | "manual_manager";
  scheduled_date: string | null;
  tech_note: string | null;
  attachments: Attachment[];
  settlement: Settlement | null;
  reminders: Reminder[];
  created_at: string;
  updated_at: string;
  status_history: StatusChange[];
}

export interface StatusChange {
  at: string;
  from: string | null;
  to: string;
  by_role: Role;
  by_name: string;
  note?: string;
}

export interface TechnicalEntry {
  id: string;
  apartment_id: string;
  request_id: string | null;
  type: TechEntryType;
  description: string;
  status: string;
  assigned_person: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  apartment_id: string;
  resident_id: string;
  amount: number;
  due_date: string;
  status: PaymentStatus;
  description: string;
  recurring?: boolean;
  status_history: StatusChange[];
  created_at: string;
}

export interface Lease {
  id: string;
  apartment_id: string;
  resident_id: string;
  start_date: string;
  end_date: string;
  status: "aktywna" | "zakończona";
  request_status: LeaseRequestStatus;
  request_type: "brak" | "przedłużenie" | "rezygnacja";
  request_proposed_new_end?: string | null;
  request_proposed_end_date?: string | null;
  request_comment?: string | null;
  request_reason?: string | null;
  request_history: StatusChange[];
  created_at: string;
}

export interface Visit {
  id: string;
  apartment_id: string;
  manager_id: string;
  resident_id: string;
  date: string;
  time: string;
  purpose: string;
  inspector: string;
  contact_phone?: string;
  status: VisitStatus;
  alternative_date: string | null;
  proposed_by_resident?: string | null;
  status_history: StatusChange[];
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  details?: string;
  created_at: string;
}

export interface CleaningOrder {
  id: string;
  apartment_id: string;
  cleaning_company_id: string;
  description: string;
  planned_date: string;
  status: CleaningStatus;
  note: string | null;
  proposed_date_by_company?: string | null;
  status_history: StatusChange[];
  created_at: string;
}

export const PRIORITY_BY_CATEGORY: Record<Category, Priority> = {
  hydraulika: "krytyczny",
  elektryka: "wysoki",
  ogrzewanie: "wysoki",
  "drzwi/okna": "średni",
  "sprzęt AGD": "średni",
  inne: "niski",
};
