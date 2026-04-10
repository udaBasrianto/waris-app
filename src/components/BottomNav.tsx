import { Home, MessageCircle, Clock, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Beranda", path: "/" },
  { icon: MessageCircle, label: "Konsultasi", path: "/konsultasi" },
  { icon: Clock, label: "Riwayat", path: "/riwayat" },
  { icon: User, label: "Profil", path: "/profil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full gradient-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
