import { z } from "zod";

export const appointmentSchema = z.object({
  slotId: z.string().uuid(),
  serviceId: z.string().uuid(),
  ownerName: z.string().min(2),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  petName: z.string().min(1),
  notes: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().min(10),
});
