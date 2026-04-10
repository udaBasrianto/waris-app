import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";

const sections = [
  {
    title: "1. Ketentuan Umum",
    content:
      "KonsultasiFaraidh.id adalah platform konsultasi hukum waris Islam (Faraidh) yang menghubungkan klien dengan ustad/konsultan berpengalaman. Dengan menggunakan layanan ini, Anda menyetujui seluruh syarat dan ketentuan yang berlaku.",
  },
  {
    title: "2. Layanan Konsultasi",
    content:
      "Layanan konsultasi disediakan oleh ustad yang terdaftar di platform kami. Hasil konsultasi bersifat informatif dan edukatif, bukan fatwa resmi. Pengguna disarankan untuk berkonsultasi lebih lanjut dengan lembaga resmi untuk keputusan hukum.",
  },
  {
    title: "3. Akun Pengguna",
    content:
      "Pengguna wajib memberikan informasi yang benar saat mendaftar. Setiap akun hanya boleh digunakan oleh pemilik akun yang terdaftar. Pengguna bertanggung jawab atas keamanan akun masing-masing.",
  },
  {
    title: "4. Privasi & Data",
    content:
      "Kami menjaga kerahasiaan data pribadi pengguna. Data konsultasi disimpan secara aman dan hanya dapat diakses oleh pihak terkait (klien dan ustad yang menangani). Kami tidak membagikan data kepada pihak ketiga tanpa persetujuan.",
  },
  {
    title: "5. Pembatasan Tanggung Jawab",
    content:
      "Platform tidak bertanggung jawab atas kerugian yang timbul dari keputusan yang diambil berdasarkan hasil konsultasi. Layanan disediakan \"sebagaimana adanya\" tanpa jaminan tertentu.",
  },
  {
    title: "6. Perubahan Ketentuan",
    content:
      "Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui platform. Penggunaan berkelanjutan setelah perubahan dianggap sebagai persetujuan.",
  },
];

const SyaratKetentuan = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout hideBottomNav>
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-heading text-xl font-bold text-foreground">Syarat & Ketentuan</h1>
      </div>

      <div className="px-5 space-y-4 pb-8">
        <p className="text-xs text-muted-foreground">Terakhir diperbarui: April 2026</p>
        {sections.map((s) => (
          <div key={s.title} className="glass-card rounded-xl p-4 space-y-2">
            <h2 className="font-semibold text-sm text-foreground">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
};

export default SyaratKetentuan;
