// src/pages/EditCustomerPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import  { useCustomers } from "../context/CustomersContext";
import type {  CustomerData } from "../context/CustomersContext";
import "./CustomerForm.css";

const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // customerId in URL
  const navigate = useNavigate();

  // context provides getCustomerById and updateCustomer (you implemented these)
  const { getCustomerById, updateCustomer } = useCustomers();

  const [formData, setFormData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load customer once on mount
  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const customer = await getCustomerById(id);
      setFormData(customer);
      setLoading(false);
    };
    load();
  }, [id, getCustomerById]);

  // Generic change handler (text/select/textarea/checkbox)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (!formData) return;
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked } as CustomerData);
    } else {
      setFormData({ ...formData, [name]: value } as CustomerData);
    }
  };

  // Health count change: preserve existing entries when possible, slice when reducing
  const handleHealthCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const count = parseInt(e.target.value || "0", 10) || 0;
    const existing = formData.healthDetails || [];
    let updated = [...existing];

    if (updated.length < count) {
      updated = [
        ...updated,
        ...Array.from({ length: count - updated.length }, () => ({
          company: "",
          product: "",
          expiry: "",
        })),
      ];
    } else {
      updated = updated.slice(0, count);
    }

    setFormData({ ...formData, healthCount: count, healthDetails: updated });
  };

  const handleHealthDetailChange = (
    index: number,
    field: keyof (CustomerData["healthDetails"][number]),
    value: string
  ) => {
    if (!formData) return;
    const updated = formData.healthDetails ? [...formData.healthDetails] : [];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, healthDetails: updated });
  };

  // Vehicle count change
  const handleVehicleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const count = parseInt(e.target.value || "0", 10) || 0;
    const existing = formData.vehicles || [];
    let updated = [...existing];

    if (updated.length < count) {
      updated = [
        ...updated,
        ...Array.from({ length: count - updated.length }, () => ({
          vehicleNo: "",
          policyCompany: "",
          policyExpiry: "",
        })),
      ];
    } else {
      updated = updated.slice(0, count);
    }

    setFormData({ ...formData, vehicleCount: count, vehicles: updated });
  };

  const handleVehicleDetailChange = (
    index: number,
    field: keyof (CustomerData["vehicles"][number]),
    value: string
  ) => {
    if (!formData) return;
    const updated = formData.vehicles ? [...formData.vehicles] : [];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, vehicles: updated });
  };

  // Submit: call context updateCustomer which does PUT + refresh
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      // updateCustomer expects id and (Partial) data — context handles the API call + refresh
      await updateCustomer(formData.customerId, formData);
      alert("Customer updated successfully!");
      navigate("/home");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update customer — check console.");
    }
  };

  if (loading) return <p>Loading customer...</p>;
  if (!formData) return <p>Customer not found.</p>;

  return (
    <div className="form-container">
      <h2>Edit Customer {formData.customerId}</h2>
      <form onSubmit={handleSubmit}>
        {/* Customer ID - read only */}
        <div className="input-box">
          <label>Customer ID</label>
          <input type="text" value={formData.customerId} readOnly />
        </div>

        {/* Customer Type */}
        <div className="input-box">
          <label>Customer Type</label>
          <select
            name="customerType"
            value={formData.customerType}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Type --</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
        </div>

        {/* Basic fields */}
        <div className="input-box">
          <label>Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-box">
          <label>Mobile</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
          />
        </div>

        <div className="input-box">
          <label>DOB</label>
          <input
            type="date"
            name="dob"
            value={String(formData.dob).slice(0,10) }
            onChange={handleChange}
          />
        </div>

        <div className="input-box">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="input-box">
          <label>Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        <div className="input-box">
          <label>Source</label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
          />
        </div>

        <div className="input-box">
          <label>Qualification</label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
          />
        </div>

        <div className="input-box">
          <label>Income</label>
          <input
            type="number"
            name="income"
            value={formData.income}
            onChange={handleChange}
          />
        </div>

        {/* Health */}
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="healthSelected"
              checked={formData.healthSelected}
              onChange={handleChange}
            />
            Health
          </label>

          {formData.healthSelected && (
            <div className="sub-section">
              <h4>Health Details</h4>

              <input
                type="number"
                name="healthCount"
                value={formData.healthCount}
                onChange={handleHealthCountChange}
                placeholder="Number of Health Policies"
              />

              {formData.healthDetails.map((detail, i) => (
                <div key={i} className="health-box">
                  <input
                    type="text"
                    placeholder="Company"
                    value={detail.company}
                    onChange={(e) =>
                      handleHealthDetailChange(i, "company", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Product"
                    value={detail.product}
                    onChange={(e) =>
                      handleHealthDetailChange(i, "product", e.target.value)
                    }
                  />
                  <input
                    type="date"
                    placeholder="Expiry"
                    value={detail.expiry}
                    onChange={(e) =>
                      handleHealthDetailChange(i, "expiry", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Motor */}
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="motorSelected"
              checked={formData.motorSelected}
              onChange={handleChange}
            />
            Motor
          </label>

          {formData.motorSelected && (
            <div className="sub-section">
              <h4>Motor Details</h4>

              <input
                type="number"
                name="vehicleCount"
                value={formData.vehicleCount}
                onChange={handleVehicleCountChange}
                placeholder="Number of Vehicles"
              />

              {formData.vehicles.map((v, i) => (
                <div key={i} className="vehicle-box">
                  <input
                    type="text"
                    placeholder="Vehicle No"
                    value={v.vehicleNo}
                    onChange={(e) =>
                      handleVehicleDetailChange(i, "vehicleNo", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Policy Company"
                    value={v.policyCompany}
                    onChange={(e) =>
                      handleVehicleDetailChange(i, "policyCompany", e.target.value)
                    }
                  />
                  <input
                    type="date"
                    placeholder="Policy Expiry"
                    value={v.policyExpiry}
                    onChange={(e) =>
                      handleVehicleDetailChange(i, "policyExpiry", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SME */}
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="smeSelected"
              checked={formData.smeSelected}
              onChange={handleChange}
            />
            SME
          </label>

          {formData.smeSelected && (
            <div className="sub-section">
              <h4>SME Details</h4>
              <textarea
                name="smeDetails"
                value={formData.smeDetails}
                onChange={handleChange}
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Loans */}
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="loansSelected"
              checked={formData.loansSelected}
              onChange={handleChange}
            />
            Loans
          </label>

          {formData.loansSelected && (
            <div className="sub-section">
              <h4>Loan Details</h4>
              <textarea
                name="loanDetails"
                value={formData.loanDetails}
                onChange={handleChange}
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="edit-customer-buttons">
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => navigate("/")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomerPage;
