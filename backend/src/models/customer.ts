// src/models/Customer.ts
import mongoose, { Document, Schema } from "mongoose";

// --- Interfaces ---
interface VehicleDetails {
  vehicleNo: string;
  policyCompany: string;
  policyExpiry: Date;           // Date type
  reminderSent?: boolean;       // NEW
  reminderSentAt?: Date | null; // NEW
}

interface HealthDetails {
  company: string;
  product: string;
  expiry: Date;                 // Date type
  reminderSent?: boolean;       // NEW
  reminderSentAt?: Date | null; // NEW
}

export interface ICustomer extends Document {
  userId: mongoose.Schema.Types.ObjectId; // ✅ link to the User who owns this customer

  customerId: string;
  customerType: string;
  customerName: string;
  mobile: string;
  dob: Date;
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

// --- Subschemas ---
const VehicleSchema = new Schema<VehicleDetails>(
  {
    vehicleNo: { type: String, default: "" },
    policyCompany: { type: String, default: "" },
    policyExpiry: { type: Date, default: null },
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: { type: Date, default: null },
  },
  { _id: false }
);

const HealthSchema = new Schema<HealthDetails>(
  {
    company: { type: String, default: "" },
    product: { type: String, default: "" },
    expiry: { type: Date, default: null },
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: { type: Date, default: null },
  },
  { _id: false }
);

// --- Main Customer Schema ---
const CustomerSchema = new Schema<ICustomer>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // ✅ ensures every customer belongs to a user
    },

    customerId: { type: String, required: true, index: true, unique: true },
    customerType: { type: String, required: true },
    customerName: { type: String },
    mobile: { type: String },
    dob: { type: Date },
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
    loanDetails: { type: String, default: "" },
  },
  { timestamps: true }
);

// --- Model Export ---
export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
