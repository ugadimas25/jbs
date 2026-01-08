import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [, navigate] = useLocation();
  const search = useSearch();
  const { t, lang } = useI18n();
  
  // Get token from URL query parameter
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return res.json();
    },
    onSuccess: () => {
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/auth"), 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      return;
    }

    if (newPassword.length < 6) {
      alert(lang === "id" ? "Password minimal 6 karakter" : "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(lang === "id" ? "Password tidak cocok" : "Passwords do not match");
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">{t("reset.invalidLink")}</CardTitle>
            <CardDescription>
              {t("reset.invalidLinkDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("reset.invalidLinkError")}
              </AlertDescription>
            </Alert>
            <Button
              className="w-full mt-4"
              onClick={() => navigate("/forgot-password")}
            >
              {t("reset.requestNew")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("reset.title")}</CardTitle>
          <CardDescription>
            {t("reset.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetPasswordMutation.isSuccess ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {t("reset.success")}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {resetPasswordMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {resetPasswordMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("reset.newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder={t("reset.minChars")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("reset.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("reset.retypePassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? t("reset.resetting") : t("reset.button")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
