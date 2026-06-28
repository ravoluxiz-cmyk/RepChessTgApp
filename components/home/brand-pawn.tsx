"use client"

import { useEffect, useRef } from "react"

type Mesh = {
  vertexCount: number
  position: WebGLBuffer
  normal: WebGLBuffer
}

type PlaneMesh = {
  vertexCount: number
  position: WebGLBuffer
  uv: WebGLBuffer
}

type Vec3 = [number, number, number]

const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uModel;
uniform mat4 uViewProj;
uniform mat3 uNormalMatrix;
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(uNormalMatrix * aNormal);
  gl_Position = uViewProj * world;
}
`

const FRAGMENT_SHADER = `
precision mediump float;
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 uColor;
uniform vec3 uLightA;
uniform vec3 uLightB;
uniform float uGloss;
void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vec3(0.0, 1.2, 8.5) - vWorld);
  float key = max(dot(normal, normalize(uLightA)), 0.0);
  float rim = pow(max(1.0 - dot(normal, viewDir), 0.0), 2.0);
  float fill = max(dot(normal, normalize(uLightB)), 0.0) * 0.28;
  vec3 halfDir = normalize(normalize(uLightA) + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 40.0) * uGloss;
  vec3 color = uColor * (0.26 + key * 0.78 + fill) + vec3(1.0) * spec + vec3(0.9, 0.03, 0.03) * rim * 0.18;
  gl_FragColor = vec4(color, 1.0);
}
`

const TEXT_VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec2 aUv;
uniform mat4 uModel;
uniform mat4 uViewProj;
varying vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = uViewProj * uModel * vec4(aPosition, 1.0);
}
`

