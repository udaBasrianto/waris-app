import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, BookOpen, Calculator, Users, Bell, ShieldCheck, MapPin, Clock } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import ServiceCard from "@/components/ServiceCard";
import UstadCard from "@/components/UstadCard";
import HeroSlider from "@/components/HeroSlider";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import logo from "@/assets/logo.png";
import { useNotifications } from "@/contexts/NotificationContext";

const services = [
  { icon: Scale, title: "Pembagian Warisan", description: "Konsultasi pembagian harta sesuai ilmu Faraidh", path: "/konsultasi" },
  { icon: Calculator, title: "Kalkulator Faraidh", description: "Hitung bagian warisan ahli waris secara otomatis", path: "/kalkulator" },
  { icon: BookOpen, title: "Materi Faraidh", description: "Pelajari dasar-dasar ilmu waris dalam Islam", path: "/konsultasi" },
  { icon: Users, title: "Mediasi Keluarga", description: "Pendampingan pembagian warisan bersama keluarga", path: "/konsultasi" },
];

interface UstadData {
  user_id: string;
  name: string;
  specialty: string;
  rating: number;
  consultations: number;
  available: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { unreadCount, markAsRead } = useNotifications();
  const [ustads, setUstads] = useState<UstadData[]>([]);
  const [location, setLocation] = useState<string>("Mendeteksi lokasi...");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Fetch ustads
  useEffect(() => {
    const fetchUstads = async () => {
      try {
        const data = await api.get<UstadData[]>("/ustads");
        setUstads(data);
      } catch {
        // silently fail
      }
    };
    fetchUstads();
  }, []);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // GPS Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("Lokasi tidak tersedia");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`
          );
          const data = await res.json();
          const addr = data.address;
          const city = addr.city || addr.town || addr.municipality || addr.county || addr.state || "";
          const state = addr.state || "";
          setLocation(city === state ? city : `${city}, ${state}`);
        } catch {
          setLocation("Lokasi tidak diketahui");
        }
      },
      () => setLocation("Izin lokasi ditolak"),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "";

  return (
    <MobileLayout>
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-8 rounded-b-3xl relative overflow-hidden shadow-lg border-b border-primary/20">

        {/* Subtle Interlocking Islamic Lattice Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M0 40 l40 -40 l40 40 l-40 40 z' /%3E%3Cpath d='M20 20 h40 v40 h-40 z' /%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Ambient Glowing Orbs (Modern Glassmorphism vibe) */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        {/* Majestic Rub el Hizb (Slowly Spinning) - Top Right */}
        <svg className="absolute -top-16 -right-16 w-72 h-72 text-white/[0.04] animate-[spin_80s_linear_infinite]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Outer squares forming 8-point star */}
          <rect x="40" y="40" width="120" height="120" transform="rotate(0 100 100)" />
          <rect x="40" y="40" width="120" height="120" transform="rotate(45 100 100)" />
          <rect x="50" y="50" width="100" height="100" transform="rotate(22.5 100 100)" strokeDasharray="4 6" />
          {/* Inner circles */}
          <circle cx="100" cy="100" r="35" />
          <circle cx="100" cy="100" r="55" />
          <circle cx="100" cy="100" r="85" strokeWidth="0.5" />
        </svg>

        {/* Elegant Crescent & Star - Center Right */}
        <svg className="absolute top-10 right-1/4 w-24 h-24 text-white hover:text-gold transition-colors duration-700 opacity-[0.08] -rotate-12" viewBox="0 0 100 100" fill="currentColor">
          <path d="M55 5 a45 45 0 1 0 45 45 a55 55 0 1 1 -45 -45 z" />
          <polygon points="68,28 72,36 81,36 74,42 77,50 68,45 59,50 62,42 55,36 64,36" opacity="0.9" />
        </svg>

        {/* Corner Accent Knot - Bottom Left */}
        <svg className="absolute -bottom-8 -left-8 w-44 h-44 text-gold/[0.06]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
          <polygon points="50,5 95,50 50,95 5,50" />
          <polygon points="50,15 85,50 50,85 15,50" />
          <circle cx="50" cy="50" r="15" fill="currentColor" fillOpacity="0.5" />
          <circle cx="50" cy="50" r="4" fill="currentColor" stroke="none" />
          <path d="M 50 25 L 75 50 L 50 75 L 25 50 Z" strokeDasharray="2 4" />
        </svg>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="KonsultasiFaraidh.com" width={40} height={40} className="rounded-lg bg-primary-foreground/10 p-1" />
            <div>
              <h1 className="font-heading text-primary-foreground text-lg font-bold leading-tight">KonsultasiFaraidh</h1>
              <p className="text-primary-foreground/70 text-xs">.com</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAsRead} className="relative w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-primary"></span>
                </span>
              )}
            </button>
            {role === "admin" && (
              <button onClick={() => navigate("/admin")} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
              </button>
            )}
            {role === "ustad" && (
              <button onClick={() => navigate("/ustad-dashboard")} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
              </button>
            )}
          </div>
        </div>
        <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-primary-foreground font-semibold text-sm mb-2">
            Assalamu'alaykum {displayName ? displayName : ""} 👋
          </p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-primary-foreground/70 flex-shrink-0" />
              <span className="text-primary-foreground/70 text-xs truncate">{location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-primary-foreground/70 flex-shrink-0" />
              <span className="text-primary-foreground/70 text-xs">{formatDate(currentTime)} • {formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slider */}
      <HeroSlider />

      {/* Services */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-base text-foreground">Layanan Kami</h2>
          <button className="text-xs text-primary font-medium">Lihat Semua</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} onClick={() => navigate(service.path)} />
          ))}
        </div>
      </div>

      {/* Featured Ustads */}
      <div className="px-5 mt-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-base text-foreground">Ustad Pilihan</h2>
        </div>
        <div className="flex flex-col gap-3">
          {ustads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada ustad terdaftar</p>
          ) : (
            ustads.map((ustad) => (
              <UstadCard
                key={ustad.user_id}
                {...ustad}
                onConsult={() => navigate(`/ustad/${ustad.user_id}`)}
              />
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Index;
