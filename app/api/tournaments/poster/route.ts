import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin } from "@/lib/telegram"

const BUCKET = process.env.SUPABASE_TOURNAMENT_POSTERS_BUCKET || "tournament-posters"
const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

function getExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName

  if (file.type === "image/jpeg") return "jpg"
  if (file.type === "image/png") return "png"
  if (file.type === "image/webp") return "webp"
  if (file.type === "image/gif") return "gif"
  return "jpg"
}

async function ensurePosterBucket() {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
  if (listError) {
    console.error("Failed to list Supabase storage buckets:", listError)
    return false
  }

  if (buckets?.some((bucket) => bucket.name === BUCKET)) {
    return true
  }

  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: Array.from(ALLOWED_TYPES),
  })

  if (error) {
    console.error("Failed to create tournament posters bucket:", error)
    return false
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request.headers)
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл афиши обязателен" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Загрузите изображение JPG, PNG, WebP или GIF" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Файл слишком большой. Максимум 8 МБ" }, { status: 400 })
    }

    const bucketReady = await ensurePosterBucket()
    if (!bucketReady) {
      return NextResponse.json({ error: "Не удалось подготовить хранилище афиш" }, { status: 500 })
    }

    const extension = getExtension(file)
    const path = `posters/${Date.now()}-${crypto.randomUUID()}.${extension}`
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      })

    if (error || !data) {
      console.error("Failed to upload tournament poster:", error)
      return NextResponse.json({ error: "Не удалось загрузить афишу" }, { status: 500 })
    }

    const { data: publicData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path)
    return NextResponse.json({ url: publicData.publicUrl, path: data.path })
  } catch (error) {
    console.error("Tournament poster upload failed:", error)
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 })
  }
}
