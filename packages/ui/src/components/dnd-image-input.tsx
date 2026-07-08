import { ImagePlus, X, Upload, Trash2 } from "lucide-react"
import { useCallback, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { useImageUpload } from "@workspace/ui/hooks/use-image-upload"

import { cn } from "@workspace/ui/lib/utils"

export function DnDImageInput({
  onChange,
  previewClassName,
  className,
  defaultPreview,
}: {
  onChange?: (file: File | null) => void
  className?: string
  previewClassName?: string
  defaultPreview?: string | null
}) {
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload({ onChange, defaultPreview })

  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file?.type.startsWith("image/")) {
        const fakeEvent = {
          target: {
            files: [file],
          },
        } as any
        handleFileChange(fakeEvent)
      }
    },
    [handleFileChange]
  )

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div
          onClick={handleThumbnailClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-muted-foreground/25 bg-muted/50 hover:bg-muted flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-4 transition-colors",
            isDragging && "border-primary/50 bg-primary/5",
            className
          )}
        >
          <div className="bg-background rounded-full p-3 shadow-sm">
            <ImagePlus className="text-muted-foreground size-4" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium sm:text-sm">Click to select</p>
            <p className="text-muted-foreground text-xs">
              or drag and drop file here
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div
            className={cn(
              "group relative h-52 overflow-hidden rounded-lg border",
              previewClassName
            )}
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleThumbnailClick}
                className="h-9 w-9 p-0"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {fileName && (
            <div className="text-muted-foreground mt-2 flex w-fit max-w-xs items-center gap-2 text-sm">
              <span className="truncate">{fileName}</span>
              <button
                type="button"
                onClick={handleRemove}
                className="hover:bg-muted ml-auto rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
