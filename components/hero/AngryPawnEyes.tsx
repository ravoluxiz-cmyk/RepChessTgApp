function setupTexture(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
  const texture = gl.createTexture()
  if (!texture) return null
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return texture
}

export function makeAngryEyesTexture(gl: WebGLRenderingContext, options: {
  iris: string
  pupil: string
  outline: string
  look: "left" | "right"
}) {
  const canvas = document.createElement("canvas")
  canvas.width = 384
  canvas.height = 128
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  const lookOffset = options.look === "right" ? 10 : -10

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.shadowColor = options.iris
  ctx.shadowBlur = 12

  drawEye(ctx, 86, 66, -0.17, lookOffset, options)
  drawEye(ctx, 244, 66, 0.17, lookOffset, options)

  return setupTexture(gl, canvas)
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tilt: number,
  pupilOffset: number,
  options: { iris: string; pupil: string; outline: string },
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(tilt)

  ctx.fillStyle = options.iris
  ctx.strokeStyle = options.outline
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(-56, -10)
  ctx.quadraticCurveTo(-22, -36, 56, -18)
  ctx.quadraticCurveTo(34, 24, -42, 24)
  ctx.quadraticCurveTo(-62, 10, -56, -10)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.fillStyle = options.pupil
  ctx.beginPath()
  ctx.ellipse(pupilOffset, 0, 13, 18, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = options.outline
  ctx.beginPath()
  ctx.moveTo(-66, -44)
  ctx.lineTo(66, -18)
  ctx.lineTo(61, -3)
  ctx.lineTo(-70, -28)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}
