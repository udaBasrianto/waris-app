import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ConsultationInfo {
  id: string;
  topic: string;
  client_id: string;
  ustad_id: string | null;
  status: string;
  other_name: string | null;
}

const ChatRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [consultation, setConsultation] = useState<ConsultationInfo | null>(null);
  const [otherName, setOtherName] = useState("...");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConsultation = async () => {
    if (!id) return;
    try {
      const data = await api.get<ConsultationInfo>(`/consultations/${id}`);
      setConsultation(data);
      setOtherName(data.other_name || "Menunggu ustad...");
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async () => {
    if (!id) return;
    try {
      const data = await api.get<Message[]>(`/consultations/${id}/messages`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!id || !user) return;
    loadConsultation();
    loadMessages();

    // Polling for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !id || sending) return;
    setSending(true);
    try {
      await api.post(`/consultations/${id}/messages`, { content: input.trim() });
      setInput("");
      await loadMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const assignToMe = async () => {
    if (!id || !user || assigning) return;
    setAssigning(true);
    try {
      await api.put(`/consultations/${id}`, { ustad_id: user.id, status: "active" });
      toast({ title: "Berhasil", description: "Anda telah mengambil konsultasi ini" });
      loadConsultation();
    } catch (error: any) {
      toast({ title: "Gagal mengambil konsultasi", description: error.message, variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  const changeStatus = async (newStatus: string) => {
    if (!id) return;
    try {
      await api.put(`/consultations/${id}`, { status: newStatus });
      toast({ title: "Status diubah", description: `Status konsultasi: ${newStatus}` });
      loadConsultation();
    } catch (error: any) {
      toast({ title: "Gagal mengubah status", description: error.message, variant: "destructive" });
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const canAssign = (role === "ustad" || role === "admin") && consultation?.ustad_id === null && consultation?.status === "pending";
  const canChangeStatus = (role === "ustad" && consultation?.ustad_id === user?.id) || role === "admin";

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-background">
      {/* Header */}
      <div className="gradient-primary px-4 pt-12 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/konsultasi")} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-bold text-sm">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-primary-foreground font-semibold text-sm truncate">{otherName}</h2>
            <p className="text-primary-foreground/70 text-xs truncate">{consultation?.topic}</p>
          </div>
        </div>

        {/* Action bar for ustad/admin */}
        {(canAssign || canChangeStatus) && (
          <div className="flex items-center gap-2 mt-3">
            {canAssign && (
              <Button
                size="sm"
                variant="secondary"
                className="gap-1 text-xs"
                onClick={assignToMe}
                disabled={assigning}
              >
                <UserPlus className="w-3.5 h-3.5" />
                {assigning ? "..." : "Ambil Konsultasi"}
              </Button>
            )}
            {canChangeStatus && (
              <Select value={consultation?.status} onValueChange={changeStatus}>
                <SelectTrigger className="h-8 text-xs w-auto min-w-[120px] bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-xs py-8">
            Belum ada pesan. Mulai percakapan Anda.
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? "gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border text-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {consultation?.status !== "completed" && (
        <div className="border-t border-border px-4 py-3 shrink-0">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="min-h-[40px] max-h-[100px] resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="shrink-0 rounded-full w-9 h-9"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
