import { z } from "zod";
import mongoose, { Document, Schema } from 'mongoose';

// User mongoose schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Internship application mongoose schema
const internshipApplicationSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resumePath: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  status: { type: String, default: "pending" }
});

// Mongoose models
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const InternshipApplicationModel = mongoose.models.InternshipApplication || 
  mongoose.model('InternshipApplication', internshipApplicationSchema);

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(255)
});

export const insertInternshipApplicationSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  phone: z.string().min(5).max(20),
  resumePath: z.string()
});

// TypeScript types
export interface User extends Document {
  id: string;
  username: string;
  password: string;
}

export interface InternshipApplication extends Document {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumePath: string;
  createdAt: string;
  status: string;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertInternshipApplication = z.infer<typeof insertInternshipApplicationSchema>;
