import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import History from "@/pages/history";
import AuthPage from "@/pages/auth";
import VerifyEmailPage from "@/pages/verify-email";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import UploadProof from "@/pages/upload-proof";
import SelectSchedule from "@/pages/select-schedule";
import AdminDashboard from "@/pages/admin-dashboard";
import CourseDetail from "@/pages/course-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/">
        <Layout>
          <Home />
        </Layout>
      </Route>
      <Route path="/booking">
        <Layout>
          <Booking />
        </Layout>
      </Route>
      <Route path="/history">
        <Layout>
          <History />
        </Layout>
      </Route>
      <Route path="/upload-proof/:id">
        <Layout>
          <UploadProof />
        </Layout>
      </Route>
      <Route path="/select-schedule/:id">
        <Layout>
          <SelectSchedule />
        </Layout>
      </Route>
      <Route path="/courses/:id">
        <Layout>
          <CourseDetail />
        </Layout>
      </Route>
      <Route path="/admin">
        <Layout>
          <AdminDashboard />
        </Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
