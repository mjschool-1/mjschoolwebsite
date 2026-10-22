import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { ZoomIn, ZoomOut, X, Check, RefreshCw, Crop as CropIcon, RotateCcw } from 'lucide-react';

export interface StaffPhotoCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  staffName: string;
  onClose: () => void;
  onCropAndUpload: (croppedBlob: Blob, croppedDataUrl: string) => Promise<void>;
  isUploading?: boolean;
}

/**
 * Utility function to crop image on an HTML5 canvas and return a square 512x512 Blob
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputSize = 512
): Promise<{ blob: Blob; dataUrl: string }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw clean white background for non-opaque images
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, outputSize, outputSize);

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas generated an empty image'));
          return;
        }
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve({ blob, dataUrl });
      },
      'image/jpeg',
      0.92
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

export const StaffPhotoCropModal: React.FC<StaffPhotoCropModalProps> = ({
  isOpen,
  imageSrc,
  staffName,
  onClose,
  onCropAndUpload,
  isUploading = false,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Reset controls when modal opens with a new image
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setErrorMsg(null);
      setIsProcessing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, imageSrc]);

  // Keyboard navigation: Escape key closes modal if not currently uploading
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isUploading && !isProcessing) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUploading, isProcessing, onClose]);

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setErrorMsg('Please select a square crop area before saving.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);

      const { blob, dataUrl } = await getCroppedImg(imageSrc, croppedAreaPixels, 512);
      await onCropAndUpload(blob, dataUrl);
    } catch (err: any) {
      console.error('[StaffPhotoCropModal] Crop & Upload Error:', err);
      setErrorMsg(err.message || 'Failed to crop photograph. Please try another image.');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  if (!isOpen || !imageSrc) return null;

  const busy = isUploading || isProcessing;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
    >
      <div className="relative w-full max-w-xl bg-white border border-slate-700 shadow-2xl rounded-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0B2545] text-white px-5 py-4 flex items-center justify-between border-b border-[#C59B27]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#133E6E] border border-[#C59B27]/50 flex items-center justify-center text-[#F6D55C]">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 id="crop-modal-title" className="text-sm font-bold font-serif text-white leading-tight">
                Square Photograph Crop Editor
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5 truncate max-w-[280px] sm:max-w-md">
                Adjusting portrait for: <span className="text-[#F6D55C] font-semibold">{staffName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Cancel crop"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Cropper Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Interactive 1:1 Crop Viewport */}
          <div className="relative w-full h-72 sm:h-80 md:h-96 bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-700 shadow-inner">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteInternal}
            />

            {/* Visual badge overlay */}
            <div className="absolute top-3 left-3 pointer-events-none z-10">
              <span className="bg-[#0B2545]/90 backdrop-blur-xs text-[#F6D55C] text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border border-[#C59B27]/40 shadow-sm">
                1:1 Square (512 × 512 px)
              </span>
            </div>
          </div>

          {/* Zoom Control Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-600">
                <ZoomIn className="w-3.5 h-3.5 text-[#0B2545]" />
                Zoom &amp; Framing
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={busy || (zoom === 1 && crop.x === 0 && crop.y === 0)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-[#0B2545] disabled:opacity-40 cursor-pointer"
                  title="Reset zoom and position"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(1, prev - 0.2))}
                disabled={busy || zoom <= 1}
                className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                disabled={busy}
                className="w-full accent-[#0B2545] cursor-pointer"
                aria-label="Zoom slider"
              />
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
                disabled={busy || zoom >= 3}
                className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              Tip: Drag inside the frame to center the staff member's face. Scroll or use the slider to scale.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 text-center sm:text-left">
            Only the square crop will be saved and uploaded.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={busy}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-black uppercase tracking-wider text-[#0B2545] bg-[#C59B27] hover:bg-[#b58b19] rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {busy ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Crop &amp; Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
