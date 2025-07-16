import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './button';
import { X, RotateCw, Check, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  title?: string;
}

export default function ImageCropper({
  imageFile,
  onCropComplete,
  onCancel,
  title = 'Recadrer votre photo de profil'
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const imageUrl = URL.createObjectURL(imageFile);

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      alert('Veuillez ajuster l\'image avant de sauvegarder');
      return;
    }

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error('Erreur lors du recadrage:', error);
      alert('Erreur lors du recadrage de l\'image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="flex items-center gap-1"
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="flex items-center gap-1"
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="flex items-center gap-1"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Crop Area */}
        <div className="p-6">
          <div className="flex flex-col items-center">
            {/* Cropper Container */}
            <div className="relative w-full max-w-md h-80 bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                showGrid={false}
                objectFit="horizontal-cover"
                style={{
                  containerStyle: {
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f3f4f6'
                  },
                  cropAreaStyle: {
                    border: '2px solid white',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }
                }}
              />
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center text-gray-600 max-w-md">
              <p className="text-sm">
                Déplacez et redimensionnez l'image pour cadrer votre photo de profil
              </p>
              <p className="text-xs mt-2 text-gray-500">
                Utilisez les boutons pour zoomer, faire pivoter ou réinitialiser
              </p>
            </div>

            {/* Preview */}
            {croppedAreaPixels && (
              <div className="mt-6 text-center">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Aperçu</h3>
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 mx-auto">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg) translate(${crop.x}%, ${crop.y}%)`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!croppedAreaPixels || isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 