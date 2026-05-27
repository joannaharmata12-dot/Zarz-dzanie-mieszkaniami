import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider, useStore } from "@/lib/store";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound";

import ResidentDashboard from "@/pages/resident/Dashboard";
import NewRequest from "@/pages/resident/NewRequest";
import ResidentPayments from "@/pages/resident/Payments";
import ResidentLease from "@/pages/resident/Lease";
import ResidentVisits from "@/pages/resident/Visits";

import ManagerDashboard from "@/pages/manager/Dashboard";
import Apartments from "@/pages/manager/Apartments";
import ApartmentForm from "@/pages/manager/ApartmentForm";
import ApartmentDetail from "@/pages/manager/ApartmentDetail";
import ManagerPayments from "@/pages/manager/Payments";
import PaymentForm from "@/pages/manager/PaymentForm";
import ManagerVisits from "@/pages/manager/Visits";
import VisitForm from "@/pages/manager/VisitForm";
import ManagerResidents from "@/pages/manager/Residents";
import ManagerRequestForm from "@/pages/manager/RequestForm";

import TechnicalDashboard from "@/pages/technical/Dashboard";
import CleaningPanel from "@/pages/cleaning/Panel";

import RequestsList from "@/components/RequestsList";
import RequestDetail from "@/pages/RequestDetail";
import Notifications from "@/pages/Notifications";
import About from "@/pages/About";

const queryClient = new QueryClient();

const Root = () => {
  const { role } = useStore();
  if (!role) return <Login />;
  const path = role === "resident" ? "/resident" : role === "manager" ? "/manager" : role === "technical" ? "/technical" : "/cleaning";
  return <Navigate to={path} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StoreProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />

            <Route element={<Layout />}>
              {/* Resident */}
              <Route path="/resident" element={<ResidentDashboard />} />
              <Route path="/resident/requests" element={<RequestsList scope="resident" basePath="/resident/requests" />} />
              <Route path="/resident/requests/:id" element={<RequestDetail />} />
              <Route path="/resident/new-request" element={<NewRequest />} />
              <Route path="/resident/payments" element={<ResidentPayments />} />
              <Route path="/resident/lease" element={<ResidentLease />} />
              <Route path="/resident/visits" element={<ResidentVisits />} />

              {/* Manager */}
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/apartments" element={<Apartments />} />
              <Route path="/manager/apartments/new" element={<ApartmentForm />} />
              <Route path="/manager/apartments/:id" element={<ApartmentDetail />} />
              <Route path="/manager/apartments/:id/edit" element={<ApartmentForm />} />
              <Route path="/manager/requests" element={<RequestsList scope="manager" basePath="/manager/requests" />} />
              <Route path="/manager/requests/new" element={<ManagerRequestForm />} />
              <Route path="/manager/requests/:id" element={<RequestDetail />} />
              <Route path="/manager/payments" element={<ManagerPayments />} />
              <Route path="/manager/payments/new" element={<PaymentForm />} />
              <Route path="/manager/visits" element={<ManagerVisits />} />
              <Route path="/manager/visits/new" element={<VisitForm />} />
              <Route path="/manager/residents" element={<ManagerResidents />} />

              {/* Technical */}
              <Route path="/technical" element={<TechnicalDashboard />} />
              <Route path="/technical/:id" element={<RequestDetail />} />

              {/* Cleaning */}
              <Route path="/cleaning" element={<CleaningPanel />} />

              <Route path="/notifications" element={<Notifications />} />
              <Route path="/about" element={<About />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
