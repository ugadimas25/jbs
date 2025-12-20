import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { SLOTS } from "@/lib/constants";
import { Calendar, Clock, MapPin, ChevronRight, Download, Award, CalendarDays, ListChecks } from "lucide-react";
import { motion } from "framer-motion";

// Mock Data for History
const MOCK_HISTORY = [
  {
    id: "BK-2025-001",
    classType: "makeup",
    title: "Professional Makeup",
    level: "Intermediate",
    date: "2025-12-10",
    time: "12:30 - 15:00",
    location: "Jakarta Beauty School - Menteng",
    status: "upcoming",
    price: "IDR 2.500.000",
    instructor: "Ms. Sarah Wijaya",
    notes: "Please bring your own brush set if you have one.",
    sessions: [
      { date: "2025-12-10", time: "12:30 - 15:00", status: "Upcoming" },
      { date: "2025-12-11", time: "12:30 - 15:00", status: "Scheduled" },
      { date: "2025-12-12", time: "12:30 - 15:00", status: "Scheduled" }
    ]
  },
  {
    id: "BK-2025-002",
    classType: "nail",
    title: "Nail Artistry",
    level: "Beginner (Low)",
    date: "2025-12-15",
    time: "13:30 - 16:00",
    location: "Jakarta Beauty School - Menteng",
    status: "upcoming",
    price: "IDR 1.500.000",
    instructor: "Ms. Linda Chen",
    notes: "All materials provided.",
    sessions: [
      { date: "2025-12-15", time: "13:30 - 16:00", status: "Upcoming" },
      { date: "2025-12-16", time: "13:30 - 16:00", status: "Scheduled" }
    ]
  },
  {
    id: "BK-2024-089",
    classType: "eyelash",
    title: "Eyelash Extensions",
    level: "Beginner (Low)",
    date: "2024-11-20",
    time: "12:30 - 15:00",
    location: "Jakarta Beauty School - Menteng",
    status: "completed",
    price: "IDR 1.500.000",
    instructor: "Ms. Jessica Tan",
    notes: "Completed with distinction.",
    sessions: [
      { date: "2024-11-20", time: "12:30 - 15:00", status: "Completed" },
      { date: "2024-11-21", time: "12:30 - 15:00", status: "Completed" }
    ]
  },
  {
    id: "BK-2024-075",
    classType: "makeup",
    title: "Professional Makeup",
    level: "Beginner (Low)",
    date: "2024-10-05",
    time: "12:30 - 15:00",
    location: "Jakarta Beauty School - Menteng",
    status: "completed",
    price: "IDR 1.500.000",
    instructor: "Ms. Sarah Wijaya",
    notes: "Basic certification awarded.",
    sessions: [
      { date: "2024-10-05", time: "12:30 - 15:00", status: "Completed" },
      { date: "2024-10-06", time: "12:30 - 15:00", status: "Completed" },
      { date: "2024-10-07", time: "12:30 - 15:00", status: "Completed" }
    ]
  }
];

