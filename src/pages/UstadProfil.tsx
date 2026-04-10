import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageSquare, Clock, User } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MobileLayout from "@/components/MobileLayout";

interface UstadProfile {
  user_id: string;
  bio: string;
  specialization: string;
  available: boolean;
  full_name: string;
  ratings: Rating[];
  avg_rating: number;
  consultation_count: number;
}

interface Rating {
  id: string;
  score: number;
  comment: string;
  created_at: string;
  client_name: string;
}

const UstadProfil = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UstadProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const data = await api.get<UstadProfile>(`/ustads/${id}`);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center pt-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  if (!profile) {
    return (
      <MobileLayout>
        <div className="text-center pt-32 text-muted-foreground">Profil ustad tidak ditemukan</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <div className="gradient-primary px-5 pt-10 pb-8 rounded-b-3xl">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-primary-foreground/80 text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-heading font-bold text-2xl">
            {profile.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-primary-foreground">{profile.full_name}</h1>
            <p className="text-primary-foreground/70 text-sm">{profile.specialization || "Konsultan Faraidh"}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${profile.available ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"}`}>
              {profile.available ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-4">
        <Card className="glass-card">
          <CardContent className="p-4 grid grid-cols-3 divide-x divide-border text-center">
            <div>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-bold text-foreground">{profile.avg_rating ? profile.avg_rating.toFixed(1) : "—"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Rating</p>
            </div>
            <div>
              <p className="font-bold text-foreground">{profile.consultation_count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Konsultasi</p>
            </div>
            <div>
              <p className="font-bold text-foreground">{profile.ratings.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ulasan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bio */}
      <div className="px-5 mt-5">
        <h2 className="font-heading font-semibold text-base text-foreground mb-2">Tentang</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {profile.bio || "Belum ada bio."}
        </p>
      </div>

      {/* Ratings */}
      <div className="px-5 mt-5 mb-24">
        <h2 className="font-heading font-semibold text-base text-foreground mb-3">Ulasan Klien</h2>
        {profile.ratings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada ulasan.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {profile.ratings.map(r => (
              <Card key={r.id} className="glass-card">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{r.client_name}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < r.score ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-5 max-w-lg mx-auto">
        <Button className="w-full rounded-xl" onClick={() => navigate("/konsultasi")} disabled={!profile.available}>
          {profile.available ? "Mulai Konsultasi" : "Sedang Offline"}
        </Button>
      </div>
    </MobileLayout>
  );
};

export default UstadProfil;