const TEXT_FRAGMENT_SHADER = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uAlpha;
void main() {
  vec4 tex = texture2D(uTexture, vUv);
  gl_FragColor = vec4(tex.rgb, tex.a * uAlpha);
}
`

const mat4 = {
  identity() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
  },
  multiply(a: Float32Array, b: Float32Array) {
    const out = new Float32Array(16)
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        out[col * 4 + row] =
          a[0 * 4 + row] * b[col * 4 + 0] +
          a[1 * 4 + row] * b[col * 4 + 1] +
          a[2 * 4 + row] * b[col * 4 + 2] +
          a[3 * 4 + row] * b[col * 4 + 3]
      }
    }
    return out
  },
  perspective(fov: number, aspect: number, near: number, far: number) {
    const f = 1 / Math.tan(fov / 2)
    const nf = 1 / (near - far)
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0,
    ])
  },
  translate(x: number, y: number, z: number) {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1])
  },
  scale(value: number) {
    return new Float32Array([value, 0, 0, 0, 0, value, 0, 0, 0, 0, value, 0, 0, 0, 0, 1])
  },
  rotateX(angle: number) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1])
  },
  rotateY(angle: number) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1])
  },
  rotateZ(angle: number) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
  },
  lookAt(eye: Vec3, center: Vec3, up: Vec3) {
    const z = normalize([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]])
    const x = normalize(cross(up, z))
    const y = cross(z, x)
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
    ])
  },
}

function dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / length, v[1] / length, v[2] / length]
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment)
  if (!vertexShader || !fragmentShader) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

function createBuffer(gl: WebGLRenderingContext, data: Float32Array) {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error("WebGL buffer failed")
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  return buffer
}

function makePawnMesh(gl: WebGLRenderingContext): Mesh {
  const profile: Array<[number, number]> = [
    [-1.46, 0.9], [-1.36, 1.08], [-1.14, 1.12], [-0.96, 0.75],
    [-0.82, 0.43], [-0.5, 0.36], [0.12, 0.38], [0.36, 0.58],
    [0.52, 0.83], [0.68, 0.86], [0.84, 0.56], [1.0, 0.32],
    [1.12, 0.31], [1.25, 0.43], [1.43, 0.5], [1.61, 0.44],
    [1.76, 0.25], [1.84, 0.06],
  ]
  const segments = 64
  const positions: number[] = []
  const normals: number[] = []

  for (let i = 0; i < profile.length - 1; i += 1) {
    const [y0, r0] = profile[i]
    const [y1, r1] = profile[i + 1]
    const slope = (r1 - r0) / Math.max(y1 - y0, 0.001)
    for (let s = 0; s < segments; s += 1) {
      const a0 = (s / segments) * Math.PI * 2
      const a1 = ((s + 1) / segments) * Math.PI * 2
      const p0: Vec3 = [Math.cos(a0) * r0, y0, Math.sin(a0) * r0]
      const p1: Vec3 = [Math.cos(a1) * r0, y0, Math.sin(a1) * r0]
      const p2: Vec3 = [Math.cos(a1) * r1, y1, Math.sin(a1) * r1]
      const p3: Vec3 = [Math.cos(a0) * r1, y1, Math.sin(a0) * r1]
      const n0 = normalize([Math.cos(a0), -slope, Math.sin(a0)])
      const n1 = normalize([Math.cos(a1), -slope, Math.sin(a1)])
      positions.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3)
      normals.push(...n0, ...n1, ...n1, ...n0, ...n1, ...n0)
    }
  }

  return {
    vertexCount: positions.length / 3,
    position: createBuffer(gl, new Float32Array(positions)),
    normal: createBuffer(gl, new Float32Array(normals)),
  }
}

function makePlaneMesh(gl: WebGLRenderingContext, width: number, height: number): PlaneMesh {
  const x = width / 2
  const y = height / 2
  return {
    vertexCount: 6,
    position: createBuffer(gl, new Float32Array([-x, -y, 0, x, -y, 0, x, y, 0, -x, -y, 0, x, y, 0, -x, y, 0])),
    uv: createBuffer(gl, new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0])),
  }
}

function makeLabelTexture(gl: WebGLRenderingContext, text: string, red = "#ff1515") {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = red
  roundRect(ctx, 18, 22, 476, 84, 42)
  ctx.fill()
  ctx.fillStyle = "#f7f7f2"
  ctx.font = "900 44px Arial Black, Impact, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, 256, 66)

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

function makeEyeTexture(gl: WebGLRenderingContext, color: string) {
  const canvas = document.createElement("canvas")
  canvas.width = 128
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 18
  ctx.beginPath()
  ctx.moveTo(12, 14)
  ctx.lineTo(116, 31)
  ctx.lineTo(104, 50)
  ctx.lineTo(20, 36)
  ctx.closePath()
  ctx.fill()

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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

function modelMatrix(x: number, y: number, z: number, rotationY: number, rotationZ = 0, scale = 1) {
  return mat4.multiply(
    mat4.translate(x, y, z),
    mat4.multiply(mat4.rotateY(rotationY), mat4.multiply(mat4.rotateZ(rotationZ), mat4.scale(scale))),
  )
}

function normalMatrix(model: Float32Array) {
  return new Float32Array([model[0], model[1], model[2], model[4], model[5], model[6], model[8], model[9], model[10]])
}

export function BrandPawn() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || window.matchMedia("(max-width: 1023px)").matches) return

    const gl = canvas.getContext("webgl", { alpha: true, antialias: true })
    if (!gl) return

    const pawnProgram = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER)
    const textProgram = createProgram(gl, TEXT_VERTEX_SHADER, TEXT_FRAGMENT_SHADER)
    if (!pawnProgram || !textProgram) return

    const pawn = makePawnMesh(gl)
    const ribbonPlane = makePlaneMesh(gl, 1.52, 0.38)
    const eyePlane = makePlaneMesh(gl, 0.34, 0.11)
    const repTexture = makeLabelTexture(gl, "REP CHESS")
    const krdTexture = makeLabelTexture(gl, "KRD")
    const whiteEyeTexture = makeEyeTexture(gl, "#ff1515")
    const blackEyeTexture = makeEyeTexture(gl, "#fff200")

    const pawnLocations = {
      position: gl.getAttribLocation(pawnProgram, "aPosition"),
      normal: gl.getAttribLocation(pawnProgram, "aNormal"),
      model: gl.getUniformLocation(pawnProgram, "uModel"),
      viewProj: gl.getUniformLocation(pawnProgram, "uViewProj"),
      normalMatrix: gl.getUniformLocation(pawnProgram, "uNormalMatrix"),
      color: gl.getUniformLocation(pawnProgram, "uColor"),
      lightA: gl.getUniformLocation(pawnProgram, "uLightA"),
      lightB: gl.getUniformLocation(pawnProgram, "uLightB"),
      gloss: gl.getUniformLocation(pawnProgram, "uGloss"),
    }

    const textLocations = {
      position: gl.getAttribLocation(textProgram, "aPosition"),
      uv: gl.getAttribLocation(textProgram, "aUv"),
      model: gl.getUniformLocation(textProgram, "uModel"),
      viewProj: gl.getUniformLocation(textProgram, "uViewProj"),
      texture: gl.getUniformLocation(textProgram, "uTexture"),
      alpha: gl.getUniformLocation(textProgram, "uAlpha"),
    }

    let frame = 0
    let raf = 0
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(rect.width * ratio))
      canvas.height = Math.max(1, Math.floor(rect.height * ratio))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const bindMesh = () => {
      gl.bindBuffer(gl.ARRAY_BUFFER, pawn.position)
      gl.enableVertexAttribArray(pawnLocations.position)
      gl.vertexAttribPointer(pawnLocations.position, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, pawn.normal)
      gl.enableVertexAttribArray(pawnLocations.normal)
      gl.vertexAttribPointer(pawnLocations.normal, 3, gl.FLOAT, false, 0, 0)
    }

    const bindPlane = (mesh: PlaneMesh) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.position)
      gl.enableVertexAttribArray(textLocations.position)
      gl.vertexAttribPointer(textLocations.position, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uv)
      gl.enableVertexAttribArray(textLocations.uv)
      gl.vertexAttribPointer(textLocations.uv, 2, gl.FLOAT, false, 0, 0)
    }

    const drawPawn = (matrix: Float32Array, color: Vec3, gloss: number) => {
      gl.useProgram(pawnProgram)
      bindMesh()
      gl.uniformMatrix4fv(pawnLocations.model, false, matrix)
      gl.uniformMatrix3fv(pawnLocations.normalMatrix, false, normalMatrix(matrix))
      gl.uniform3fv(pawnLocations.color, color)
      gl.uniform1f(pawnLocations.gloss, gloss)
      gl.drawArrays(gl.TRIANGLES, 0, pawn.vertexCount)
    }

    const drawTexturedPlane = (mesh: PlaneMesh, matrix: Float32Array, texture: WebGLTexture | null, alpha = 1) => {
      if (!texture) return
      gl.useProgram(textProgram)
      bindPlane(mesh)
      gl.uniformMatrix4fv(textLocations.model, false, matrix)
      gl.uniform1f(textLocations.alpha, alpha)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(textLocations.texture, 0)
      gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount)
    }

    const render = () => {
      frame += reduceMotion ? 0 : 1
      const time = frame / 60
      const aspect = canvas.width / Math.max(canvas.height, 1)
      const projection = mat4.perspective(Math.PI / 4.8, aspect, 0.1, 100)
      const view = mat4.lookAt([0, 0.52, 7.4], [0, 0.1, 0], [0, 1, 0])
      const viewProj = mat4.multiply(projection, view)
      const anger = Math.sin(time * 1.15) * 0.06
      const hover = Math.sin(time * 1.05) * 0.08

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.enable(gl.DEPTH_TEST)
      gl.disable(gl.CULL_FACE)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      gl.useProgram(pawnProgram)
      gl.uniformMatrix4fv(pawnLocations.viewProj, false, viewProj)
      gl.uniform3fv(pawnLocations.lightA, [0.75, 1.2, 1.1])
      gl.uniform3fv(pawnLocations.lightB, [-1.0, 0.35, 0.6])

      const whiteModel = modelMatrix(-0.82, -0.08 + hover, 0, 0.52 + anger, -0.06, 0.98)
      const blackModel = modelMatrix(0.82, -0.08 - hover, 0, -0.52 - anger, 0.06, 0.98)
      drawPawn(whiteModel, [0.92, 0.88, 0.78], 0.78)
      drawPawn(blackModel, [0.015, 0.015, 0.017], 1.0)

      gl.useProgram(textProgram)
      gl.uniformMatrix4fv(textLocations.viewProj, false, viewProj)

      drawTexturedPlane(
        ribbonPlane,
        mat4.multiply(mat4.translate(-0.95, -0.24 + hover, 0.86), mat4.multiply(mat4.rotateY(0.4), mat4.rotateZ(-0.16))),
        repTexture,
      )
      drawTexturedPlane(
        ribbonPlane,
        mat4.multiply(mat4.translate(0.95, -0.24 - hover, 0.86), mat4.multiply(mat4.rotateY(-0.4), mat4.rotateZ(0.16))),
        krdTexture,
      )
      drawTexturedPlane(
        eyePlane,
        mat4.multiply(mat4.translate(-0.56, 1.48 + hover, 0.56), mat4.multiply(mat4.rotateY(0.42), mat4.rotateZ(-0.32))),
        whiteEyeTexture,
        0.9,
      )
      drawTexturedPlane(
        eyePlane,
        mat4.multiply(mat4.translate(0.56, 1.48 - hover, 0.56), mat4.multiply(mat4.rotateY(-0.42), mat4.rotateZ(0.32))),
        blackEyeTexture,
        0.95,
      )

      raf = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="brand-pawn-shell pointer-events-none relative hidden h-[360px] w-[330px] shrink-0 items-center justify-center lg:flex xl:h-[430px] xl:w-[410px]" aria-hidden="true">
      <div className="absolute inset-x-8 bottom-10 h-16 rounded-full bg-black/70 blur-2xl" />
      <canvas ref={canvasRef} className="brand-pawn-canvas brand-pawn relative z-10 h-full w-full" />
      <div className="absolute inset-0 rounded-full bg-[#ff1515]/10 blur-3xl" />
    </div>
  )
}
