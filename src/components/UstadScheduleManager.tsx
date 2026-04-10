import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

interface Ustad {
  user_id: string;
  full_name: string;
}

interface Availability {
  id: string;
  ustad_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Booking {
  id: string;
  ustad_id: string;
  client_id: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: string;
}

interface Props {
  isAdmin?: boolean;
  ustadId?: string;
}

const UstadScheduleManager = ({ isAdmin = false, ustadId }: Props) => {
  const [ustads, setUstads] = useState<Ustad[]>([]);
  const [selectedUstad, setSelectedUstad] = useState<string>("");
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showAvailDialog, setShowAvailDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const [formDay, setFormDay] = useState(1);
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("12:00");

  const [bookDate, setBookDate] = useState("");
  const [bookStart, setBookStart] = useState("08:00");
  const [bookEnd, setBookEnd] = useState("09:00");
  const [bookNotes, setBookNotes] = useState("");

  useEffect(() => {
    if (ustadId) {
      setSelectedUstad(ustadId);
    } else if (isAdmin) {
      fetchUstads();
    }
  }, [isAdmin, ustadId]);

  useEffect(() => {
    if (selectedUstad) {
      fetchAvailability();
      fetchBookings();
    }
  }, [selectedUstad]);

  const fetchUstads = async () => {
    try {
      const data = await api.get<any[]>("/ustads");
      setUstads(data.map(d => ({ user_id: d.user_id, full_name: d.name })));
      if (data.length > 0 && !selectedUstad) setSelectedUstad(data[0].user_id);
    } catch (err) { console.error(err); }
  };

  const fetchAvailability = async () => {
    try {
      const data = await api.get<Availability[]>(`/ustads/${selectedUstad}/availability`);
      setAvailability(data);
    } catch (err) { console.error(err); }
  };

  const fetchBookings = async () => {
    try {
      const data = await api.get<Booking[]>(`/ustads/${selectedUstad}/bookings`);
      setBookings(data);
    } catch (err) { console.error(err); }
  };

  const addAvailability = async () => {
    try {
      await api.post(`/ustads/${selectedUstad}/availability`, {
        day_of_week: formDay,
        start_time: formStartTime,
        end_time: formEndTime,
      });
      toast.success("Ketersediaan ditambahkan");
      setShowAvailDialog(false);
      fetchAvailability();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteAvailability = async (id: string) => {
    try {
      await api.delete(`/ustads/${selectedUstad}/availability/${id}`);
      toast.success("Ketersediaan dihapus");
      fetchAvailability();
    } catch (err) { console.error(err); }
  };

  const addBooking = async () => {
    if (!bookDate) { toast.error("Pilih tanggal"); return; }
    try {
      await api.post(`/ustads/${selectedUstad}/bookings`, {
        booking_date: bookDate,
        start_time: bookStart,
        end_time: bookEnd,
        notes: bookNotes || "",
      });
      toast.success("Booking ditambahkan");
      setShowBookingDialog(false);
      setBookNotes("");
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      await api.put(`/ustads/${selectedUstad}/bookings/${id}`, { status: "cancelled" });
      toast.success("Booking dibatalkan");
      fetchBookings();
    } catch (err) { console.error(err); }
  };

  const formatTime = (t: string) => t.slice(0, 5);

  return (
    <div className="space-y-4">
      {isAdmin && ustads.length > 0 && (
        <div className="space-y-2">
          <Label>Pilih Ustad</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedUstad}
            onChange={e => setSelectedUstad(e.target.value)}
          >
            {ustads.map(u => (
              <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
            ))}
          </select>
        </div>
      )}

      {!selectedUstad ? (
        <p className="text-center text-muted-foreground py-8">Pilih ustad untuk melihat jadwal</p>
      ) : (
        <Tabs defaultValue="availability">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="availability" className="gap-1">
              <Clock className="w-3.5 h-3.5" /> Ketersediaan
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1">
              <Calendar className="w-3.5 h-3.5" /> Booking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm">Jadwal Mingguan</CardTitle>
                <Button size="sm" className="gap-1 text-xs" onClick={() => setShowAvailDialog(true)}>
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </Button>
              </CardHeader>
              <CardContent>
                {availability.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-6">Belum ada jadwal ketersediaan</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hari</TableHead>
                        <TableHead>Jam</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availability.map(a => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <Badge variant="outline">{DAYS[a.day_of_week]}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTime(a.start_time)} - {formatTime(a.end_time)}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteAvailability(a.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm">Booking Konsultasi</CardTitle>
                <Button size="sm" className="gap-1 text-xs" onClick={() => setShowBookingDialog(true)}>
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </Button>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-6">Belum ada booking</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jam</TableHead>
                        <TableHead>Catatan</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map(b => (
                        <TableRow key={b.id}>
                          <TableCell className="text-sm">
                            {new Date(b.booking_date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTime(b.start_time)} - {formatTime(b.end_time)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground truncate max-w-[120px]">
                            {b.notes || "—"}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => cancelBooking(b.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Add Availability Dialog */}
      <Dialog open={showAvailDialog} onOpenChange={setShowAvailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Ketersediaan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Hari</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formDay} onChange={e => setFormDay(Number(e.target.value))}>
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Jam Mulai</Label>
                <Input type="time" value={formStartTime} onChange={e => setFormStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Jam Selesai</Label>
                <Input type="time" value={formEndTime} onChange={e => setFormEndTime(e.target.value)} />
              </div>
            </div>
            <Button onClick={addAvailability} className="w-full">Tambahkan</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Booking Konsultasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" value={bookDate} onChange={e => setBookDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Jam Mulai</Label>
                <Input type="time" value={bookStart} onChange={e => setBookStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Jam Selesai</Label>
                <Input type="time" value={bookEnd} onChange={e => setBookEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Input value={bookNotes} onChange={e => setBookNotes(e.target.value)} placeholder="Topik konsultasi..." />
            </div>
            <Button onClick={addBooking} className="w-full">Tambahkan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UstadScheduleManager;
