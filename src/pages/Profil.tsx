import { ChevronRight, LogOut, Settings, Shield, HelpCircle, FileText, Users, UserCheck, LayoutDashboard, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { icon: Settings, label: "Pengaturan Akun", path: "/pengaturan-akun" },
  { icon: Shield, label: "Keamanan & Privasi", path: "/keamanan-privasi" },
  { icon: FileText, label: "Syarat & Ketentuan", path: "/syarat-ketentuan" },
  { icon: HelpCircle, label: "Pusat Bantuan", path: "/pusat-bantuan" },
];

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  ustad: "Ustad / Coach",
  klien: "Klien",
};

const Profil = () => {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-6">
        <h1 className="font-heading text-xl font-bold text-foreground">Profil</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5 mb-6">
        <div className="glass-card rounded-xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-2xl">{initial}</span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {role && (
              <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-light text-primary">
                {roleLabels[role] || role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Konsultasi", value: "0" },
            { label: "Selesai", value: "0" },
            { label: "Rating", value: "-" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
              <p className="font-heading font-bold text-lg text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Menu */}
      {role === "admin" && (
        <div className="px-5 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Admin</p>
          <div className="glass-card rounded-xl overflow-hidden">
            {[
              { icon: LayoutDashboard, label: "Dashboard Admin", path: "/admin" },
              { icon: Users, label: "Kelola User & Role", path: "/admin" },
              { icon: UserCheck, label: "Kelola Profil Ustad", path: "/admin" },
            ].map(({ icon: Icon, label, path }, i, arr) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-muted/50 transition-colors ${
                  i < arr.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="flex-1 text-sm text-foreground">{label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ustad Menu */}
      {role === "ustad" && (
        <div className="px-5 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Ustad</p>
          <div className="glass-card rounded-xl overflow-hidden">
            {[
              { icon: LayoutDashboard, label: "Dashboard Ustad", path: "/ustad-dashboard" },
              { icon: BookOpen, label: "Pengaturan Profil Ustad", path: "/ustad-dashboard" },
            ].map(({ icon: Icon, label, path }, i, arr) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-muted/50 transition-colors ${
                  i < arr.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="flex-1 text-sm text-foreground">{label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="px-5">
        <div className="glass-card rounded-xl overflow-hidden">
          {menuItems.map(({ icon: Icon, label, path }, i) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-muted/50 transition-colors ${
                i < menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground">{label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3.5 mt-3 glass-card rounded-xl text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Keluar</span>
        </button>
      </div>
    </MobileLayout>
  );
};

export default Profil;
