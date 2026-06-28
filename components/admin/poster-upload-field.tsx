"use client"

import { ImageUploadField } from "./image-upload-field"

interface PosterUploadFieldProps {
  value: string
  onChange: (value: string) => void
  authHeader?: string
  inputClassName: string
  labelClassName: string
}

export function PosterUploadField({
  value,
  onChange,
  authHeader,
  inputClassName,
  labelClassName,
}: PosterUploadFieldProps) {
  return (
    <ImageUploadField
      value={value}
      onChange={onChange}
      endpoint="/api/tournaments/poster"
      authHeader={authHeader}
      inputClassName={inputClassName}
      labelClassName={labelClassName}
      label="Афиша"
      previewAlt="Афиша турнира"
    />
  )
}
