"use client"

/*
 * Hand-built stand-in for Atelier's pro Gradient Flow (with its dither option).
 * A DOM-aligned plane on the shared canvas: domain-warped palette flow,
 * chrome streaks lifted from the logo, then an 8x8 Bayer ordered dither
 * that also dissolves the flow into ink behind the type. Because it lives on the shared
 * canvas, FluidDistortion bends it too.
 */

import { useFrame } from "@react-three/fiber"
import { type RefObject, useLayoutEffect, useMemo, useRef } from "react"
import { Color, type Mesh, type ShaderMaterial, Vector2 } from "three"
import { useDomPlane } from "../../hooks/use-dom-plane"
import { webglTeleport } from "../webgl-portal/webgl-portal"

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
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uHover;
uniform float uDot;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uInk;
uniform float uFade;
uniform float uFadeEdge;
uniform float uFadeWidth;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}
float fbm(vec2 p) {
    float f = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { f += a * snoise(p); p *= 2.02; a *= 0.5; }
    return f;
}
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec3 palette(float t) {
    t = fract(t);
    if (t < 0.25) return mix(uC0, uC1, smoothstep(0.0, 0.25, t));
    if (t < 0.5)  return mix(uC1, uC2, smoothstep(0.25, 0.5, t));
    if (t < 0.75) return mix(uC2, uC3, smoothstep(0.5, 0.75, t));
    return mix(uC3, uC0, smoothstep(0.75, 1.0, t));
}

void main() {
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = vUv; p.x *= aspect;
    vec2 m = uMouse; m.x *= aspect;
    float t = uTime * 0.04;

    float md = distance(p, m);
    float pull = exp(-md * 3.2) * uHover;

    vec2 q = vec2(fbm(p * 0.55 + t), fbm(p * 0.55 - t + 4.1));
    vec2 r = vec2(fbm(p * 0.7 + 1.6 * q + vec2(1.7, 9.2) + t * 1.4),
                  fbm(p * 0.7 + 1.6 * q + vec2(8.3, 2.8) - t));
    r += (p - m) * pull * 0.9;
    float f = fbm(p * 0.6 + 1.8 * r);

    vec3 col = palette(f * 0.9 + q.x * 0.35 + t * 0.6);

    // chrome streaks, like the logo's liquid metal
    float band = abs(sin((f + r.y) * 5.0 + uTime * 0.35));
    float streak = pow(1.0 - band, 22.0);
    col = mix(col, vec3(1.0), streak * 0.6);
    col = mix(col, uInk, pow(band, 60.0) * 0.55);

    // cursor glow
    col += vec3(1.0, 0.98, 0.9) * exp(-md * 9.0) * 0.25 * uHover;

    // Ordered (Bayer 8x8) dither on a chunky pixel grid. Pixels get
    // coarser around the cursor.
    float pixel = uDot * (1.0 + pull * 1.2);
    vec2 cellId = floor(vUv * uRes / pixel);
    float threshold = bayer8(cellId);

    // Posterize the palette through the dither, a few levels per channel.
    float levels = 5.0;
    col = floor(col * levels + threshold) / levels;

    // Readability: dither-dissolve into ink wherever type sits
    // (bottom band, plus a thin strip under the nav).
    float edge = uFadeEdge + fbm(vec2(vUv.x * 1.5, uTime * 0.05)) * 0.05;
    float fade = smoothstep(edge, edge - uFadeWidth, vUv.y) * uFade;
    float top = smoothstep(0.88, 1.0, vUv.y) * uFade * 0.9;
    float amt = max(fade, top);
    col = mix(col, uInk, step(threshold, amt * 1.02));

    gl_FragColor = vec4(col, 1.0);
}
`

type ChromeFlowProps = {
    className?: string
    colors?: [string, string, string, string]
    dotSize?: number
    zIndex?: number
    /** 0 = no readability fade, 1 = full. */
    fade?: number
    /** vUv.y where the ink fade starts (1 = top of the element). */
    fadeEdge?: number
    fadeWidth?: number
}

export function ChromeFlow({
    className,
    colors = ["#dcf26b", "#c9a2ff", "#ff5fae", "#8fd3ff"],
    dotSize = 4,
    zIndex = 0,
    fade = 1,
    fadeEdge = 0.48,
    fadeWidth = 0.3,
}: ChromeFlowProps) {
    const ref = useRef<HTMLDivElement>(null)
    const key = colors.join()
    return (
        <div ref={ref} className={className} aria-hidden>
            <webglTeleport.In>
                <FlowPlane key={key} el={ref} colors={colors} dotSize={dotSize} zIndex={zIndex} fade={[fade, fadeEdge, fadeWidth]} />
            </webglTeleport.In>
        </div>
    )
}

function FlowPlane({
    el,
    colors,
    dotSize,
    zIndex,
    fade,
}: {
    el: RefObject<HTMLDivElement | null>
    colors: string[]
    dotSize: number
    zIndex: number
    fade: [number, number, number]
}) {
    const mesh = useRef<Mesh>(null)
    const mat = useRef<ShaderMaterial>(null)
    const measure = useDomPlane(el, mesh, { autoReflow: false })
    const target = useRef({ x: 0.5, y: 0.5, hover: 0 })

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uRes: { value: new Vector2(1, 1) },
            uMouse: { value: new Vector2(0.5, 0.5) },
            uHover: { value: 0 },
            uDot: { value: dotSize },
            uC0: { value: new Color(colors[0]) },
            uC1: { value: new Color(colors[1]) },
            uC2: { value: new Color(colors[2]) },
            uC3: { value: new Color(colors[3]) },
            uInk: { value: new Color("#0c0c0b") },
            uFade: { value: fade[0] },
            uFadeEdge: { value: fade[1] },
            uFadeWidth: { value: fade[2] },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    useLayoutEffect(() => {
        const node = el.current
        if (!node) return
        const update = () => {
            const rect = measure()
            if (rect) uniforms.uRes.value.set(rect.width, rect.height)
        }
        update()
        const ro = new ResizeObserver(update)
        ro.observe(node)
        ro.observe(document.body)

        const onMove = (e: PointerEvent) => {
            const r = node.getBoundingClientRect()
            const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
            target.current.x = (e.clientX - r.left) / r.width
            target.current.y = 1 - (e.clientY - r.top) / r.height
            target.current.hover = inside ? 1 : 0
        }
        window.addEventListener("pointermove", onMove)
        return () => {
            ro.disconnect()
            window.removeEventListener("pointermove", onMove)
        }
    }, [el, measure, uniforms])

    useFrame((_, delta) => {
        const u = uniforms
        u.uTime.value += Math.min(delta, 0.05)
        const k = 1 - Math.exp(-delta * 4)
        u.uMouse.value.x += (target.current.x - u.uMouse.value.x) * k
        u.uMouse.value.y += (target.current.y - u.uMouse.value.y) * k
        u.uHover.value += (target.current.hover - u.uHover.value) * (1 - Math.exp(-delta * 2.5))
    })

    return (
        <mesh ref={mesh} renderOrder={zIndex}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={mat}
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={uniforms}
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    )
}
