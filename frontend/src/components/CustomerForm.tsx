import React, { useState, useEffect} from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerForm.css";
import Axios from "../axios";

// Define TypeScript type for form data
interface VehicleDetails {
  vehicleNo: string;
  policyCompany: string;
  policyExpiry: Date | string;
}

interface HealthDetails{
  company: string;
  product: string;
  expiry: Date | string;
}
 
interface CustomerData {
  customerId: string;
  customerType: string;
  customerName: string;
  mobile: string;
  dob: Date | string;
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

const CustomerForm: React.FC = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState<CustomerData>({
    customerId: "",
    customerType: "",
    customerName: "",
    mobile: "",
    dob: "",
    address: "",
    website: "",
    source: "",
    qualification: "",
    income: "",

    // New defaults
    healthSelected: false,
    healthCount: 0,
    healthDetails:[],

    motorSelected: false,
    vehicleCount: 0,
    vehicles: [],

    smeSelected: false,
    smeDetails: "",

    loansSelected: false,
    loanDetails: "",
  });

  // ⭐ NEW — store files for each policy
  const [healthFiles, setHealthFiles] = useState<Record<number, File[]>>({});
  const [vehicleFiles, setVehicleFiles] = useState<Record<number, File[]>>({});

  // Auto-generate Customer ID when component mounts
  useEffect(() => {
    const generatedId = "CUST-" + Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, customerId: generatedId }));
  }, []);

  // Handle input changes
  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value, type } = e.target;

  if (type === "checkbox") {
    // ✅ Narrow to input element before using .checked
    const target = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: target.checked }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};

// Handle health count change
const handleHealthCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const count = parseInt(e.target.value) || 0;
  const details = Array.from({ length: count }, () => ({
    company: "",
    product: "",
    expiry: "",
  }));
  setFormData((prev) => ({
    ...prev,
    healthCount: count,
    healthDetails: details,
  }));
};

// Handle health details input
const handleHealthDetailChange = (
  index: number,
  field: keyof HealthDetails,
  value: string
) => {
  const updatedDetails = [...formData.healthDetails];
  updatedDetails[index][field] = value;
  setFormData((prev) => ({
    ...prev,
    healthDetails: updatedDetails,
  }));
};

