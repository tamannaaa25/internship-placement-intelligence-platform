const mongoose = require("mongoose");

const interviewRoundSchema = new mongoose.Schema(
  {
    roundName: {
      type: String,
      required: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    interviewerName: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    roleTitle: {
      type: String,
      required: true,
      trim: true,
    },
    jobUrl: {
      type: String,
      default: null,
    },
    salary: {
      type: Number,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    domain: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "APPLIED",
        "OA_SCHEDULED",
        "OA_COMPLETED",
        "INTERVIEWING",
        "OFFER",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "APPLIED",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      default: null,
    },
    rounds: [interviewRoundSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._count = { rounds: ret.rounds ? ret.rounds.length : 0 };
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._count = { rounds: ret.rounds ? ret.rounds.length : 0 };
        return ret;
      },
    },
  }
);

// Compound indexes for user queries
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, appliedDate: -1 });

module.exports = mongoose.model("Application", applicationSchema);
