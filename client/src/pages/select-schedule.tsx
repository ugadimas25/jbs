import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, ArrowLeft, CheckCircle, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { CLASS_TYPES, LEVELS, SLOTS } from "@/lib/constants";

export default function SelectSchedule() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Session 1 state
  const [date1, setDate1] = useState<string>("");
  const [time1, setTime1] = useState<string>("");
  
  // Session 2 state
  const [date2, setDate2] = useState<string>("");
  const [time2, setTime2] = useState<string>("");
  
  // Teacher selection
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");

  // Fetch booking details
  const { data: bookingData, isLoading: bookingLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch booking");
      return res.json();
    },
    enabled: !!id && isAuthenticated,
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Fetch teachers
  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await fetch("/api/teachers", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch teachers");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Check teacher availability for session 1
  const { data: availability1 } = useQuery({
    queryKey: ["teacher-availability", selectedTeacher, date1, time1],
    queryFn: async () => {
      const res = await fetch(`/api/teachers/${selectedTeacher}/availability?date=${date1}&time=${time1}`, { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to check availability");
      return res.json();
    },
    enabled: !!selectedTeacher && !!date1 && !!time1,
  });

  // Check teacher availability for session 2
  const { data: availability2 } = useQuery({
    queryKey: ["teacher-availability", selectedTeacher, date2, time2],
    queryFn: async () => {
      const res = await fetch(`/api/teachers/${selectedTeacher}/availability?date=${date2}&time=${time2}`, { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to check availability");
      return res.json();
    },
    enabled: !!selectedTeacher && !!date2 && !!time2,
  });

  const booking = bookingData?.booking;
  const teachers = teachersData?.teachers || [];
  
  // Filter teachers by specialization matching the class type
  const filteredTeachers = teachers.filter((t: any) => 
    t.isActive && (!t.specialization || t.specialization === booking?.classType)
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to select schedule.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [isAuthenticated, authLoading, setLocation, toast]);

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (data: { 
      scheduledDate1: string; 
      scheduledTime1: string;
      scheduledDate2: string; 
      scheduledTime2: string;
      teacherId: string;
    }) => {
      const res = await apiRequest("PUT", `/api/bookings/${id}/schedule`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      toast({
        title: "Schedule Submitted!",
        description: "Your schedule has been submitted. Waiting for admin confirmation.",
        className: "bg-green-600 text-white border-none",
      });
      setLocation("/history");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit schedule",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!date1 || !time1 || !date2 || !time2 || !selectedTeacher) {
      toast({
        title: "Incomplete Selection",
        description: "Please select date, time, and teacher for both sessions.",
        variant: "destructive",
      });
      return;
    }

    if (availability1 && !availability1.available) {
      toast({
        title: "Teacher Not Available",
        description: `Teacher is not available for Session 1 on ${date1} at ${time1}`,
        variant: "destructive",
      });
      return;
    }

    if (availability2 && !availability2.available) {
      toast({
        title: "Teacher Not Available",
        description: `Teacher is not available for Session 2 on ${date2} at ${time2}`,
        variant: "destructive",
      });
      return;
    }

    updateScheduleMutation.mutate({
      scheduledDate1: date1,
      scheduledTime1: time1,
      scheduledDate2: date2,
      scheduledTime2: time2,
      teacherId: selectedTeacher,
    });
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (authLoading || bookingLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ec7014]"></div>
      </div>
    );
  }

  if (!booking || booking.status !== "paid") {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <Calendar className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Cannot Select Schedule</h2>
            <p className="text-gray-600 mb-4">
              {booking ? "Your payment must be approved before selecting a schedule." : "Booking not found."}
            </p>
            <Button onClick={() => setLocation("/history")} className="bg-[#ec7014] hover:bg-[#cc4c02]">
              Go to My Classes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const classDetails = CLASS_TYPES.find(c => c.id === booking.classType);
  const levelDetails = LEVELS.find(l => l.id === booking.level);
  const selectedTeacherData = teachers.find((t: any) => t.id === selectedTeacher);

  const isSession1Available = !availability1 || availability1.available;
  const isSession2Available = !availability2 || availability2.available;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/history")}
          className="mb-6 text-[#993404] hover:text-[#662506]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Classes
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-xl bg-white/90">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="font-serif text-3xl text-[#662506]">Select Your Schedule</CardTitle>
              <p className="text-[#993404]">Your payment has been approved! Please select your class schedule.</p>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Booking Summary */}
              <div className="bg-[#ffffe5] p-4 rounded-lg border border-[#fee391]">
                <h3 className="font-bold text-[#662506] mb-3">Class Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[#993404]">Class</p>
                    <p className="font-medium text-[#662506]">{classDetails?.title || booking.classType}</p>
                  </div>
                  <div>
                    <p className="text-[#993404]">Level</p>
                    <p className="font-medium text-[#662506]">{levelDetails?.label || booking.level}</p>
                  </div>
                </div>
              </div>

              {/* Teacher Selection */}
              <div className="space-y-4">
                <h3 className="font-bold text-[#662506] text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-[#ec7014]" />
                  Select Teacher
                </h3>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="border-[#fee391] focus:ring-[#ec7014]">
                    <SelectValue placeholder="Choose your teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTeachers.length === 0 ? (
                      <SelectItem value="none" disabled>No teachers available</SelectItem>
                    ) : (
                      filteredTeachers.map((teacher: any) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} {teacher.specialization && `(${teacher.specialization})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-[#fff7bc] p-4 rounded-lg border border-[#fec44f]">
                <p className="text-sm text-[#662506]">
                  <strong>Note:</strong> Each class package includes 2 sessions. Please select date and time for each session. 
                  Admin will confirm your schedule.
                </p>
              </div>

              {/* Session 1 Selection */}
              <div className="space-y-4 p-4 bg-[#ffffe5]/50 rounded-lg border border-[#fee391]">
                <h3 className="font-bold text-[#662506] text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#ec7014]" />
                  Session 1
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#662506]">Date</Label>
                    <Input 
                      type="date" 
                      value={date1}
                      onChange={(e) => setDate1(e.target.value)}
                      min={getMinDate()}
                      className="border-[#fee391] focus:ring-[#ec7014]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#662506]">Time</Label>
                    <Select value={time1} onValueChange={setTime1}>
                      <SelectTrigger className="border-[#fee391] focus:ring-[#ec7014]">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {SLOTS.map(slot => (
                          <SelectItem key={slot.id} value={slot.label}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedTeacher && date1 && time1 && !isSession1Available && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>Teacher is already booked at this time. Please select another slot.</span>
                  </div>
                )}
                {selectedTeacher && date1 && time1 && isSession1Available && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span>Teacher is available!</span>
                  </div>
                )}
              </div>

              {/* Session 2 Selection */}
              <div className="space-y-4 p-4 bg-[#ffffe5]/50 rounded-lg border border-[#fee391]">
                <h3 className="font-bold text-[#662506] text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#ec7014]" />
                  Session 2
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#662506]">Date</Label>
                    <Input 
                      type="date" 
                      value={date2}
                      onChange={(e) => setDate2(e.target.value)}
                      min={date1 || getMinDate()}
                      className="border-[#fee391] focus:ring-[#ec7014]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#662506]">Time</Label>
                    <Select value={time2} onValueChange={setTime2}>
                      <SelectTrigger className="border-[#fee391] focus:ring-[#ec7014]">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {SLOTS.map(slot => (
                          <SelectItem key={slot.id} value={slot.label}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedTeacher && date2 && time2 && !isSession2Available && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>Teacher is already booked at this time. Please select another slot.</span>
                  </div>
                )}
                {selectedTeacher && date2 && time2 && isSession2Available && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span>Teacher is available!</span>
                  </div>
                )}
              </div>

              {/* Selected Summary */}
              {(date1 || date2 || selectedTeacher) && (
                <div className="bg-[#ec7014]/10 p-4 rounded-lg border border-[#ec7014]/30">
                  <h4 className="font-bold text-[#662506] mb-2">Your Selection</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-[#993404]">
                      <strong>Teacher:</strong> {selectedTeacherData?.name || "Not selected"}
                    </p>
                    <p className="text-[#993404]">
                      <strong>Session 1:</strong> {date1 && time1 ? `${date1} at ${time1}` : "Not selected"}
                    </p>
                    <p className="text-[#993404]">
                      <strong>Session 2:</strong> {date2 && time2 ? `${date2} at ${time2}` : "Not selected"}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={
                  !date1 || !time1 || !date2 || !time2 || !selectedTeacher || 
                  !isSession1Available || !isSession2Available ||
                  updateScheduleMutation.isPending
                }
                className="w-full bg-[#662506] hover:bg-[#993404] text-white py-6 text-lg"
              >
                {updateScheduleMutation.isPending ? "Submitting..." : "Submit Schedule"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
