import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface NotificationContextProps {
  unreadCount: number;
  markAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextProps>({
  unreadCount: 0,
  markAsRead: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, role } = useAuth();
  const lastChecked = useRef<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user || (role !== "ustad" && role !== "admin")) return;

    const checkNew = async () => {
      try {
        const data = await api.get<any[]>("/consultations/ustad/pending");
        if (lastChecked.current === null) {
          lastChecked.current = new Date().toISOString();
          setUnreadCount(data.length);
          return;
        }
        const newOnes = data.filter(c => new Date(c.created_at) > new Date(lastChecked.current!));
        if (newOnes.length > 0) {
          setUnreadCount(prev => prev + newOnes.length);
          newOnes.forEach(c => {
            toast.info("Konsultasi Baru Masuk", {
              description: `${c.client_name || "Klien"}: ${c.topic}`,
              duration: 8000,
            });
          });
        }
        lastChecked.current = new Date().toISOString();
      } catch {
        // silently fail
      }
    };

    checkNew();
    const interval = setInterval(checkNew, 10000);
    return () => clearInterval(interval);
  }, [user, role]);

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
