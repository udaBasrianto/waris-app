import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Navigate, useNavigate } from "react-router-dom";
import { Users, UserCheck, MessageSquare, TrendingUp, Shield, ArrowLeft, Plus, Pencil, Trash2, CalendarDays, Image, Upload, Loader2 } from "lucide-react";
import UstadScheduleManager from "@/components/UstadScheduleManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type AppRole = "admin" | "ustad" | "klien";

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  role: AppRole;
  created_at: string;
}

interface UstadProfileData {
  user_id: string;
  bio: string;
  specialization: string;
  available: boolean;
  full_name: string;
}

interface SliderData {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  active: boolean;
  sort_order: number;
}

const AdminDashboard = () => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [ustadProfiles, setUstadProfiles] = useState<UstadProfileData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [editingUstad, setEditingUstad] = useState<UstadProfileData | null>(null);
  const [formBio, setFormBio] = useState("");
  const [formSpec, setFormSpec] = useState("");
  const [formAvailable, setFormAvailable] = useState(false);
  const [formName, setFormName] = useState("");
  const [formUserId, setFormUserId] = useState("");
  const [isNew, setIsNew] = useState(false);

  // Slider states
  const [sliders, setSliders] = useState<SliderData[]>([]);
  const [sliderDialog, setSliderDialog] = useState(false);
  const [editingSlider, setEditingSlider] = useState<SliderData | null>(null);
  const [isNewSlider, setIsNewSlider] = useState(false);
  const [sliderTitle, setSliderTitle] = useState("");
  const [sliderDesc, setSliderDesc] = useState("");
  const [sliderImageUrl, setSliderImageUrl] = useState("");
  const [sliderLinkUrl, setSliderLinkUrl] = useState("");
  const [sliderActive, setSliderActive] = useState(true);
  const [sliderOrder, setSliderOrder] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (role === "admin") {
      fetchUsers();
      fetchUstadProfiles();
      fetchSliders();
    }
  }, [role]);

  const fetchUsers = async () => {
    setLoadingData(true);
    try {
      const data = await api.get<UserWithRole[]>("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingData(false);
  };

  const fetchUstadProfiles = async () => {
    try {
      const data = await api.get<UstadProfileData[]>("/admin/ustads");
      setUstadProfiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateRole = async (userId: string, newRole: AppRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditDialog = (ustad: UstadProfileData) => {
    setIsNew(false);
    setEditingUstad(ustad);
    setFormBio(ustad.bio);
    setFormSpec(ustad.specialization);
    setFormAvailable(ustad.available);
    setFormName(ustad.full_name);
    setFormUserId(ustad.user_id);
    setEditDialog(true);
  };

  const openNewDialog = () => {
    setIsNew(true);
    setEditingUstad(null);
    setFormBio("");
    setFormSpec("");
    setFormAvailable(false);
    setFormName("");
    setFormUserId("");
    setEditDialog(true);
  };

  const saveUstadProfile = async () => {
    try {
      if (isNew) {
        if (!formUserId) {
          toast({ title: "Pilih user ID ustad", variant: "destructive" });
          return;
        }
        await api.post("/admin/ustads", {
          user_id: formUserId,
          bio: formBio,
          specialization: formSpec,
          available: formAvailable,
        });
      } else {
        await api.put(`/admin/ustads/${formUserId}`, {
          bio: formBio,
          specialization: formSpec,
          available: formAvailable,
        });
      }
      setEditDialog(false);
      fetchUstadProfiles();
      fetchUsers();
      toast({ title: isNew ? "Profil ustad ditambahkan" : "Profil ustad diperbarui" });
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  const deleteUstadProfile = async (userId: string) => {
    try {
      await api.delete(`/admin/ustads/${userId}`);
      fetchUstadProfiles();
      toast({ title: "Profil ustad dihapus" });
    } catch (err) {
      console.error(err);
    }
  };

  // ============ SLIDER FUNCTIONS ============
  const fetchSliders = async () => {
    try {
      const data = await api.get<SliderData[]>("/admin/sliders");
      setSliders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openNewSliderDialog = () => {
    setIsNewSlider(true);
    setEditingSlider(null);
    setSliderTitle("");
    setSliderDesc("");
    setSliderImageUrl("");
    setSliderLinkUrl("");
    setSliderActive(true);
    setSliderOrder(0);
    setSliderDialog(true);
  };

  const openEditSliderDialog = (s: SliderData) => {
    setIsNewSlider(false);
    setEditingSlider(s);
    setSliderTitle(s.title);
    setSliderDesc(s.description);
    setSliderImageUrl(s.image_url);
    setSliderLinkUrl(s.link_url);
    setSliderActive(s.active);
    setSliderOrder(s.sort_order);
    setSliderDialog(true);
  };

  const saveSlider = async () => {
    try {
      const body = {
        title: sliderTitle,
        description: sliderDesc,
        image_url: sliderImageUrl,
        link_url: sliderLinkUrl,
        active: sliderActive,
        sort_order: sliderOrder,
      };
      if (isNewSlider) {
        await api.post("/admin/sliders", body);
      } else if (editingSlider) {
        await api.put(`/admin/sliders/${editingSlider.id}`, body);
      }
      setSliderDialog(false);
      fetchSliders();
      toast({ title: isNewSlider ? "Slider ditambahkan" : "Slider diperbarui" });
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  const deleteSlider = async (id: string) => {
    try {
      await api.delete(`/admin/sliders/${id}`);
      fetchSliders();
      toast({ title: "Slider dihapus" });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (role !== "admin") return <Navigate to="/" replace />;

  const ustads = users.filter((u) => u.role === "ustad");
  const kliens = users.filter((u) => u.role === "klien");
  const totalUsers = users.length;

  const stats = [
    { label: "Total Pengguna", value: totalUsers, icon: Users, color: "text-primary" },
    { label: "Ustad/Coach", value: ustads.length, icon: UserCheck, color: "text-gold" },
    { label: "Klien", value: kliens.length, icon: MessageSquare, color: "text-blue-500" },
    { label: "Konsultasi", value: 0, icon: TrendingUp, color: "text-green-500" },
  ];

  const roleBadgeVariant = (r: AppRole) => {
    switch (r) {
      case "admin": return "destructive" as const;
      case "ustad": return "default" as const;
      case "klien": return "secondary" as const;
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const UserTable = ({ data, showRoleActions = false }: { data: UserWithRole[]; showRoleActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Telepon</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Terdaftar</TableHead>
          {showRoleActions && <TableHead>Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showRoleActions ? 5 : 4} className="text-center text-muted-foreground py-8">Belum ada data</TableCell>
          </TableRow>
        ) : (
          data.map((u) => (
            <TableRow key={u.user_id}>
              <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
              <TableCell>{u.phone || "—"}</TableCell>
              <TableCell><Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge></TableCell>
              <TableCell className="text-muted-foreground text-xs">{formatDate(u.created_at)}</TableCell>
              {showRoleActions && (
                <TableCell>
                  <div className="flex gap-1">
                    {u.role !== "ustad" && (
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateRole(u.user_id, "ustad")}>→ Ustad</Button>
                    )}
                    {u.role !== "klien" && u.role !== "admin" && (
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateRole(u.user_id, "klien")}>→ Klien</Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary px-5 pt-10 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Shield className="w-6 h-6 text-primary-foreground" />
            <h1 className="font-heading text-xl font-bold text-primary-foreground">Dashboard Admin</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <Card key={s.label} className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="ustad-profiles" className="mb-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="sliders" className="gap-1"><Image className="w-3.5 h-3.5" /> Slider</TabsTrigger>
            <TabsTrigger value="ustad-profiles">Profil Ustad</TabsTrigger>
            <TabsTrigger value="jadwal" className="gap-1"><CalendarDays className="w-3.5 h-3.5" /> Jadwal</TabsTrigger>
            <TabsTrigger value="ustads">Ustad ({ustads.length})</TabsTrigger>
            <TabsTrigger value="kliens">Klien ({kliens.length})</TabsTrigger>
            <TabsTrigger value="semua">Semua ({totalUsers})</TabsTrigger>
          </TabsList>

          {/* SLIDER TAB */}
          <TabsContent value="sliders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Kelola Slider Beranda</CardTitle>
                <Button size="sm" className="gap-1" onClick={openNewSliderDialog}>
                  <Plus className="w-4 h-4" /> Tambah
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gambar</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Urutan</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sliders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada slider</TableCell>
                      </TableRow>
                    ) : (
                      sliders.map(s => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <img src={s.image_url} alt={s.title} className="w-20 h-12 object-cover rounded-md" />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <p className="text-sm">{s.title}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{s.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={s.active ? "default" : "secondary"}>
                              {s.active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{s.sort_order}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-7" onClick={() => openEditSliderDialog(s)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-destructive" onClick={() => deleteSlider(s.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ustad-profiles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Kelola Profil Ustad</CardTitle>
                <Button size="sm" className="gap-1" onClick={openNewDialog}>
                  <Plus className="w-4 h-4" /> Tambah
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Spesialisasi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ustadProfiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Belum ada profil ustad</TableCell>
                      </TableRow>
                    ) : (
                      ustadProfiles.map(up => (
                        <TableRow key={up.user_id}>
                          <TableCell className="font-medium">{up.full_name}</TableCell>
                          <TableCell className="text-sm">{up.specialization || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={up.available ? "default" : "secondary"}>
                              {up.available ? "Online" : "Offline"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-7" onClick={() => openEditDialog(up)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-destructive" onClick={() => deleteUstadProfile(up.user_id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jadwal">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kelola Jadwal Ustad</CardTitle>
              </CardHeader>
              <CardContent>
                <UstadScheduleManager isAdmin />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ustads">
            <Card>
              <CardHeader><CardTitle className="text-base">Daftar Ustad/Coach</CardTitle></CardHeader>
              <CardContent><UserTable data={ustads} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kliens">
            <Card>
              <CardHeader><CardTitle className="text-base">Daftar Klien</CardTitle></CardHeader>
              <CardContent><UserTable data={kliens} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semua">
            <Card>
              <CardHeader><CardTitle className="text-base">Semua Pengguna</CardTitle></CardHeader>
              <CardContent><UserTable data={users} showRoleActions /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit/Add Ustad Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Tambah Profil Ustad" : "Edit Profil Ustad"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {isNew && (
              <div className="space-y-2">
                <Label>Pilih User</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formUserId}
                  onChange={e => {
                    setFormUserId(e.target.value);
                    const u = users.find(u => u.user_id === e.target.value);
                    setFormName(u?.full_name || "");
                  }}
                >
                  <option value="">-- Pilih user --</option>
                  {users.filter(u => !ustadProfiles.some(up => up.user_id === u.user_id)).map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.full_name || u.user_id}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Spesialisasi</Label>
              <Input value={formSpec} onChange={e => setFormSpec(e.target.value)} placeholder="Ahli Faraidh & Fiqh Mawaris" />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={formBio} onChange={e => setFormBio(e.target.value)} placeholder="Deskripsi singkat tentang ustad..." rows={4} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Tersedia (Online)</Label>
              <Switch checked={formAvailable} onCheckedChange={setFormAvailable} />
            </div>
            <Button onClick={saveUstadProfile} className="w-full">
              {isNew ? "Tambahkan" : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slider Dialog */}
      <Dialog open={sliderDialog} onOpenChange={setSliderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewSlider ? "Tambah Slider" : "Edit Slider"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input value={sliderTitle} onChange={e => setSliderTitle(e.target.value)} placeholder="Judul slider" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={sliderDesc} onChange={e => setSliderDesc(e.target.value)} placeholder="Deskripsi singkat (opsional)" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Gambar Slider *</Label>
              <div className="flex gap-2">
                <Input value={sliderImageUrl} onChange={e => setSliderImageUrl(e.target.value)} placeholder="URL gambar atau upload file" className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 shrink-0"
                  disabled={uploading}
                  onClick={() => document.getElementById('slider-upload')?.click()}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "..." : "Upload"}
                </Button>
                <input
                  id="slider-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const formData = new FormData();
                      formData.append('image', file);
                      const token = localStorage.getItem('auth_token');
                      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData,
                      });
                      const data = await res.json();
                      if (data.url) setSliderImageUrl(data.url);
                      else toast({ title: 'Upload gagal', description: data.error, variant: 'destructive' });
                    } catch (err: any) {
                      toast({ title: 'Upload error', description: err.message, variant: 'destructive' });
                    } finally {
                      setUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              {sliderImageUrl && (
                <img src={sliderImageUrl.startsWith('/') ? `${(import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api','')}${sliderImageUrl}` : sliderImageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
              )}
            </div>
            <div className="space-y-2">
              <Label>URL Link (opsional)</Label>
              <Input value={sliderLinkUrl} onChange={e => setSliderLinkUrl(e.target.value)} placeholder="/konsultasi atau https://..." />
            </div>
            <div className="flex items-center justify-between">
              <Label>Urutan</Label>
              <Input type="number" value={sliderOrder} onChange={e => setSliderOrder(Number(e.target.value))} className="w-20 text-center" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Aktif</Label>
              <Switch checked={sliderActive} onCheckedChange={setSliderActive} />
            </div>
            <Button onClick={saveSlider} className="w-full" disabled={!sliderTitle || !sliderImageUrl}>
              {isNewSlider ? "Tambahkan" : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
