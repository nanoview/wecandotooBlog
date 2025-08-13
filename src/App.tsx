import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import GoogleSiteVerification from "@/components/GoogleSiteVerification";
import GoogleAutoAds from "@/components/GoogleAutoAds";
import { googleConfig } from "@/config/google";
import Index from "./pages/Index";
import BlogPostDetail from "./pages/BlogPostDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import BlogEditor from "./pages/BlogEditor";
import Write from "./pages/Write";
import Edit from "./pages/Edit";
import OAuthCallback from "./pages/OAuthCallback";
import GoogleServicesSetup from "./pages/GoogleServicesSetup";
import { EditorPanel } from "./pages/EditorPanel";
import ImageUploadDemo from "./pages/ImageUploadDemo";
import SocialSharingDemo from "./pages/SocialSharingDemo";
import NotFound from "./pages/NotFound";
import ConfirmSubscription from "./pages/ConfirmSubscription";
import AuthConfirm from "./pages/AuthConfirm";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GoogleSiteVerification 
          verificationCode={googleConfig.siteVerification}
          adsenseClientId={googleConfig.adsenseClientId}
        />
        <GoogleAutoAds />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/:slug" element={<BlogPostDetail />} />
            <Route path="/post/:id" element={<BlogPostDetail />} /> {/* Legacy ID support */}
            <Route path="/edit/:id" element={<Edit />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/google-services" element={<GoogleServicesSetup />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/editor" element={<BlogEditor />} />
            <Route path="/write" element={<Write />} />
            <Route path="/editor-panel" element={<EditorPanel />} />
            <Route path="/image-demo" element={<ImageUploadDemo />} />
            <Route path="/social-demo" element={<SocialSharingDemo />} />
            <Route path="/confirm-subscription" element={<ConfirmSubscription />} />
            <Route path="/auth/confirm" element={<AuthConfirm />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
