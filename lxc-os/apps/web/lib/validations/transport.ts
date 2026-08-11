import { z } from "zod";

// --- Bus Schemas ---
export const createBusSchema = z.object({
  busNumber: z.string().min(1, "Bus number is required"),
  capacity: z.coerce.number().int().positive(), // Coerce for form data safety
  schoolId: z.string().cuid("Invalid school id"),
});

export const updateBusSchema = z.object({
  busNumber: z.string().min(1).optional(),
  capacity: z.coerce.number().int().positive().optional(),
});

export const busIdParamSchema = z.object({
  id: z.string().cuid("Invalid bus id"),
});

// --- Route Schemas ---
export const createRouteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  busId: z.string().cuid("Invalid bus id"),
  schoolId: z.string().cuid("Invalid school id"),
  distance: z.coerce.number().positive().optional(),
  busStopIds: z.union([z.array(z.string()), z.string()]).transform(val => {
      if (typeof val === 'string') return [val]; // Handle single value from form
      return val;
  }).optional(),
  // Sequence handling simplified for initial port
});

export const updateRouteSchema = z.object({
  name: z.string().min(1).optional(),
  busId: z.string().cuid("Invalid bus id").optional(),
  distance: z.coerce.number().positive().optional(),
  busStopIds: z.array(z.string()).optional(),
});

// --- Bus Stop Schemas ---
export const createBusStopSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  routeId: z.string().cuid("Invalid route id").optional().nullable().or(z.literal("")),
  schoolId: z.string().cuid("Invalid school id"),
});

export const updateBusStopSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  routeId: z.string().cuid("Invalid route id").optional(),
});

// --- Driver Schemas ---
export const registerDriverSchema = z.object({
    // User fields
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone is required"),
    password: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
    bloodType: z.string().optional(),
    sex: z.enum(["MALE", "FEMALE", "OTHERS"]).optional().default("MALE"),

    // Driver fields
    license: z.string().min(1, "License is required"),
    busId: z.string().cuid("Invalid bus id"),
    schoolId: z.string().cuid("Invalid school id"),
});

export const updateDriverSchema = registerDriverSchema.partial();
