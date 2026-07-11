import { useRef, useState, useCallback } from "react"

interface UseImageUploadProps {
  onChange?: (file: File | null) => void
  defaultPreview?: string | null
}

export function useImageUpload({
  onChange,
  defaultPreview,
}: UseImageUploadProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultPreview ?? null
  )

  const handleThumbnailClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null

      if (!f) return

      if (!f.type.startsWith("image/")) return

      setFile(f)
      setPreviewUrl(URL.createObjectURL(f))
      onChange?.(f)
    },
    [onChange]
  )

  const handleRemove = useCallback(() => {
    setFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onChange?.(null)
  }, [onChange])

  return {
    file,
    previewUrl,
    fileName: file?.name ?? null,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  }
}
