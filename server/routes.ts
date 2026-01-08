import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { sendEmail, generateVerificationEmail } from "./email";
import { insertUserSchema, loginSchema, insertBookingSchema, insertTeacherSchema, insertNotificationSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { uploadToCOS } from "./cos";

// Configure multer for memory storage (files go to COS)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpg, png) and PDF files are allowed"));
    }
  },
});

// Middleware to check authentication
const requireAuth = async (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }
  req.user = user;
  next();
};

// Middleware to check admin role
const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  req.user = user;
  next();
};

// Middleware to check teacher role
const requireTeacher = async (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "teacher") {
    return res.status(403).json({ error: "Teacher access required" });
  }
  req.user = user;
  // Get teacher data linked to this user
  const teacher = await storage.getTeacherByUserId(user.id);
  if (!teacher) {
    return res.status(403).json({ error: "Teacher profile not found" });
  }
  req.teacher = teacher;
  next();
};

// Middleware to check admin or teacher role
const requireAdminOrTeacher = async (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    return res.status(403).json({ error: "Admin or teacher access required" });
  }
  req.user = user;
  if (user.role === "teacher") {
    const teacher = await storage.getTeacherByUserId(user.id);
    req.teacher = teacher;
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Signup endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Generate verification token
      const verificationToken = randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry,
      });

      // Send verification email
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: "Verify your email - Jakarta Beauty School",
        html: generateVerificationEmail(user.name, verificationUrl),
      });

      res.status(201).json({
        message: "Account created! Please check your email to verify your account.",
        userId: user.id,
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(400).json({ error: error.message || "Failed to create account" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if email is verified
      if (!user.isVerified) {
        return res.status(403).json({ error: "Please verify your email before logging in" });
      }

      // Create session
      if (req.session) {
        req.session.userId = user.id;
        // Explicitly save session before responding
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              reject(err);
            } else {
              console.log("Session saved successfully. Session ID:", req.sessionID);
              console.log("Session data:", req.session);
              resolve();
            }
          });
        });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ error: error.message || "Failed to login" });
    }
  });

  // Verify email endpoint
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: "Invalid verification token" });
      }

      const user = await storage.verifyUser(token);
      
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }

      res.json({
        message: "Email verified successfully! You can now login.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      res.status(400).json({ error: error.message || "Failed to verify email" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ message: "Logout successful" });
      });
    } else {
      res.json({ message: "Logout successful" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/me", async (req, res) => {
    try {
      console.log("GET /api/auth/me - Session ID:", req.sessionID);
      console.log("GET /api/auth/me - Session userId:", req.session?.userId);
      console.log("GET /api/auth/me - Cookies:", req.headers.cookie);
      
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ==================== BOOKING ENDPOINTS ====================

  // Create a new booking
  app.post("/api/bookings", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const booking = await storage.createBooking(validatedData);

      // Create notification
      await storage.createNotification({
        userId: req.user.id,
        message: `Booking created for ${booking.classType} class. Please complete payment within 1 hour.`,
        link: `/upload-proof/${booking.id}`,
      });

      res.status(201).json({ booking });
    } catch (error: any) {
      console.error("Create booking error:", error);
      res.status(400).json({ error: error.message || "Failed to create booking" });
    }
  });

  // Get user's bookings
  app.get("/api/bookings", requireAuth, async (req: any, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.user.id);
      res.json({ bookings });
    } catch (error: any) {
      console.error("Get bookings error:", error);
      res.status(500).json({ error: "Failed to get bookings" });
    }
  });

  // Get single booking
  app.get("/api/bookings/:id", requireAuth, async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      // Only allow owner or admin to view
      if (booking.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json({ booking });
    } catch (error: any) {
      console.error("Get booking error:", error);
      res.status(500).json({ error: "Failed to get booking" });
    }
  });

  // Upload payment proof
  app.post("/api/bookings/:id/upload-proof", requireAuth, upload.single("proof"), async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Upload to Tencent COS
      const result = await uploadToCOS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      console.log("File uploaded to COS:", result.url);

      const updatedBooking = await storage.updateBooking(req.params.id, {
        paymentProof: result.url,
        status: "waiting_approval",
      });

      // Notify user
      await storage.createNotification({
        userId: req.user.id,
        message: "Payment proof uploaded. Waiting for admin approval.",
        link: `/history`,
      });

      res.json({ booking: updatedBooking });
    } catch (error: any) {
      console.error("Upload proof error:", error);
      res.status(500).json({ error: "Failed to upload proof" });
    }
  });

  // Update booking preferred slots (user)
  app.put("/api/bookings/:id/slots", requireAuth, async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { preferredSlot1, preferredSlot2 } = req.body;
      const updatedBooking = await storage.updateBooking(req.params.id, {
        preferredSlot1,
        preferredSlot2,
        status: "waiting_schedule",
      });

      res.json({ booking: updatedBooking });
    } catch (error: any) {
      console.error("Update slots error:", error);
      res.status(500).json({ error: "Failed to update slots" });
    }
  });

  // User submit schedule with date, time, and teacher (user)
  app.put("/api/bookings/:id/schedule", requireAuth, async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { scheduledDate1, scheduledTime1, scheduledDate2, scheduledTime2, teacherId } = req.body;

      // Check teacher availability for both sessions
      const allBookings = await storage.getAllBookings();
      const conflictSession1 = allBookings.find(b => 
        b.id !== booking.id &&
        b.teacherId === teacherId && 
        b.status === "scheduled" &&
        ((b.scheduledDate1 === scheduledDate1 && b.scheduledTime1 === scheduledTime1) ||
         (b.scheduledDate2 === scheduledDate1 && b.scheduledTime2 === scheduledTime1))
      );

      if (conflictSession1) {
        return res.status(400).json({ error: "Teacher is already booked for Session 1 time slot" });
      }

      const conflictSession2 = allBookings.find(b => 
        b.id !== booking.id &&
        b.teacherId === teacherId && 
        b.status === "scheduled" &&
        ((b.scheduledDate1 === scheduledDate2 && b.scheduledTime1 === scheduledTime2) ||
         (b.scheduledDate2 === scheduledDate2 && b.scheduledTime2 === scheduledTime2))
      );

      if (conflictSession2) {
        return res.status(400).json({ error: "Teacher is already booked for Session 2 time slot" });
      }

      const updatedBooking = await storage.updateBooking(req.params.id, {
        scheduledDate1,
        scheduledTime1,
        scheduledDate2,
        scheduledTime2,
        teacherId,
        status: "waiting_schedule", // Waiting for admin confirmation
      });

      // Notify admins
      const admins = await storage.getAllAdmins();
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          message: `New schedule request from ${req.user.name} for ${booking.classType} class.`,
          link: "/admin",
        });
      }

      res.json({ booking: updatedBooking });
    } catch (error: any) {
      console.error("Submit schedule error:", error);
      res.status(500).json({ error: "Failed to submit schedule" });
    }
  });

  // ==================== ADMIN ENDPOINTS ====================

  // Get all bookings (admin)
  app.get("/api/admin/bookings", requireAdmin, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json({ bookings });
    } catch (error: any) {
      console.error("Admin get bookings error:", error);
      res.status(500).json({ error: "Failed to get bookings" });
    }
  });

  // Approve/Reject payment (admin)
  app.put("/api/admin/bookings/:id/payment", requireAdmin, async (req: any, res) => {
    try {
      const { action } = req.body; // 'approve' or 'reject'
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      let newStatus = booking.status;
      let notificationMessage = "";

      if (action === "approve") {
        newStatus = "paid";
        notificationMessage = "Your payment has been approved! Please select your preferred class schedule.";
      } else if (action === "reject") {
        newStatus = "payment_rejected";
        notificationMessage = "Your payment was rejected. Please upload a valid payment proof.";
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }

      const updatedBooking = await storage.updateBooking(req.params.id, { status: newStatus });

      // Notify user
      await storage.createNotification({
        userId: booking.userId,
        message: notificationMessage,
        link: action === "approve" ? `/select-schedule/${booking.id}` : `/upload-proof/${booking.id}`,
      });

      res.json({ booking: updatedBooking });
    } catch (error: any) {
      console.error("Admin payment action error:", error);
      res.status(500).json({ error: "Failed to process payment action" });
    }
  });

  // Confirm or reject schedule (admin) - now just confirms student's selection
  app.put("/api/admin/bookings/:id/schedule", requireAdmin, async (req: any, res) => {
    try {
      const { action } = req.body; // 'confirm' or 'reject'
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      let notificationMessage = "";
      let newStatus = booking.status;

      if (action === "confirm") {
        // Verify schedule is set
        if (!booking.scheduledDate1 || !booking.scheduledTime1 || !booking.teacherId) {
          return res.status(400).json({ error: "Schedule not set by student yet" });
        }

        // Double-check teacher availability before confirming
        const allBookings = await storage.getAllBookings();
        const conflict = allBookings.find(b => 
          b.id !== booking.id &&
          b.teacherId === booking.teacherId && 
          b.status === "scheduled" &&
          ((b.scheduledDate1 === booking.scheduledDate1 && b.scheduledTime1 === booking.scheduledTime1) ||
           (b.scheduledDate2 === booking.scheduledDate1 && b.scheduledTime2 === booking.scheduledTime1) ||
           (b.scheduledDate1 === booking.scheduledDate2 && b.scheduledTime1 === booking.scheduledTime2) ||
           (b.scheduledDate2 === booking.scheduledDate2 && b.scheduledTime2 === booking.scheduledTime2))
        );

        if (conflict) {
          return res.status(400).json({ error: "Teacher is already booked at this time. Please ask student to reschedule." });
        }

        newStatus = "scheduled";
        notificationMessage = `Your class has been confirmed! First session: ${booking.scheduledDate1} at ${booking.scheduledTime1}`;
      } else if (action === "reject") {
        // Reset schedule and ask student to re-select
        const updatedBooking = await storage.updateBooking(req.params.id, {
          scheduledDate1: null,
          scheduledTime1: null,
          scheduledDate2: null,
          scheduledTime2: null,
          teacherId: null,
          status: "paid", // Back to paid so student can re-select
        });

        await storage.createNotification({
          userId: booking.userId,
          message: "Your schedule was not approved. Please select a new schedule.",
          link: `/select-schedule/${booking.id}`,
        });

        return res.json({ booking: updatedBooking });
      } else {
        return res.status(400).json({ error: "Invalid action. Use 'confirm' or 'reject'" });
      }

      const updatedBooking = await storage.updateBooking(req.params.id, {
        status: newStatus,
      });

      // Notify user
      await storage.createNotification({
        userId: booking.userId,
        message: notificationMessage,
        link: `/history`,
      });

      res.json({ booking: updatedBooking });
    } catch (error: any) {
      console.error("Admin schedule action error:", error);
      res.status(500).json({ error: "Failed to process schedule" });
    }
  });

  // Get all users (admin)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
      })) });
    } catch (error: any) {
      console.error("Admin get users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // ==================== TEACHER ENDPOINTS ====================

  // Check teacher availability
  app.get("/api/teachers/:id/availability", requireAuth, async (req: any, res) => {
    try {
      const { date, time } = req.query;
      const teacherId = req.params.id;

      if (!date || !time) {
        return res.status(400).json({ error: "Date and time are required" });
      }

      const allBookings = await storage.getAllBookings();
      
      // Check if teacher has any booking at the specified date/time
      const conflict = allBookings.find(b => 
        b.teacherId === teacherId && 
        (b.status === "scheduled" || b.status === "waiting_schedule") &&
        ((b.scheduledDate1 === date && b.scheduledTime1 === time) ||
         (b.scheduledDate2 === date && b.scheduledTime2 === time))
      );

      res.json({ 
        available: !conflict,
        conflict: conflict ? {
          bookingId: conflict.id,
          date,
          time,
        } : null
      });
    } catch (error: any) {
      console.error("Check availability error:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  // Get all teachers
  app.get("/api/teachers", async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      res.json({ teachers });
    } catch (error: any) {
      console.error("Get teachers error:", error);
      res.status(500).json({ error: "Failed to get teachers" });
    }
  });

  // Create teacher (admin)
  app.post("/api/admin/teachers", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(validatedData);
      res.status(201).json({ teacher });
    } catch (error: any) {
      console.error("Create teacher error:", error);
      res.status(400).json({ error: error.message || "Failed to create teacher" });
    }
  });

  // Update teacher (admin)
  app.put("/api/admin/teachers/:id", requireAdmin, async (req, res) => {
    try {
      const teacher = await storage.updateTeacher(req.params.id, req.body);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.json({ teacher });
    } catch (error: any) {
      console.error("Update teacher error:", error);
      res.status(500).json({ error: "Failed to update teacher" });
    }
  });

  // Delete teacher (admin)
  app.delete("/api/admin/teachers/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteTeacher(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.json({ message: "Teacher deleted" });
    } catch (error: any) {
      console.error("Delete teacher error:", error);
      res.status(500).json({ error: "Failed to delete teacher" });
    }
  });

  // ==================== TEACHER ENDPOINTS ====================

  // Get teacher's own data
  app.get("/api/teacher/me", requireTeacher, async (req: any, res) => {
    try {
      res.json({ teacher: req.teacher });
    } catch (error: any) {
      console.error("Get teacher data error:", error);
      res.status(500).json({ error: "Failed to get teacher data" });
    }
  });

  // Get teacher's bookings
  app.get("/api/teacher/bookings", requireTeacher, async (req: any, res) => {
    try {
      const bookings = await storage.getBookingsByTeacher(req.teacher.id);
      res.json({ bookings });
    } catch (error: any) {
      console.error("Get teacher bookings error:", error);
      res.status(500).json({ error: "Failed to get bookings" });
    }
  });

  // Teacher request reschedule
  app.post("/api/teacher/reschedule-request", requireTeacher, async (req: any, res) => {
    try {
      const { bookingId, originalDate, originalTime, requestedDate, requestedTime, reason } = req.body;
      
      // Verify the booking belongs to this teacher
      const booking = await storage.getBooking(bookingId);
      if (!booking || booking.teacherId !== req.teacher.id) {
        return res.status(403).json({ error: "You can only reschedule your own classes" });
      }

      // Create reschedule request
      const request = await storage.createRescheduleRequest({
        bookingId,
        teacherId: req.teacher.id,
        originalDate,
        originalTime,
        requestedDate,
        requestedTime,
        reason,
      });

      // Notify all admins
      const admins = await storage.getAllAdmins();
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          message: `Teacher ${req.teacher.name} has requested a reschedule.`,
          link: "/admin",
        });
      }

      res.status(201).json({ request, message: "Reschedule request submitted" });
    } catch (error: any) {
      console.error("Create reschedule request error:", error);
      res.status(500).json({ error: "Failed to create reschedule request" });
    }
  });

  // Get teacher's own reschedule requests
  app.get("/api/teacher/reschedule-requests", requireTeacher, async (req: any, res) => {
    try {
      const requests = await storage.getRescheduleRequestsByTeacher(req.teacher.id);
      res.json({ requests });
    } catch (error: any) {
      console.error("Get teacher reschedule requests error:", error);
      res.status(500).json({ error: "Failed to get reschedule requests" });
    }
  });

  // ==================== ADMIN RESCHEDULE ENDPOINTS ====================

  // Get all reschedule requests (admin)
  app.get("/api/admin/reschedule-requests", requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllRescheduleRequests();
      res.json({ requests });
    } catch (error: any) {
      console.error("Get reschedule requests error:", error);
      res.status(500).json({ error: "Failed to get reschedule requests" });
    }
  });

  // Approve/Reject reschedule request (admin)
  app.put("/api/admin/reschedule-requests/:id", requireAdmin, async (req, res) => {
    try {
      const { action } = req.body;
      const request = await storage.getRescheduleRequest(req.params.id);
      
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (action === "approve") {
        // Update the booking with new schedule
        const booking = await storage.getBooking(request.bookingId);
        if (booking) {
          await storage.updateBooking(request.bookingId, {
            scheduledDate1: request.requestedDate,
            scheduledTime1: request.requestedTime,
          });
        }
        await storage.updateRescheduleRequest(request.id, { status: "approved" });

        // Notify teacher
        const teacher = await storage.getTeacher(request.teacherId);
        if (teacher?.userId) {
          await storage.createNotification({
            userId: teacher.userId,
            message: "Your reschedule request has been approved.",
            link: "/admin",
          });
        }

        // Notify student
        if (booking) {
          await storage.createNotification({
            userId: booking.userId,
            message: "Your class schedule has been updated by the teacher.",
            link: "/history",
          });
        }
      } else if (action === "reject") {
        await storage.updateRescheduleRequest(request.id, { status: "rejected" });

        // Notify teacher
        const teacher = await storage.getTeacher(request.teacherId);
        if (teacher?.userId) {
          await storage.createNotification({
            userId: teacher.userId,
            message: "Your reschedule request has been rejected.",
            link: "/admin",
          });
        }
      }

      res.json({ message: `Request ${action}d successfully` });
    } catch (error: any) {
      console.error("Process reschedule request error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // ==================== NOTIFICATION ENDPOINTS ====================

  // Get user's notifications
  app.get("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json({ notifications });
    } catch (error: any) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", requireAuth, async (req: any, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json({ notification });
    } catch (error: any) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.put("/api/notifications/read-all", requireAuth, async (req: any, res) => {
    try {
      await storage.markAllNotificationsRead(req.user.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  });

  return httpServer;
}
