import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: ["income", "expense"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "salary",
        "freelance",
        "investment",
        "business",
        "food",
        "transport",
        "utilities",
        "rent",
        "healthcare",
        "education",
        "entertainment",
        "shopping",
        "travel",
        "other",
      ],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false, // Soft delete support
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


transactionSchema.index({ type: 1, category: 1, date: -1 });
transactionSchema.index({ createdBy: 1 });
transactionSchema.index({ isDeleted: 1 });

// Automatically exclude soft-deleted records
transactionSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
