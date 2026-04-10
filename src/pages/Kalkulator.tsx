import { useState } from "react";
import { ArrowLeft, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";

type CalculationResult = {
  name: string;
  portion: string;
  amount: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#E63946', '#457B9D'];

const Kalkulator = () => {
  const navigate = useNavigate();
  const [totalHarta, setTotalHarta] = useState<string>("");
  const [hutang, setHutang] = useState<string>("");
  const [biayaPemakaman, setBiayaPemakaman] = useState<string>("");

  const [pewarisGender, setPewarisGender] = useState<"laki-laki" | "perempuan">("laki-laki");
  const [pasanganHidup, setPasanganHidup] = useState(true);
  const [ayahHidup, setAyahHidup] = useState(true);
  const [ibuHidup, setIbuHidup] = useState(true);
  
  const [jumlahAnakLaki, setJumlahAnakLaki] = useState<number>(0);
  const [jumlahAnakPerempuan, setJumlahAnakPerempuan] = useState<number>(0);

  const [results, setResults] = useState<CalculationResult[] | null>(null);

  const handleCalculate = () => {
    const harta = Number(totalHarta) || 0;
    const utg = Number(hutang) || 0;
    const biaya = Number(biayaPemakaman) || 0;
    
    let hartaBersih = harta - utg - biaya;
    if (hartaBersih <= 0) {
      setResults([]);
      return;
    }

    const hasChildren = jumlahAnakLaki > 0 || jumlahAnakPerempuan > 0;
    let totalFractionUsed = 0;
    const newResults: CalculationResult[] = [];

    const addResult = (name: string, fraction: number, portionStr: string) => {
      const amount = hartaBersih * fraction;
      totalFractionUsed += fraction;
      newResults.push({ name, portion: portionStr, amount });
    };

    // 1. Dzu Furudh (Porsi Pasti)
    // Pasangan (Suami/Istri)
    if (pasanganHidup) {
      if (pewarisGender === "perempuan") { // Suami
        if (hasChildren) addResult("Suami", 1/4, "1/4");
        else addResult("Suami", 1/2, "1/2");
      } else { // Istri
        if (hasChildren) addResult("Istri", 1/8, "1/8");
        else addResult("Istri", 1/4, "1/4");
      }
    }

    // Ibu
    if (ibuHidup) {
      if (hasChildren) addResult("Ibu", 1/6, "1/6");
      else addResult("Ibu", 1/3, "1/3"); // Asumsi sederhana tanpa saudara
    }

    // Ayah
    let ayahGetsAshabah = false;
    if (ayahHidup) {
      if (jumlahAnakLaki > 0) {
        addResult("Ayah", 1/6, "1/6");
      } else if (jumlahAnakPerempuan > 0) {
        addResult("Ayah", 1/6, "1/6 + Ashabah");
        ayahGetsAshabah = true;
      } else {
        ayahGetsAshabah = true;
      }
    }

    // Anak Perempuan (Tanpa Anak Laki-laki)
    if (jumlahAnakLaki === 0 && jumlahAnakPerempuan > 0) {
      if (jumlahAnakPerempuan === 1) {
        addResult("Anak Perempuan", 1/2, "1/2");
      } else {
        addResult("Anak Perempuan (Dibagi Rata)", 2/3, "2/3");
      }
    }

    // 2. Ashabah (Sisa)
    const sisaBagian = 1 - totalFractionUsed;

    if (sisaBagian > 0.0001) {
      if (jumlahAnakLaki > 0) {
        const totalShares = (jumlahAnakLaki * 2) + jumlahAnakPerempuan;
        const portionPerShare = sisaBagian / totalShares;
        
        if (jumlahAnakLaki > 0) {
          const totalAnakLaki = portionPerShare * 2 * jumlahAnakLaki;
          newResults.push({
            name: `Anak Laki-Laki (${jumlahAnakLaki} org)`,
            portion: "Ashabah (2 Bagian)",
            amount: hartaBersih * totalAnakLaki
          });
        }
        if (jumlahAnakPerempuan > 0) {
          const totalAnakPr = portionPerShare * jumlahAnakPerempuan;
          newResults.push({
            name: `Anak Perempuan (${jumlahAnakPerempuan} org)`,
            portion: "Ashabah (1 Bagian)",
            amount: hartaBersih * totalAnakPr
          });
        }
      } else if (ayahGetsAshabah && ayahHidup) {
        // Find existing ayah result and add to it
        const existingAyah = newResults.find(r => r.name === "Ayah");
        if (existingAyah) {
          existingAyah.amount += hartaBersih * sisaBagian;
        } else {
          newResults.push({
            name: "Ayah",
            portion: "Ashabah",
            amount: hartaBersih * sisaBagian
          });
        }
      }
    }

    setResults(newResults);
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(number);
  };

  return (
    <MobileLayout>
      <div className="gradient-primary px-5 pt-12 pb-8 rounded-b-3xl text-primary-foreground relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-12 left-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="ml-12">
          <h1 className="font-heading font-bold text-xl flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Kalkulator Faraidh
          </h1>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Simulasi pembagian waris secara proporsional.
          </p>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-10 pb-20">
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Informasi Harta</CardTitle>
            <CardDescription>Masukkan rincian harta yang ditinggalkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Total Harta Peninggalan</Label>
              <Input 
                type="number" 
                placeholder="Contoh: 150000000" 
                value={totalHarta}
                onChange={(e) => setTotalHarta(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hutang Almarhum</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={hutang}
                  onChange={(e) => setHutang(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Biaya Pemakaman</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={biayaPemakaman}
                  onChange={(e) => setBiayaPemakaman(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Data Ahli Waris</CardTitle>
            <CardDescription>Pilih ahli waris yang masih hidup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Almarhum/ah adalah</Label>
                  <p className="text-xs text-muted-foreground">Menentukan kewarisan pasangan</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${pewarisGender === "perempuan" ? "text-muted-foreground" : "font-medium text-primary"}`}>Laki-laki</span>
                  <Switch 
                    checked={pewarisGender === "perempuan"} 
                    onCheckedChange={(checked) => setPewarisGender(checked ? "perempuan" : "laki-laki")} 
                  />
                  <span className={`text-sm ${pewarisGender === "laki-laki" ? "text-muted-foreground" : "font-medium text-primary"}`}>Perempuan</span>
                </div>
             </div>
             
             <Separator />

             <div className="flex items-center justify-between">
                <Label>{pewarisGender === "laki-laki" ? "Istri" : "Suami"} Hidup?</Label>
                <Switch checked={pasanganHidup} onCheckedChange={setPasanganHidup} />
             </div>
             <div className="flex items-center justify-between">
                <Label>Ayah Hidup?</Label>
                <Switch checked={ayahHidup} onCheckedChange={setAyahHidup} />
             </div>
             <div className="flex items-center justify-between">
                <Label>Ibu Hidup?</Label>
                <Switch checked={ibuHidup} onCheckedChange={setIbuHidup} />
             </div>

             <Separator />

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Jumlah Anak Laki-laki</Label>
                 <Input 
                   type="number" 
                   min="0"
                   value={jumlahAnakLaki}
                   onChange={(e) => setJumlahAnakLaki(parseInt(e.target.value) || 0)}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Jumlah Anak Pr.</Label>
                 <Input 
                   type="number" 
                   min="0"
                   value={jumlahAnakPerempuan}
                   onChange={(e) => setJumlahAnakPerempuan(parseInt(e.target.value) || 0)}
                 />
               </div>
             </div>

             <Button className="w-full mt-4" onClick={handleCalculate} size="lg">
               Hitung Pembagian (Simulasi)
             </Button>

          </CardContent>
        </Card>

        {results && (
          <Card className="shadow-lg border-primary/20 bg-primary/5 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader>
              <CardTitle className="text-primary text-center">Hasil Perhitungan</CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Harta tidak cukup setelah dikurangi hutang dan biaya jenazah.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pie Chart Visualization */}
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={results}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {results.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => formatRupiah(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {results.map((res, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-background rounded-lg border">
                        <div>
                          <p className="font-semibold">{res.name}</p>
                          <p className="text-xs text-muted-foreground">Porsi: {res.portion}</p>
                        </div>
                        <p className="font-bold text-primary">{formatRupiah(res.amount)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 text-center space-y-3">
                    <p className="text-xs text-muted-foreground">
                      *Hasil di atas adalah simulasi dasar ahli waris *dzawil furudh* utama. Untuk kasus dengan paman, kakek, nenek atau terhijab lainnya, silakan konsultasi.
                    </p>
                    <Button onClick={() => navigate("/konsultasi")} variant="outline" className="w-full">
                      Tanya Ustadz Lebih Lengkap
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default Kalkulator;
