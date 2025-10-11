// src/pages/ExpiringPoliciesPage.tsx
import React, { useMemo } from "react";
import { useCustomers } from "../context/CustomersContext";
import  { isExpiringSoon } from "../utils/dateUtils";
import "./ExpiringPoliciesPage.css";

const ExpiringPoliciesPage: React.FC = () => {
  const { customers, loading } = useCustomers();
  const daysBefore = 30;

  // Filter customers with expiring health or vehicle
  const expiringCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (c.healthSelected && c.healthDetails.some((h) => isExpiringSoon(h.expiry, daysBefore))) {
        return true;
      }
      if (c.motorSelected && c.vehicles.some((v) => isExpiringSoon(v.policyExpiry, daysBefore))) {
        return true;
      }
      return false;
    });
  }, [customers]);

  return (
    <div className="expiring-page">
      <h1>Expiring Policies (Next {daysBefore} Days)</h1>

      {loading ? (
        <p>Loading...</p>
      ) : expiringCustomers.length === 0 ? (
        <p>No expiring policies found.</p>
      ) : (
        <table className="expiring-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Type</th>
              <th>Expiring Products</th>
            </tr>
          </thead>
          <tbody>
            {expiringCustomers.map((c) => (
              <tr key={c._id || c.customerId}>
                <td>{c.customerId}</td>
                <td>{c.customerName}</td>
                <td>{c.mobile}</td>
                <td>{c.customerType}</td>
                <td>
                  {/* Health expiries */}
                  {c.healthSelected &&
                    c.healthDetails
                      .filter((h) => isExpiringSoon(h.expiry, daysBefore))
                      .map((h, idx) => (
                        <div key={idx} className="expiring-warning">
                          Health ({h.company}) – expires {h.expiry}
                        </div>
                      ))}

                  {/* Vehicle expiries */}
                  {c.motorSelected &&
                    c.vehicles
                      .filter((v) => isExpiringSoon(v.policyExpiry, daysBefore))
                      .map((v, idx) => (
                        <div key={idx} className="expiring-warning">
                          Vehicle {v.vehicleNo} ({v.policyCompany}) – expires {v.policyExpiry}
                        </div>
                      ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpiringPoliciesPage;
