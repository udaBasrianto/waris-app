import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const useConsultationNotifications = () => {
  const { user, role } = useAuth();
  const lastChecked = useRef<string | null>(null);

  useEffect(() => {
    if (!user || (role !== "ustad" && role !== "admin")) return;

    const checkNew = async () => {
      try {
        const data = await api.get<any[]>("/consultations/ustad/pending");
        if (lastChecked.current === null) {
          // First load — don't notify, just record
          lastChecked.current = new Date().toISOString();
          return;
        }
        // Check for new ones since last check
        const newOnes = data.filter(c => new Date(c.created_at) > new Date(lastChecked.current!));
        newOnes.forEach(c => {
          toast.info("Konsultasi Baru Masuk", {
            description: `${c.client_name || "Klien"}: ${c.topic}`,
            duration: 8000,
          });
        });
        lastChecked.current = new Date().toISOString();
      } catch {
        // silently fail
      }
    };

    checkNew();
    const interval = setInterval(checkNew, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [user, role]);
};
