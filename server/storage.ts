import { 
  type User, type InsertUser,
  type Booking, type InsertBooking,
  type Teacher, type InsertTeacher,
  type Notification, type InsertNotification,
  type RescheduleRequest, type InsertRescheduleRequest,
  type Gallery, type InsertGallery
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { verificationToken: string; verificationTokenExpiry: Date }): Promise<User>;
  verifyUser(token: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getAllAdmins(): Promise<User[]>;

  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByTeacher(teacherId: string): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking | undefined>;

  // Teacher methods
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByUserId(userId: string): Promise<Teacher | undefined>;
  getAllTeachers(): Promise<Teacher[]>;
  updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: string): Promise<boolean>;

  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: string): Promise<void>;

  // Reschedule Request methods
  createRescheduleRequest(request: InsertRescheduleRequest): Promise<RescheduleRequest>;
  getRescheduleRequest(id: string): Promise<RescheduleRequest | undefined>;
  getRescheduleRequestsByTeacher(teacherId: string): Promise<RescheduleRequest[]>;
  getAllRescheduleRequests(): Promise<RescheduleRequest[]>;
  getPendingRescheduleRequests(): Promise<RescheduleRequest[]>;
  updateRescheduleRequest(id: string, data: Partial<RescheduleRequest>): Promise<RescheduleRequest | undefined>;

  // Gallery methods
  createGalleryItem(item: InsertGallery): Promise<Gallery>;
  getGalleryItem(id: string): Promise<Gallery | undefined>;
  getAllGalleryItems(): Promise<Gallery[]>;
  getActiveGalleryItems(): Promise<Gallery[]>;
  updateGalleryItem(id: string, data: Partial<Gallery>): Promise<Gallery | undefined>;
  deleteGalleryItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bookings: Map<string, Booking>;
  private teachers: Map<string, Teacher>;
  private notifications: Map<string, Notification>;
  private rescheduleRequests: Map<string, RescheduleRequest>;
  private galleryItems: Map<string, Gallery>;
  private initialized: boolean = false;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.teachers = new Map();
    this.notifications = new Map();
    this.rescheduleRequests = new Map();
    this.galleryItems = new Map();
  }

  async init() {
    if (this.initialized) return;
    
    // Seed admin user - password: admin123
    const adminId = randomUUID();
    const hashedPassword = await bcrypt.hash("admin123", 10);
    this.users.set(adminId, {
      id: adminId,
      email: "admin@jbs.com",
      password: hashedPassword,
      name: "Admin JBS",
      phone: "081234567890",
      role: "admin",
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed student user - password: student123
    const studentId = randomUUID();
    const studentPassword = await bcrypt.hash("student123", 10);
    this.users.set(studentId, {
      id: studentId,
      email: "student@jbs.com",
      password: studentPassword,
      name: "Sari Dewi",
      phone: "081298765432",
      role: "user",
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed teacher users and link to teacher data
    const teacher1UserId = randomUUID();
    const teacher1Password = await bcrypt.hash("teacher123", 10);
    this.users.set(teacher1UserId, {
      id: teacher1UserId,
      email: "rina@jbs.com",
      password: teacher1Password,
      name: "Ibu Rina",
      phone: "081300001111",
      role: "teacher",
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const teacher2UserId = randomUUID();
    const teacher2Password = await bcrypt.hash("teacher123", 10);
    this.users.set(teacher2UserId, {
      id: teacher2UserId,
      email: "maya@jbs.com",
      password: teacher2Password,
      name: "Ibu Maya",
      phone: "081300002222",
      role: "teacher",
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const teacher3UserId = randomUUID();
    const teacher3Password = await bcrypt.hash("teacher123", 10);
    this.users.set(teacher3UserId, {
      id: teacher3UserId,
      email: "putri@jbs.com",
      password: teacher3Password,
      name: "Ibu Putri",
      phone: "081300003333",
      role: "teacher",
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed teacher data (linked to user accounts)
    const teacher1Id = randomUUID();
    this.teachers.set(teacher1Id, {
      id: teacher1Id,
      userId: teacher1UserId,
      name: "Ibu Rina",
      email: "rina@jbs.com",
      phone: "081300001111",
      specialization: "makeup",
      isActive: true,
      createdAt: new Date(),
    });

    const teacher2Id = randomUUID();
    this.teachers.set(teacher2Id, {
      id: teacher2Id,
      userId: teacher2UserId,
      name: "Ibu Maya",
      email: "maya@jbs.com",
      phone: "081300002222",
      specialization: "nail",
      isActive: true,
      createdAt: new Date(),
    });

    const teacher3Id = randomUUID();
    this.teachers.set(teacher3Id, {
      id: teacher3Id,
      userId: teacher3UserId,
      name: "Ibu Putri",
      email: "putri@jbs.com",
      phone: "081300003333",
      specialization: "eyelash",
      isActive: true,
      createdAt: new Date(),
    });
    
    this.initialized = true;
    console.log("=".repeat(50));
    console.log("Storage initialized with test accounts:");
    console.log("=".repeat(50));
    console.log("ADMIN:   admin@jbs.com / admin123");
    console.log("STUDENT: student@jbs.com / student123");
    console.log("TEACHER: rina@jbs.com / teacher123 (Makeup)");
    console.log("TEACHER: maya@jbs.com / teacher123 (Nail)");
    console.log("TEACHER: putri@jbs.com / teacher123 (Eyelash)");
    console.log("=".repeat(50));
  }

  // ==================== USER METHODS ====================
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser & { verificationToken: string; verificationTokenExpiry: Date }): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    // Auto-verify in development mode for easier testing
    const isDev = process.env.NODE_ENV !== 'production';
    const user: User = {
      ...insertUser,
      id,
      phone: insertUser.phone || null,
      role: "user",
      isVerified: isDev, // Auto-verify in dev mode
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async verifyUser(token: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(
      (u) => u.verificationToken === token && u.verificationTokenExpiry && u.verificationTokenExpiry > new Date()
    );
    
    if (user) {
      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpiry = null;
      user.updatedAt = new Date();
      this.users.set(user.id, user);
    }
    
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === "user");
  }

  async getAllAdmins(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === "admin");
  }

  // ==================== BOOKING METHODS ====================
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const now = new Date();
    const paymentDue = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    const booking: Booking = {
      id,
      userId: insertBooking.userId,
      classType: insertBooking.classType,
      level: insertBooking.level,
      status: "pending_payment",
      paymentMethod: insertBooking.paymentMethod || null,
      paymentDue,
      paymentProof: null,
      preferredSlot1: null,
      preferredSlot2: null,
      scheduledDate1: null,
      scheduledTime1: null,
      scheduledDate2: null,
      scheduledTime2: null,
      teacherId: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBookingsByTeacher(teacherId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(b => b.teacherId === teacherId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...data, updatedAt: new Date() };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // ==================== TEACHER METHODS ====================
  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = randomUUID();
    const now = new Date();
    
    const teacher: Teacher = {
      id,
      userId: null,
      name: insertTeacher.name,
      email: insertTeacher.email || null,
      phone: insertTeacher.phone || null,
      specialization: insertTeacher.specialization || null,
      isActive: true,
      createdAt: now,
    };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getTeacherByUserId(userId: string): Promise<Teacher | undefined> {
    return Array.from(this.teachers.values()).find(t => t.userId === userId);
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher | undefined> {
    const teacher = this.teachers.get(id);
    if (!teacher) return undefined;
    
    const updatedTeacher = { ...teacher, ...data };
    this.teachers.set(id, updatedTeacher);
    return updatedTeacher;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    return this.teachers.delete(id);
  }

  // ==================== NOTIFICATION METHODS ====================
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const now = new Date();
    
    const notification: Notification = {
      id,
      userId: insertNotification.userId,
      message: insertNotification.message,
      link: insertNotification.link || null,
      isRead: false,
      createdAt: now,
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return notification;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    for (const [id, notification] of this.notifications) {
      if (notification.userId === userId) {
        notification.isRead = true;
        this.notifications.set(id, notification);
      }
    }
  }

  // ==================== RESCHEDULE REQUEST METHODS ====================
  async createRescheduleRequest(insertRequest: InsertRescheduleRequest): Promise<RescheduleRequest> {
    const id = randomUUID();
    const now = new Date();
    
    const request: RescheduleRequest = {
      id,
      bookingId: insertRequest.bookingId,
      teacherId: insertRequest.teacherId,
      originalDate: insertRequest.originalDate,
      originalTime: insertRequest.originalTime,
      requestedDate: insertRequest.requestedDate,
      requestedTime: insertRequest.requestedTime,
      reason: insertRequest.reason || null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.rescheduleRequests.set(id, request);
    return request;
  }

  async getRescheduleRequest(id: string): Promise<RescheduleRequest | undefined> {
    return this.rescheduleRequests.get(id);
  }

  async getRescheduleRequestsByTeacher(teacherId: string): Promise<RescheduleRequest[]> {
    return Array.from(this.rescheduleRequests.values())
      .filter(r => r.teacherId === teacherId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllRescheduleRequests(): Promise<RescheduleRequest[]> {
    return Array.from(this.rescheduleRequests.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPendingRescheduleRequests(): Promise<RescheduleRequest[]> {
    return Array.from(this.rescheduleRequests.values())
      .filter(r => r.status === "pending")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateRescheduleRequest(id: string, data: Partial<RescheduleRequest>): Promise<RescheduleRequest | undefined> {
    const request = this.rescheduleRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...data, updatedAt: new Date() };
    this.rescheduleRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Gallery methods
  async createGalleryItem(insertItem: InsertGallery): Promise<Gallery> {
    const id = randomUUID();
    const now = new Date();
    const item: Gallery = {
      id,
      titleId: insertItem.titleId,
      titleEn: insertItem.titleEn,
      descriptionId: insertItem.descriptionId || null,
      descriptionEn: insertItem.descriptionEn || null,
      imageUrl: insertItem.imageUrl,
      imageKey: insertItem.imageKey || null,
      sortOrder: insertItem.sortOrder || 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.galleryItems.set(id, item);
    return item;
  }

  async getGalleryItem(id: string): Promise<Gallery | undefined> {
    return this.galleryItems.get(id);
  }

  async getAllGalleryItems(): Promise<Gallery[]> {
    return Array.from(this.galleryItems.values())
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getActiveGalleryItems(): Promise<Gallery[]> {
    return Array.from(this.galleryItems.values())
      .filter(item => item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async updateGalleryItem(id: string, data: Partial<Gallery>): Promise<Gallery | undefined> {
    const item = this.galleryItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...data, updatedAt: new Date() };
    this.galleryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    return this.galleryItems.delete(id);
  }
}

// Use database storage if DATABASE_URL is set, otherwise fallback to memory
import { dbStorage } from "./db-storage";

const useDatabase = !!process.env.DATABASE_URL;

export const storage: IStorage = useDatabase ? dbStorage : new MemStorage();

console.log(`📦 Storage mode: ${useDatabase ? "PostgreSQL Database" : "In-Memory (data will be lost on restart)"}`);

