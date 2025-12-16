// src/context/CustomersContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import Axios from "../axios"; // your axios instance

// ---- Interfaces ----
interface FileMeta {
  url: string;
  publicId: string;
  uploadedAt: string;
  originalName:string;
}

interface VehicleDetails {
  vehicleNo: string;
  policyCompany: string;
  policyExpiry: string;
  reminderSent?: boolean;
  reminderSentAt?: string | null;
  files: FileMeta[];   // ✅ NEW

}

interface HealthDetails {
  company: string;
  product: string;
  expiry: string;
  reminderSent?: boolean;
  reminderSentAt?: string | null;
  files: FileMeta[];   // ✅ NEW

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
  getCustomerById: (id: string) => Promise<CustomerData | null>;
  updateCustomer: (id: string, data: Partial<CustomerData>) => Promise<void>;
};

const CustomersContext = createContext<ContextType | undefined>(undefined);

export const CustomersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

 const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // ✅ Get JWT from login
      if (!token) {
        console.log("No token found — skipping fetchCustomers");
        setLoading(false);
        return;
      }

      const res = await Axios.get("/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };
  // 🔹 Fetch single customer by ID (uses your backend controller)
  const getCustomerById = async (id: string): Promise<CustomerData | null> => {
    try {
      const res = await Axios.get(`/api/customers/${id}`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch customer:", err);
      return null;
    }
  };

  // 🔹 Update customer (PUT or PATCH)
  const updateCustomer = async (
    id: string,
    data: Partial<CustomerData>
  ): Promise<void> => {
    try {
      await Axios.put(`/api/customers/${id}`, data);
      await fetchCustomers(); // refresh list
    } catch (err) {
      console.error("Failed to update customer:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <CustomersContext.Provider
      value={{ customers, loading, refresh: fetchCustomers, getCustomerById, updateCustomer }}
    >
      {children}
    </CustomersContext.Provider>
  );
};

// Hook
export function useCustomers() {
  const ctx = useContext(CustomersContext);
  if (!ctx)
    throw new Error("useCustomers must be used within CustomersProvider");
  return ctx;
}
