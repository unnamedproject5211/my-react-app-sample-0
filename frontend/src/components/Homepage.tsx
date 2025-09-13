// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../axios";
import "./HomePage.css";

// --- Interfaces ---
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

interface CustomerData {
  _id?: string; // comes from MongoDB
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

  // New Fields
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

// --- Component ---
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch customers from backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await Axios.get("/api/customers");
        setCustomers(res.data); // assuming backend returns array
      } catch (error) {
        console.error("Error fetching customers", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="homepage-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Dashboard</h2>
        <ul>
          <li>
            <button onClick={() => navigate("/add-customer")}>
              Add Customer
            </button>
          </li>
          <li>View Customer</li>
          <li>Task</li>
          <li>Converted Case</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header with search */}
        <header className="header">
          <h1>Customer Management</h1>
          <input
            type="text"
            className="search-box"
            placeholder="Search customers..."
          />
        </header>

        {/* Dashboard stats */}
        <section className="stats">
          <div className="card">Total Customers: {customers.length}</div>
          <div className="card">
            Individual:{" "}
            {customers.filter((c) => c.customerType === "Individual").length}
          </div>
          <div className="card">
            Corporate:{" "}
            {customers.filter((c) => c.customerType === "Corporate").length}
          </div>
        </section>

        {/* Customer Table */}
        <section className="table-section">
          <h2>Customer List</h2>
          <div className="table-wrapper">
            {loading ? (
              <p>Loading...</p>
            ) : customers.length === 0 ? (
              <p>No customers found</p>
            ) : (
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Products</th>
                    <th>Source</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cust, index) => (
                    <tr key={cust._id || index}>
                      <td>{cust.customerId}</td>
                      <td>{cust.customerName}</td>
                      <td>{cust.mobile}</td>
                      <td>{cust.customerType}</td>
                      <td>
                        {cust.healthSelected && (
                          <span className="tag">Health ({cust.healthCount})</span>
                        )}
                        {cust.motorSelected && (
                          <span className="tag">Motor ({cust.vehicleCount})</span>
                        )}
                        {cust.smeSelected && (
                          <span className="tag">SME</span>
                        )}
                        {cust.loansSelected && (
                          <span className="tag">Loan</span>
                        )}
                      </td>
                      <td>{cust.source}</td>
                      <td>
                        <button className="view-btn">👁️</button>
                        <button className="edit-btn">✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
