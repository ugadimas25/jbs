import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [, navigate] = useLocation();
  const { t } = useI18n();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return res.json();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("forgot.title")}</CardTitle>
          <CardDescription>
            {t("forgot.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forgotPasswordMutation.isSuccess ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  {t("forgot.success")}
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("forgot.backToLogin")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {forgotPasswordMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {forgotPasswordMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? t("forgot.sending") : t("forgot.sendLink")}
              </Button>

              <Link href="/auth">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("forgot.backToLogin")}
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
