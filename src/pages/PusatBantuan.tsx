import { ArrowLeft, MessageCircle, Mail, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Bagaimana cara memulai konsultasi?",
    a: "Buka halaman Konsultasi, klik tombol \"+ Baru\", masukkan topik yang ingin Anda konsultasikan, lalu tunggu ustad yang tersedia untuk merespons.",
  },
  {
    q: "Apakah layanan ini berbayar?",
    a: "Saat ini layanan konsultasi disediakan secara gratis. Kami akan menginformasikan jika ada perubahan kebijakan di masa depan.",
  },
  {
    q: "Bagaimana cara memilih ustad?",
    a: "Anda bisa melihat profil ustad di halaman Beranda, termasuk spesialisasi dan rating dari klien sebelumnya untuk membantu Anda memilih.",
  },
  {
    q: "Apakah data konsultasi saya aman?",
    a: "Ya, semua data konsultasi dienkripsi dan hanya bisa diakses oleh Anda dan ustad yang menangani konsultasi tersebut.",
  },
  {
    q: "Bagaimana cara mengubah password?",
    a: "Buka Profil → Keamanan & Privasi → masukkan password baru dan konfirmasi, lalu klik Ubah Password.",
  },
];

const PusatBantuan = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout hideBottomNav>
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-heading text-xl font-bold text-foreground">Pusat Bantuan</h1>
      </div>

      <div className="px-5 space-y-5 pb-8">
        {/* FAQ */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Pertanyaan Umum (FAQ)</h2>
          <div className="glass-card rounded-xl overflow-hidden">
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                  <AccordionTrigger className="px-4 py-3 text-sm text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Hubungi Kami</h2>
          <div className="space-y-3">
            <a
              href="mailto:support@konsultasifaraidh.id"
              className="glass-card rounded-xl p-4 flex items-center gap-3 block"
            >
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-xs text-muted-foreground">support@konsultasifaraidh.id</p>
              </div>
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-xl p-4 flex items-center gap-3 block"
            >
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp</p>
                <p className="text-xs text-muted-foreground">+62 812-3456-7890</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default PusatBantuan;
