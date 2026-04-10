import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";

interface SliderData {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  active: boolean;
  sort_order: number;
}

const HeroSlider = () => {
  const [sliders, setSliders] = useState<SliderData[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const data = await api.get<SliderData[]>("/sliders");
        setSliders(data);
      } catch {
        // silently fail
      }
    };
    fetchSliders();
  }, []);

  // Auto-slide every 5 seconds
  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % sliders.length);
  }, [sliders.length]);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, sliders.length]);

  const prev = () => {
    setCurrent((p) => (p - 1 + sliders.length) % sliders.length);
  };

  if (sliders.length === 0) return null;

  const slide = sliders[current];

  return (
    <div className="px-5 mt-4">
      <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/7]">
        {/* Slide Image */}
        <img
          src={slide.image_url}
          alt={slide.title}
          className="w-full h-full object-cover transition-all duration-500"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Text */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-sm leading-tight mb-1">{slide.title}</h3>
          {slide.description && (
            <p className="text-white/80 text-xs line-clamp-2">{slide.description}</p>
          )}
        </div>

        {/* Navigation Arrows */}
        {sliders.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        {/* Dots */}
        {sliders.length > 1 && (
          <div className="absolute bottom-1.5 right-3 flex gap-1">
            {sliders.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === current ? "bg-white w-4" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Clickable overlay link */}
        {slide.link_url && (
          <a
            href={slide.link_url}
            className="absolute inset-0 z-10"
            target={slide.link_url.startsWith("http") ? "_blank" : "_self"}
            rel="noopener noreferrer"
          />
        )}
      </div>
    </div>
  );
};

export default HeroSlider;
