import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [location, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffffe5] p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/90 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Jakarta Beauty School Logo" 
              className="h-20 w-auto"
            />
          </div>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>Jakarta Beauty School</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 animate-spin text-[#ec7014] mx-auto" />
              <p className="text-[#662506]">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-[#662506] mb-2">Success!</h3>
                <p className="text-[#993404]">{message}</p>
              </div>
              <Button 
                onClick={() => setLocation("/auth")}
                className="w-full bg-[#ec7014] hover:bg-[#cc4c02] text-white"
              >
                Go to Login
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-[#662506] mb-2">Verification Failed</h3>
                <p className="text-[#993404]">{message}</p>
              </div>
              <Button 
                onClick={() => setLocation("/auth")}
                variant="outline"
                className="w-full border-[#ec7014] text-[#ec7014] hover:bg-[#ec7014] hover:text-white"
              >
                Back to Sign Up
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
