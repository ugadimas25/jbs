import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CLASS_TYPES } from "@/lib/constants";
import { Check, ChevronRight, Clock, CreditCard, Building2, AlertCircle, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Bank account information
const BANK_ACCOUNTS = [
  { 
    id: "bca", 
    name: "BCA", 
    accountNumber: "1234567890",
    accountName: "Jakarta Beauty School",
    logo: "🏦"
  },
  { 
    id: "mandiri", 
    name: "Mandiri", 
    accountNumber: "0987654321",
    accountName: "Jakarta Beauty School",
    logo: "🏛️"
  },
  { 
    id: "bni", 
    name: "BNI", 
    accountNumber: "1122334455",
    accountName: "Jakarta Beauty School",
    logo: "🏢"
  },
];

export default function Booking() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const queryParams = new URLSearchParams(search);
  const initialClassId = queryParams.get("class");

  const { toast } = useToast();

  // Start at step 2 (payment) if class is provided via URL (from course detail page)
  const [step, setStep] = useState(initialClassId ? 2 : 1);
  const [selectedClass, setSelectedClass] = useState<string>(initialClassId || "");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [paymentDue, setPaymentDue] = useState<Date | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in or create an account to book a class.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [isAuthenticated, isLoading, setLocation, toast]);

  // Countdown timer
  useEffect(() => {
    if (!paymentDue) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const due = paymentDue.getTime();
      const remaining = Math.max(0, Math.floor((due - now) / 1000));
      setCountdown(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        toast({
          title: "Payment Time Expired",
          description: "Your booking has expired. Please create a new booking.",
          variant: "destructive",
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentDue, toast]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: { classType: string; paymentMethod: string }) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: (data) => {
      setBookingId(data.booking.id);
      setPaymentDue(new Date(data.booking.paymentDue));
      setStep(3);
      toast({
        title: "Booking Created!",
        description: "Please complete your payment within 1 hour.",
        className: "bg-[#ec7014] text-white border-none",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ec7014]"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleNext = () => {
    if (step === 1 && !selectedClass) return;
    if (step === 2 && !selectedBank) return;
    
    setStep(step + 1);
  };

  const handleBack = () => {
    // If user came from course detail page and at step 2, go back to course detail
    if (initialClassId && step === 2) {
      setLocation(`/courses/${initialClassId}`);
      return;
    }
    setStep(step - 1);
  };

  const handleConfirmPayment = async () => {
    // Create booking with selected bank
    createBookingMutation.mutate({
      classType: selectedClass,
      paymentMethod: selectedBank.toUpperCase(),
    });
  };

  const handleUploadProof = () => {
    if (bookingId) {
      setLocation(`/upload-proof/${bookingId}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard.",
    });
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const classDetails = CLASS_TYPES.find(c => c.id === selectedClass);
  const bankDetails = BANK_ACCOUNTS.find(b => b.id === selectedBank);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-[#662506] mb-2">Book Your Class</h1>
          <p className="text-[#993404]">Step {step} of 3</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-2 w-20 rounded-full transition-colors ${i <= step ? "bg-[#ec7014]" : "bg-[#fee391]"}`}
              />
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-serif font-bold text-[#662506]">Select a Class</h2>
                      <RadioGroup value={selectedClass} onValueChange={setSelectedClass} className="grid gap-4">
                        {CLASS_TYPES.map((c) => (
                          <div key={c.id}>
                            <RadioGroupItem value={c.id} id={c.id} className="peer sr-only" />
                            <Label
                              htmlFor={c.id}
                              className="flex items-center justify-between p-4 rounded-xl border-2 border-[#fee391] bg-[#ffffe5]/50 hover:bg-[#fff7bc] peer-data-[state=checked]:border-[#ec7014] peer-data-[state=checked]:bg-[#fff7bc] cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="bg-[#fec44f]/20 p-3 rounded-lg text-[#ec7014]">
                                  <c.icon className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="font-bold text-[#662506] text-lg">{c.title}</div>
                                  <div className="text-[#993404] text-sm">{c.description}</div>
                                </div>
                              </div>
                              <div className="w-6 h-6 rounded-full border-2 border-[#ec7014] flex items-center justify-center opacity-0 peer-data-[state=checked]:opacity-100">
                                <div className="w-3 h-3 rounded-full bg-[#ec7014]" />
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-serif font-bold text-[#662506]">Select Payment Method</h2>
                      <p className="text-[#993404]">Choose your preferred bank for transfer</p>
                      
                      <RadioGroup value={selectedBank} onValueChange={setSelectedBank} className="grid gap-4">
                        {BANK_ACCOUNTS.map((bank) => (
                          <div key={bank.id}>
                            <RadioGroupItem value={bank.id} id={bank.id} className="peer sr-only" />
                            <Label
                              htmlFor={bank.id}
                              className="flex items-center justify-between p-4 rounded-xl border-2 border-[#fee391] bg-[#ffffe5]/50 hover:bg-[#fff7bc] peer-data-[state=checked]:border-[#ec7014] peer-data-[state=checked]:bg-[#fff7bc] cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-3xl">{bank.logo}</div>
                                <div>
                                  <div className="font-bold text-[#662506] text-lg">{bank.name}</div>
                                  <div className="text-[#993404] text-sm">{bank.accountNumber}</div>
                                </div>
                              </div>
                              <div className="w-6 h-6 rounded-full border-2 border-[#ec7014] flex items-center justify-center opacity-0 peer-data-[state=checked]:opacity-100">
                                <div className="w-3 h-3 rounded-full bg-[#ec7014]" />
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      <div className="bg-[#fff7bc] p-4 rounded-lg border border-[#fec44f]">
                        <h3 className="font-bold text-[#662506] mb-2">Review Your Order</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#993404]">Class:</span>
                            <span className="font-medium text-[#662506]">{classDetails?.title}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-serif font-bold text-[#662506]">Complete Your Payment</h2>
                      
                      {/* Countdown Timer */}
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                        <div>
                          <p className="font-bold text-red-700">Time Remaining</p>
                          <p className="text-2xl font-mono font-bold text-red-600">{formatCountdown(countdown)}</p>
                        </div>
                      </div>

                      {/* Bank Details */}
                      {bankDetails && (
                        <div className="bg-[#ffffe5] p-6 rounded-xl border border-[#fee391] space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Building2 className="w-8 h-8 text-[#ec7014]" />
                            <h3 className="font-bold text-[#662506] text-xl">{bankDetails.name}</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-[#993404]">Account Number</p>
                              <div className="flex items-center gap-2">
                                <p className="text-2xl font-mono font-bold text-[#662506]">{bankDetails.accountNumber}</p>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => copyToClipboard(bankDetails.accountNumber)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-[#993404]">Account Name</p>
                              <p className="font-bold text-[#662506]">{bankDetails.accountName}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-[#ec7014]/5 p-4 rounded-lg flex gap-3 items-start text-sm text-[#993404]">
                        <CreditCard className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[#662506]">Payment Instructions:</p>
                          <ol className="list-decimal ml-4 mt-2 space-y-1">
                            <li>Transfer the exact amount to the account above</li>
                            <li>Save your payment receipt/proof</li>
                            <li>Click "Upload Payment Proof" button below</li>
                            <li>Wait for admin approval (usually within 1-2 hours)</li>
                          </ol>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                  {step < 3 ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handleBack}
                        disabled={step === 1 && !initialClassId}
                        className="border-[#cc4c02] text-[#cc4c02] hover:bg-[#cc4c02]/10"
                      >
                        Back
                      </Button>
                      
                      {step < 2 ? (
                        <Button 
                          onClick={handleNext}
                          className="bg-[#ec7014] hover:bg-[#cc4c02] text-white px-8"
                        >
                          Next Step <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleConfirmPayment}
                          disabled={!selectedBank || createBookingMutation.isPending}
                          className="bg-[#662506] hover:bg-[#993404] text-white px-8"
                        >
                          {createBookingMutation.isPending ? "Processing..." : "Confirm & Get Payment Details"}
                          <Check className="ml-2 w-4 h-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="w-full">
                      <Button 
                        onClick={handleUploadProof}
                        className="w-full bg-[#ec7014] hover:bg-[#cc4c02] text-white px-8 py-6 text-lg"
                      >
                        Upload Payment Proof <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="hidden lg:block">
             <Card className="border-[#fee391] bg-white/90 sticky top-24">
               <CardContent className="p-6 space-y-6">
                 <h3 className="font-serif text-xl font-bold text-[#662506]">Booking Summary</h3>
                 
                 <div className="space-y-4">
                   <div className="flex items-start gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${step >= 1 ? 'bg-[#ec7014] border-[#ec7014]' : 'bg-[#ffffe5] border-[#fee391]'}`}>
                       {step > 1 ? <Check className="w-4 h-4 text-white" /> : <span className={`font-bold ${step >= 1 ? 'text-white' : 'text-[#ec7014]'}`}>1</span>}
                     </div>
                     <div>
                       <p className="text-xs uppercase text-[#993404] font-bold">Class</p>
                       <p className="text-[#662506] font-medium">{classDetails?.title || "Not selected"}</p>
                     </div>
                   </div>

                   <div className="w-0.5 h-4 bg-[#fee391] ml-4"></div>

                   <div className="flex items-start gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${step >= 2 ? 'bg-[#ec7014] border-[#ec7014]' : 'bg-[#ffffe5] border-[#fee391]'}`}>
                       {step > 2 ? <Check className="w-4 h-4 text-white" /> : <span className={`font-bold ${step >= 2 ? 'text-white' : 'text-[#ec7014]'}`}>2</span>}
                     </div>
                     <div>
                       <p className="text-xs uppercase text-[#993404] font-bold">Payment</p>
                       <p className="text-[#662506] font-medium">{bankDetails?.name || "Not selected"}</p>
                     </div>
                   </div>

                   {step === 3 && countdown > 0 && (
                     <>
                       <div className="w-0.5 h-4 bg-[#fee391] ml-4"></div>
                       <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                           <Clock className="w-4 h-4 text-white" />
                         </div>
                         <div>
                           <p className="text-xs uppercase text-red-600 font-bold">Time Left</p>
                           <p className="text-red-600 font-mono font-bold text-lg">{formatCountdown(countdown)}</p>
                         </div>
                       </div>
                     </>
                   )}
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
