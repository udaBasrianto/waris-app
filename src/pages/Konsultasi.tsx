import { useState, useEffect } from "react";
import { Plus, MessageSquare, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Consultation {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  ustad_id: string | null;
  client_id: string;
  ustad_name?: string;
}

const Konsultasi = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchConsultations = async () => {
    if (!user) return;
    try {
      const data = await api.get<Consultation[]>("/consultations");
      setConsultations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [user]);

  const createConsultation = async () => {
    if (!topic.trim() || !user) return;
    setCreating(true);
    try {
      const data = await api.post<Consultation>("/consultations", { topic: topic.trim() });
      setDialogOpen(false);
      setTopic("");
      navigate(`/konsultasi/${data.id}`);
    } catch (error: any) {
      toast({ title: "Gagal membuat konsultasi", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const statusLabel: Record<string, { label: string; class: string }> = {
    pending: { label: "Menunggu", class: "bg-gold-light text-accent-foreground" },
    active: { label: "Aktif", class: "bg-primary-light text-primary" },
    completed: { label: "Selesai", class: "bg-muted text-muted-foreground" },
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">Konsultasi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "ustad" ? "Konsultasi yang ditugaskan" : "Konsultasi Anda"}
          </p>
        </div>
        {role !== "ustad" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full gap-1">
                <Plus className="w-4 h-4" /> Baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konsultasi Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Input
                  placeholder="Topik konsultasi, contoh: Pembagian warisan orang tua"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createConsultation()}
                />
                <Button onClick={createConsultation} disabled={creating || !topic.trim()} className="w-full">
                  {creating ? "Membuat..." : "Mulai Konsultasi"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="px-5 flex flex-col gap-3 pb-24">
        {loading ? (
          <div className="text-center text-muted-foreground py-12 text-sm">Memuat...</div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Belum ada konsultasi</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Mulai konsultasi baru untuk bertanya</p>
          </div>
        ) : (
          consultations.map((c) => {
            const status = statusLabel[c.status] || statusLabel.pending;
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/konsultasi/${c.id}`)}
                className="glass-card rounded-xl p-4 text-left animate-fade-in hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{c.topic}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.ustad_name || "Menunggu ustad..."}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {new Date(c.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.class}`}>
                      {status.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </MobileLayout>
  );
};

export default Konsultasi;
