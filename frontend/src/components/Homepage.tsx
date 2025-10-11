// src/pages/HomePage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "../context/CustomersContext"; // ⬅️ use context instead of Axios
import "./Homepage.css";

// --- Component ---
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // ⬅️ get customers + loading from context
  const { customers, loading } = useCustomers();

  // Search query controlled by input box
  const [query, setQuery] = useState<string>("");

  // Compute filtered customers based on query.
  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter((c) => {
      const name = (c.customerName || "").toLowerCase();
      const id = (c.customerId || "").toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [customers, query]);

  // Handler for search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

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
          <li>
            <button onClick={()=> navigate("/exp-policy")}>
            Task
            </button>
          </li>
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
            placeholder="Search by name or customer ID..."
            value={query}
            onChange={handleSearchChange}
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
          <div className="card">Results: {filteredCustomers.length}</div>
        </section>

        {/* Customer Table */}
        <section className="table-section">
          <h2>Customer List</h2>
          <div className="table-wrapper">
            {loading ? (
              <p>Loading...</p>
            ) : filteredCustomers.length === 0 ? (
              <p>No customers found{query ? ` for "${query}"` : ""}</p>
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
                  {filteredCustomers.map((cust) => (
                    <tr key={cust._id || cust.customerId}>
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
                        {cust.smeSelected && <span className="tag">SME</span>}
                        {cust.loansSelected && <span className="tag">Loan</span>}
                      </td>
                      <td>{cust.source}</td>
                      <td>
                        <button className="view-btn" >👁️</button>
                        <button 
                        className="edit-btn" onClick={() => navigate(`/edit/${cust.customerId}`)}>✏️</button>
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
