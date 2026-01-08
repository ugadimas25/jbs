import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, XCircle, Clock, Users, BookOpen, Calendar, 
  UserCog, Plus, Trash2, Eye, FileImage, AlertCircle, Image, Edit, GripVertical
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { CLASS_TYPES, LEVELS } from "@/lib/constants";

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin, isTeacher, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for dialogs
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [teacherDialog, setTeacherDialog] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", phone: "", specialization: "" });
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [rescheduleData, setRescheduleData] = useState({ requestedDate: "", requestedTime: "", reason: "" });

  // State for Gallery management
  const [galleryDialog, setGalleryDialog] = useState(false);
  const [editingGallery, setEditingGallery] = useState<any>(null);
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });
  const [galleryImage, setGalleryImage] = useState<File | null>(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null);

  // Redirect if not admin or teacher
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (!isAdmin && !isTeacher))) {
      toast({
        title: "Access Denied",
        description: "You need admin or teacher privileges to access this page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, isAdmin, isTeacher, authLoading, setLocation, toast]);

  // Fetch all bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/bookings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: isAdmin || isTeacher,
  });

  // Fetch teacher's own data (for teachers)
  const { data: myTeacherData } = useQuery({
    queryKey: ["my-teacher-data"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch teacher data");
      return res.json();
    },
    enabled: isTeacher,
  });

  // Fetch teacher's bookings
  const { data: myBookingsData } = useQuery({
    queryKey: ["teacher", "my-bookings"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/bookings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: isTeacher,
  });

  // Fetch teacher's reschedule requests
  const { data: myRescheduleRequestsData } = useQuery({
    queryKey: ["teacher", "my-reschedule-requests"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/reschedule-requests", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reschedule requests");
      return res.json();
    },
    enabled: isTeacher,
  });

  // Fetch reschedule requests (for admin)
  const { data: rescheduleRequestsData } = useQuery({
    queryKey: ["admin", "reschedule-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reschedule-requests", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reschedule requests");
      return res.json();
    },
    enabled: isAdmin,
  });

  // Fetch gallery items (for admin)
  const { data: galleryData, isLoading: galleryLoading } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => {
      const res = await fetch("/api/admin/gallery", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch gallery");
      return res.json();
    },
    enabled: isAdmin,
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: isAdmin,
  });

  // Fetch all teachers
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await fetch("/api/teachers", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch teachers");
      return res.json();
    },
    enabled: isAdmin || isTeacher,
  });

  // Payment approval mutation
  const paymentMutation = useMutation({
    mutationFn: async ({ bookingId, action }: { bookingId: string; action: "approve" | "reject" }) => {
      const res = await apiRequest("PUT", `/api/admin/bookings/${bookingId}/payment`, { action });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      toast({
        title: "Success",
        description: "Payment status updated.",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        variant: "destructive",
      });
    },
  });

  // Schedule confirmation/rejection mutation
  const scheduleMutation = useMutation({
    mutationFn: async (data: { bookingId: string; action: "confirm" | "reject" }) => {
      const res = await apiRequest("PUT", `/api/admin/bookings/${data.bookingId}/schedule`, { action: data.action });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      toast({
        title: "Success",
        description: variables.action === "confirm" ? "Schedule confirmed." : "Schedule rejected. Student will be asked to reschedule.",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process schedule",
        variant: "destructive",
      });
    },
  });

  // Create teacher mutation
  const createTeacherMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/teachers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setTeacherDialog(false);
      setNewTeacher({ name: "", email: "", phone: "", specialization: "" });
      toast({
        title: "Success",
        description: "Teacher added successfully.",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add teacher",
        variant: "destructive",
      });
    },
  });

  // Delete teacher mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/teachers/${teacherId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({
        title: "Success",
        description: "Teacher removed successfully.",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove teacher",
        variant: "destructive",
      });
    },
  });

  // Reschedule request mutation (for teacher)
  const rescheduleRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/teacher/reschedule-request", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "my-bookings"] });
      setRescheduleDialog(false);
      setRescheduleBooking(null);
      setRescheduleData({ requestedDate: "", requestedTime: "", reason: "" });
      toast({
        title: "Success",
        description: "Reschedule request submitted. Waiting for admin approval.",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit reschedule request",
        variant: "destructive",
      });
    },
  });

  // Reschedule approval mutation (for admin)
  const rescheduleApprovalMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: "approve" | "reject" }) => {
      const res = await apiRequest("PUT", `/api/admin/reschedule-requests/${requestId}`, { action });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reschedule-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      toast({
        title: "Success",
        description: "Reschedule request processed.",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process reschedule request",
        variant: "destructive",
      });
    },
  });

  // Gallery create mutation
  const createGalleryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      // Check content-type to handle non-JSON responses
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error: Invalid response format");
      }
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || "Failed to create gallery item");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      resetGalleryForm();
      toast({
        title: "Success",
        description: "Gallery item created successfully.",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create gallery item",
        variant: "destructive",
      });
    },
  });

  // Gallery update mutation
  const updateGalleryMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      
      // Check content-type to handle non-JSON responses
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error: Invalid response format");
      }
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || "Failed to update gallery item");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      resetGalleryForm();
      toast({
        title: "Success",
        description: "Gallery item updated successfully.",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update gallery item",
        variant: "destructive",
      });
    },
  });

  // Gallery delete mutation
  const deleteGalleryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      // Check content-type to handle non-JSON responses
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error: Invalid response format");
      }
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || "Failed to delete gallery item");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast({
        title: "Success",
        description: "Gallery item deleted successfully.",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete gallery item",
        variant: "destructive",
      });
    },
  });

  // Helper function to reset gallery form
  const resetGalleryForm = () => {
    setGalleryDialog(false);
    setEditingGallery(null);
    setGalleryForm({
      title: "",
      description: "",
      sortOrder: 0,
      isActive: true,
    });
    setGalleryImage(null);
    setGalleryImagePreview(null);
  };

  // Handle gallery form submit - auto copy Indonesian to English
  const handleGallerySubmit = () => {
    const formData = new FormData();
    // Use same text for both Indonesian and English
    formData.append("titleId", galleryForm.title);
    formData.append("titleEn", galleryForm.title);
    formData.append("descriptionId", galleryForm.description);
    formData.append("descriptionEn", galleryForm.description);
    formData.append("sortOrder", galleryForm.sortOrder.toString());
    formData.append("isActive", galleryForm.isActive.toString());
    
    if (galleryImage) {
      formData.append("image", galleryImage);
    }

    if (editingGallery) {
      updateGalleryMutation.mutate({ id: editingGallery.id, formData });
    } else {
      createGalleryMutation.mutate(formData);
    }
  };

  // Handle gallery image change
  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGalleryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open gallery edit dialog
  const openGalleryEdit = (item: any) => {
    setEditingGallery(item);
    setGalleryForm({
      title: item.titleId,
      description: item.descriptionId || "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setGalleryImagePreview(item.imageUrl);
    setGalleryDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending_payment: { variant: "outline", label: "Pending Payment" },
      waiting_approval: { variant: "secondary", label: "Awaiting Approval" },
      payment_rejected: { variant: "destructive", label: "Rejected" },
      paid: { variant: "default", label: "Paid" },
      waiting_schedule: { variant: "secondary", label: "Awaiting Schedule" },
      scheduled: { variant: "default", label: "Scheduled" },
      completed: { variant: "default", label: "Completed" },
    };
    const config = statusConfig[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ec7014]"></div>
      </div>
    );
  }

  if (!isAdmin && !isTeacher) return null;

  const bookings = bookingsData?.bookings || [];
  const users = usersData?.users || [];
  const teachers = teachersData?.teachers || [];
  const myBookings = myBookingsData?.bookings || [];
  const rescheduleRequests = rescheduleRequestsData?.requests || [];
  const myRescheduleRequests = myRescheduleRequestsData?.requests || [];
  const pendingReschedules = rescheduleRequests.filter((r: any) => r.status === "pending");

  // Helper function to get reschedule request for a booking
  const getRescheduleRequestForBooking = (bookingId: string) => {
    return myRescheduleRequests.find((r: any) => r.bookingId === bookingId);
  };

  // Filter bookings by status
  const pendingPayments = bookings.filter((b: any) => b.status === "waiting_approval");
  const pendingSchedules = bookings.filter((b: any) => b.status === "waiting_schedule");
  const scheduledBookings = bookings.filter((b: any) => b.status === "scheduled");

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-[#662506]">
            {isTeacher ? "Teacher Dashboard" : "Admin Dashboard"}
          </h1>
          <p className="text-[#993404]">
            {isTeacher ? "View your schedule and request reschedules" : "Manage bookings, schedules, and users"}
          </p>
        </div>

        {/* Stats Cards - Only for Admin */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-800">{pendingPayments.length}</p>
                  <p className="text-sm text-yellow-600">Pending Approvals</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-800">{pendingSchedules.length}</p>
                  <p className="text-sm text-blue-600">Awaiting Schedule</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-800">{scheduledBookings.length}</p>
                  <p className="text-sm text-green-600">Scheduled Classes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-800">{users.length}</p>
                  <p className="text-sm text-purple-600">Total Students</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Teacher Stats */}
        {isTeacher && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-800">{myBookings.length}</p>
                  <p className="text-sm text-green-600">My Scheduled Classes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserCog className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-800">{myTeacherData?.teacher?.specialization || "N/A"}</p>
                  <p className="text-sm text-blue-600">Specialization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue={isTeacher ? "my-schedule" : "approval"} className="space-y-6">
          <TabsList className={`grid w-full bg-[#fff7bc] ${isAdmin ? "grid-cols-6" : "grid-cols-1"}`}>
            {isAdmin && (
              <>
                <TabsTrigger value="approval" className="data-[state=active]:bg-[#ec7014] data-[state=active]:text-white">
                  Approval
                </TabsTrigger>
                <TabsTrigger value="reschedule" className="data-[state=active]:bg-[#ec7014] data-[state=active]:text-white">
                  Reschedule ({pendingReschedules.length})
                </TabsTrigger>
                <TabsTrigger value="schedule" className="data-[state=active]:bg-[#ec7014] data-[state=active]:text-white">
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="students" className="data-[state=active]:bg-[#ec7014] data-[state=active]:text-white">
                  Students
                </TabsTrigger>
                <TabsTrigger value="teachers" className="data-[state=active]:bg-[#ec7014] data-[state=active]:text-white">
                  Teachers
                </TabsTrigger>
                <TabsTrigger value="gallery" className="data-[state=active]:bg-[#ec7014] data-[state=active]:text-white">
                  Gallery
                </TabsTrigger>
              </>
            )}
            {isTeacher && (
              <TabsTrigger value="my-schedule" className="data-[state=active]:bg-[#ec7014] data-[state=active]:text-white">
                My Schedule
              </TabsTrigger>
            )}
          </TabsList>

          {/* Teacher's My Schedule Tab */}
          {isTeacher && (
            <TabsContent value="my-schedule">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#662506]">My Teaching Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  {myBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No scheduled classes assigned to you</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead>Session 1</TableHead>
                          <TableHead>Session 2</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reschedule</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myBookings.map((booking: any) => {
                          const classInfo = CLASS_TYPES.find(c => c.id === booking.classType);
                          const rescheduleRequest = getRescheduleRequestForBooking(booking.id);
                          return (
                            <TableRow key={booking.id}>
                              <TableCell>{classInfo?.title || booking.classType}</TableCell>
                              <TableCell>{booking.scheduledDate1} {booking.scheduledTime1}</TableCell>
                              <TableCell>{booking.scheduledDate2} {booking.scheduledTime2}</TableCell>
                              <TableCell>{getStatusBadge(booking.status)}</TableCell>
                              <TableCell>
                                {rescheduleRequest ? (
                                  <div className="space-y-1">
                                    {rescheduleRequest.status === "pending" && (
                                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                        <Clock className="w-3 h-3 mr-1" /> Pending
                                      </Badge>
                                    )}
                                    {rescheduleRequest.status === "approved" && (
                                      <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Approved
                                      </Badge>
                                    )}
                                    {rescheduleRequest.status === "rejected" && (
                                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                                        <XCircle className="w-3 h-3 mr-1" /> Rejected
                                      </Badge>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      → {rescheduleRequest.requestedDate} {rescheduleRequest.requestedTime}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {(!rescheduleRequest || rescheduleRequest.status !== "pending") && (
                                <Dialog open={rescheduleDialog && rescheduleBooking?.id === booking.id} onOpenChange={(open) => {
                                  setRescheduleDialog(open);
                                  if (open) setRescheduleBooking(booking);
                                  else {
                                    setRescheduleBooking(null);
                                    setRescheduleData({ requestedDate: "", requestedTime: "", reason: "" });
                                  }
                                }}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Clock className="w-4 h-4 mr-1" /> Request Reschedule
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Request Reschedule</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="bg-[#fff7bc] p-3 rounded-lg text-sm">
                                        <p><strong>Current Schedule:</strong></p>
                                        <p>Session 1: {booking.scheduledDate1} {booking.scheduledTime1}</p>
                                        <p>Session 2: {booking.scheduledDate2} {booking.scheduledTime2}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>New Date</Label>
                                          <Input 
                                            type="date" 
                                            value={rescheduleData.requestedDate}
                                            onChange={(e) => setRescheduleData(prev => ({ ...prev, requestedDate: e.target.value }))}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>New Time</Label>
                                          <Input 
                                            type="time" 
                                            value={rescheduleData.requestedTime}
                                            onChange={(e) => setRescheduleData(prev => ({ ...prev, requestedTime: e.target.value }))}
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Reason</Label>
                                        <Input 
                                          value={rescheduleData.reason}
                                          onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                                          placeholder="Reason for reschedule..."
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        onClick={() => {
                                          rescheduleRequestMutation.mutate({
                                            bookingId: booking.id,
                                            originalDate: booking.scheduledDate1,
                                            originalTime: booking.scheduledTime1,
                                            requestedDate: rescheduleData.requestedDate,
                                            requestedTime: rescheduleData.requestedTime,
                                            reason: rescheduleData.reason,
                                          });
                                        }}
                                        disabled={!rescheduleData.requestedDate || !rescheduleData.requestedTime || rescheduleRequestMutation.isPending}
                                        className="bg-[#662506] hover:bg-[#993404]"
                                      >
                                        {rescheduleRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Admin Reschedule Approval Tab */}
          {isAdmin && (
            <TabsContent value="reschedule">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#662506]">Reschedule Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingReschedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                      <p>No pending reschedule requests</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Original</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingReschedules.map((request: any) => {
                          const teacher = teachers.find((t: any) => t.id === request.teacherId);
                          return (
                            <TableRow key={request.id}>
                              <TableCell>{teacher?.name || "Unknown"}</TableCell>
                              <TableCell>{request.originalDate} {request.originalTime}</TableCell>
                              <TableCell>{request.requestedDate} {request.requestedTime}</TableCell>
                              <TableCell>{request.reason || "N/A"}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => rescheduleApprovalMutation.mutate({ requestId: request.id, action: "approve" })}
                                    disabled={rescheduleApprovalMutation.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => rescheduleApprovalMutation.mutate({ requestId: request.id, action: "reject" })}
                                    disabled={rescheduleApprovalMutation.isPending}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" /> Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Approval Tab */}
          {isAdmin && (
          <TabsContent value="approval">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#662506]">Payment Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingPayments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                    <p>No pending payment approvals</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Proof</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingPayments.map((booking: any) => {
                        const classInfo = CLASS_TYPES.find(c => c.id === booking.classType);
                        const levelInfo = LEVELS.find(l => l.id === booking.level);
                        return (
                          <TableRow key={booking.id}>
                            <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{booking.userId.slice(0, 8)}...</TableCell>
                            <TableCell>{classInfo?.title || booking.classType}</TableCell>
                            <TableCell>{levelInfo?.label || booking.level}</TableCell>
                            <TableCell>
                              {booking.paymentProof ? (
                                <a 
                                  href={booking.paymentProof} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#ec7014] hover:underline flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" /> View
                                </a>
                              ) : (
                                <span className="text-gray-400">No proof</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => paymentMutation.mutate({ bookingId: booking.id, action: "approve" })}
                                  disabled={paymentMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => paymentMutation.mutate({ bookingId: booking.id, action: "reject" })}
                                  disabled={paymentMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Schedule Tab */}
          {isAdmin && (
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#662506]">Schedule Management</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-bold text-[#662506] mb-4">Pending Schedule Confirmations</h3>
                {pendingSchedules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-blue-400" />
                    <p>No pending schedule confirmations</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Session 1</TableHead>
                        <TableHead>Session 2</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSchedules.map((booking: any) => {
                        const classInfo = CLASS_TYPES.find(c => c.id === booking.classType);
                        const teacherInfo = teachers.find((t: any) => t.id === booking.teacherId);
                        return (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.userId.slice(0, 8)}...</TableCell>
                            <TableCell>{classInfo?.title || booking.classType}</TableCell>
                            <TableCell>
                              {teacherInfo ? (
                                <span className="font-medium">{teacherInfo.name}</span>
                              ) : (
                                <span className="text-gray-400">Not selected</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {booking.scheduledDate1 && booking.scheduledTime1 ? (
                                <div className="text-sm">
                                  <p className="font-medium">{booking.scheduledDate1}</p>
                                  <p className="text-gray-500">{booking.scheduledTime1}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not set</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {booking.scheduledDate2 && booking.scheduledTime2 ? (
                                <div className="text-sm">
                                  <p className="font-medium">{booking.scheduledDate2}</p>
                                  <p className="text-gray-500">{booking.scheduledTime2}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not set</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    scheduleMutation.mutate({ bookingId: booking.id, action: "confirm" });
                                  }}
                                  disabled={!booking.scheduledDate1 || !booking.teacherId || scheduleMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" /> Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    scheduleMutation.mutate({ bookingId: booking.id, action: "reject" });
                                  }}
                                  disabled={scheduleMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}

                <h3 className="font-bold text-[#662506] mt-8 mb-4">Scheduled Classes</h3>
                {scheduledBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No scheduled classes yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Session 1</TableHead>
                        <TableHead>Session 2</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledBookings.map((booking: any) => {
                        const classInfo = CLASS_TYPES.find(c => c.id === booking.classType);
                        const teacher = teachers.find((t: any) => t.id === booking.teacherId);
                        return (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.userId.slice(0, 8)}...</TableCell>
                            <TableCell>{classInfo?.title || booking.classType}</TableCell>
                            <TableCell>{booking.scheduledDate1} {booking.scheduledTime1}</TableCell>
                            <TableCell>{booking.scheduledDate2} {booking.scheduledTime2}</TableCell>
                            <TableCell>{teacher?.name || "N/A"}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Students Tab */}
          {isAdmin && (
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#662506]">Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No students registered yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || "N/A"}</TableCell>
                          <TableCell>
                            {user.isVerified ? (
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Teachers Tab */}
          {isAdmin && (
          <TabsContent value="teachers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[#662506]">Teacher Management</CardTitle>
                <Dialog open={teacherDialog} onOpenChange={setTeacherDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#ec7014] hover:bg-[#cc4c02]">
                      <Plus className="w-4 h-4 mr-2" /> Add Teacher
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Teacher</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input 
                          value={newTeacher.name}
                          onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Teacher name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          type="email"
                          value={newTeacher.email}
                          onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="teacher@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input 
                          value={newTeacher.phone}
                          onChange={(e) => setNewTeacher(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Specialization</Label>
                        <Select 
                          value={newTeacher.specialization} 
                          onValueChange={(value) => setNewTeacher(prev => ({ ...prev, specialization: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="makeup">Makeup</SelectItem>
                            <SelectItem value="nail">Nail Art</SelectItem>
                            <SelectItem value="eyelash">Eyelash Extension</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => createTeacherMutation.mutate(newTeacher)}
                        disabled={!newTeacher.name || createTeacherMutation.isPending}
                        className="bg-[#662506] hover:bg-[#993404]"
                      >
                        {createTeacherMutation.isPending ? "Adding..." : "Add Teacher"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {teachers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserCog className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No teachers added yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map((teacher: any) => (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium">{teacher.name}</TableCell>
                          <TableCell>{teacher.email || "N/A"}</TableCell>
                          <TableCell>{teacher.phone || "N/A"}</TableCell>
                          <TableCell className="capitalize">{teacher.specialization || "N/A"}</TableCell>
                          <TableCell>
                            {teacher.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTeacherMutation.mutate(teacher.id)}
                              disabled={deleteTeacherMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Gallery Tab */}
          {isAdmin && (
          <TabsContent value="gallery">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[#662506]">Kelola Galeri</CardTitle>
                <Dialog open={galleryDialog} onOpenChange={(open) => {
                  if (!open) resetGalleryForm();
                  else setGalleryDialog(true);
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#ec7014] hover:bg-[#cc4c02]">
                      <Plus className="w-4 h-4 mr-2" /> Tambah Foto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingGallery ? "Edit Item Galeri" : "Tambah Item Galeri"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Image Upload */}
                      <div className="space-y-2">
                        <Label>Foto *</Label>
                        <div className="flex flex-col gap-3">
                          {galleryImagePreview && (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                              <img 
                                src={galleryImagePreview} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleGalleryImageChange}
                            className="cursor-pointer"
                          />
                          {!editingGallery && !galleryImage && (
                            <p className="text-sm text-red-500">Foto wajib diisi</p>
                          )}
                        </div>
                      </div>

                      {/* Title ID */}
                      <div className="space-y-2">
                        <Label>Judul *</Label>
                        <Input 
                          value={galleryForm.title}
                          onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Contoh: Workshop Makeup Profesional"
                        />
                      </div>

                      {/* Description ID */}
                      <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Textarea 
                          value={galleryForm.description}
                          onChange={(e) => setGalleryForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Deskripsi singkat tentang foto ini"
                          rows={3}
                        />
                      </div>

                      {/* Sort Order */}
                      <div className="space-y-2">
                        <Label>Urutan</Label>
                        <Input 
                          type="number"
                          value={galleryForm.sortOrder}
                          onChange={(e) => setGalleryForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500">Angka lebih kecil = tampil lebih dulu</p>
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={galleryForm.isActive}
                          onCheckedChange={(checked) => setGalleryForm(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label>Aktif (tampil di website)</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={resetGalleryForm}
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handleGallerySubmit}
                        disabled={
                          !galleryForm.title || 
                          (!editingGallery && !galleryImage) ||
                          createGalleryMutation.isPending ||
                          updateGalleryMutation.isPending
                        }
                        className="bg-[#662506] hover:bg-[#993404]"
                      >
                        {(createGalleryMutation.isPending || updateGalleryMutation.isPending) 
                          ? "Menyimpan..." 
                          : editingGallery ? "Update" : "Tambah"
                        }
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {galleryLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ec7014] mx-auto"></div>
                    <p className="text-gray-500 mt-2">Memuat galeri...</p>
                  </div>
                ) : !galleryData?.gallery || galleryData.gallery.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Belum ada item galeri</p>
                    <p className="text-sm">Klik "Tambah Foto" untuk menambahkan foto pertama</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryData.gallery.map((item: any) => (
                      <Card key={item.id} className={`overflow-hidden ${!item.isActive ? 'opacity-60' : ''}`}>
                        <div className="relative h-48">
                          <img 
                            src={item.imageUrl} 
                            alt={item.titleId}
                            className="w-full h-full object-cover"
                          />
                          {!item.isActive && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary">Hidden</Badge>
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className="bg-white">#{item.sortOrder}</Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-[#662506] mb-1">{item.titleId}</h3>
                          <p className="text-sm text-gray-500 mb-1">{item.titleEn}</p>
                          {item.descriptionId && (
                            <p className="text-xs text-gray-400 line-clamp-2">{item.descriptionId}</p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openGalleryEdit(item)}
                            >
                              <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this gallery item?")) {
                                  deleteGalleryMutation.mutate(item.id);
                                }
                              }}
                              disabled={deleteGalleryMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}
        </Tabs>
      </motion.div>
    </div>
  );
}
