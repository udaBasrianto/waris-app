import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import MobileLayout from "@/components/MobileLayout";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, User, Calendar } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_BASE = API_URL.replace('/api', '');

interface PostDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string;
  published_at: string;
  author_name: string;
  categories: { name: string; slug: string }[];
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    setLoading(true);
    try {
      const data = await api.get<PostDetail>(`/blog/${postSlug}`);
      setPost(data);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
    return url;
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!post) {
    return (
      <MobileLayout>
        <div className="p-5 pt-12 text-center">
          <h2 className="text-xl font-bold mb-4">Artikel tidak ditemukan</h2>
          <Link to="/blog" className="text-primary hover:underline">Kembali ke Daftar Artikel</Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="w-full max-w-md mx-auto px-4 h-14 flex items-center">
          <Link to="/blog" className="flex items-center text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium text-sm">Kembali</span>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto bg-background min-h-screen shadow-sm">
        {post.featured_image && (
          <div className="w-full aspect-[4/3] bg-muted relative">
            <img 
              src={resolveImageUrl(post.featured_image)} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-5">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-3">
             {post.categories?.map(c => (
               <span key={c.slug} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                 {c.name}
               </span>
             ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold font-heading leading-tight mb-4 text-foreground">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 pb-4 border-b">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{post.author_name || "Admin"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.published_at ? format(new Date(post.published_at), 'd MMMM yyyy', { locale: id }) : ''}</span>
            </div>
          </div>

          {/* Content */}
          {/* Note: since it might contain HTML from a rich text editor, we use dangerouslySetInnerHTML */}
          <div 
            className="prose prose-sm md:prose-base prose-slate max-w-none 
                       prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground
                       prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary hover:prose-a:underline
                       prose-img:rounded-xl prose-img:w-full"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
    </div>
  );
}
