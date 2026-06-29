"use client"

import { useRef, useState, type ChangeEvent, type CSSProperties } from "react"
import { ImageIcon, Loader2, Upload, X } from "lucide-react"

interface ImageUploadFieldProps {
  value: string
  onChange: (value: string) => void
  endpoint: string
  authHeader?: string
  inputClassName: string
  labelClassName: string
  label?: string
  helpText?: string
  previewAlt?: string
  previewClassName?: string
  previewStyle?: CSSProperties
}

export function ImageUploadField({
  value,
  onChange,
  endpoint,
  authHeader,
  inputClassName,
  labelClassName,
  label = "Изображение",
  helpText = "JPG, PNG, WebP или GIF до 8 МБ. Можно также вставить прямую ссылку ниже.",
  previewAlt = "Изображение",
  previewClassName = "aspect-[16/9] w-full object-cover",
  previewStyle,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function uploadFile(file: File) {
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: authHeader ? { Authorization: authHeader } : undefined,
        body: formData,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Не удалось загрузить изображение")
      }

      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить изображение")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="space-y-3">
      <label className={labelClassName}>{label}</label>

      {value && (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={previewAlt} className={previewClassName} style={previewStyle} />
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-50 transition hover:bg-emerald-500/30 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Загрузка..." : "Загрузить фото"}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
            Убрать
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-start gap-2 text-xs text-white/50">
        <ImageIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{helpText}</span>
      </div>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
        placeholder="https://..."
        type="url"
      />

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      )}
    </div>
  )
}
