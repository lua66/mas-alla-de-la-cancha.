/**
 * Image compression and upload utility for client-side blog media management.
 * Compresses uploaded images to a balanced resolution and quality so they can be
 * stored reliably in localStorage and loaded instantly on mobile and desktop.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export const compressImageFile = (
  file: File,
  maxDimension = 1200,
  quality = 0.82
): Promise<ProcessedImageResult> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo desde tu dispositivo.'));
    };

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('No se pudo decodificar la imagen seleccionada.'));
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el procesador de imágenes.'));
          return;
        }

        // Draw with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg
        let outputType = 'image/webp';
        let dataUrl = canvas.toDataURL(outputType, quality);

        // Fallback to jpeg if webp is not produced
        if (!dataUrl.startsWith('data:image/webp')) {
          outputType = 'image/jpeg';
          dataUrl = canvas.toDataURL(outputType, quality);
        }

        // Calculate approximate size in bytes from base64
        const stringLength = dataUrl.length - dataUrl.indexOf(',') - 1;
        const compressedSize = Math.round((stringLength * 3) / 4);

        resolve({
          dataUrl,
          originalName: file.name,
          originalSize: file.size,
          compressedSize,
          width,
          height
        });
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};
