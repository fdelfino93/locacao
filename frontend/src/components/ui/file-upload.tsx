import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // em MB
  onFileSelect: (file: File | null) => void;
  required?: boolean;
  currentFile?: File | string | null;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 5,
  onFileSelect,
  required = false,
  currentFile,
  error
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      setUploadStatus('error');
      return;
    }

    // Validar tipo
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''));
    
    if (fileExtension && !allowedExtensions.includes(fileExtension)) {
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    
    // Simular upload
    setTimeout(() => {
      setUploadStatus('success');
      onFileSelect(file);
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadStatus('idle');
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getFileName = () => {
    if (currentFile instanceof File) {
      return currentFile.name;
    }
    if (typeof currentFile === 'string') {
      return currentFile;
    }
    return null;
  };

  const hasFile = currentFile || uploadStatus === 'success';

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${error ? 'border-destructive bg-destructive/5' : ''}
          ${hasFile ? 'border-success bg-success/5' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          required={required}
        />

        {uploadStatus === 'uploading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Fazendo upload...</p>
          </motion.div>
        )}

        {uploadStatus === 'success' || hasFile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Check className="w-6 h-6 text-success" />
              <File className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {getFileName() || 'Arquivo selecionado'}
            </p>
            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
              >
                Trocar arquivo
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : uploadStatus === 'error' || error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive mb-2">
              {error || `Arquivo deve ser menor que ${maxSize}MB e nos formatos permitidos`}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
            >
              Tentar novamente
            </Button>
          </motion.div>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-foreground mb-1">
              Clique para selecionar ou arraste o arquivo aqui
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Formatos aceitos: {accept} (máx. {maxSize}MB)
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar arquivo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};