// ⭐ NEW — handle health file uploads
  const handleHealthFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    setHealthFiles((prev) => ({
      ...prev,
      [index]: Array.from(files),
    }));
  };

  // Handle vehicle count change
  const handleVehicleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 0;
    const vehicles = Array.from({ length: count }, () => ({
      vehicleNo: "",
      policyCompany: "",
      policyExpiry: "",
    }));
    setFormData((prev) => ({  
      ...prev,
      vehicleCount: count,
      vehicles,
    }));
  };

  // Handle vehicle details input
  const handleVehicleDetailChange = (
    index: number,
    field: keyof VehicleDetails,
    value: string
  ) => {
    const updatedVehicles = [...formData.vehicles];
    updatedVehicles[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      vehicles: updatedVehicles,
    }));
  };

   // ⭐ NEW — handle vehicle file uploads
  const handleVehicleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    setVehicleFiles((prev) => ({
      ...prev,
      [index]: Array.from(files),
    }));
  };

  // ------------------------------------------------------
  // SUBMIT — SEND JSON + FILES USING FormData
  // ------------------------------------------------------
 // Handle form submit
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  // Validation
  if (!formData.customerName.trim()) {
    alert("Customer name is required!");
    return;
  }

  if (!formData.mobile.trim()) {
    alert("Mobile number is required!");
    return;
  }

  console.log("📋 Submitting form data:", formData);

  const form = new FormData();

  // Append JSON DATA
  form.append("customerData", JSON.stringify(formData));

  // Append HEALTH files
  Object.entries(healthFiles).forEach(([index, files]) => {
    files.forEach((file) => {
      form.append(`health_${index}`, file);
    });
  });

  // Append VEHICLE files
  Object.entries(vehicleFiles).forEach(([index, files]) => {
    files.forEach((file) => {
      form.append(`vehicle_${index}`, file);
    });
  });

  // Debug logs
  console.log("📦 Sending FormData with entries:");
  for (let [key, value] of form.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
    } else {
      console.log(`  ${key}:`, value);
    }
  }

  try {
  const res = await Axios.post("/api/customers", form, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  console.log("✅ Customer saved successfully:", res.data);
  alert("Customer saved successfully!");
  navigate("/home");
  } catch (error: any) {
    console.error("❌ Error submitting form:", error);
    
    if (error.response) {
      console.error("❌ Server responded with:", error.response.data);
      alert(error.response.data.message || "Server error occurred");
    } else if (error.request) {
      console.error("❌ No response from server");
      alert("Cannot connect to server. Please check if backend is running.");
    } else {
      console.error("❌ Error:", error.message);
      alert("An error occurred: " + error.message);
    }
  }
};
  return (
    <div className="form-container">
      <h2>Customer Details Form</h2>
      <form onSubmit={handleSubmit}>
        {/* Existing fields remain unchanged */}
        <div className="input-box">
          <label htmlFor="customerId">Customer ID</label>
          <input
            type="text"
            id="customerId"
            name="customerId"
            value={formData.customerId}
            readOnly
          />
        </div>

        <div className="input-box">
          <label htmlFor="customerType">Customer Type</label>
          <select
            id="customerType"
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

        <div className="input-box">
          <label htmlFor="customerName">Customer Name</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="input-box">
          <label htmlFor="mobile">Mobile No</label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter mobile number"
            required
          />
        </div>

        <div className="input-box">
          <label htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={String(formData.dob).slice(0, 10)}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-box">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
            required
          ></textarea>
        </div>

        <div className="input-box">
          <label htmlFor="website">Website</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="Enter website link"
          />
        </div>

        <div className="input-box">
          <label htmlFor="source">Source</label>
          <input
            type="text"
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="Enter source"
          />
        </div>

        <div className="input-box">
          <label htmlFor="qualification">Qualification</label>
          <input
            type="text"
            id="qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            placeholder="Enter qualification"
          />
        </div>

        <div className="input-box">
          <label htmlFor="income">Income</label>
          <input
            type="number"
            id="income"
            name="income"
            value={formData.income}
            onChange={handleChange}
            placeholder="Enter income"
            required
          />
        </div>

        {/* ✅ New Section: Checkboxes */}
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
            {formData.healthDetails.map((detail, index) => (
              <div key={index} className="health-box">
                <input
                  type="text"
                  placeholder="Company"
                  value={detail.company}
                  onChange={(e) =>
                    handleHealthDetailChange(index, "company", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Product"
                  value={detail.product}
                  onChange={(e) =>
                    handleHealthDetailChange(index, "product", e.target.value)
                  }
                />
                <input
                  type="date"
                  placeholder="Expiry"
                  value={String(detail.expiry).slice(0,10)}
                  onChange={(e) =>
                    handleHealthDetailChange(index, "expiry", e.target.value)
                  }
                />
                {/* ⭐ NEW File Upload */}
                <label>Upload Health Files</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleHealthFileChange(index, e)}
                />
              </div>
            ))}
          </div>
        )}

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
              {formData.vehicles.map((vehicle, index) => (
                <div key={index} className="vehicle-box">
                  <input
                    type="text"
                    placeholder="Vehicle No"
                    value={vehicle.vehicleNo}
                    onChange={(e) =>
                      handleVehicleDetailChange(index,"vehicleNo",e.target.value )
                    }
                  />
                  <input
                    type="text"
                    placeholder="Policy Company"
                    value={vehicle.policyCompany}
                    onChange={(e) =>
                      handleVehicleDetailChange(index,"policyCompany",e.target.value )
                    }
                  />
                  <input
                    type="date"
                    placeholder="Policy Expiry"
                    value={String(vehicle.policyExpiry).slice(0,10)}
                    onChange={(e) =>
                      handleVehicleDetailChange(index,"policyExpiry",e.target.value)
                    }
                  />
                  {/* ⭐ NEW File Upload */}
                <label>Upload Vehicle Files</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleVehicleFileChange(index, e)}
                />
                </div>
              ))}
            </div>
          )}

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
                placeholder="Enter SME details..."
                rows={4}
              ></textarea>
            </div>
          )}

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
                placeholder="Enter Loan details..."
                rows={4}
              ></textarea>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CustomerForm;
