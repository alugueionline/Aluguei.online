"use client";

import React, { useRef } from 'react';
import { Camera, Loader2, X, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface PhotoStepProps {
  imageUrl: string;
  isUploading: boolean;
  setIsUploading: (v: boolean) => void;
  onChange: (url: string) => void;
}

export const PhotoStep = ({ imageUrl, isUploading, setIsUploading, onChange }: PhotoStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `property-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      showSuccess('Foto carregada com sucesso!');
    } catch (error: any) {
      showError('Erro ao carregar foto: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center justify-center">
        <div className="relative group">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full aspect-video md:w-[500px] rounded-[2.5rem] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center transition-all group-hover:border-blue-400 group-hover:bg-blue-50/30 cursor-pointer",
              imageUrl && "border-none"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm font-bold text-blue-600">Enviando arquivo...</p>
              </div>
            ) : imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm font-black text-slate-400 group-hover:text-blue-600">Clique para selecionar foto</p>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Galeria ou Computador</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload} 
          />
          {imageUrl && !isUploading && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-red-500 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="w-full max-w-[500px] mt-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ou use um link externo</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>
          <div className="relative">
            <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <Input 
              placeholder="https://exemplo.com/foto.jpg" 
              value={imageUrl}
              onChange={e => onChange(e.target.value)}
              className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};