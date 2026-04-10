import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

const ServiceCard = ({ icon: Icon, title, description, onClick }: ServiceCardProps) => {
  return (
    <button
      onClick={onClick}
      className="glass-card rounded-xl p-4 text-left w-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
    </button>
  );
};

export default ServiceCard;
