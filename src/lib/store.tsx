import React, { createContext, useContext, useEffect, useState } from "react";
import * as seed from "./seed";
import type {
  Apartment, CleaningOrder, Lease, MaintenanceRequest, Notification,
  Payment, Profile, Role, TechnicalEntry, Visit,
} from "./types";

interface State {
  profiles: Profile[];
  apartments: Apartment[];
  requests: MaintenanceRequest[];
  techEntries: TechnicalEntry[];
  payments: Payment[];
  leases: Lease[];
  visits: Visit[];
  notifications: Notification[];
  cleaning: CleaningOrder[];
}

const STORAGE_KEY = "propertycare-state-v3";
const ROLE_KEY = "propertycare-role";
const USER_KEY = "propertycare-user";

const initial: State = {
  profiles: seed.seedProfiles,
  apartments: seed.seedApartments,
  requests: seed.seedRequests,
  techEntries: seed.seedTechEntries,
  payments: seed.seedPayments,
  leases: seed.seedLeases,
  visits: seed.seedVisits,
  notifications: seed.seedNotifications,
  cleaning: seed.seedCleaning,
};

const load = (): State => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initial;
};

interface StoreCtx {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  role: Role | null;
  userId: string | null;
  setSession: (role: Role, userId: string) => void;
  logout: () => void;
  resetData: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<State>(load);
  const [role, setRole] = useState<Role | null>(() => (localStorage.getItem(ROLE_KEY) as Role) || null);
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(USER_KEY));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setSession = (r: Role, uid: string) => {
    localStorage.setItem(ROLE_KEY, r);
    localStorage.setItem(USER_KEY, uid);
    setRole(r);
    setUserId(uid);
  };

  const logout = () => {
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    setRole(null);
    setUserId(null);
  };

  const resetData = () => {
    setState(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  };

  return <Ctx.Provider value={{ state, setState, role, userId, setSession, logout, resetData }}>{children}</Ctx.Provider>;
};

export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const nextRequestNumber = (existing: MaintenanceRequest[]) => {
  const year = new Date().getFullYear();
  const n = existing.length + 1;
  return `ZG-${year}-${String(n).padStart(3, "0")}`;
};

export const notify = (
  setState: React.Dispatch<React.SetStateAction<State>>,
  user_id: string, title: string, message: string, type = "info",
) => {
  setState(s => ({
    ...s,
    notifications: [
      { id: uid(), user_id, title, message, type, is_read: false, created_at: new Date().toISOString() },
      ...s.notifications,
    ],
  }));
};
