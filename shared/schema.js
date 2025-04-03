import { z } from "zod";
import mongoose, { Schema } from 'mongoose';
// User mongoose schema
var userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
// Internship application mongoose schema
var internshipApplicationSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    resumePath: { type: String, required: true },
    createdAt: { type: String, default: function () { return new Date().toISOString(); } },
    status: { type: String, default: "pending" }
});
// Mongoose models
export var UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export var InternshipApplicationModel = mongoose.models.InternshipApplication ||
    mongoose.model('InternshipApplication', internshipApplicationSchema);
// Zod schemas for validation
export var insertUserSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(255)
});
export var insertInternshipApplicationSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(100),
    phone: z.string().min(5).max(20),
    resumePath: z.string()
});
