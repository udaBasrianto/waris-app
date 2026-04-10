import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, CheckCircle, Clock, Star, UserPlus, Eye, CalendarDays } from "lucide-react";
import UstadScheduleManager from "@/components/UstadScheduleManager";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ConsultationItem {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  client_name: string | null;
}

interface UstadProfileData {
  bio: string;
  specialization: string;
  available: boolean;
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  pending: { label: "Menunggu", icon: Clock, className: "bg-yellow-500/10 text-yellow-600" },
  active: { label: "Aktif", icon: MessageCircle, className: "bg-primary/10 text-primary" },
  completed: { label: "Selesai", icon: CheckCircle, className: "bg-green-500/10 text-green-600" },
};

const UstadDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [myConsultations, setMyConsultations] = useState<ConsultationItem[]>([]);
  const [pendingConsultations, setPendingConsultations] = useState<ConsultationItem[]>([]);
  const [profileData, setProfileData] = useState<UstadProfileData>({ bio: "", specialization: "", available: false });
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && role === "ustad") {
      fetchAll();
    }
  }, [user, role]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([fetchMyConsultations(), fetchPendingConsultations(), fetchProfile(), fetchStats()]);
    setLoading(false);
  };

  const fetchMyConsultations = async () => {
    try {
      const data = await api.get<ConsultationItem[]>("/consultations/ustad/mine");
      setMyConsultations(data);
    } catch (err) { console.error(err); }
  };

  const fetchPendingConsultations = async () => {
    try {
      const data = await api.get<ConsultationItem[]>("/consultations/ustad/pending");
      setPendingConsultations(data);
    } catch (err) { console.error(err); }
  };

  const fetchProfile = async () => {
    try {
      const data = await api.get<any>(`/ustads/${user!.id}`);
      setProfileData({ bio: data.bio || "", specialization: data.specialization || "", available: data.available || false });
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const data = await api.get<{ total: number; active: number; completed: number; avgRating: number }>("/consultations/ustad/stats");
      setStats(data);
    } catch (err) { console.error(err); }
  };

  const assignConsultation = async (consultationId: string) => {
    try {
      await api.put(`/consultations/${consultationId}`, { ustad_id: user!.id, status: "active" });
      toast({ title: "Berhasil", description: "Konsultasi berhasil diambil" });
      fetchAll();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put("/ustads/profile", profileData);
      toast({ title: "Berhasil", description: "Profil berhasil diperbarui" });
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <MobileLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  if (role !== "ustad") {
    navigate("/");
    return null;
  }

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-6">
        <h1 className="font-heading text-xl font-bold text-foreground">Dashboard Ustad</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola konsultasi dan profil Anda</p>
      </div>

      {/* Stats */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: stats.total, icon: MessageCircle },
            { label: "Aktif", value: stats.active, icon: Clock },
            { label: "Selesai", value: stats.completed, icon: CheckCircle },
            { label: "Rating", value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "-", icon: Star },
          ].map((s) => (
            <Card key={s.label} className="glass-card border-border">
              <CardContent className="p-3 text-center">
                <s.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="font-heading font-bold text-lg text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pb-24">
        <Tabs defaultValue="my" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="my">Konsultasi</TabsTrigger>
            <TabsTrigger value="pending">
              Pending {pendingConsultations.length > 0 && `(${pendingConsultations.length})`}
            </TabsTrigger>
            <TabsTrigger value="jadwal" className="gap-1">
              <CalendarDays className="w-3 h-3" /> Jadwal
            </TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          {/* Schedule */}
          <TabsContent value="jadwal" className="mt-4">
            <UstadScheduleManager ustadId={user?.id} />
          </TabsContent>

          {/* My Consultations */}
          <TabsContent value="my" className="mt-4 space-y-3">
            {myConsultations.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Belum ada konsultasi
              </div>
            ) : (
              myConsultations.map((c) => {
                const cfg = statusConfig[c.status] || statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/konsultasi/${c.id}`)}
                    className="glass-card rounded-xl p-4 w-full text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{c.topic}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {c.client_name || "Klien"} • {new Date(c.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <Badge variant="secondary" className={`ml-2 text-[10px] ${cfg.className}`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {cfg.label}
                      </Badge>
                    </div>
                  </button>
                );
              })
            )}
          </TabsContent>

          {/* Pending Consultations */}
          <TabsContent value="pending" className="mt-4 space-y-3">
            {pendingConsultations.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Tidak ada konsultasi yang menunggu
              </div>
            ) : (
              pendingConsultations.map((c) => (
                <div key={c.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{c.topic}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {c.client_name || "Klien"} • {new Date(c.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/konsultasi/${c.id}`)}>
                      <Eye className="w-3 h-3 mr-1" /> Lihat
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => assignConsultation(c.id)}>
                      <UserPlus className="w-3 h-3 mr-1" /> Ambil
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="glass-card rounded-xl p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Spesialisasi</label>
                <Input
                  value={profileData.specialization}
                  onChange={(e) => setProfileData((p) => ({ ...p, specialization: e.target.value }))}
                  placeholder="Contoh: Faraidh, Fiqih Muamalah"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Bio</label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tuliskan bio singkat tentang Anda..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Status Ketersediaan</p>
                  <p className="text-xs text-muted-foreground">
                    {profileData.available ? "Online — bisa menerima konsultasi" : "Offline — tidak menerima konsultasi"}
                  </p>
                </div>
                <Switch
                  checked={profileData.available}
                  onCheckedChange={(v) => setProfileData((p) => ({ ...p, available: v }))}
                />
              </div>
              <Button onClick={saveProfile} disabled={saving} className="w-full">
                {saving ? "Menyimpan..." : "Simpan Profil"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default UstadDashboard;
