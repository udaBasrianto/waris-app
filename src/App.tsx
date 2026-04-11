import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Konsultasi from "./pages/Konsultasi";
import ChatRoom from "./pages/ChatRoom";
import Riwayat from "./pages/Riwayat";
import Profil from "./pages/Profil";
import PengaturanAkun from "./pages/PengaturanAkun";
import KeamananPrivasi from "./pages/KeamananPrivasi";
import SyaratKetentuan from "./pages/SyaratKetentuan";
import PusatBantuan from "./pages/PusatBantuan";
import AdminDashboard from "./pages/AdminDashboard";
import UstadProfil from "./pages/UstadProfil";
import UstadDashboard from "./pages/UstadDashboard";
import NotFound from "./pages/NotFound";
import Kalkulator from "./pages/Kalkulator";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
const queryClient = new QueryClient();

import { NotificationProvider } from "@/contexts/NotificationContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/konsultasi" element={<ProtectedRoute><Konsultasi /></ProtectedRoute>} />
              <Route path="/konsultasi/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
              <Route path="/riwayat" element={<ProtectedRoute><Riwayat /></ProtectedRoute>} />
              <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
              <Route path="/pengaturan-akun" element={<ProtectedRoute><PengaturanAkun /></ProtectedRoute>} />
              <Route path="/keamanan-privasi" element={<ProtectedRoute><KeamananPrivasi /></ProtectedRoute>} />
              <Route path="/syarat-ketentuan" element={<SyaratKetentuan />} />
              <Route path="/pusat-bantuan" element={<PusatBantuan />} />
              <Route path="/ustad/:id" element={<UstadProfil />} />
              <Route path="/ustad-dashboard" element={<ProtectedRoute><UstadDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/kalkulator" element={<Kalkulator />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
