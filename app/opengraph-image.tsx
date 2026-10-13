import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const runtime = "nodejs"
export const alt = "Rep Chess KRD — шахматы в Краснодаре. Шахматы — это люди."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
  const [font, photo, logo] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/benzin-brand-extrabold.ttf")),
    readFile(join(process.cwd(), "public/home/chess-evening.jpg")),
    readFile(join(process.cwd(), "public/home/rep-chess-krd-white.png")),
  ])
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", background: "#151515", color: "#fff", display: "flex", position: "relative", fontFamily: "Benzin", padding: 54 }}>
      {/* ImageResponse generates pixels server-side from native image elements. */}
      <img src={`data:image/jpeg;base64,${photo.toString("base64")}`} alt="" width={620} height={630} style={{ position: "absolute", right: 0, top: 0, objectFit: "cover", opacity: .32 }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, #151515 20%, transparent 100%)" }} />
      <div style={{ display: "flex", flexDirection: "column", position: "relative", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 25, marginBottom: 56 }}><div style={{ display: "flex" }}>
          <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="Rep Chess KRD" width={130} height={91} />
        </div><span style={{ fontSize: 21 }}>КРАСНОДАР</span></div>
        <div style={{ display: "flex", fontSize: 77, lineHeight: 1.2 }}>ШАХМАТЫ —</div>
        <div style={{ display: "flex", fontSize: 77, lineHeight: 1.2, alignItems: "center", gap: 19 }}><span>ЭТО</span><span style={{ background: "#fff200", color: "#151515", padding: "0 12px" }}>ЛЮДИ.</span></div>
        <div style={{ display: "flex", marginTop: 57, fontSize: 22 }}>ПРИЛОЖЕНИЕ + TELEGRAM + ЖИВЫЕ ВСТРЕЧИ</div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Benzin", data: font, weight: 700, style: "normal" }] },
  )
}
