export type Vec3 = [number, number, number]

export type PawnGeometry = {
  positions: Float32Array
  normals: Float32Array
  vertexCount: number
}

export type Mesh = {
  vertexCount: number
  position: WebGLBuffer
  normal: WebGLBuffer
}

export type PlaneMesh = {
  vertexCount: number
  position: WebGLBuffer
  uv: WebGLBuffer
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / length, v[1] / length, v[2] / length]
}

// In-house procedural low-poly pawn mesh. No external GLB asset is bundled.
// The same mesh is duplicated twice and recolored in the WebGL scene.
export function createPawnGeometry(): PawnGeometry {
  const profile: Array<[number, number]> = [
    [-1.46, 0.88], [-1.36, 1.08], [-1.14, 1.12], [-0.96, 0.74],
    [-0.82, 0.42], [-0.5, 0.34], [0.12, 0.36], [0.36, 0.56],
    [0.52, 0.81], [0.68, 0.84], [0.84, 0.54], [1.0, 0.3],
    [1.12, 0.3], [1.25, 0.42], [1.43, 0.49], [1.61, 0.43],
    [1.76, 0.24], [1.84, 0.05],
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
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    vertexCount: positions.length / 3,
  }
}

export function createBuffer(gl: WebGLRenderingContext, data: Float32Array) {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error("WebGL buffer failed")
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  return buffer
}

export function makePawnMesh(gl: WebGLRenderingContext): Mesh {
  const geometry = createPawnGeometry()
  return {
    vertexCount: geometry.vertexCount,
    position: createBuffer(gl, geometry.positions),
    normal: createBuffer(gl, geometry.normals),
  }
}

export function makePlaneMesh(gl: WebGLRenderingContext, width: number, height: number): PlaneMesh {
  const x = width / 2
  const y = height / 2
  return {
    vertexCount: 6,
    position: createBuffer(gl, new Float32Array([-x, -y, 0, x, -y, 0, x, y, 0, -x, -y, 0, x, y, 0, -x, y, 0])),
    uv: createBuffer(gl, new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0])),
  }
}
