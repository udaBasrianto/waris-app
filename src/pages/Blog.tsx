import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import MobileLayout from "@/components/MobileLayout";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_BASE = API_URL.replace('/api', '');

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  author_name: string;
  categories: { name: string; slug: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts(selectedCat);
  }, [selectedCat]);

  const fetchCategories = async () => {
    try {
      const data = await api.get<Category[]>("/blog/categories");
      setCategories(data);
    } catch {
      // ignore
    }
  };

  const fetchPosts = async (catSlug?: string) => {
    try {
      const url = catSlug ? `/blog?category=${catSlug}` : "/blog";
      const data = await api.get<Post[]>(url);
      setPosts(data);
    } catch {
      // ignore
    }
  };

  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
    return url;
  };

  return (
    <MobileLayout>
      <div className="gradient-primary px-5 pt-12 pb-8 rounded-b-3xl relative overflow-hidden shadow-lg border-b border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-primary-foreground font-semibold">← Kembali</Link>
        </div>
        <h1 className="font-heading text-primary-foreground text-2xl font-bold leading-tight relative z-10">Materi & Berita</h1>
        <p className="text-primary-foreground/80 mt-2 text-sm relative z-10">Artikel terbaru seputar Ilmu Faraidh dan seputar Konsultasi Keluarga.</p>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      </div>

      <div className="px-5 mt-6 mb-20 space-y-6">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
            <button 
              onClick={() => setSelectedCat("")} 
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCat === "" ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground border hover:bg-muted/80"}`}
            >
              Semua
            </button>
            {categories.map(c => (
              <button 
                key={c.id} 
                onClick={() => setSelectedCat(c.slug)} 
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCat === c.slug ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground border hover:bg-muted/80"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Posts List */}
        <div className="grid gap-4">
          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Belum ada artikel ditemukan.</p>
            </div>
          ) : (
            posts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="overflow-hidden hover:shadow-md transition-all active:scale-[0.98] border-none bg-card shadow-sm">
                  {post.featured_image && (
                    <div className="w-full h-40 bg-muted overflow-hidden">
                      <img src={resolveImageUrl(post.featured_image)} alt={post.title} className="w-full h-full object-cover transition-transform hover:scale-105" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex gap-2 text-xs mb-2">
                       {post.categories?.slice(0,2).map(c => (
                         <span key={c.slug} className="text-primary font-medium">{c.name}</span>
                       ))}
                    </div>
                    <h3 className="font-heading font-semibold text-lg leading-tight mb-2 line-clamp-2">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <span className="font-medium text-foreground/80">{post.author_name}</span>
                      <span>•</span>
                      <span>{post.published_at ? format(new Date(post.published_at), 'd MMM yyyy', { locale: id }) : ''}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
