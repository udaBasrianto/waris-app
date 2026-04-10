import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UstadCardProps {
  name: string;
  specialty: string;
  rating: number;
  consultations: number;
  available: boolean;
  onConsult?: () => void;
}

const UstadCard = ({ name, specialty, rating, consultations, available, onConsult }: UstadCardProps) => {
  return (
    <div className="glass-card rounded-xl p-4 flex gap-3 items-center">
      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-lg shrink-0">
        {name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-foreground truncate">{name}</h4>
        <p className="text-xs text-muted-foreground">{specialty}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-xs font-medium text-foreground">{rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">• {consultations} konsultasi</span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onConsult}
        disabled={!available}
        className="text-xs shrink-0"
      >
        {available ? "Konsultasi" : "Offline"}
      </Button>
    </div>
  );
};

export default UstadCard;
