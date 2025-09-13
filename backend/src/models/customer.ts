// src/models/Customer.ts
import mongoose, { Document, Schema } from "mongoose";

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

export interface ICustomer extends Document {
  customerId: string;
  customerType: string;
  customerName: string;
  mobile: string;
  dob: string;
  address: string;
  website?: string;
  source?: string;
  qualification?: string;
  income?: number | string;

  healthSelected: boolean;
  healthCount: number;
  healthDetails: HealthDetails[];

  motorSelected: boolean;
  vehicleCount: number;
  vehicles: VehicleDetails[];

  smeSelected: boolean;
  smeDetails?: string;

  loansSelected: boolean;
  loanDetails?: string;

  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<VehicleDetails>(
  {
    vehicleNo: { type: String, default: "" },
    policyCompany: { type: String, default: "" },
    policyExpiry: { type: String, default: "" },
  },
  { _id: false }
);

const HealthSchema = new Schema<HealthDetails>(
  {
    company: { type: String, default: "" },
    product: { type: String, default: "" },
    expiry: { type: String, default: "" },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, required: true, index: true, unique: true },
    customerType: { type: String, required: true},
    customerName: { type: String },
    mobile: { type: String },
    dob: { type: String },
    address: { type: String },
    website: { type: String },
    source: { type: String },
    qualification: { type: String },
    income: { type: Schema.Types.Mixed },

    healthSelected: { type: Boolean, default: false },
    healthCount: { type: Number, default: 0 },
    healthDetails: { type: [HealthSchema], default: [] },

    motorSelected: { type: Boolean, default: false },
    vehicleCount: { type: Number, default: 0 },
    vehicles: { type: [VehicleSchema], default: [] },

    smeSelected: { type: Boolean, default: false },
    smeDetails: { type: String, default: "" },

    loansSelected: { type: Boolean, default: false },
    loanDetails: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
