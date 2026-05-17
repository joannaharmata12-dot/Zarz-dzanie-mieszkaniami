## Cel
Rozbudowa PropertyCare o interaktywność, procesy, historię zmian i potwierdzenia. Praca pozostaje frontendowa (localStorage), bez backendu.

## 1. Rozszerzenie modelu danych (`src/lib/types.ts`)
- `Profile`: dodać `phone`, `created_by_manager?: boolean`.
- `MaintenanceRequest`: dodać `attachments: {name: string; placeholder: true}[]`, `settlement: { amount: number; payer: "mieszkaniec"|"właściciel"|"zarządca"|"do decyzji"; status: "nieustalone"|"do zapłaty"|"opłacone"|"anulowane" } | null`, `reminders: {at: string; by: string}[]`.
- `Payment`: dodać `status_history: {at; from; to; by_name}[]`, `recurring?: boolean`, `parent_recurring_id?: string`.
- `Lease`: dodać `request_proposed_end_date?`, `request_proposed_new_end?`, `request_comment?`, `request_reason?`, `request_history`.
- `Visit`: dodać `contact_phone`, `proposed_by_resident?: string | null`, `status_history`.
- `CleaningOrder`: dodać `status_history`, `completion_note`, `proposed_date_by_company?: string | null`.
- `Notification`: dodać `link?: string`, `details?: string`.

Bump STORAGE_KEY → `v3`, rozszerzyć seed.

## 2. Mieszkaniec
- **Login** (`Login.tsx`): karty profili testowych ze zdjęciem/avatar, opisem roli i jednym kliknięciem wejścia.
- **NewRequest**: sekcja „Załączniki" — placeholder upload (lista nazw plików, „Dodaj zdjęcie" tylko UI).
- **Payments**: kliknięcie wiersza → Dialog ze szczegółami + historia statusów.
- **Lease**: dwa rozbudowane formularze (przedłużenie / rezygnacja) w Dialogach, z polami i confirm-modal "Czy na pewno?".
- **Visits**: Dialog ze szczegółami; akcje: Zaakceptuj termin, Zaproponuj inny termin (date picker), Anuluj/przenieś.
- **Notifications page**: kliknięcie powiadomienia → Dialog z pełną treścią (już istnieje strona — rozbudować).

## 3. Zarządca
- **Apartments / nowy podstron "Mieszkańcy"**: tworzenie profilu mieszkańca (imię, email, telefon) i przypisanie do mieszkania.
- **RequestDetail**: dane kontaktowe mieszkańca + firmy, select priorytetu (zapis do history), przycisk „Wyślij ponaglenie" z confirm modal (dodaje wpis do `reminders` + notification).
- **Payments**:
  - Generator płatności cyklicznych (czynsz miesięczny) — przycisk „Generuj czynsz na X miesięcy".
  - Filtry: select mieszkaniec, mieszkanie, status.
  - Zmiana statusu zapisuje historię (status "zaległa" pozostaje w historii).
- **Visits**: edycja, zmiana terminu, anuluj, akceptacja propozycji mieszkańca.
- **Dashboard**: sekcja „Wymaga reakcji" (nowe zgłoszenia, krytyczne, zaległe płatności, propozycje zmian terminu wizyt, oczekujące wnioski najmu).

## 4. Firma techniczna
- Tabs: „Aktywne" / „Zarchiwizowane" (zakończone i archiwalne).
- Filtry: select statusu i priorytetu + szybki przycisk „Krytyczne".
- Szczegóły zgłoszenia (już RequestDetail) — sekcja „Rozliczenie naprawy" z formularzem (amount, payer, status).
- Notatka techniczna już jest, zachować.

## 5. Firma sprzątająca
- Tabs: „Aktywne" / „Zarchiwizowane".
- Edycja zlecenia (Dialog), akceptacja terminu / prośba o zmianę daty.
- Filtr po statusie.
- Notatka po wykonaniu usługi.

## 6. Globalnie
- Wszystkie ważne akcje (wysłanie wniosku, anulowanie, archiwizacja, zakończenie, ponaglenie) opakować w `AlertDialog` z potwierdzeniem.
- Komponent reużywalny `ConfirmDialog`.
- Historia zmian wyświetlana w szczegółach (timeline) dla zgłoszeń (jest), płatności, wizyt, zleceń.

## Aspekt techniczny
- Wykorzystywane już shadcn: `Dialog`, `AlertDialog`, `Select`, `Tabs`, `Calendar`, `Popover`.
- Nowy helper `src/lib/history.ts` — funkcje `pushStatusChange`, `pushReminder`.
- Komponent `src/components/ConfirmDialog.tsx`.
- Komponent `src/components/HistoryTimeline.tsx` (reużywalny).
- Nowe podstrony zarządcy: `Residents.tsx` (lista + tworzenie + przypisanie), opcjonalnie scalone z istniejącym `Apartments`.
- Aktualizacja `App.tsx` routes.

## Co zostaje bez zmian
- Schemat ról, motyw kolorystyczny, język polski, layout.
- Mechanizm seed/reset (tylko bump wersji).
