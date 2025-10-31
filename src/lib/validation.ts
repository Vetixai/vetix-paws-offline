import { z } from 'zod';

// Emergency contact validation schema
export const emergencyContactSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  phone_number: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{8,14}$/, 'Invalid phone number format. Use format: +254...')
    .max(15, 'Phone number too long'),
  relationship: z.string()
    .trim()
    .max(50, 'Relationship cannot exceed 50 characters')
    .optional(),
  location: z.string()
    .trim()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),
  priority: z.number().int().min(1).max(10)
});

// Diagnosis validation schema
export const diagnosisSchema = z.object({
  symptoms: z.string()
    .trim()
    .min(10, 'Symptoms must be at least 10 characters')
    .max(2000, 'Symptoms cannot exceed 2000 characters'),
  species: z.string()
    .trim()
    .min(1, 'Species is required')
    .max(50, 'Species name too long'),
  location: z.string()
    .trim()
    .max(200, 'Location cannot exceed 200 characters')
    .optional(),
  urgency_level: z.enum(['low', 'medium', 'high', 'critical']).optional()
});

// Animal data validation schema
export const animalSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  animal_type: z.string().min(1, 'Animal type is required'),
  breed: z.string()
    .trim()
    .max(100, 'Breed name too long')
    .optional(),
  age_months: z.number().int().min(0).max(600).optional(),
  weight_kg: z.number().min(0).max(10000).optional(),
  gender: z.string().max(20).optional(),
  identification_number: z.string()
    .trim()
    .max(50, 'ID number too long')
    .optional(),
  location: z.string()
    .trim()
    .max(200, 'Location too long')
    .optional(),
  notes: z.string()
    .trim()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
});

// Disease outbreak validation schema
export const outbreakSchema = z.object({
  disease_name: z.string()
    .trim()
    .min(2, 'Disease name must be at least 2 characters')
    .max(100, 'Disease name too long'),
  animal_type: z.string().min(1, 'Animal type is required'),
  location: z.string()
    .trim()
    .min(2, 'Location is required')
    .max(200, 'Location too long'),
  region: z.string()
    .trim()
    .max(100, 'Region name too long')
    .optional(),
  affected_count: z.number().int().min(1).max(100000),
  mortality_count: z.number().int().min(0).max(100000),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  symptoms: z.array(z.string().max(100)).max(20).optional(),
  description: z.string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
});

// AI chat message validation
export const chatMessageSchema = z.object({
  message: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters')
});

// Voice input validation
export const voiceInputSchema = z.object({
  audio: z.string().min(1, 'Audio data is required'),
  language: z.string()
    .trim()
    .max(10)
    .optional()
});
