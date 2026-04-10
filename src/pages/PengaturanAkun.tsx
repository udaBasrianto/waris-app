import { ArrowLeft, Camera, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const PengaturanAkun = () => {
  const navigate = useNavigate();
  const { user, profile, refreshUser } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.put("/profiles/me", { full_name: fullName, phone });
      await refreshUser();
      toast({ title: "Berhasil", description: "Profil berhasil diperbarui" });
    } catch (error: any) {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout hideBottomNav>
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-heading text-xl font-bold text-foreground">Pengaturan Akun</h1>
      </div>

      <div className="px-5 space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-3xl">
                {(fullName || user?.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Masukkan nama lengkap" />
          </div>
          <div className="space-y-2">
            <Label>No. Telepon</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gradient-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </MobileLayout>
  );
};

export default PengaturanAkun;
