import React, { useState, useRef } from 'react';
import { Upload, X, Video, Music, File, Play, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabaseClient';

interface MediaFile {
  id: string;
  file: File;
  url?: string;
  type: 'video' | 'audio' | 'image';
  thumbnail?: string;
  progress?: number;
  error?: string;
  isUploading?: boolean;
}

interface MultiMediaUploadProps {
  onFilesChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
  userId?: string;
}

const MultiMediaUpload: React.FC<MultiMediaUploadProps> = ({
  onFilesChange,
  maxFiles = 5,
  acceptedTypes = ['video/*', 'audio/*', 'image/*'],
  className = "",
  userId
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'video' | 'audio' | 'image' => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image';
  };

  const generateThumbnail = (file: File, type: 'video' | 'audio' | 'image'): Promise<string> => {
    return new Promise((resolve) => {
      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else if (type === 'video') {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.onloadeddata = () => {
          try {
            video.currentTime = 1;
          } catch (e) {
            video.currentTime = 0;
          }
        };
        
        video.onseeked = () => {
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          }
        };
        
        video.onerror = () => {
          resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+');
        };
        
        video.src = URL.createObjectURL(file);
      } else {
        // Pour l'audio, utiliser une icône
        resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZWMTA0QzkwIDExMi4yODQgODMuMjg0MyAxMTkgNzUgMTE5QzY2LjcxNTcgMTE5IDYwIDExMi4yODQgNjAgMTA0VjU2QzYwIDQ3LjcxNTcgNjYuNzE1NyA0MSA3NSA0MVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+');
      }
    });
  };

  const uploadFile = async (file: MediaFile): Promise<string> => {
    if (!userId) {
      throw new Error('User ID is required for upload');
    }

    const type = file.type;
    let bucket: string;
    let filePath: string;

    // Déterminer le bucket et le chemin selon le type
    if (type === 'video') {
      bucket = 'user-videos';
      const fileExt = file.file.name.split('.').pop();
      filePath = `video_${userId}_${Date.now()}.${fileExt}`;
    } else {
      bucket = 'gallery';
      const sanitizedFileName = file.file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      filePath = `${userId}/${Date.now()}_${sanitizedFileName}`;
    }

    console.log(`[UPLOAD] Uploading ${type} to bucket: ${bucket}, path: ${filePath}`);

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file.file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.file.type,
    });

    if (uploadError) {
      console.error(`[UPLOAD] Upload error:`, uploadError);
      throw new Error(`Erreur d'upload: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    console.log(`[UPLOAD] Public URL:`, publicUrl);
    
    // Mettre à jour la base de données selon le type de fichier
    if (type === 'video') {
      await supabase.from('User').update({ galleryVideo: publicUrl }).eq('id', userId);
      console.log('[UPLOAD] Video URL saved to database');
    } else {
      // Pour les images, récupérer la galerie existante et ajouter la nouvelle image
      const { data: userData } = await supabase.from('User').select('galleryimages').eq('id', userId).single();
      const currentGallery = userData?.galleryimages || [];
      const updatedGallery = [...currentGallery, publicUrl];
      await supabase.from('User').update({ galleryimages: updatedGallery }).eq('id', userId);
      console.log('[UPLOAD] Image added to gallery in database');
    }
    
    return publicUrl;
  };

  const handleFiles = async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter(file => 
      acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      })
    );

    if (files.length + validFiles.length > maxFiles) {
      alert(`Vous ne pouvez uploader que ${maxFiles} fichiers maximum.`);
      return;
    }

    const newMediaFiles: MediaFile[] = await Promise.all(
      validFiles.map(async (file) => {
        const type = getFileType(file);
        const thumbnail = await generateThumbnail(file, type);
        
        return {
          id: `${Date.now()}_${Math.random()}`,
          file,
          type,
          thumbnail,
          progress: 0,
          isUploading: false
        };
      })
    );

    const updatedFiles = [...files, ...newMediaFiles];
    setFiles(updatedFiles);

    // Upload immédiat de chaque fichier
    for (const mediaFile of newMediaFiles) {
      const fileIndex = updatedFiles.findIndex(f => f.id === mediaFile.id);
      
      // Marquer comme en cours d'upload
      setFiles(prev => prev.map(f => 
        f.id === mediaFile.id ? { ...f, isUploading: true, progress: 0 } : f
      ));

      try {
        const publicUrl = await uploadFile(mediaFile);
        
        // Mettre à jour avec l'URL
        setFiles(prev => prev.map(f => 
          f.id === mediaFile.id ? { ...f, url: publicUrl, isUploading: false, progress: 100 } : f
        ));
        
        // Notifier le parent
        const finalFiles = files.map(f => 
          f.id === mediaFile.id ? { ...f, url: publicUrl, isUploading: false, progress: 100 } : f
        );
        onFilesChange(finalFiles);
        
      } catch (error: any) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === mediaFile.id ? { ...f, error: error.message, isUploading: false } : f
        ));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const getFileIcon = (type: 'video' | 'audio' | 'image') => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Glissez-déposez vos fichiers ici ou{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            cliquez pour sélectionner
          </button>
        </p>
        <p className="text-xs text-gray-500">
          Formats acceptés: vidéos, audio, images • Max {maxFiles} fichiers
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Fichiers sélectionnés ({files.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-200 rounded mb-2 overflow-hidden relative">
                  {file.isUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : file.error ? (
                    <div className="w-full h-full flex items-center justify-center bg-red-50">
                      <div className="text-center">
                        <X className="w-8 h-8 text-red-500 mx-auto mb-1" />
                        <p className="text-xs text-red-600">Erreur</p>
                      </div>
                    </div>
                  ) : file.type === 'video' && file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : file.type === 'audio' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-8 h-8 text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={file.thumbnail}
                      alt="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Indicateur de type */}
                  <div className="absolute top-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs flex items-center gap-1">
                    {getFileIcon(file.type)}
                    {file.type === 'video' ? 'Vidéo' : file.type === 'audio' ? 'Audio' : 'Image'}
                  </div>

                  {/* Indicateur de succès */}
                  {file.url && !file.isUploading && !file.error && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                      ✓ Uploadé
                    </div>
                  )}
                </div>

                {/* Infos fichier */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file.size)}
                  </p>
                  
                  {/* Progress bar si upload en cours */}
                  {file.progress !== undefined && file.progress < 100 && (
                    <Progress value={file.progress} className="h-1" />
                  )}
                  
                  {/* Erreur */}
                  {file.error && (
                    <p className="text-xs text-red-600">{file.error}</p>
                  )}
                </div>

                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiMediaUpload; 