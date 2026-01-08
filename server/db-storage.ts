import { eq, desc, and, asc } from "drizzle-orm";
import { db } from "./db";
import {
  users, bookings, teachers, notifications, rescheduleRequests, gallery, classes,
  type User, type InsertUser,
  type Booking, type InsertBooking,
  type Teacher, type InsertTeacher,
  type Notification, type InsertNotification,
  type RescheduleRequest, type InsertRescheduleRequest,
  type Gallery, type InsertGallery,
  type Class, type InsertClass
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  private initialized: boolean = false;

  async init() {
    if (this.initialized) return;
    
    // Check if admin exists, if not seed the database
    const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@jbs.com")).limit(1);
    
    if (existingAdmin.length === 0) {
      console.log("Seeding database with initial data...");
      await this.seedDatabase();
    } else {
      // Check if classes exist, if not seed them
      const existingClasses = await db.select().from(classes).limit(1);
      if (existingClasses.length === 0) {
        console.log("Seeding default classes...");
        await this.seedClasses();
      }
    }
    
    this.initialized = true;
    console.log("=".repeat(50));
    console.log("Database initialized with test accounts:");
    console.log("=".repeat(50));
    console.log("ADMIN:   admin@jbs.com / admin123");
    console.log("STUDENT: student@jbs.com / student123");
    console.log("TEACHER: rina@jbs.com / teacher123 (Makeup)");
    console.log("TEACHER: maya@jbs.com / teacher123 (Nail)");
    console.log("TEACHER: putri@jbs.com / teacher123 (Eyelash)");
    console.log("=".repeat(50));
  }

  private async seedDatabase() {
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedStudentPassword = await bcrypt.hash("student123", 10);
    const hashedTeacherPassword = await bcrypt.hash("teacher123", 10);

    // Seed admin
    await db.insert(users).values({
      email: "admin@jbs.com",
      password: hashedAdminPassword,
      name: "Admin JBS",
      phone: "081234567890",
      role: "admin",
      isVerified: true,
    });

    // Seed student
    await db.insert(users).values({
      email: "student@jbs.com",
      password: hashedStudentPassword,
      name: "Sari Dewi",
      phone: "081298765432",
      role: "user",
      isVerified: true,
    });

    // Seed teacher users
    const [teacher1User] = await db.insert(users).values({
      email: "rina@jbs.com",
      password: hashedTeacherPassword,
      name: "Ibu Rina",
      phone: "081300001111",
      role: "teacher",
      isVerified: true,
    }).returning();

    const [teacher2User] = await db.insert(users).values({
      email: "maya@jbs.com",
      password: hashedTeacherPassword,
      name: "Ibu Maya",
      phone: "081300002222",
      role: "teacher",
      isVerified: true,
    }).returning();

    const [teacher3User] = await db.insert(users).values({
      email: "putri@jbs.com",
      password: hashedTeacherPassword,
      name: "Ibu Putri",
      phone: "081300003333",
      role: "teacher",
      isVerified: true,
    }).returning();

    // Seed teacher data linked to users
    await db.insert(teachers).values({
      userId: teacher1User.id,
      name: "Ibu Rina",
      email: "rina@jbs.com",
      phone: "081300001111",
      specialization: "makeup",
      isActive: true,
    });

    await db.insert(teachers).values({
      userId: teacher2User.id,
      name: "Ibu Maya",
      email: "maya@jbs.com",
      phone: "081300002222",
      specialization: "nail",
      isActive: true,
    });

    await db.insert(teachers).values({
      userId: teacher3User.id,
      name: "Ibu Putri",
      email: "putri@jbs.com",
      phone: "081300003333",
      specialization: "eyelash",
      isActive: true,
    });

    // Seed default classes
    await db.insert(classes).values({
      slug: "makeup",
      nameId: "Make up and Hair do",
      nameEn: "Make up and Hair do",
      descriptionId: "Kuasai seni tata rias kecantikan dan penataan rambut profesional. Pelajari teknik dasar hingga tingkat lanjut untuk berbagai kesempatan.",
      descriptionEn: "Master the art of beauty makeup and professional hair styling. Learn basic to advanced techniques for various occasions.",
      shortDescId: "Kelas tata rias dan penataan rambut profesional",
      shortDescEn: "Professional makeup and hair styling class",
      duration: "3-6 bulan",
      price: 5000000,
      features: ["Sertifikat", "Praktik langsung", "Materi lengkap", "Mentor profesional"],
      sortOrder: 1,
      isActive: true,
    });

    await db.insert(classes).values({
      slug: "nail",
      nameId: "Nails",
      nameEn: "Nails",
      descriptionId: "Ciptakan desain kuku yang menakjubkan dan teknik perawatan kuku. Pelajari nail art dari dasar hingga desain kompleks.",
      descriptionEn: "Create stunning nail designs and nail care techniques. Learn nail art from basic to complex designs.",
      shortDescId: "Kelas desain dan perawatan kuku profesional",
      shortDescEn: "Professional nail design and care class",
      duration: "2-4 bulan",
      price: 4000000,
      features: ["Sertifikat", "Praktik langsung", "Kit nail art", "Mentor profesional"],
      sortOrder: 2,
      isActive: true,
    });

    await db.insert(classes).values({
      slug: "eyelash",
      nameId: "Brow, lips and lash",
      nameEn: "Brow, lips and lash",
      descriptionId: "Pelajari teknik presisi untuk membentuk alis, bibir, dan aplikasi bulu mata. Kuasai seni detail wajah.",
      descriptionEn: "Learn precision techniques for eyebrow shaping, lips, and lash application. Master the art of facial details.",
      shortDescId: "Kelas alis, bibir, dan bulu mata profesional",
      shortDescEn: "Professional brow, lips, and lash class",
      duration: "2-3 bulan",
      price: 3500000,
      features: ["Sertifikat", "Praktik langsung", "Peralatan premium", "Mentor profesional"],
      sortOrder: 3,
      isActive: true,
    });

    console.log("✅ Database seeded successfully");
  }

  private async seedClasses() {
    // Seed default classes
    await db.insert(classes).values({
      slug: "makeup",
      nameId: "Make up and Hair do",
      nameEn: "Make up and Hair do",
      descriptionId: "Kuasai seni tata rias kecantikan dan penataan rambut profesional. Pelajari teknik dasar hingga tingkat lanjut untuk berbagai kesempatan.",
      descriptionEn: "Master the art of beauty makeup and professional hair styling. Learn basic to advanced techniques for various occasions.",
      shortDescId: "Kelas tata rias dan penataan rambut profesional",
      shortDescEn: "Professional makeup and hair styling class",
      duration: "3-6 bulan",
      price: 5000000,
      features: ["Sertifikat", "Praktik langsung", "Materi lengkap", "Mentor profesional"],
      sortOrder: 1,
      isActive: true,
    });

    await db.insert(classes).values({
      slug: "nail",
      nameId: "Nails",
      nameEn: "Nails",
      descriptionId: "Ciptakan desain kuku yang menakjubkan dan teknik perawatan kuku. Pelajari nail art dari dasar hingga desain kompleks.",
      descriptionEn: "Create stunning nail designs and nail care techniques. Learn nail art from basic to complex designs.",
      shortDescId: "Kelas desain dan perawatan kuku profesional",
      shortDescEn: "Professional nail design and care class",
      duration: "2-4 bulan",
      price: 4000000,
      features: ["Sertifikat", "Praktik langsung", "Kit nail art", "Mentor profesional"],
      sortOrder: 2,
      isActive: true,
    });

    await db.insert(classes).values({
      slug: "eyelash",
      nameId: "Brow, lips and lash",
      nameEn: "Brow, lips and lash",
      descriptionId: "Pelajari teknik presisi untuk membentuk alis, bibir, dan aplikasi bulu mata. Kuasai seni detail wajah.",
      descriptionEn: "Learn precision techniques for eyebrow shaping, lips, and lash application. Master the art of facial details.",
      shortDescId: "Kelas alis, bibir, dan bulu mata profesional",
      shortDescEn: "Professional brow, lips, and lash class",
      duration: "2-3 bulan",
      price: 3500000,
      features: ["Sertifikat", "Praktik langsung", "Peralatan premium", "Mentor profesional"],
      sortOrder: 3,
      isActive: true,
    });

    console.log("✅ Default classes seeded successfully");
  }

  // ==================== USER METHODS ====================
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser & { verificationToken: string; verificationTokenExpiry: Date }): Promise<User> {
    const isDev = process.env.NODE_ENV !== 'production';
    const [user] = await db.insert(users).values({
      email: insertUser.email,
      password: insertUser.password,
      name: insertUser.name,
      phone: insertUser.phone || null,
      socialMediaType: insertUser.socialMediaType || null,
      socialMediaAccount: insertUser.socialMediaAccount || null,
      role: "user",
      isVerified: isDev,
      verificationToken: insertUser.verificationToken,
      verificationTokenExpiry: insertUser.verificationTokenExpiry,
    }).returning();
    return user;
  }

  async verifyUser(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
    
    if (user && user.verificationTokenExpiry && user.verificationTokenExpiry > new Date()) {
      const [updatedUser] = await db.update(users)
        .set({
          isVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      return updatedUser;
    }
    
    return undefined;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "user"));
  }

  async getAllAdmins(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "admin"));
  }

  // ==================== BOOKING METHODS ====================
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const now = new Date();
    const paymentDue = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    const [booking] = await db.insert(bookings).values({
      userId: insertBooking.userId,
      classType: insertBooking.classType,
      level: insertBooking.level || null,
      status: "pending_payment",
      paymentMethod: insertBooking.paymentMethod || null,
      paymentDue,
    }).returning();
    
    return booking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return booking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByTeacher(teacherId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.teacherId, teacherId))
      .orderBy(desc(bookings.createdAt));
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db.update(bookings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // ==================== TEACHER METHODS ====================
  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const [teacher] = await db.insert(teachers).values({
      name: insertTeacher.name,
      email: insertTeacher.email || null,
      phone: insertTeacher.phone || null,
      specialization: insertTeacher.specialization || null,
      isActive: true,
    }).returning();
    
    return teacher;
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
    return teacher;
  }

  async getTeacherByUserId(userId: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
    return teacher;
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return await db.select().from(teachers);
  }

  async updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher | undefined> {
    const [updatedTeacher] = await db.update(teachers)
      .set(data)
      .where(eq(teachers.id, id))
      .returning();
    return updatedTeacher;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const result = await db.delete(teachers).where(eq(teachers.id, id));
    return true;
  }

  // ==================== NOTIFICATION METHODS ====================
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values({
      userId: insertNotification.userId,
      message: insertNotification.message,
      link: insertNotification.link || null,
      isRead: false,
    }).returning();
    
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const [notification] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // ==================== RESCHEDULE REQUEST METHODS ====================
  async createRescheduleRequest(insertRequest: InsertRescheduleRequest): Promise<RescheduleRequest> {
    const [request] = await db.insert(rescheduleRequests).values({
      bookingId: insertRequest.bookingId,
      teacherId: insertRequest.teacherId,
      originalDate: insertRequest.originalDate,
      originalTime: insertRequest.originalTime,
      requestedDate: insertRequest.requestedDate,
      requestedTime: insertRequest.requestedTime,
      reason: insertRequest.reason || null,
      status: "pending",
    }).returning();
    
    return request;
  }

  async getRescheduleRequest(id: string): Promise<RescheduleRequest | undefined> {
    const [request] = await db.select().from(rescheduleRequests).where(eq(rescheduleRequests.id, id)).limit(1);
    return request;
  }

  async getRescheduleRequestsByTeacher(teacherId: string): Promise<RescheduleRequest[]> {
    return await db.select().from(rescheduleRequests)
      .where(eq(rescheduleRequests.teacherId, teacherId))
      .orderBy(desc(rescheduleRequests.createdAt));
  }

  async getAllRescheduleRequests(): Promise<RescheduleRequest[]> {
    return await db.select().from(rescheduleRequests).orderBy(desc(rescheduleRequests.createdAt));
  }

  async getPendingRescheduleRequests(): Promise<RescheduleRequest[]> {
    return await db.select().from(rescheduleRequests)
      .where(eq(rescheduleRequests.status, "pending"))
      .orderBy(desc(rescheduleRequests.createdAt));
  }

  async updateRescheduleRequest(id: string, data: Partial<RescheduleRequest>): Promise<RescheduleRequest | undefined> {
    const [updatedRequest] = await db.update(rescheduleRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rescheduleRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Gallery methods
  async createGalleryItem(insertItem: InsertGallery): Promise<Gallery> {
    const [item] = await db.insert(gallery).values({
      titleId: insertItem.titleId,
      titleEn: insertItem.titleEn,
      descriptionId: insertItem.descriptionId || null,
      descriptionEn: insertItem.descriptionEn || null,
      imageUrl: insertItem.imageUrl,
      imageKey: insertItem.imageKey || null,
      sortOrder: insertItem.sortOrder || 0,
      isActive: true,
    }).returning();
    
    return item;
  }

  async getGalleryItem(id: string): Promise<Gallery | undefined> {
    const [item] = await db.select().from(gallery).where(eq(gallery.id, id)).limit(1);
    return item;
  }

  async getAllGalleryItems(): Promise<Gallery[]> {
    return await db.select().from(gallery).orderBy(asc(gallery.sortOrder));
  }

  async getActiveGalleryItems(): Promise<Gallery[]> {
    return await db.select().from(gallery)
      .where(eq(gallery.isActive, true))
      .orderBy(asc(gallery.sortOrder));
  }

  async updateGalleryItem(id: string, data: Partial<Gallery>): Promise<Gallery | undefined> {
    const [updatedItem] = await db.update(gallery)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(gallery.id, id))
      .returning();
    return updatedItem;
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    const result = await db.delete(gallery).where(eq(gallery.id, id)).returning();
    return result.length > 0;
  }

  // ==================== CLASS METHODS ====================

  async createClass(insertItem: InsertClass): Promise<Class> {
    const [item] = await db.insert(classes).values({
      slug: insertItem.slug,
      nameId: insertItem.nameId,
      nameEn: insertItem.nameEn,
      descriptionId: insertItem.descriptionId,
      descriptionEn: insertItem.descriptionEn,
      shortDescId: insertItem.shortDescId,
      shortDescEn: insertItem.shortDescEn,
      imageUrl: insertItem.imageUrl,
      imageKey: insertItem.imageKey,
      duration: insertItem.duration,
      price: insertItem.price,
      features: insertItem.features as string[] | null,
      sortOrder: insertItem.sortOrder || 0,
      isActive: true,
    }).returning();
    
    return item;
  }

  async getClass(id: string): Promise<Class | undefined> {
    const [item] = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
    return item;
  }

  async getClassBySlug(slug: string): Promise<Class | undefined> {
    const [item] = await db.select().from(classes).where(eq(classes.slug, slug)).limit(1);
    return item;
  }

  async getAllClasses(): Promise<Class[]> {
    return await db.select().from(classes).orderBy(asc(classes.sortOrder));
  }

  async getActiveClasses(): Promise<Class[]> {
    return await db.select().from(classes)
      .where(eq(classes.isActive, true))
      .orderBy(asc(classes.sortOrder));
  }

  async updateClass(id: string, data: Partial<Class>): Promise<Class | undefined> {
    const [updatedItem] = await db.update(classes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return updatedItem;
  }

  async deleteClass(id: string): Promise<boolean> {
    const result = await db.delete(classes).where(eq(classes.id, id)).returning();
    return result.length > 0;
  }

  // Finance methods
  async getFinanceData(): Promise<import("./storage").FinanceData[]> {
    const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    
    const financeData = await Promise.all(
      allBookings.map(async (booking) => {
        // Get user data
        const [user] = await db.select().from(users).where(eq(users.id, booking.userId)).limit(1);
        
        // Get class data by slug (booking.classType is the slug)
        const [classData] = await db.select().from(classes).where(eq(classes.slug, booking.classType)).limit(1);
        
        return {
          bookingId: booking.id,
          studentName: user?.name || "Unknown",
          studentEmail: user?.email || "",
          className: classData?.nameEn || booking.classType,
          classType: booking.classType,
          paymentStatus: booking.status,
          paymentDue: booking.paymentDue,
          amount: classData?.price || null,
          createdAt: booking.createdAt,
        };
      })
    );
    
    return financeData;
  }
}

export const dbStorage = new DatabaseStorage();

