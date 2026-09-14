const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    placementStatus: {
      type: String,
      enum: ["Placed", "Unplaced"],
      default: "Placed",
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    jobRole: {
      type: String,
      default: "",
      trim: true,
    },
    salaryLpa: {
      type: Number,
      default: null,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Placement", placementSchema);
