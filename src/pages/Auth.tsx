import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.post<{ token: string }>("/auth/login", { email, password });
        setToken(data.token);
        await refreshUser();
        toast({ title: "Berhasil masuk!", description: "Selamat datang kembali." });
        navigate("/");
      } else {
        const data = await api.post<{ token: string }>("/auth/register", { email, password, full_name: fullName });
        setToken(data.token);
        await refreshUser();
        toast({ title: "Pendaftaran berhasil!", description: "Akun Anda telah dibuat." });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Terjadi kesalahan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-primary px-6 pt-16 pb-12 rounded-b-3xl flex flex-col items-center">
        <img src={logo} alt="KonsultasiFaraidh.id" width={72} height={72} className="rounded-xl bg-primary-foreground/10 p-2 mb-4" />
        <h1 className="font-heading text-primary-foreground text-2xl font-bold">
          KonsultasiFaraidh.id
        </h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Konsultasi Warisan Sesuai Syariat
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 -mt-6 max-w-lg mx-auto w-full">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-1">
            {isLogin ? "Masuk" : "Daftar"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {isLogin ? "Masuk ke akun Anda" : "Buat akun baru untuk mulai konsultasi"}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  placeholder="Masukkan nama lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  maxLength={100}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={128}
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

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary font-medium"
            >
              {isLogin ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
