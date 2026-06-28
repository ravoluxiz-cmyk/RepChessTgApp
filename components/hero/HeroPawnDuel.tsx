"use client"

import { useEffect, useRef, useState } from "react"
import { makeAngryEyesTexture } from "./AngryPawnEyes"
import { HeroPawnDuelFallback } from "./HeroPawnDuelFallback"
import { makePawnMesh, makePlaneMesh, type Mesh, type PlaneMesh, type Vec3 } from "./PawnModel"

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
  vec3 viewDir = normalize(vec3(0.0, 1.2, 8.0) - vWorld);
  float key = max(dot(normal, normalize(uLightA)), 0.0);
  float rim = pow(max(1.0 - dot(normal, viewDir), 0.0), 2.0);
  float fill = max(dot(normal, normalize(uLightB)), 0.0) * 0.26;
  vec3 halfDir = normalize(normalize(uLightA) + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 42.0) * uGloss;
  vec3 color = uColor * (0.27 + key * 0.76 + fill) + vec3(1.0) * spec + vec3(0.95, 0.02, 0.02) * rim * 0.16;
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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

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

function makeLabelTexture(gl: WebGLRenderingContext, text: string) {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#ff1515"
  roundRect(ctx, 18, 22, 476, 84, 42)
  ctx.fill()
  ctx.fillStyle = "#f7f7f2"
  ctx.font = "900 44px Arial Black, Impact, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, 256, 66)
  return setupTexture(gl, canvas)
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

function bindPawnMesh(gl: WebGLRenderingContext, mesh: Mesh, position: number, normal: number) {
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.position)
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normal)
  gl.enableVertexAttribArray(normal)
  gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 0, 0)
}

function bindPlaneMesh(gl: WebGLRenderingContext, mesh: PlaneMesh, position: number, uv: number) {
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.position)
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uv)
  gl.enableVertexAttribArray(uv)
  gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0)
}