export default function History() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // TEMPORARY: Authentication check disabled untuk testing

  const [selectedBooking, setSelectedBooking] = useState<typeof MOCK_HISTORY[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  
  // Reschedule form state
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");

  // TEMPORARY: Disabled untuk testing
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     setLocation("/auth");
  //   }
  // }, [isAuthenticated, setLocation]);

  const handleDetails = (booking: typeof MOCK_HISTORY[0]) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleReschedule = (booking: typeof MOCK_HISTORY[0]) => {
    setSelectedBooking(booking);
    setNewDate(booking.date); // Pre-fill current date
    setIsRescheduleOpen(true);
  };

  const handleDownloadCertificate = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Certificate Downloaded",
      description: "Your certificate has been saved successfully.",
      className: "bg-[#ec7014] text-white border-none",
    });
  };

  const confirmReschedule = () => {
    if (!newDate || !newSlot) {
      toast({
        title: "Incomplete Selection",
        description: "Please select both a new date and time slot.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reschedule Request Sent",
      description: `Your request to move ${selectedBooking?.title} to ${newDate} has been submitted for approval.`,
      className: "bg-[#ec7014] text-white border-none",
    });
    setIsRescheduleOpen(false);
  };

  // TEMPORARY: Disabled untuk testing
  // if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="font-serif text-4xl font-bold text-[#662506]">My Class History</h1>
            <p className="text-[#993404] mt-2">Track your learning journey and upcoming schedules.</p>
          </div>
          <div className="bg-[#ffffe5] px-6 py-3 rounded-xl border border-[#fee391] flex gap-4 shadow-sm">
            <div className="text-center">
              <div className="text-xs text-[#993404] uppercase font-bold tracking-wider">Completed</div>
              <div className="text-2xl font-serif font-bold text-[#ec7014]">2</div>
            </div>
            <div className="w-px bg-[#fee391]"></div>
            <div className="text-center">
              <div className="text-xs text-[#993404] uppercase font-bold tracking-wider">Upcoming</div>
              <div className="text-2xl font-serif font-bold text-[#662506]">2</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {MOCK_HISTORY.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Date Section */}
                    <div className={`p-6 md:w-48 flex flex-col justify-center items-center shrink-0 ${
                      item.status === 'upcoming' ? 'bg-[#ec7014] text-white' : 'bg-[#fee391] text-[#662506]'
                    }`}>
                      <span className="text-sm font-medium opacity-80 uppercase tracking-widest">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-4xl font-serif font-bold my-1">
                        {new Date(item.date).getDate()}
                      </span>
                      <span className="text-sm font-medium opacity-80">
                        {new Date(item.date).getFullYear()}
                      </span>
                    </div>

                    {/* Details Section */}
                    <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`
                            ${item.status === 'upcoming' 
                              ? 'border-[#ec7014] text-[#ec7014] bg-[#ec7014]/10' 
                              : 'border-[#662506] text-[#662506] bg-[#662506]/10'}
                            uppercase tracking-wider text-xs font-bold px-3 py-1
                          `}>
                            {item.status}
                          </Badge>
                          <span className="text-xs text-[#993404] font-mono bg-[#ffffe5] px-2 py-1 rounded border border-[#fee391]">
                            #{item.id}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-[#662506] group-hover:text-[#ec7014] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-[#993404] font-medium">{item.level}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-[#993404]/80">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {item.time}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {item.location}
                          </div>
                        </div>
                      </div>

                      {/* Actions Section */}
                      <div className="flex md:flex-col gap-3 w-full md:w-auto">
                        {item.status === 'completed' ? (
                          <Button 
                            variant="outline" 
                            onClick={handleDownloadCertificate}
                            className="w-full md:w-40 border-[#fec44f] text-[#662506] hover:bg-[#fec44f] hover:text-[#662506] gap-2"
                          >
                            <Download className="w-4 h-4" /> Certificate
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            onClick={() => handleReschedule(item)}
                            className="w-full md:w-40 border-[#ec7014] text-[#ec7014] hover:bg-[#ec7014] hover:text-white gap-2"
                          >
                            Reschedule
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleDetails(item)}
                          className="w-full md:w-40 bg-[#662506] text-white hover:bg-[#993404] gap-2"
                        >
                          Details <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Empty State Suggestion (Visual Only) */}
        <div className="mt-12 text-center p-10 bg-[#fec44f]/10 rounded-3xl border border-[#fec44f]/20">
          <Award className="w-12 h-12 text-[#ec7014] mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold text-[#662506] mb-2">Want to learn more?</h3>
          <p className="text-[#993404] mb-6">Expand your skills with our advanced courses.</p>
          <Button 
            onClick={() => setLocation("/booking")}
            className="bg-[#ec7014] hover:bg-[#cc4c02] text-white"
          >
            Browse Available Classes
          </Button>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl bg-[#ffffe5] border-[#fee391] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#662506] flex items-center gap-2">
              <span className="bg-[#ec7014] w-2 h-6 rounded-full"></span>
              Class Details
            </DialogTitle>
            <DialogDescription className="text-[#993404]">
              Full information regarding your course and schedule.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-8 py-4">
              {/* Primary Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs uppercase text-[#993404] font-bold tracking-wider">Class Name</Label>
                    <p className="text-lg font-bold text-[#662506]">{selectedBooking.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-[#993404] font-bold tracking-wider">Level</Label>
                    <p className="font-medium text-[#662506]">{selectedBooking.level}</p>
                  </div>
                  <div>
                     <Label className="text-xs uppercase text-[#993404] font-bold tracking-wider">Location</Label>
                     <p className="font-medium text-[#662506] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#ec7014]" />
                        {selectedBooking.location}
                     </p>
                  </div>
                </div>
                <div className="space-y-4">
                   <div>
                    <Label className="text-xs uppercase text-[#993404] font-bold tracking-wider">Instructor</Label>
                    <p className="font-medium text-[#662506]">{selectedBooking.instructor}</p>
                  </div>
                   <div>
                    <Label className="text-xs uppercase text-[#993404] font-bold tracking-wider">Total Price</Label>
                    <p className="font-medium text-[#662506]">{selectedBooking.price}</p>
                  </div>
                   <div>
                    <Label className="text-xs uppercase text-[#993404] font-bold tracking-wider">Notes</Label>
                    <p className="text-sm text-[#662506] italic">{selectedBooking.notes}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-[#fee391]" />

              {/* Session List */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                   <ListChecks className="w-5 h-5 text-[#ec7014]" />
                   <h3 className="font-serif text-xl font-bold text-[#662506]">Course Sessions</h3>
                </div>
                
                <div className="grid gap-3">
                  {selectedBooking.sessions?.map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/50 p-4 rounded-xl border border-[#fee391] hover:bg-white transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#ec7014]/10 text-[#ec7014] w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-[#662506] flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-[#993404]/60" />
                            {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-sm text-[#993404] flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" />
                            {session.time}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${session.status === 'Completed' 
                            ? 'border-[#662506] text-[#662506] bg-[#ffffe5]' 
                            : 'border-[#ec7014] text-[#ec7014] bg-[#ec7014]/5'}
                          ml-2
                        `}
                      >
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)} className="bg-[#662506] hover:bg-[#993404] text-white w-full sm:w-auto">Close Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="max-w-lg bg-[#ffffe5] border-[#fee391]">
          <DialogHeader>
             <DialogTitle className="font-serif text-2xl text-[#662506] flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#ec7014]" />
              Reschedule Class
            </DialogTitle>
            <DialogDescription className="text-[#993404]">
              Select a new date and time for your class. Subject to approval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label htmlFor="new-date" className="text-[#662506] font-medium">Select New Date</Label>
              <Input 
                type="date" 
                id="new-date" 
                value={newDate} 
                onChange={(e) => setNewDate(e.target.value)}
                className="h-12 border-[#fec44f] focus:ring-[#ec7014] bg-white/50"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-[#662506] font-medium">Select New Time Slot</Label>
              <RadioGroup value={newSlot} onValueChange={setNewSlot} className="grid grid-cols-2 gap-4">
                {SLOTS.map((s) => (
                  <div key={s.id}>
                    <RadioGroupItem value={s.id} id={`reschedule-${s.id}`} className="peer sr-only" />
                    <Label
                      htmlFor={`reschedule-${s.id}`}
                      className="flex flex-col items-center justify-center p-4 text-center rounded-xl border-2 border-[#fee391] bg-white/50 hover:bg-[#fff7bc] peer-data-[state=checked]:border-[#ec7014] peer-data-[state=checked]:bg-[#fff7bc] cursor-pointer transition-all h-full"
                    >
                      <Clock className="w-5 h-5 text-[#ec7014] mb-1" />
                      <span className="font-bold text-[#662506] text-sm">{s.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)} className="border-[#cc4c02] text-[#cc4c02]">Cancel</Button>
            <Button onClick={confirmReschedule} className="bg-[#ec7014] hover:bg-[#cc4c02] text-white">Confirm Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
