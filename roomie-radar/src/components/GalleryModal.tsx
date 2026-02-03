import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

type GalleryModalProps = {
  images: string[];
  startIndex?: number;
  onClose: () => void;
};

const GalleryModal = ({ images, startIndex = 0, onClose }: GalleryModalProps) => {
  const [index, setIndex] = useState(startIndex);

  const showPrev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);
  const showNext = () => setIndex((prev) => (prev + 1) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="relative w-full max-w-5xl">
            <motion.img
              key={index}
              src={images[index]}
              alt={`gallery-${index + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-xl border border-white/20 shadow-2xl"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            />

            <button
              onClick={onClose}
              className="absolute -top-10 right-0 text-white/90 hover:text-white"
              aria-label="Close gallery"
            >
              ✕
            </button>

            <button
              onClick={showPrev}
              className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-8 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={showNext}
              className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-8 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
              aria-label="Next image"
            >
              ›
            </button>

            <div className="mt-4 grid grid-cols-6 md:grid-cols-8 gap-2">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setIndex(i)}
                  className={`h-16 rounded-lg overflow-hidden border ${i === index ? 'border-white ring-2 ring-white/70' : 'border-white/30'}`}
                  aria-label={`Go to image ${i + 1}`}
                >
                  <img src={img} alt={`thumb-${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default GalleryModal;



