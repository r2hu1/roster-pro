import { useRef, useState, useCallback } from 'react';

interface UseImageUploadProps {
  onChange?: (file: File | null) => void;
}

export function useImageUpload({ onChange }: UseImageUploadProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;

      if (!f) return;

      if (!f.type.startsWith('image/')) return;

      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      onChange?.(f);
    },
    [onChange],
  );

  const handleRemove = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange?.(null);
  }, [onChange]);

  return {
    file,
    previewUrl,
    fileName: file?.name ?? null,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  };
}
