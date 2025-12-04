import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email, "Member");
      setLocation("/booking");
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      login(email, name);
      setLocation("/booking");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffffe5] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center bg-[#ec7014] p-3 rounded-full text-white mb-4 shadow-lg">
              <Sparkles size={32} />
           </div>
           <h1 className="font-serif text-3xl font-bold text-[#662506]">Jakarta Beauty School</h1>
           <p className="text-[#993404]">Join our community of beauty professionals</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur">
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#ffffe5]">
              <TabsTrigger value="signup" className="data-[state=active]:bg-[#fec44f] data-[state=active]:text-[#662506]">Sign Up</TabsTrigger>
              <TabsTrigger value="login" className="data-[state=active]:bg-[#fec44f] data-[state=active]:text-[#662506]">Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Start your journey with us today.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Jane Doe" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-[#fec44f] focus-visible:ring-[#ec7014]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input 
                      id="email-signup" 
                      type="email" 
                      placeholder="jane@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-[#fec44f] focus-visible:ring-[#ec7014]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input 
                      id="password-signup" 
                      type="password" 
                      required
                      className="border-[#fec44f] focus-visible:ring-[#ec7014]"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-[#ec7014] hover:bg-[#cc4c02] text-white">Sign Up</Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Sign in to manage your bookings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input 
                      id="email-login" 
                      type="email" 
                      placeholder="jane@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-[#fec44f] focus-visible:ring-[#ec7014]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                    <Input 
                      id="password-login" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-[#fec44f] focus-visible:ring-[#ec7014]"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-[#ec7014] hover:bg-[#cc4c02] text-white">Login</Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
