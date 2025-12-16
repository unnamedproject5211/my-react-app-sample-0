import mongoose, { Document, Schema } from "mongoose";
import { FileMeta, FileSchema } from "./File";    // ⭐ NEW

// --- Interfaces ---
interface VehicleDetails {
  vehicleNo: string;
  policyCompany: string;
  policyExpiry: Date;
  reminderSent?: boolean;
  reminderSentAt?: Date | null;

  files: FileMeta[];     // ⭐ NEW
}

interface HealthDetails {
  company: string;
  product: string;
  expiry: Date;
  reminderSent?: boolean;
  reminderSentAt?: Date | null;

  files: FileMeta[];     // ⭐ NEW
}

export interface ICustomer extends Document {
  userId: mongoose.Schema.Types.ObjectId;

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

    files: { type: [FileSchema], default: [] },  // ⭐ NEW
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

    files: { type: [FileSchema], default: [] }, // ⭐ NEW
  },
  { _id: false }
);

// --- Main schema ---
const CustomerSchema = new Schema<ICustomer>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
