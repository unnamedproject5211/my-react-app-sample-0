// src/pages/EditCustomerPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import  { useCustomers } from "../context/CustomersContext";
import type {  CustomerData } from "../context/CustomersContext";
import "./EditCustomerPage.css";
import Axios from "../axios";

const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // customerId in URL
  const navigate = useNavigate();

  // context provides getCustomerById and updateCustomer (you implemented these)
  const { getCustomerById, updateCustomer } = useCustomers();

  const [formData, setFormData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

    // processing state to disable buttons while an operation runs
  const [isProcessing, setIsProcessing] = useState(false);

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
  const handleHealthCountChange = (count: number) => {
  if (!formData) return;

  const safeCount = Math.min(count, 30); // ✅ Limit max value to prevent UI freeze

  const existing = formData.healthDetails || [];

  const updated = Array.from({ length: safeCount }, (_, i) =>
    existing[i] || {
      company: "",
      product: "",
      expiry: "",
      files: [],
    }
  );

  setFormData({
    ...formData,
    healthCount: safeCount,
    healthDetails: updated,
  });
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

  const handleDeleteHealthDetail = (index: number) => {
  if (!formData) return;

  const updated = formData.healthDetails.filter((_, i) => i !== index);

  setFormData({
    ...formData,
    healthCount: updated.length,
    healthDetails: updated,
  });
};

  // Vehicle count change
 const handleVehicleCountChange = (count: number) => {
  if (!formData) return;

  const safeCount = Math.min(count, 30); // ✅ Limit max value to prevent UI freeze

  const existing = formData.vehicles || [];

  const updated = Array.from({ length: safeCount }, (_, i) =>
    existing[i] || {
      vehicleNo: "",
      policyCompany: "",
      policyExpiry: "",
      files: [],
    }
  );

  setFormData({
    ...formData,
    vehicleCount: safeCount,
    vehicles: updated,
  });
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

 const handleDeleteVehicleDetail = (index: number) => {
  if (!formData) return;

  const updated = formData.vehicles.filter((_, i) => i !== index);

  setFormData({
    ...formData,
    vehicleCount: updated.length,
    vehicles: updated,
  });
};

  // ---------------------------
  // FILE HANDLERS: Upload / Delete / Replace
  // ---------------------------

  // Upload file to health index
  const handleUploadHealthFile = async (index: number, file: File | null) => {
    if (!file || !formData) return;
    setIsProcessing(true);
    try {
      const form = new FormData();
      form.append("file", file);

      // POST to your upload endpoint (adjust path if router mounted differently)
      const res = await Axios.post(`/files/health/${formData.customerId}/${index}`,form);
      const newFile = res.data.file; // expected DB subdoc with _id, url, originalName

      // Update local state so UI reflects immediately
      const updated = { ...formData };
      updated.healthDetails = updated.healthDetails || [];
      updated.healthDetails[index].files = updated.healthDetails[index].files || [];
      updated.healthDetails[index].files=[newFile];
      setFormData(updated);
    } catch (err: any) {
      console.error("upload error", err);
      alert(err?.response?.data?.message || "Upload failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload file to vehicle index
  const handleUploadVehicleFile = async (index: number, file: File | null) => {
    if (!file || !formData) return;
    setIsProcessing(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await Axios.post(
        `/files/vehicle/${formData.customerId}/${index}`,
        form
      );
      const newFile = res.data.file;

      const updated = { ...formData };
      updated.vehicles = updated.vehicles || [];
      updated.vehicles[index].files = updated.vehicles[index].files || [];
      updated.vehicles[index].files= [newFile];
      setFormData(updated);
    } catch (err: any) {
      console.error("upload error", err);
      alert(err?.response?.data?.message || "Upload failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete any file (section: "health" | "vehicles")
  const handleDeleteFile = async (
  section: "health" | "vehicles",
  index: number,
  file: any
) => {
  if (!formData) return;
  if (!confirm("Delete this file?")) return;

  setIsProcessing(true);
  try {
    await Axios.delete(
      `/files/${formData.customerId}/files?section=${section}&index=${index}`
    );

    // Remove locally
    const updated = { ...formData };
    if (section === "health") {
      updated.healthDetails[index].files =
        (updated.healthDetails[index].files || []).filter(
          (f: any) => String(f._id) !== String(file._id)
        );
    } else {
      updated.vehicles[index].files =
        (updated.vehicles[index].files || []).filter(
          (f: any) => String(f._id) !== String(file._id)
        );
    }

    setFormData(updated);
  } catch (err) {
    console.error("delete error", err);
    alert("Delete failed");
  } finally {
    setIsProcessing(false);
  }
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
            value={formData.dob ? new Date(formData.dob).toISOString().slice(0,10): ""}
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

              <div className="count-control">
                
                <span className="count-display">
                  {formData.healthCount}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const value = Math.min(10, Number(formData.healthCount) + 1);
                    handleHealthCountChange(value);
                  }}
                >
                  +
                </button>
              </div>

              {formData.healthDetails.map((detail, i) => (
                <div key={i} className="health-box">
                  <div className="health-row">
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
                    value={detail.expiry ? new Date(detail.expiry).toISOString().slice(0,10) : ""}
                    onChange={(e) =>
                      handleHealthDetailChange(i, "expiry", e.target.value)
                    }
                    />
                   <button
                        type="button"
                        onClick={() => handleDeleteHealthDetail(i)}
                        disabled={isProcessing}
                        className="remove-policy-btn"
                        >
                        ✕ Remove
                      </button>
                      </div>
              
                   {/* Add file input */}
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      onChange={(e) => handleUploadHealthFile(i, e.target.files?.[0] || null)}
                      disabled={isProcessing}
                      multiple={false}
                    />
                  </div>
                  {/* ✅ NEW — Show uploaded files */}
                  {detail.files?.[0] && <p>Uploaded files:</p>}
                  {detail.files?.[0]&& (
                    <div className="file-preview-box">
                        <a
                          href={detail.files[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                         {detail.files[0].originalName || "File"}
                        </a>
                            <button
                              className="file-remove-btn"
                              type="button"
                              onClick={() => handleDeleteFile("health", i, detail.files![0])}
                              disabled={isProcessing}
                              aria-label="Remove file"
                            >
                              ✕
                            </button>
                      </div>        
                )}
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
              <div className="count-control">
                <span className="count-display">
                  {formData.vehicleCount}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const value = Math.min(10, Number(formData.vehicleCount) + 1);
                    handleVehicleCountChange(value);
                  }}
                >
                  +
                </button>
                </div>

              {formData.vehicles.map((v, i) => (
                <div key={i} className="vehicle-box">
                  <div className="health-row">
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
                    value={v.policyExpiry ? new Date(v.policyExpiry).toISOString().slice(0,10) : ""}
                    onChange={(e) =>
                      handleVehicleDetailChange(i, "policyExpiry", e.target.value)
                    }
                    />
                  <button
                        type="button"
                        onClick={() => handleDeleteVehicleDetail(i)}
                        disabled={isProcessing}
                        className="remove-policy-btn"
                        >
                        ✕ Remove 
                  </button>
                    </div>
                    {/* Add vehicle file input */}
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      onChange={(e) => handleUploadVehicleFile(i, e.target.files?.[0] || null)}
                      disabled={isProcessing}
                    />
                  </div>

              {v.files?.[0] && <p>Uploaded File:</p>}

                   {/* ✅ NEW — Show uploaded files */}
              {v.files?.[0] &&  (
                <div className="file-preview-box">
                        <a
                          href={v.files[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          {v.files[0].originalName || "File"}
                        </a>
                            <button
                              type="button"
                              className="file-remove-btn"
                              onClick={() => handleDeleteFile("vehicles", i, v.files![0])}
                              disabled={isProcessing}
                              aria-label="Remove file"
                            >
                              ✕
                            </button>
                </div>
              )}
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
          <button type="button" onClick={() => navigate("/home")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomerPage;
