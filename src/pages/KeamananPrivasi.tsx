import { ArrowLeft, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const KeamananPrivasi = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password minimal 6 karakter", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Password tidak cocok", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await api.put("/auth/password", { password: newPassword });
      toast({ title: "Berhasil", description: "Password berhasil diubah" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
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
        <h1 className="font-heading text-xl font-bold text-foreground">Keamanan & Privasi</h1>
      </div>

      <div className="px-5 space-y-5">
        {/* Security Info */}
        <div className="glass-card rounded-xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Keamanan Akun</p>
            <p className="text-xs text-muted-foreground">Data Anda terenkripsi dan aman</p>
          </div>
        </div>

        {/* Change Password */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Ubah Password</h2>
          </div>
          <div className="space-y-2">
            <Label>Password Baru</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Konfirmasi Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
            />
          </div>
        </div>

        <Button onClick={handleChangePassword} disabled={saving} className="w-full gradient-primary text-primary-foreground">
          {saving ? "Menyimpan..." : "Ubah Password"}
        </Button>
      </div>
    </MobileLayout>
  );
};

export default KeamananPrivasi;
