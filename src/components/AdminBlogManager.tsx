import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  created_at: string;
  author_name: string;
}

export function AdminBlogManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"posts" | "categories">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  
  // Forms
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState({
    title: "", slug: "", content: "", excerpt: "", featured_image: "", status: "draft", category_ids: [] as string[]
  });
  
  const [catForm, setCatForm] = useState({ name: "", slug: "" });

  const fetchPosts = async () => {
    try {
      const data = await api.get<Post[]>("/blog/admin/posts");
      setPosts(data);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.get<Category[]>("/blog/categories");
      setCategories(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const handleCreateCat = async () => {
    try {
      if (!catForm.name || !catForm.slug) return toast({ title: "Validasi", description: "Nama dan slug wajib diisi" });
      await api.post("/blog/categories", catForm);
      toast({ title: "Berhasil", description: "Kategori ditambahkan" });
      setIsCatModalOpen(false);
      setCatForm({ name: "", slug: "" });
      fetchCategories();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      await api.delete(`/blog/categories/${id}`);
      fetchCategories();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const openNewPost = () => {
    setEditingPostId(null);
    setPostForm({ title: "", slug: "", content: "", excerpt: "", featured_image: "", status: "draft", category_ids: [] });
    setIsPostModalOpen(true);
  };

  const openEditPost = async (id: string) => {
    try {
      const data = await api.get(`/blog/admin/posts/${id}`);
      setEditingPostId(data.id);
      setPostForm({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || "",
        featured_image: data.featured_image || "",
        status: data.status,
        category_ids: data.category_ids || [],
      });
      setIsPostModalOpen(true);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleSavePost = async () => {
    try {
      if (!postForm.title || !postForm.slug || !postForm.content) {
        return toast({ variant: "destructive", description: "Judul, Slug, dan Konten wajib diisi" });
      }
      if (editingPostId) {
        await api.put(`/blog/posts/${editingPostId}`, postForm);
      } else {
        await api.post("/blog/posts", postForm);
      }
      toast({ title: "Berhasil", description: "Artikel disimpan" });
      setIsPostModalOpen(false);
      fetchPosts();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Hapus artikel ini?")) return;
    try {
      await api.delete(`/blog/posts/${id}`);
      fetchPosts();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  // Handle image upload using existing admin/upload endpoint
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Gagal upload gambar");
      const data = await res.json();
      setPostForm(prev => ({ ...prev, featured_image: data.url }));
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload Gagal", description: e.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manajemen Blog</h2>
        <div className="flex gap-2">
          <Button variant={activeTab === "posts" ? "default" : "outline"} onClick={() => setActiveTab("posts")}>Artikel</Button>
          <Button variant={activeTab === "categories" ? "default" : "outline"} onClick={() => setActiveTab("categories")}>Kategori</Button>
        </div>
      </div>

      {activeTab === "posts" && (
        <div className="bg-card rounded-lg shadow border p-4">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-lg">Daftar Artikel</h3>
            <Button onClick={openNewPost} size="sm"><Plus className="w-4 h-4 mr-2" /> Artikel Baru</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.author_name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs text-white ${p.status === 'published' ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditPost(p.id)}><Edit className="w-4 h-4 text-primary" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePost(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-4">Belum ada artikel</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="bg-card rounded-lg shadow border p-4 max-w-2xl">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-lg">Kategori Kustom</h3>
            <Button onClick={() => setIsCatModalOpen(true)} size="sm"><Plus className="w-4 h-4 mr-2" /> Kategori Baru</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.slug}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCat(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal Post */}
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPostId ? 'Edit Artikel' : 'Tulis Artikel Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Judul Artikel</label>
                  <Input 
                    value={postForm.title} 
                    onChange={e => {
                      setPostForm(p => ({ ...p, title: e.target.value, slug: !editingPostId ? generateSlug(e.target.value) : p.slug }));
                    }} 
                    placeholder="Masukkan judul..." 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Tautan (Slug)</label>
                  <Input value={postForm.slug} onChange={e => setPostForm(p => ({ ...p, slug: e.target.value }))} placeholder="judul-artikel" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Konten Tulisan (Mendukung HTML dasar)</label>
                  <Textarea 
                    value={postForm.content} 
                    onChange={e => setPostForm(p => ({ ...p, content: e.target.value }))} 
                    className="min-h-[300px]"
                    placeholder="Tuliskan isi artikel di sini..."
                  />
                </div>
              </div>
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status Pengambilan</label>
                  <select 
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={postForm.status} 
                    onChange={e => setPostForm(p => ({ ...p, status: e.target.value as any }))}
                  >
                    <option value="draft">Draft (Konsep)</option>
                    <option value="published">Published (Terbit)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto border p-2 rounded bg-background">
                    {categories.map(c => (
                      <label key={c.id} className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          checked={postForm.category_ids.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) setPostForm(p => ({ ...p, category_ids: [...p.category_ids, c.id] }));
                            else setPostForm(p => ({ ...p, category_ids: p.category_ids.filter(id => id !== c.id) }));
                          }}
                        />
                        {c.name}
                      </label>
                    ))}
                    {categories.length === 0 && <span className="text-xs text-muted-foreground">Belum ada kategori</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kutipan Singkat (Excerpt)</label>
                  <Textarea value={postForm.excerpt} onChange={e => setPostForm(p => ({ ...p, excerpt: e.target.value }))} className="h-20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Gambar Sampul</label>
                  {postForm.featured_image && (
                    <img src={postForm.featured_image.startsWith('/') ? `${API_URL.replace('/api','')}${postForm.featured_image}` : postForm.featured_image} alt="Preview" className="w-full h-32 object-cover rounded-md border" />
                  )}
                  <Input type="file" accept="image/*" onChange={handleUploadImage} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>Batal</Button>
            <Button onClick={handleSavePost}>Simpan Artikel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Kategori */}
      <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategori Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Kategori</label>
              <Input 
                value={catForm.name} 
                onChange={e => setCatForm(c => ({ ...c, name: e.target.value, slug: generateSlug(e.target.value) }))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input value={catForm.slug} onChange={e => setCatForm(c => ({ ...c, slug: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCatModalOpen(false)}>Batal</Button>
            <Button onClick={handleCreateCat}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
