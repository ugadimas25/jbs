import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileImage, CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { CLASS_TYPES, LEVELS } from "@/lib/constants";

export default function UploadProof() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Fetch booking details
  const { data: bookingData, isLoading: bookingLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch booking");
      return res.json();
    },
    enabled: !!id && isAuthenticated,
  });

  const booking = bookingData?.booking;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload payment proof.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [isAuthenticated, authLoading, setLocation, toast]);

  // Countdown timer
  useEffect(() => {
    if (!booking?.paymentDue) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const due = new Date(booking.paymentDue).getTime();
      const remaining = Math.max(0, Math.floor((due - now) / 1000));
      setCountdown(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking?.paymentDue]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("proof", file);

      const res = await fetch(`/api/bookings/${id}/upload-proof`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      toast({
        title: "Upload Successful!",
        description: "Your payment proof has been uploaded. Please wait for admin approval.",
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload payment proof",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending_payment":
        return { 
          color: "text-yellow-600", 
          bg: "bg-yellow-50", 
          border: "border-yellow-200",
          icon: Clock,
          label: "Waiting for Payment Upload",
          description: "Please upload your payment proof"
        };
      case "waiting_approval":
        return { 
          color: "text-blue-600", 
          bg: "bg-blue-50", 
          border: "border-blue-200",
          icon: Clock,
          label: "Waiting for Approval",
          description: "Your payment is being reviewed by admin"
        };
      case "payment_rejected":
        return { 
          color: "text-red-600", 
          bg: "bg-red-50", 
          border: "border-red-200",
          icon: XCircle,
          label: "Payment Rejected",
          description: "Please upload a valid payment proof"
        };
      case "paid":
        return { 
          color: "text-green-600", 
          bg: "bg-green-50", 
          border: "border-green-200",
          icon: CheckCircle,
          label: "Payment Approved",
          description: "Please proceed to select your class schedule"
        };
      default:
        return { 
          color: "text-gray-600", 
          bg: "bg-gray-50", 
          border: "border-gray-200",
          icon: AlertCircle,
          label: status,
          description: ""
        };
    }
  };

  if (authLoading || bookingLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ec7014]"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => setLocation("/")} className="bg-[#ec7014] hover:bg-[#cc4c02]">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);
  const StatusIcon = statusInfo.icon;
  const classDetails = CLASS_TYPES.find(c => c.id === booking.classType);
  const levelDetails = LEVELS.find(l => l.id === booking.level);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
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
              <CardTitle className="font-serif text-3xl text-[#662506]">Upload Payment Proof</CardTitle>
              <p className="text-[#993404]">Booking ID: {booking.id.slice(0, 8)}...</p>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {/* Status Badge */}
              <div className={`${statusInfo.bg} ${statusInfo.border} border p-4 rounded-lg flex items-center gap-3`}>
                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                <div>
                  <p className={`font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
                  <p className="text-sm text-gray-600">{statusInfo.description}</p>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-[#ffffe5] p-4 rounded-lg border border-[#fee391]">
                <h3 className="font-bold text-[#662506] mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[#993404]">Class</p>
                    <p className="font-medium text-[#662506]">{classDetails?.title || booking.classType}</p>
                  </div>
                  <div>
                    <p className="text-[#993404]">Level</p>
                    <p className="font-medium text-[#662506]">{levelDetails?.label || booking.level}</p>
                  </div>
                  <div>
                    <p className="text-[#993404]">Payment Method</p>
                    <p className="font-medium text-[#662506]">{booking.paymentMethod || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[#993404]">Amount</p>
                    <p className="font-bold text-[#ec7014]">{levelDetails?.price || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Countdown Timer (only for pending_payment) */}
              {booking.status === "pending_payment" && countdown > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <p className="font-bold text-red-700">Time Remaining to Upload</p>
                    <p className="text-2xl font-mono font-bold text-red-600">{formatCountdown(countdown)}</p>
                  </div>
                </div>
              )}

              {/* Upload Area - only show for pending_payment or payment_rejected */}
              {(booking.status === "pending_payment" || booking.status === "payment_rejected") && (
                <>
                  <div
                    className="border-2 border-dashed border-[#fec44f] rounded-xl p-8 text-center cursor-pointer hover:border-[#ec7014] hover:bg-[#fff7bc]/30 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/jpeg,image/png,application/pdf"
                      className="hidden"
                    />

                    {previewUrl ? (
                      <div className="space-y-4">
                        <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-lg" />
                        <p className="text-[#662506] font-medium">{selectedFile?.name}</p>
                        <p className="text-sm text-[#993404]">Click to change file</p>
                      </div>
                    ) : selectedFile ? (
                      <div className="space-y-4">
                        <FileImage className="w-16 h-16 text-[#ec7014] mx-auto" />
                        <p className="text-[#662506] font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-[#993404]">Click to change file</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-16 h-16 text-[#fec44f] mx-auto" />
                        <div>
                          <p className="text-[#662506] font-medium">Click to upload or drag and drop</p>
                          <p className="text-sm text-[#993404]">JPG, PNG or PDF (max. 5MB)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadMutation.isPending}
                    className="w-full bg-[#ec7014] hover:bg-[#cc4c02] text-white py-6 text-lg"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Payment Proof
                      </>
                    )}
                  </Button>
                </>
              )}

              {/* Show uploaded proof if exists */}
              {booking.paymentProof && (
                <div className="border border-[#fee391] rounded-lg p-4">
                  <p className="text-sm text-[#993404] mb-2">Uploaded Proof:</p>
                  <a 
                    href={booking.paymentProof} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#ec7014] hover:underline flex items-center gap-2"
                  >
                    <FileImage className="w-4 h-4" />
                    View uploaded file
                  </a>
                </div>
              )}

              {/* Next step for approved payments */}
              {booking.status === "paid" && (
                <Button
                  onClick={() => setLocation(`/select-schedule/${booking.id}`)}
                  className="w-full bg-[#662506] hover:bg-[#993404] text-white py-6 text-lg"
                >
                  Select Class Schedule
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
