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
      <div className="gradient-primary px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="KonsultasiFaraidh.id" width={40} height={40} className="rounded-lg bg-primary-foreground/10 p-1" />
            <div>
              <h1 className="font-heading text-primary-foreground text-lg font-bold leading-tight">KonsultasiFaraidh</h1>
              <p className="text-primary-foreground/70 text-xs">.id</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary-foreground" />
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
