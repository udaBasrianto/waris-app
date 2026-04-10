import { useEffect, useState } from "react";
import { Clock, CheckCircle, AlertCircle, MessageSquare, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface ConsultationItem {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  ustad_name?: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; className: string }> = {
  completed: { icon: CheckCircle, label: "Selesai", className: "text-primary bg-primary-light" },
  active: { icon: AlertCircle, label: "Berlangsung", className: "text-accent-foreground bg-gold-light" },
  pending: { icon: Clock, label: "Menunggu", className: "text-muted-foreground bg-muted" },
};

const Riwayat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await api.get<ConsultationItem[]>("/consultations");
        setConsultations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button 
          onClick={() => navigate("/")}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">Riwayat Konsultasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Daftar konsultasi Anda</p>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3 pb-24">
        {loading ? (
          <div className="text-center text-muted-foreground py-12 text-sm">Memuat...</div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Belum ada riwayat konsultasi</p>
          </div>
        ) : (
          consultations.map((item) => {
            const config = statusConfig[item.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/konsultasi/${item.id}`)}
                className="glass-card rounded-xl p-4 animate-fade-in text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-foreground">{item.topic}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.ustad_name || "Menunggu ustad..."}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${config.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </MobileLayout>
  );
};

export default Riwayat;
