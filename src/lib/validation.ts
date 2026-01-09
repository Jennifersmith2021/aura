/**
 * Data validation schemas using Zod
 */

import { z } from "zod";

// Item validation
export const ItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  type: z.enum(["clothing", "makeup"]),
  category: z.string(),
  userId: z.string().optional(),
  color: z.string().max(50).optional(),
  image: z.string().optional(),
  purchaseUrl: z.string().url().optional(),
  price: z.number().min(0).optional(),
  wishlist: z.boolean().optional(),
  brand: z.string().max(100).optional(),
  dateAdded: z.number(),
  dateOpened: z.number().optional(),
  notes: z.string().optional(),
  importMeta: z
    .object({
      confidence: z.number().min(0).max(1).optional(),
      source: z.string().optional(),
      order_id: z.string().optional(),
      asin: z.string().optional(),
      order_date: z.string().optional(),
      quantity: z.number().optional(),
      url: z.string().optional(),
    })
    .optional(),
});

export type Item = z.infer<typeof ItemSchema>;

// Measurement validation
export const MeasurementLogSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.number(),
  values: z.object({
    bust: z.number().optional(),
    waist: z.number().optional(),
    hips: z.number().optional(),
    underbust: z.number().optional(),
    shoulders: z.number().optional(),
    inseam: z.number().optional(),
    shoe: z.number().optional(),
    weight: z.number().optional(),
    dressSize: z.number().optional(),
    shoeSize: z.number().optional(),
    braBand: z.number().optional(),
    braCup: z.string().optional(),
    breast: z.number().optional(),
    butt: z.number().optional(),
    clitLengthMm: z.number().optional(),
    clitGirthMm: z.number().optional(),
  }),
  photo: z.string().optional(),
  goalWaist: z.number().optional(),
  goalWHR: z.number().optional(),
});

export type MeasurementLog = z.infer<typeof MeasurementLogSchema>;

// Orgasm log validation
export const OrgasmLogSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.number(),
  type: z.enum(["solo", "partnered", "other"]).optional(),
  method: z
    .enum(["wand", "anal", "penetration", "oral", "hands", "other"])
    .optional(),
  chastityStatus: z.enum(["locked", "unlocked"]).optional(),
  note: z.string().optional(),
});

export type OrgasmLog = z.infer<typeof OrgasmLogSchema>;

// Chastity session validation
export const ChastitySessionSchema = z.object({
  id: z.string().uuid().optional(),
  startDate: z.number(),
  endDate: z.number().optional(),
  cageModel: z.string().optional(),
  ringSize: z.string().optional(),
  hygieneEvents: z.array(z.object({ date: z.number(), duration: z.number() })).optional(),
});

export type ChastitySession = z.infer<typeof ChastitySessionSchema>;

// Look validation
export const LookSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  items: z.array(z.string().uuid()),
  dateCreated: z.number(),
  image: z.string().optional(),
});

export type Look = z.infer<typeof LookSchema>;

// Workout session validation
export const WorkoutSessionSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.number(),
  type: z.string(),
  durationMinutes: z.number().min(0),
  caloriesBurned: z.number().min(0).optional(),
  intensity: z.enum(["low", "moderate", "high"]).optional(),
  notes: z.string().optional(),
});

export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;

// Shopping item validation
export const ShoppingItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  price: z.number().min(0).optional(),
  retailer: z.string().optional(),
  url: z.string().url().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  purchased: z.boolean().optional(),
  datePurchased: z.number().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;

/**
 * Validation helper functions
 */

export function validateItem(data: unknown): { valid: boolean; data?: Item; errors?: string[] } {
  try {
    const validated = ItemSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return { valid: false, errors };
    }
    return { valid: false, errors: ["Unknown validation error"] };
  }
}

export function validateMeasurement(
  data: unknown
): { valid: boolean; data?: MeasurementLog; errors?: string[] } {
  try {
    const validated = MeasurementLogSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return { valid: false, errors };
    }
    return { valid: false, errors: ["Unknown validation error"] };
  }
}

export function validateBatch<T>(
  data: unknown[],
  schema: z.ZodSchema
): {
  valid: T[];
  invalid: Array<{ data: unknown; errors: string[] }>;
} {
  const valid: T[] = [];
  const invalid: Array<{ data: unknown; errors: string[] }> = [];

  data.forEach((item) => {
    try {
      const validated = schema.parse(item);
      valid.push(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        invalid.push({ data: item, errors });
      } else {
        invalid.push({ data: item, errors: ["Unknown validation error"] });
      }
    }
  });

  return { valid, invalid };
}

/**
 * Create a typed validator
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { valid: boolean; data?: T; error?: string } => {
    try {
      const validated = schema.parse(data);
      return { valid: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, error: error.errors[0]?.message };
      }
      return { valid: false, error: "Unknown validation error" };
    }
  };
}

/**
 * Safe parse with default values
 */
export function safeParseItem(data: unknown, defaults?: Partial<Item>): Item {
  try {
    return ItemSchema.parse(data);
  } catch {
    // Return minimal valid item
    return {
      name: (data as any)?.name || "Unknown",
      type: (data as any)?.type || "clothing",
      category: (data as any)?.category || "other",
      dateAdded: (data as any)?.dateAdded || Date.now(),
      ...defaults,
    } as Item;
  }
}

/**
 * Type predicates
 */
export function isValidItem(data: unknown): data is Item {
  return ItemSchema.safeParse(data).success;
}

export function isValidMeasurement(data: unknown): data is MeasurementLog {
  return MeasurementLogSchema.safeParse(data).success;
}

export function isValidOrgasmLog(data: unknown): data is OrgasmLog {
  return OrgasmLogSchema.safeParse(data).success;
}
