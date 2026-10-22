import mongoose from "mongoose";

export const job_categories = [
  "plumbing",
  "typing",
  "electricals",
  "cleaning",
  "painting",
  "carpentry",
  "writing",
  "laundry",
  "tutoring",
  "gardening",
  "other",
];

const jobSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    service: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      trim: true,
      required: true,
      enum: [
        "requested",
        "accepted",
        "in_progress",
        "awaiting_confirmation",
        "completed",
        "cancel",
      ],
      default: "requested",
    },
    category: {
      required: true,
      enum: job_categories,
      type: String,
    },
  },
  { timestamps: true },
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
