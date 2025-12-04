import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ChevronRight, Download, Award } from "lucide-react";
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
    price: "IDR 2.500.000"
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
    price: "IDR 1.500.000"
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
    price: "IDR 1.500.000"
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
    price: "IDR 1.500.000"
  }
];

export default function History() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

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
                          <Button variant="outline" className="w-full md:w-40 border-[#fec44f] text-[#662506] hover:bg-[#fec44f] hover:text-[#662506] gap-2">
                            <Download className="w-4 h-4" /> Certificate
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full md:w-40 border-[#ec7014] text-[#ec7014] hover:bg-[#ec7014] hover:text-white gap-2">
                            Reschedule
                          </Button>
                        )}
                        <Button className="w-full md:w-40 bg-[#662506] text-white hover:bg-[#993404] gap-2">
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
    </div>
  );
}
