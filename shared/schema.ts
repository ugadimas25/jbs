import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== USERS TABLE ====================
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("user"), // user, admin, teacher
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ==================== TEACHERS TABLE ====================
export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Link to user account for login
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  specialization: text("specialization"), // makeup, nail, eyelash
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== BOOKINGS TABLE ====================
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  classType: text("class_type").notNull(), // makeup, nail, eyelash
  level: text("level"), // low, intermediate, high (optional)
  status: text("status").notNull().default("pending_payment"),
  // Status values: pending_payment, waiting_approval, payment_rejected, paid, waiting_schedule, scheduled, completed
  paymentMethod: text("payment_method"), // BCA, Mandiri, BNI
  paymentDue: timestamp("payment_due"),
  paymentProof: text("payment_proof"), // file path
  preferredSlot1: text("preferred_slot1"), // e.g., "Mon-09:30"
  preferredSlot2: text("preferred_slot2"),
  scheduledDate1: date("scheduled_date1"),
  scheduledTime1: text("scheduled_time1"),
  scheduledDate2: date("scheduled_date2"),
  scheduledTime2: text("scheduled_time2"),
  teacherId: varchar("teacher_id").references(() => teachers.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ==================== NOTIFICATIONS TABLE ====================
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== RESCHEDULE REQUESTS TABLE ====================
export const rescheduleRequests = pgTable("reschedule_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
  originalDate: date("original_date").notNull(),
  originalTime: text("original_time").notNull(),
  requestedDate: date("requested_date").notNull(),
  requestedTime: text("requested_time").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ==================== SCHEMAS & TYPES ====================

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
}).extend({
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  userId: true,
  classType: true,
  paymentMethod: true,
});

export const insertTeacherSchema = createInsertSchema(teachers).pick({
  name: true,
  email: true,
  phone: true,
  specialization: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  message: true,
  link: true,
});

export const insertRescheduleRequestSchema = createInsertSchema(rescheduleRequests).pick({
  bookingId: true,
  teacherId: true,
  originalDate: true,
  originalTime: true,
  requestedDate: true,
  requestedTime: true,
  reason: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type RescheduleRequest = typeof rescheduleRequests.$inferSelect;
export type InsertRescheduleRequest = z.infer<typeof insertRescheduleRequestSchema>;