export default function HeroPawnDuel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || window.matchMedia("(max-width: 767px)").matches) return

    const gl = canvas.getContext("webgl", { alpha: true, antialias: true })
    if (!gl) {
      setFailed(true)
      return
    }

    const pawnProgram = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER)
    const textProgram = createProgram(gl, TEXT_VERTEX_SHADER, TEXT_FRAGMENT_SHADER)
    if (!pawnProgram || !textProgram) {
      setFailed(true)
      return
    }

    const pawn = makePawnMesh(gl)
    const labelPlane = makePlaneMesh(gl, 1.36, 0.34)
    const eyesPlane = makePlaneMesh(gl, 0.64, 0.22)
    const repTexture = makeLabelTexture(gl, "REP CHESS")
    const krdTexture = makeLabelTexture(gl, "KRD")
    const badgeTexture = makeLabelTexture(gl, "REP CHESS KRD")
    const whiteEyesTexture = makeAngryEyesTexture(gl, {
      iris: "#151515",
      pupil: "#ff1515",
      outline: "#f7f7f2",
      look: "right",
    })
    const blackEyesTexture = makeAngryEyesTexture(gl, {
      iris: "#fff200",
      pupil: "#151515",
      outline: "#ff1515",
      look: "left",
    })

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

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    let raf = 0

    const onPointerMove = (event: PointerEvent) => {
      if (reduceMotion) return
      pointerRef.current = {
        x: Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2)),
        y: Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2)),
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(rect.width * ratio))
      canvas.height = Math.max(1, Math.floor(rect.height * ratio))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    resize()

    const drawPawn = (matrix: Float32Array, color: Vec3, gloss: number) => {
      gl.useProgram(pawnProgram)
      bindPawnMesh(gl, pawn, pawnLocations.position, pawnLocations.normal)
      gl.uniformMatrix4fv(pawnLocations.model, false, matrix)
      gl.uniformMatrix3fv(pawnLocations.normalMatrix, false, normalMatrix(matrix))
      gl.uniform3fv(pawnLocations.color, color)
      gl.uniform1f(pawnLocations.gloss, gloss)
      gl.drawArrays(gl.TRIANGLES, 0, pawn.vertexCount)
    }

    const drawPlane = (mesh: PlaneMesh, matrix: Float32Array, texture: WebGLTexture | null, alpha = 1) => {
      if (!texture) return
      gl.useProgram(textProgram)
      bindPlaneMesh(gl, mesh, textLocations.position, textLocations.uv)
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
      const pointer = reduceMotion ? { x: 0, y: 0 } : pointerRef.current
      const aspect = canvas.width / Math.max(canvas.height, 1)
      const projection = mat4.perspective(Math.PI / 4.8, aspect, 0.1, 100)
      const view = mat4.lookAt(
        [pointer.x * 0.22, 0.56 + pointer.y * 0.08, 7.25],
        [pointer.x * 0.08, 0.1 + pointer.y * 0.04, 0],
        [0, 1, 0],
      )
      const viewProj = mat4.multiply(projection, view)
      const breath = Math.sin(time * 1.05) * 0.035
      const challenge = Math.sin(time * 0.92) * 0.035
      const twitch = Math.max(0, Math.sin(time * 1.55)) ** 18 * 0.045

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.enable(gl.DEPTH_TEST)
      gl.disable(gl.CULL_FACE)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      gl.useProgram(pawnProgram)
      gl.uniformMatrix4fv(pawnLocations.viewProj, false, viewProj)
      gl.uniform3fv(pawnLocations.lightA, [-0.72, 1.24, 1.04])
      gl.uniform3fv(pawnLocations.lightB, [0.9, 0.32, 0.55])

      const whiteModel = modelMatrix(-0.65, -0.15 + breath, 0, 0.35 + challenge, -0.04, 1)
      const blackModel = modelMatrix(0.65, -0.15 - breath, 0, -0.35 - challenge, 0.04, 1)
      drawPawn(whiteModel, [0.86, 0.82, 0.72], 0.7)
      drawPawn(blackModel, [0.035, 0.036, 0.04], 0.95)

      gl.useProgram(textProgram)
      gl.uniformMatrix4fv(textLocations.viewProj, false, viewProj)

      drawPlane(
        labelPlane,
        mat4.multiply(mat4.translate(-0.73, -0.45 + breath, 0.9), mat4.multiply(mat4.rotateY(0.31), mat4.rotateZ(-0.08))),
        repTexture,
      )
      drawPlane(
        labelPlane,
        mat4.multiply(mat4.translate(0.73, -0.45 - breath, 0.9), mat4.multiply(mat4.rotateY(-0.31), mat4.rotateZ(0.08))),
        krdTexture,
      )
      drawPlane(
        eyesPlane,
        mat4.multiply(mat4.translate(-0.43, 1.41 + breath, 0.62 + twitch), mat4.multiply(mat4.rotateY(0.35), mat4.rotateZ(-0.06))),
        whiteEyesTexture,
        0.98,
      )
      drawPlane(
        eyesPlane,
        mat4.multiply(mat4.translate(0.43, 1.41 - breath, 0.62 + twitch), mat4.multiply(mat4.rotateY(-0.35), mat4.rotateZ(0.06))),
        blackEyesTexture,
        0.98,
      )
      drawPlane(
        labelPlane,
        mat4.multiply(mat4.translate(0, -1.55, 0.25), mat4.rotateZ(0)),
        badgeTexture,
        0.75,
      )

      raf = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener("pointermove", onPointerMove)
    }
  }, [])

  if (failed) {
    return <HeroPawnDuelFallback />
  }

  return (
    <div className="pawn-duel-shell" aria-hidden="true">
      <HeroPawnDuelFallback />
      <canvas ref={canvasRef} className="pawn-duel-canvas" />
      <div className="pawn-duel-red-glow" />
    </div>
  )
}
