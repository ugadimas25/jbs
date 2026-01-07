import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CLASS_TYPES, LEVELS } from "@/lib/constants";
import { 
  Calendar, Clock, ChevronRight, Upload, CheckCircle, 
  AlertCircle, XCircle, Award, BookOpen 
} from "lucide-react";
import { motion } from "framer-motion";

export default function History() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your classes.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [isAuthenticated, authLoading, setLocation, toast]);

  // Fetch user's bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await fetch("/api/bookings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const bookings = bookingsData?.bookings || [];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { 
      label: string; 
      color: string; 
      bg: string; 
      icon: any;
      actionLabel?: string;
      actionLink?: (id: string) => string;
    }> = {
      pending_payment: {
        label: "Pending Payment",
        color: "text-yellow-700",
        bg: "bg-yellow-100 border-yellow-300",
        icon: Clock,
        actionLabel: "Upload Proof",
        actionLink: (id) => `/upload-proof/${id}`,
      },
      waiting_approval: {
        label: "Awaiting Approval",
        color: "text-blue-700",
        bg: "bg-blue-100 border-blue-300",
        icon: Clock,
      },
      payment_rejected: {
        label: "Payment Rejected",
        color: "text-red-700",
        bg: "bg-red-100 border-red-300",
        icon: XCircle,
        actionLabel: "Re-upload Proof",
        actionLink: (id) => `/upload-proof/${id}`,
      },
      paid: {
        label: "Payment Approved",
        color: "text-green-700",
        bg: "bg-green-100 border-green-300",
        icon: CheckCircle,
        actionLabel: "Select Schedule",
        actionLink: (id) => `/select-schedule/${id}`,
      },
      waiting_schedule: {
        label: "Awaiting Schedule",
        color: "text-purple-700",
        bg: "bg-purple-100 border-purple-300",
        icon: Calendar,
      },
      scheduled: {
        label: "Scheduled",
        color: "text-green-700",
        bg: "bg-green-100 border-green-300",
        icon: CheckCircle,
      },
      completed: {
        label: "Completed",
        color: "text-gray-700",
        bg: "bg-gray-100 border-gray-300",
        icon: Award,
      },
    };
    return configs[status] || {
      label: status,
      color: "text-gray-700",
      bg: "bg-gray-100 border-gray-300",
      icon: AlertCircle,
    };
  };

  if (authLoading || bookingsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ec7014]"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Separate bookings by active status
  const activeBookings = bookings.filter((b: any) => 
    !['completed'].includes(b.status)
  );
  const completedBookings = bookings.filter((b: any) => 
    b.status === 'completed'
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="font-serif text-4xl font-bold text-[#662506]">My Classes</h1>
            <p className="text-[#993404] mt-2">Track your bookings and class schedules.</p>
          </div>
          <div className="bg-[#ffffe5] px-6 py-3 rounded-xl border border-[#fee391] flex gap-4 shadow-sm">
            <div className="text-center">
              <div className="text-xs text-[#993404] uppercase font-bold tracking-wider">Active</div>
              <div className="text-2xl font-serif font-bold text-[#ec7014]">{activeBookings.length}</div>
            </div>
            <div className="w-px bg-[#fee391]"></div>
            <div className="text-center">
              <div className="text-xs text-[#993404] uppercase font-bold tracking-wider">Completed</div>
              <div className="text-2xl font-serif font-bold text-[#662506]">{completedBookings.length}</div>
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-[#fec44f] mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-[#662506] mb-2">No Classes Yet</h2>
            <p className="text-[#993404] mb-6">Start your beauty journey by booking your first class!</p>
            <Button 
              onClick={() => setLocation("/booking")}
              className="bg-[#ec7014] hover:bg-[#cc4c02] text-white"
            >
              Book a Class
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Bookings Section */}
            {activeBookings.length > 0 && (
              <>
                <h2 className="font-serif text-xl font-bold text-[#662506] mb-4">Active Bookings</h2>
                {activeBookings.map((booking: any, index: number) => {
                  const classInfo = CLASS_TYPES.find(c => c.id === booking.classType);
                  const levelInfo = LEVELS.find(l => l.id === booking.level);
                  const statusConfig = getStatusConfig(booking.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur group">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            {/* Status Section */}
                            <div className={`p-6 md:w-48 flex flex-col justify-center items-center shrink-0 ${statusConfig.bg} border-r`}>
                              <StatusIcon className={`w-8 h-8 ${statusConfig.color} mb-2`} />
                              <span className={`text-sm font-bold ${statusConfig.color} text-center`}>
                                {statusConfig.label}
                              </span>
                            </div>

                            {/* Details Section */}
                            <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-[#993404] font-mono bg-[#ffffe5] px-2 py-1 rounded border border-[#fee391]">
                                    #{booking.id.slice(0, 8)}
                                  </span>
                                </div>
                                
                                <div>
                                  <h3 className="font-serif text-2xl font-bold text-[#662506] group-hover:text-[#ec7014] transition-colors">
                                    {classInfo?.title || booking.classType}
                                  </h3>
                                  <p className="text-[#993404] font-medium">{levelInfo?.label || booking.level}</p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-[#993404]/80">
                                  {booking.paymentMethod && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-medium">Payment:</span> {booking.paymentMethod}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                                  </div>
                                  {booking.scheduledDate1 && (
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-4 h-4" />
                                      Session 1: {booking.scheduledDate1} at {booking.scheduledTime1}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Actions Section */}
                              <div className="flex md:flex-col gap-3 w-full md:w-auto">
                                {statusConfig.actionLink && (
                                  <Button 
                                    onClick={() => setLocation(statusConfig.actionLink!(booking.id))}
                                    className="w-full md:w-48 bg-[#ec7014] text-white hover:bg-[#cc4c02] gap-2"
                                  >
                                    {statusConfig.actionLabel} <ChevronRight className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </>
            )}

            {/* Completed Bookings Section */}
            {completedBookings.length > 0 && (
              <>
                <h2 className="font-serif text-xl font-bold text-[#662506] mt-8 mb-4">Completed Classes</h2>
                {completedBookings.map((booking: any, index: number) => {
                  const classInfo = CLASS_TYPES.find(c => c.id === booking.classType);
                  const levelInfo = LEVELS.find(l => l.id === booking.level);

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden border-none shadow-md bg-white/60">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-green-100 rounded-lg">
                                <Award className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-serif text-lg font-bold text-[#662506]">
                                  {classInfo?.title || booking.classType}
                                </h3>
                                <p className="text-sm text-[#993404]">{levelInfo?.label || booking.level}</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              Completed
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
        )}
        
        {/* Call to Action */}
        <div className="mt-12 text-center p-10 bg-[#fec44f]/10 rounded-3xl border border-[#fec44f]/20">
          <Award className="w-12 h-12 text-[#ec7014] mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold text-[#662506] mb-2">Want to learn more?</h3>
          <p className="text-[#993404] mb-6">Expand your skills with our courses.</p>
          <Button 
            onClick={() => setLocation("/booking")}
            className="bg-[#ec7014] hover:bg-[#cc4c02] text-white"
          >
            Book Another Class
          </Button>
        </div>
      </div>
    </div>
  );
}
