import { useState } from 'react';
import { ExternalBlob } from '@/backend';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

interface ImageGallerySliderProps {
  images: ExternalBlob[];
  title?: string;
}

const PLACEHOLDER = '/assets/generated/luxury-interior.dim_800x600.png';

export default function ImageGallerySlider({ images, title = 'Property' }: ImageGallerySliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-muted rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="w-12 h-12 mb-2 opacity-40" />
        <p className="text-sm">No photos available</p>
      </div>
    );
  }

  const prev = () => setActiveIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex(i => (i + 1) % images.length);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-muted">
        <img
          src={images[activeIndex].getDirectURL()}
          alt={`${title} - photo ${activeIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img
                src={img.getDirectURL()}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
