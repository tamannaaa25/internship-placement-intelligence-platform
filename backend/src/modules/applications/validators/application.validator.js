const { z } = require("zod");

// Define enums corresponding to Prisma status enums
const StatusEnum = z.enum([
  "APPLIED",
  "OA_SCHEDULED",
  "OA_COMPLETED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
]);

const createApplicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  jobUrl: z.string().url("Invalid URL format").nullable().optional().or(z.literal("")),
  salary: z.number().nonnegative("Salary must be a positive number").nullable().optional(),
  location: z.string().nullable().optional(),
  domain: z.string().min(1, "Domain is required"),
  status: StatusEnum.optional(),
  appliedDate: z.coerce.date().optional(),
  deadline: z.coerce.date().nullable().optional(),
});

const updateApplicationSchema = createApplicationSchema.partial();

const createRoundSchema = z.object({
  roundName: z.string().min(1, "Round name is required"),
  scheduledAt: z.coerce.date().nullable().optional(),
  interviewerName: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().nullable().optional(),
});

const updateRoundSchema = createRoundSchema.partial();

module.exports = {
  createApplicationSchema,
  updateApplicationSchema,
  createRoundSchema,
  updateRoundSchema,
};
