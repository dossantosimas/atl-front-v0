"use client";

import type { Pictogram } from "@/lib/types/chemical-substances";

// Helper function to normalize image URL
function getPictogramImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // Si ya es una URL completa de API, blob o data, retornarla tal cual
  if (imageUrl.startsWith('/api/') || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Si tiene un path antiguo como /security/pic/..., extraer solo el filename
  if (imageUrl.includes('/')) {
    const filename = imageUrl.split('/').pop() || imageUrl;
    return `/api/pictogram/image/${filename}`;
  }
  
  // Si es solo el filename, construir la URL completa
  return `/api/pictogram/image/${imageUrl}`;
}

interface PictogramsDisplayProps {
  pictograms?: Pictogram[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PictogramsDisplay({
  pictograms = [],
  size = "md",
  className = "",
}: PictogramsDisplayProps) {
  if (!pictograms || pictograms.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {pictograms.map((pictogram) => (
        <div
          key={pictogram.id}
          className={`${sizeClasses[size]} rounded border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 flex-shrink-0`}
          title={pictogram.description || pictogram.name}
        >
          {pictogram.imageUrl ? (
            <img
              src={getPictogramImageUrl(pictogram.imageUrl) || ''}
              alt={pictogram.name}
              className="w-full h-full object-contain p-1"
              onLoad={() => {
                console.log("✅ PictogramDisplay - Imagen cargada:", {
                  originalUrl: pictogram.imageUrl,
                  finalUrl: getPictogramImageUrl(pictogram.imageUrl)
                });
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const finalUrl = getPictogramImageUrl(pictogram.imageUrl);
                console.error("❌ PictogramDisplay - Error al cargar:", {
                  originalUrl: pictogram.imageUrl,
                  finalUrl: finalUrl,
                  attemptedSrc: target.src,
                  name: pictogram.name,
                  currentSrc: target.currentSrc
                });
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs text-gray-400">${pictogram.name.charAt(0).toUpperCase()}</div>`;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 p-1">
              {pictogram.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

