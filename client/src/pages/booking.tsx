import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CLASS_TYPES, LEVELS, SLOTS } from "@/lib/constants";
import { Check, ChevronRight, Calendar, Clock, Award, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Booking() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const queryParams = new URLSearchParams(search);
  const initialClassId = queryParams.get("class");

  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<string>(initialClassId || "");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [date, setDate] = useState<string>("");

  // TEMPORARY: Disabled authentication check untuk testing
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     toast({
  //       title: "Authentication Required",
  //       description: "Please sign in or create an account to book a class.",
  //       variant: "destructive",
  //     });
  //     setLocation("/auth");
  //   }
  // }, [isAuthenticated, setLocation, toast]);

  // if (!isAuthenticated) return null;

  const handleNext = () => {
    if (step === 1 && !selectedClass) return;
    if (step === 2 && !selectedLevel) return;
    if (step === 3 && (!selectedSlot || !date)) return;
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleConfirm = () => {
    // Mock success
    toast({
      title: "Booking Confirmed!",
      description: "Check your email for the booking details.",
      className: "bg-[#ec7014] text-white border-none",
    });
    setTimeout(() => setLocation("/"), 2000);
  };

  const classDetails = CLASS_TYPES.find(c => c.id === selectedClass);
  const levelDetails = LEVELS.find(l => l.id === selectedLevel);
  const slotDetails = SLOTS.find(s => s.id === selectedSlot);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-[#662506] mb-2">Book Your Class</h1>
          <p className="text-[#993404]">Step {step} of 4</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-2 w-16 rounded-full transition-colors ${i <= step ? "bg-[#ec7014]" : "bg-[#fee391]"}`}
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
                      <h2 className="text-2xl font-serif font-bold text-[#662506]">Choose Your Level</h2>
                      <RadioGroup value={selectedLevel} onValueChange={setSelectedLevel} className="grid gap-4">
                        {LEVELS.map((l) => (
                          <div key={l.id}>
                            <RadioGroupItem value={l.id} id={l.id} className="peer sr-only" />
                            <Label
                              htmlFor={l.id}
                              className="flex flex-col p-6 rounded-xl border-2 border-[#fee391] bg-[#ffffe5]/50 hover:bg-[#fff7bc] peer-data-[state=checked]:border-[#ec7014] peer-data-[state=checked]:bg-[#fff7bc] cursor-pointer transition-all"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-[#662506] text-lg">{l.label}</span>
                                <span className="text-[#ec7014] font-bold bg-[#ec7014]/10 px-3 py-1 rounded-full">{l.price}</span>
                              </div>
                              <p className="text-[#993404] text-sm">{l.description}</p>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
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
                      <h2 className="text-2xl font-serif font-bold text-[#662506]">Select Date & Time</h2>
                      
                      <div className="space-y-4">
                        <Label htmlFor="date" className="text-[#662506] font-medium">Pick a Date</Label>
                        <Input 
                          type="date" 
                          id="date" 
                          value={date} 
                          onChange={(e) => setDate(e.target.value)}
                          className="h-12 border-[#fec44f] focus:ring-[#ec7014]"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div className="space-y-4 pt-4">
                        <Label className="text-[#662506] font-medium">Available Slots</Label>
                        <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot} className="grid sm:grid-cols-2 gap-4">
                          {SLOTS.map((s) => (
                            <div key={s.id}>
                              <RadioGroupItem value={s.id} id={s.id} className="peer sr-only" />
                              <Label
                                htmlFor={s.id}
                                className="flex flex-col items-center justify-center p-4 text-center rounded-xl border-2 border-[#fee391] bg-[#ffffe5]/50 hover:bg-[#fff7bc] peer-data-[state=checked]:border-[#ec7014] peer-data-[state=checked]:bg-[#fff7bc] cursor-pointer transition-all h-full"
                              >
                                <Clock className="w-6 h-6 text-[#ec7014] mb-2" />
                                <span className="font-bold text-[#662506]">{s.label}</span>
                                <span className="text-xs text-[#993404] mt-1">Duration: 2.5 Hours</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-serif font-bold text-[#662506]">Review Booking</h2>
                      
                      <div className="bg-[#ffffe5] p-6 rounded-xl border border-[#fee391] space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[#993404]">Class</span>
                          <span className="font-bold text-[#662506]">{classDetails?.title}</span>
                        </div>
                        <Separator className="bg-[#fee391]" />
                        <div className="flex justify-between items-center">
                          <span className="text-[#993404]">Level</span>
                          <span className="font-bold text-[#662506]">{levelDetails?.label}</span>
                        </div>
                        <Separator className="bg-[#fee391]" />
                        <div className="flex justify-between items-center">
                          <span className="text-[#993404]">Date</span>
                          <span className="font-bold text-[#662506]">{date}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#993404]">Time Slot</span>
                          <span className="font-bold text-[#662506]">{slotDetails?.label}</span>
                        </div>
                        <Separator className="bg-[#ec7014]" />
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-bold text-[#662506]">Total</span>
                          <span className="font-bold text-[#ec7014]">{levelDetails?.price}</span>
                        </div>
                      </div>

                      <div className="bg-[#ec7014]/5 p-4 rounded-lg flex gap-3 items-start text-sm text-[#993404]">
                        <CreditCard className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>Payment will be processed at the academy. Please arrive 15 minutes before your scheduled slot to complete registration.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    disabled={step === 1}
                    className="border-[#cc4c02] text-[#cc4c02] hover:bg-[#cc4c02]/10"
                  >
                    Back
                  </Button>
                  
                  {step < 4 ? (
                    <Button 
                      onClick={handleNext}
                      className="bg-[#ec7014] hover:bg-[#cc4c02] text-white px-8"
                    >
                      Next Step <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleConfirm}
                      className="bg-[#662506] hover:bg-[#993404] text-white px-8"
                    >
                      Confirm Booking <Check className="ml-2 w-4 h-4" />
                    </Button>
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
                     <div className="w-8 h-8 rounded-full bg-[#ffffe5] flex items-center justify-center shrink-0 border border-[#fee391]">
                       <span className="font-bold text-[#ec7014]">1</span>
                     </div>
                     <div>
                       <p className="text-xs uppercase text-[#993404] font-bold">Class</p>
                       <p className="text-[#662506] font-medium">{classDetails?.title || "Not selected"}</p>
                     </div>
                   </div>

                   <div className="w-0.5 h-4 bg-[#fee391] ml-4"></div>

                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#ffffe5] flex items-center justify-center shrink-0 border border-[#fee391]">
                       <span className="font-bold text-[#ec7014]">2</span>
                     </div>
                     <div>
                       <p className="text-xs uppercase text-[#993404] font-bold">Level</p>
                       <p className="text-[#662506] font-medium">{levelDetails?.label || "Not selected"}</p>
                     </div>
                   </div>

                   <div className="w-0.5 h-4 bg-[#fee391] ml-4"></div>

                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#ffffe5] flex items-center justify-center shrink-0 border border-[#fee391]">
                       <span className="font-bold text-[#ec7014]">3</span>
                     </div>
                     <div>
                       <p className="text-xs uppercase text-[#993404] font-bold">Time</p>
                       <p className="text-[#662506] font-medium">
                         {date ? date : "No Date"} <br/>
                         {slotDetails?.label || "No Slot"}
                       </p>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
