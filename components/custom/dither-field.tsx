"use client"

/*
 * Drifting Bayer-dithered wave bands on the shared Atelier canvas.
 *
 * Adapted from a standalone dither-wave background: instead of its own
 * WebGL context it is a DOM-aligned plane in the WebglProvider scene, and
 * instead of one blue-on-paper tone it dithers our palette over ink, with
 * neighbouring palette colours are dithered against each other, two-ink
 * riso style, so the field stays saturated.
 *
 * Readability comes from "calm zones": any descendant marked `data-calm`
 * is measured, and the field dithers out to plain paper inside its box,
 * easing back in over `feather` pixels. Text gets its own clearing that
 * follows the layout, rather than a hardcoded band.
 * `data-calm="24"` adds 24px of padding around that element's box.
 */

import { useFrame } from "@react-three/fiber"
import { type ReactNode, type RefObject, useLayoutEffect, useMemo, useRef } from "react"
import { Color, type Mesh, Vector2, Vector3, Vector4 } from "three"
import { useDomPlane } from "../../hooks/use-dom-plane"
import { webglTeleport } from "../webgl-portal/webgl-portal"

const MAX_ZONES = 8

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uCell;
uniform float uTime;
uniform float uBias;
uniform float uFeather;
uniform vec3 uMouse;
uniform vec3 uPaper;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec4 uZones[${MAX_ZONES}];

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

float sdBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
    // Work per dither cell so every value is constant across a pixel block.
    vec2 px = vUv * uRes;
    vec2 cell = floor(px / uCell);
    vec2 cpx = (cell + 0.5) * uCell;
    vec2 uv = cpx / uRes;
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = vec2(uv.x * aspect, uv.y);

    // Pointer gently swirls the field.
    if (uMouse.z > 0.001) {
        vec2 dm = p - vec2(uMouse.x * aspect, uMouse.y);
        p += dm * exp(-dot(dm, dm) * 10.0) * 0.28 * uMouse.z;
    }

    float t = uTime;

    // Density: two slow crossing waves, like the original.
    float v = uBias
        + 0.22 * sin(dot(p, normalize(vec2(0.55, 1.0))) * 5.2 - t * 0.11)
        + 0.14 * sin(dot(p, normalize(vec2(1.0, 0.28))) * 8.4 + t * 0.07)
        + 0.08 * sin(length(p - vec2(aspect * 0.5, 0.5)) * 11.0 - t * 0.2);

    float threshold = bayer8(cell);

    // Colour: walk around the palette ring (lime > sky > lilac > pink) and
    // dither between neighbouring inks, like a two-ink riso gradient.
    // The density waves push the position so they still read as bands.
    float z = (sin(p.x * 1.4 + t * 0.035) + sin(p.y * 2.1 - t * 0.03) + sin((p.x + p.y) * 0.9 + t * 0.02)) / 3.0;
    float g = (z * 0.5 + 0.5) * 3.0 + v * 1.1 + t * 0.015;
    float i0 = mod(floor(g), 4.0);
    float i1 = mod(i0 + 1.0, 4.0);
    vec3 a = i0 < 0.5 ? uC0 : i0 < 1.5 ? uC1 : i0 < 2.5 ? uC2 : uC3;
    vec3 b = i1 < 0.5 ? uC0 : i1 < 1.5 ? uC1 : i1 < 2.5 ? uC2 : uC3;
    vec3 col = fract(g) > threshold ? b : a;

    // Calm zones: dither out to paper around each text box over a long
    // feather, with a gentle ease so the dots thin out gradually.
    float calm = 0.0;
    for (int i = 0; i < ${MAX_ZONES}; i++) {
        vec4 zn = uZones[i];
        float d = sdBox(cpx - zn.xy, zn.zw, 24.0);
        float k = 1.0 - clamp(d / uFeather, 0.0, 1.0);
        k = k * k * (3.0 - 2.0 * k);
        calm = max(calm, k);
    }
    col = calm > threshold ? uPaper : col;

    gl_FragColor = vec4(col, 1.0);
}
`

// three stores Color in linear space; this raw shader writes to an sRGB
// canvas, so pass sRGB values to get the exact hex on screen.
const srgb = (hex: string) => new Color(hex).convertLinearToSRGB()

type DitherFieldProps = {
    children?: ReactNode
    className?: string
    colors?: [string, string, string, string]
    /** Dither pixel size in CSS px. */
    pixelSize?: number
    /** Overall density, 0..1. */
    density?: number
    /** How far, in CSS px, the dither eases back in around a calm zone. */
    feather?: number
    speed?: number
    zIndex?: number
}

export function DitherField({
    children,
    className,
    colors = ["#dcf26b", "#8fd3ff", "#c9a2ff", "#ff5fae"],
    pixelSize = 5,
    density = 0.55,
    feather = 420,
    speed = 1,
    zIndex = 0,
}: DitherFieldProps) {
    const ref = useRef<HTMLDivElement>(null)
    return (
        <div ref={ref} className={className}>
            <webglTeleport.In>
                <FieldPlane
                    key={colors.join()}
                    el={ref}
                    colors={colors}
                    pixelSize={pixelSize}
                    density={density}
                    feather={feather}
                    speed={speed}
                    zIndex={zIndex}
                />
            </webglTeleport.In>
            {children}
        </div>
    )
}

function FieldPlane({
    el,
    colors,
    pixelSize,
    density,
    feather,
    speed,
    zIndex,
}: {
    el: RefObject<HTMLDivElement | null>
    colors: string[]
    pixelSize: number
    density: number
    feather: number
    speed: number
    zIndex: number
}) {
    const mesh = useRef<Mesh>(null)
    const measure = useDomPlane(el, mesh, { autoReflow: false })
    const target = useRef({ x: 0.5, y: 0.5, on: 0 })

    const uniforms = useMemo(
        () => ({
            uRes: { value: new Vector2(1, 1) },
            uCell: { value: pixelSize },
            uTime: { value: 0 },
            uBias: { value: density },
            uFeather: { value: feather },
            uMouse: { value: new Vector3(0.5, 0.5, 0) },
            uPaper: { value: srgb("#ece9e1") },
            uC0: { value: srgb(colors[0]) },
            uC1: { value: srgb(colors[1]) },
            uC2: { value: srgb(colors[2]) },
            uC3: { value: srgb(colors[3]) },
            uZones: { value: Array.from({ length: MAX_ZONES }, () => new Vector4(-1e5, -1e5, 0, 0)) },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )
    uniforms.uCell.value = pixelSize
    uniforms.uBias.value = density
    uniforms.uFeather.value = feather

    useLayoutEffect(() => {
        const host = el.current
        if (!host) return

        const update = () => {
            const rect = measure()
            if (!rect) return
            uniforms.uRes.value.set(rect.width, rect.height)

            // Calm zones in host-local px, y up (matches vUv * uRes).
            const zones = Array.from(host.querySelectorAll<HTMLElement>("[data-calm]")).slice(0, MAX_ZONES)
            zones.forEach((z, i) => {
                const r = z.getBoundingClientRect()
                const pad = Number(z.dataset.calm) || 0
                const cx = r.left - rect.left + r.width / 2
                const cy = rect.height - (r.top - rect.top + r.height / 2)
                uniforms.uZones.value[i].set(cx, cy, r.width / 2 + pad, r.height / 2 + pad)
            })
            // Park unused slots far off-canvas.
            for (let i = zones.length; i < MAX_ZONES; i++) uniforms.uZones.value[i].set(-1e5, -1e5, 0, 0)
        }

        update()
        const ro = new ResizeObserver(update)
        ro.observe(host)
        ro.observe(document.body)
        host.querySelectorAll("[data-calm]").forEach((z) => ro.observe(z))
        document.fonts?.ready.then(update)

        const onMove = (e: PointerEvent) => {
            if (e.pointerType === "touch") return
            const r = host.getBoundingClientRect()
            const x = (e.clientX - r.left) / r.width
            const y = 1 - (e.clientY - r.top) / r.height
            target.current.on = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? 1 : 0
            target.current.x = x
            target.current.y = y
        }
        window.addEventListener("pointermove", onMove, { passive: true })
        return () => {
            ro.disconnect()
            window.removeEventListener("pointermove", onMove)
        }
    }, [el, measure, uniforms])

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.05)
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (!reduced) uniforms.uTime.value += dt * speed
        const m = uniforms.uMouse.value
        const k = 1 - Math.exp(-dt * 6) // ~power3.out feel
        m.x += (target.current.x - m.x) * k
        m.y += (target.current.y - m.y) * k
        m.z += (target.current.on - m.z) * (1 - Math.exp(-dt * (target.current.on ? 4 : 2.5)))
    })

    return (
        <mesh ref={mesh} renderOrder={zIndex}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={uniforms}
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    )
}
