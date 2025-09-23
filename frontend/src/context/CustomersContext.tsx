// src/context/CustomersContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import Axios from "../axios"; // your axios instance

// ---- Interfaces ----
interface VehicleDetails {
  vehicleNo: string;
  policyCompany: string;
  policyExpiry: string;
}

interface HealthDetails {
  company: string;
  product: string;
  expiry: string;
}

export interface CustomerData {
  _id?: string;
  customerId: string;
  customerType: string;
  customerName: string;
  mobile: string;
  dob: string;
  address: string;
  website: string;
  source: string;
  qualification: string;
  income: string;

  healthSelected: boolean;
  healthCount: number;
  healthDetails: HealthDetails[];

  motorSelected: boolean;
  vehicleCount: number;
  vehicles: VehicleDetails[];

  smeSelected: boolean;
  smeDetails: string;

  loansSelected: boolean;
  loanDetails: string;
}

// ---- Context ----
type ContextType = {
  customers: CustomerData[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const CustomersContext = createContext<ContextType | undefined>(undefined);

export const CustomersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await Axios.get("/api/customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <CustomersContext.Provider value={{ customers, loading, refresh: fetchCustomers }}>
      {children}
    </CustomersContext.Provider>
  );
};

// Hook
export function useCustomers() {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error("useCustomers must be used within CustomersProvider");
  return ctx;
}
